import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  tempSignIn: (username: string, password: string) => Promise<{ error: any }>;
  updateProfile: (updates: { avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for temporary session first
    const tempUser = localStorage.getItem('temp_user');
    if (tempUser) {
      const userData = JSON.parse(tempUser);
      setUser(userData);
      setSession({ user: userData } as Session);
      setLoading(false);
      return;
    }

    // Set up auth state listener for real Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          toast({
            title: "Welcome to Dekolzee Bot!",
            description: "You have successfully signed in.",
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const tempSignIn = async (username: string, password: string) => {
    // Create a temporary user for demo purposes
    if (username.length >= 3 && password.length >= 6) {
      const tempUser = {
        id: `temp_${Date.now()}`,
        email: `${username}@temp.com`,
        user_metadata: { username },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        confirmation_sent_at: new Date().toISOString(),
      };

      localStorage.setItem('temp_user', JSON.stringify(tempUser));
      setUser(tempUser as unknown as User);
      setSession({ 
        user: tempUser,
        access_token: 'temp_token',
        refresh_token: 'temp_refresh',
        expires_in: 3600,
        token_type: 'bearer',
        expires_at: Date.now() + 3600000
      } as unknown as Session);

      toast({
        title: "Welcome to Dekolzee Bot!",
        description: `Signed in temporarily as ${username}`,
      });

      return { error: null };
    } else {
      const error = { message: 'Username must be at least 3 characters and password at least 6 characters' };
      toast({
        title: "Temporary Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "Please check your email for a confirmation link.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    // Clear temporary session
    localStorage.removeItem('temp_user');
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "Password reset instructions have been sent to your email.",
      });
    }

    return { error };
  };

  const updateProfile = async (updates: { avatar_url?: string }) => {
    if (!user) return;
    
    // For temporary users, update localStorage
    if (user.id.startsWith('temp_')) {
      const tempUser = JSON.parse(localStorage.getItem('temp_user') || '{}');
      tempUser.user_metadata = { ...tempUser.user_metadata, ...updates };
      localStorage.setItem('temp_user', JSON.stringify(tempUser));
      setUser({ ...user, user_metadata: { ...user.user_metadata, ...updates } } as User);
      return;
    }
    
    // For real users, update via Supabase
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      tempSignIn,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
