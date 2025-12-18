
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  source?: 'realtime' | 'gemini';
  attachments?: Array<{ id: string; name: string; type: string; url: string; size: number }>;
  timestamp: Date;
  streaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  createSession: (title?: string) => Promise<void>;
  setActiveSession: (sessionId: string) => void;
  sendMessage: (content: string, attachments?: Array<{ id: string; name: string; type: string; url: string; size: number }>) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  getActiveSession: () => ChatSession | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create initial session for temp users
  useEffect(() => {
    if (user && sessions.length === 0) {
      createSession('Welcome Chat');
    }
  }, [user]);

  const createSession = async (title = 'New Chat') => {
    if (!user) return;

    try {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      
      toast({
        title: "New chat created",
        description: `Started "${title}"`,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
    }
  };

  const setActiveSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const sendMessage = async (
    content: string,
    attachments?: Array<{ id: string; name: string; type: string; url: string; size: number }>
  ) => {
    if (!user || !activeSessionId || !content.trim()) return;

    setIsLoading(true);

    const getErrorDescription = async (err: unknown): Promise<string> => {
      const anyErr = err as any;

      // Supabase Functions errors often include the original Response here
      const resp: Response | undefined = anyErr?.context?.response;
      if (resp) {
        try {
          const text = await resp.clone().text();
          try {
            const json = JSON.parse(text);
            if (json?.error && typeof json.error === 'string') return json.error;
          } catch {
            // ignore JSON parse errors
          }
          if (text?.trim()) return text.trim();
        } catch {
          // ignore body read errors
        }
      }

      const msg = anyErr?.message ? String(anyErr.message) : '';
      if (!msg) return 'Failed to get response from AI. Please try again.';

      if (msg.includes('non-2xx')) {
        return 'The AI request failed (non-2xx). This is usually caused by an API quota/billing issue or rate limit.';
      }

      return msg;
    };

    try {
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        role: 'user',
        attachments,
        timestamp: new Date(),
      };

      // Update local state
      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, userMessage] }
            : session
        )
      );

      // Prepare images for Gemini API
      const images: Array<{ data: string; mimeType: string }> = [];
      if (attachments) {
        for (const attachment of attachments) {
          if (attachment.type.startsWith('image/')) {
            try {
              const response = await fetch(attachment.url);
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  resolve(result.split(',')[1]); // Remove data URL prefix
                };
                reader.readAsDataURL(blob);
              });

              images.push({
                data: base64,
                mimeType: attachment.type,
              });
            } catch (error) {
              console.error('Error processing image:', error);
            }
          }
        }
      }

      // Call Gemini API using Supabase edge function
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: {
          message: content,
          images: images.length > 0 ? images : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'assistant',
        source: 'gemini',
        timestamp: new Date(),
      };

      // Update local state with AI response
      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        )
      );

      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const description = await getErrorDescription(error);

      toast({
        title: 'AI Error',
        description,
        variant: 'destructive',
      });

      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
      
      toast({
        title: "Chat deleted",
        description: "Chat session has been removed",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };

  const getActiveSession = () => {
    return sessions.find(session => session.id === activeSessionId);
  };

  return (
    <ChatContext.Provider value={{
      sessions,
      activeSessionId,
      isLoading,
      createSession,
      setActiveSession,
      sendMessage,
      deleteSession,
      getActiveSession,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
