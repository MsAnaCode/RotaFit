import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { signInWithGoogleOAuth } from '@/lib/googleAuth';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: () => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const DEMO_USER_KEY = 'rotafit.demo-user';

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: { provider: 'google' },
  user_metadata: {
    full_name: 'Corredor RotaFit',
    name: 'Corredor RotaFit',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    email: 'corredor@rotafit.app',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'corredor@rotafit.app',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const demoStored = await AsyncStorage.getItem(DEMO_USER_KEY);
        if (demoStored === 'true') {
          if (isMounted) {
            setUser(DEMO_USER);
            setIsDemoMode(true);
            setIsLoading(false);
          }
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (e) {
        console.warn('Erro ao carregar sessão inicial do Supabase:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isDemoMode && isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogleOAuth();
      await AsyncStorage.removeItem(DEMO_USER_KEY);
      setIsDemoMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsDemoUser = async () => {
    await AsyncStorage.setItem(DEMO_USER_KEY, 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(DEMO_USER_KEY);
      setIsDemoMode(false);
      setUser(null);
      setSession(null);
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signInWithGoogle,
      signInAsDemoUser,
      signOut,
      isDemoMode,
    }),
    [user, session, isLoading, isDemoMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
