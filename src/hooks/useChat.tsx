import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  // Load sessions from database
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const sessionsWithMessages = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;

          const messages: Message[] = (messagesData || []).map(msg => {
            // Safely parse attachments from Json to expected array format
            let attachments: Array<{ id: string; name: string; type: string; url: string; size: number }> = [];
            if (msg.attachments && Array.isArray(msg.attachments)) {
              attachments = msg.attachments as Array<{ id: string; name: string; type: string; url: string; size: number }>;
            }

            return {
              id: msg.id,
              content: msg.content,
              role: msg.role as 'user' | 'assistant' | 'system',
              source: msg.source as 'realtime' | 'gemini' | undefined,
              attachments,
              timestamp: new Date(msg.created_at),
            };
          });

          return {
            id: session.id,
            title: session.title,
            messages,
            createdAt: new Date(session.created_at),
            updatedAt: new Date(session.updated_at),
          };
        })
      );

      setSessions(sessionsWithMessages);
      
      if (sessionsWithMessages.length > 0 && !activeSessionId) {
        setActiveSessionId(sessionsWithMessages[0].id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    }
  };

  const createSession = async (title = 'New Chat') => {
    if (!user) return;

    try {
      const { data: sessionData, error } = await supabase
        .from('chat_sessions')
        .insert([{ user_id: user.id, title }])
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: sessionData.id,
        title: sessionData.title,
        messages: [],
        createdAt: new Date(sessionData.created_at),
        updatedAt: new Date(sessionData.updated_at),
      };

      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
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

      // Save user message to database
      await supabase.from('messages').insert([{
        session_id: activeSessionId,
        content,
        role: 'user',
        attachments: attachments || [],
      }]);

      // Update local state
      setSessions(prev => prev.map(session =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      ));

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiResponse = `I understand you said: "${content}". This is a simulated response from Dekolzee Bot. In a production version, this would connect to real AI services like OpenAI's Realtime API or Google Gemini.`;
        
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: aiResponse,
          role: 'assistant',
          source: 'realtime',
          timestamp: new Date(),
        };

        // Save AI message to database
        await supabase.from('messages').insert([{
          session_id: activeSessionId,
          content: aiResponse,
          role: 'assistant',
          source: 'realtime',
        }]);

        // Update local state
        setSessions(prev => prev.map(session =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        ));

        setIsLoading(false);
      }, 1000);
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
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
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
