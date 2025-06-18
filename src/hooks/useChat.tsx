import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const sendMessage = async (content: string, attachments?: Array<{ id: string; name: string; type: string; url: string; size: number }>) => {
    if (!user || !activeSessionId || !content.trim()) return;

    setIsLoading(true);

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
      setSessions(prev => prev.map(session =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      ));

      // Prepare images for Gemini API
      const images = [];
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
                mimeType: attachment.type
              });
            } catch (error) {
              console.error('Error processing image:', error);
            }
          }
        }
      }

      // Call Gemini API
      const response = await fetch('/api/chat-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          images: images.length > 0 ? images : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'assistant',
        source: 'gemini',
        timestamp: new Date(),
      };

      // Update local state with AI response
      setSessions(prev => prev.map(session =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, assistantMessage] }
          : session
      ));

      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
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
