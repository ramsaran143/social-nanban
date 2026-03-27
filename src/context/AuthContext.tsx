import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../app/data/supabase';

// Check if credentials are placeholders or empty
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const hasCredentials = SUPABASE_URL && !SUPABASE_URL.includes('placeholder');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isDemo: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if user is using Demo Mode from session storage
    const demoUser = sessionStorage.getItem('demo_user');
    if (demoUser || !hasCredentials) {
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Determine current session status
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes (Login, Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isDemo) {
      sessionStorage.removeItem('demo_user');
      setIsDemo(false);
      window.location.href = '/login';
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
