import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogleOAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'rotafit',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('Não foi possível obter a URL de autorização do Google.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  if (result.type === 'success' && result.url) {
    const url = result.url;

    // Trata resposta em query params (?code=...)
    const queryParams = new URL(url).searchParams;
    const code = queryParams.get('code');
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
      return;
    }

    // Trata resposta em hash fragment (#access_token=...&refresh_token=...)
    const hash = url.split('#')[1];
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      }
    }
  } else if (result.type === 'cancel') {
    throw new Error('Login cancelado pelo usuário.');
  }
}
