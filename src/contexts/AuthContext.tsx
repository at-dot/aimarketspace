'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  user_type?: 'creator' | 'business';
  access_token?: string;
}

interface AuthContextType {
  user: User | null;
  sendMagicLink: (
    email: string, 
    userType: 'creator' | 'business',
    metadata?: { terms_accepted_at?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Proveri postojeću sesiju
    checkUser();

    // Slušaj promene autentifikacije
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          user_type: session.user.user_metadata?.user_type,
          access_token: session.access_token
        };
        setUser(userData);
        
        // Ne radimo nikakav automatski redirect na onboarding
        // Korisnik će sam otići na My Profile kada bude spreman
        
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          user_type: session.user.user_metadata?.user_type,
          access_token: session.access_token
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  const sendMagicLink = async (
    email: string, 
    userType: 'creator' | 'business',
    metadata?: { terms_accepted_at?: string }
  ) => {
    try {
      // Pripremi podatke koji će biti sačuvani u user_metadata
      const userMetadata: any = { 
        user_type: userType 
      };

      // Ako je prosleđen terms_accepted_at, dodaj ga u metadata
      if (metadata?.terms_accepted_at) {
        userMetadata.terms_accepted_at = metadata.terms_accepted_at;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Magic link error:', error);
      return { success: false, error: 'Failed to send magic link' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, sendMagicLink, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};