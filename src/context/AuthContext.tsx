import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';
import { signInWithGoogle } from '@/lib/googleAuth';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) queryClient.clear(); // não vazar dados entre contas
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithGoogle,
      signInAsGuest: async () => {
        const fakeUser: User = {
          id: '11111111-1111-1111-1111-111111111111',
          app_metadata: {},
          user_metadata: { full_name: 'Corredor Demo' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        const fakeSession: Session = {
          access_token: 'demo-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'demo-refresh',
          user: fakeUser,
        };
        setSession(fakeSession);
      },
      signOut: async () => {
        setSession(null);
        await supabase.auth.signOut().catch(() => undefined);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return context;
}
