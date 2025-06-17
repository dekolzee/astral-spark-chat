
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

      // Enhanced AI response with more personality
      const responses = [
        `Hello! I'm Dekolzee Bot, your AI assistant. You said: "${content}". I'm here to help you with any questions or tasks you might have. How can I assist you further?`,
        `Thank you for reaching out! "${content}" is an interesting topic. As your AI companion, I'm ready to dive deeper into this conversation. What specific aspect would you like to explore?`,
        `I appreciate your message: "${content}". I'm Dekolzee Bot, designed to be your intelligent conversational partner. Whether you need information, creative help, or just want to chat, I'm here for you!`,
        `Great to hear from you! Regarding "${content}" - I'm equipped with knowledge and ready to help. As your AI assistant, I can provide information, answer questions, or engage in creative discussions. What would you like to know more about?`,
        `Hi there! You mentioned "${content}" and I'm excited to help. I'm Dekolzee Bot, your AI-powered assistant designed to make conversations engaging and informative. How can I make your day better?`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate typing delay
      setTimeout(async () => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: randomResponse,
          role: 'assistant',
          source: 'realtime',
          timestamp: new Date(),
        };

        // Update local state with AI response
        setSessions(prev => prev.map(session =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        ));

        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
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
