
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use IP or a simple identifier for rate limiting
    const clientId = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'anonymous';
    const { allowed, remaining } = checkRateLimit(clientId);
    
    if (!allowed) {
      console.log(`Rate limit exceeded for client: ${clientId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please wait a moment before sending another message.' 
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          }
        }
      );
    }

    const { message, images } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Prepare the content parts
    const parts = [{ text: message }];
    
    // Add images if provided
    if (images && images.length > 0) {
      for (const image of images) {
        parts.push({
          inline_data: {
            mime_type: image.mimeType,
            data: image.data
          }
        });
      }
    }

    console.log(`Processing request for client: ${clientId}, remaining: ${remaining}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);

      if (response.status === 429) {
        let retryAfterSeconds: number | undefined;
        try {
          const parsed = JSON.parse(errorData);
          const retryInfo = parsed?.error?.details?.find((d: any) =>
            typeof d?.['@type'] === 'string' && d['@type'].includes('RetryInfo')
          );
          const retryDelay = retryInfo?.retryDelay as string | undefined; // e.g. "24s"
          if (retryDelay && typeof retryDelay === 'string') {
            const m = retryDelay.match(/(\d+)/);
            if (m?.[1]) retryAfterSeconds = Number(m[1]);
          }
        } catch {
          // ignore parse errors
        }

        const baseMsg =
          'Gemini API quota exceeded. Please check your Google AI Studio billing/quota and try again.';
        const msg = retryAfterSeconds
          ? `${baseMsg} Retry in ~${retryAfterSeconds}s.`
          : baseMsg;

        return new Response(
          JSON.stringify({ error: msg, retryAfterSeconds }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              ...(retryAfterSeconds ? { 'Retry-After': String(retryAfterSeconds) } : {}),
            },
          }
        );
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ response: generatedText }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': remaining.toString()
        } 
      }
    );
  } catch (error) {
    console.error('Error in chat-with-gemini function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
