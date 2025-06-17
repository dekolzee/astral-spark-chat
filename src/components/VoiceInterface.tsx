
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
}

export default function VoiceInterface({ onTranscription }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<ISpeechRecognition | null>(null);
  const { toast } = useToast();
  const { sendMessage } = useChat();

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionConstructor() as ISpeechRecognition;
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening!",
        });
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        sendMessage(transcript);
        
        // Convert response to speech
        setTimeout(() => {
          speakText(`I heard you say: ${transcript}. Let me help you with that!`);
        }, 500);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isListening ? "destructive" : "default"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        className={`${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white`}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {isListening ? 'Stop' : 'Voice'}
      </Button>

      <Button
        variant={isSpeaking ? "destructive" : "secondary"}
        size="sm"
        onClick={isSpeaking ? stopSpeaking : () => speakText("Hello! I'm Dekolzee Bot, ready to assist you!")}
        className={`${
          isSpeaking 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-teal-600 hover:bg-teal-700'
        } text-white`}
      >
        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {isSpeaking ? 'Stop' : 'Speak'}
      </Button>
    </div>
  );
}
