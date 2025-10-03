import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user?.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (email: string | undefined) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        
        // If session is missing or corrupt, force logout locally
        if (error.message?.includes('Auth session missing') || 
            error.message?.includes('session_not_found')) {
          console.log('🔄 Session missing/corrupt, forcing local logout...');
          // Force local state cleanup
          setUser(null);
          setIsAdmin(false);
          // Clear any local storage auth data
          localStorage.removeItem('supabase.auth.token');
          window.location.reload(); // Force page reload to clear state
          return;
        }
        
        throw error;
      }
      
      console.log('✅ Successfully signed out');
    } catch (error: any) {
      console.error('💥 Error during sign out:', error);
      
      // Always force logout locally even if Supabase fails
      console.log('🔄 Forcing local logout as fallback...');
      setUser(null);
      setIsAdmin(false);
      
      // Clear any auth-related localStorage
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.clear(); // Clear all localStorage as last resort
      } catch (storageError) {
        console.warn('⚠️ Failed to clear localStorage:', storageError);
      }
      
      // Force page reload to ensure clean state
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut }}>
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
