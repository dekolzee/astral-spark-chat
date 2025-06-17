
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  streaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'CREATE_SESSION'; session: ChatSession }
  | { type: 'SET_ACTIVE_SESSION'; sessionId: string }
  | { type: 'ADD_MESSAGE'; sessionId: string; message: Message }
  | { type: 'UPDATE_MESSAGE'; sessionId: string; messageId: string; updates: Partial<Message> }
  | { type: 'DELETE_SESSION'; sessionId: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOAD_SESSIONS'; sessions: ChatSession[] };

const initialState: ChatState = {
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  error: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: [action.session, ...state.sessions],
        activeSessionId: action.session.id,
      };
    
    case 'SET_ACTIVE_SESSION':
      return {
        ...state,
        activeSessionId: action.sessionId,
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? {
                ...session,
                messages: [...session.messages, action.message],
                updatedAt: new Date(),
              }
            : session
        ),
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? {
                ...session,
                messages: session.messages.map(message =>
                  message.id === action.messageId
                    ? { ...message, ...action.updates }
                    : message
                ),
                updatedAt: new Date(),
              }
            : session
        ),
      };
    
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.sessionId),
        activeSessionId: state.activeSessionId === action.sessionId ? null : state.activeSessionId,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      };
    
    case 'LOAD_SESSIONS':
      return {
        ...state,
        sessions: action.sessions,
      };
    
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  createSession: (title?: string) => string;
  setActiveSession: (sessionId: string) => void;
  sendMessage: (content: string, attachments?: Message['attachments']) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  getActiveSession: () => ChatSession | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatbot-sessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })),
        }));
        dispatch({ type: 'LOAD_SESSIONS', sessions });
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (state.sessions.length > 0) {
      localStorage.setItem('chatbot-sessions', JSON.stringify(state.sessions));
    }
  }, [state.sessions]);

  const createSession = (title = 'New Chat'): string => {
    const session: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'CREATE_SESSION', session });
    return session.id;
  };

  const setActiveSession = (sessionId: string) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', sessionId });
  };

  const sendMessage = async (content: string, attachments?: Message['attachments']) => {
    if (!state.activeSessionId) {
      const sessionId = createSession();
      dispatch({ type: 'SET_ACTIVE_SESSION', sessionId });
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      role: 'user',
      timestamp: new Date(),
      attachments,
    };

    dispatch({
      type: 'ADD_MESSAGE',
      sessionId: state.activeSessionId!,
      message: userMessage,
    });

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: `I received your message: "${content}". This is a simulated response. In a real implementation, this would connect to your AI backend.`,
        role: 'assistant',
        timestamp: new Date(),
        streaming: true,
      };

      dispatch({
        type: 'ADD_MESSAGE',
        sessionId: state.activeSessionId!,
        message: aiMessage,
      });

      // Simulate streaming completion
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MESSAGE',
          sessionId: state.activeSessionId!,
          messageId: aiMessage.id,
          updates: { streaming: false },
        });
      }, 2000);
    }, 1000);
  };

  const deleteSession = (sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', sessionId });
  };

  const getActiveSession = (): ChatSession | null => {
    return state.sessions.find(session => session.id === state.activeSessionId) || null;
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        createSession,
        setActiveSession,
        sendMessage,
        deleteSession,
        getActiveSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
