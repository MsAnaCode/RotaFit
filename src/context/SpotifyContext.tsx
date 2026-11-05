import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as AuthSession from 'expo-auth-session';
import { SpotifyTokens } from '@/types';
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_SCOPES,
  spotifyDiscovery,
  getSpotifyRedirectUri,
  exchangeSpotifyCode,
  refreshSpotifyToken,
} from '@/lib/spotify';
import { saveSecureItem, getSecureItem, deleteSecureItem } from '@/lib/secureStore';

interface SpotifyContextValue {
  tokens: SpotifyTokens | null;
  isConnected: boolean;
  isLoading: boolean;
  connectSpotify: () => Promise<void>;
  disconnectSpotify: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
  isDemoConnected: boolean;
}

const SPOTIFY_TOKENS_STORAGE_KEY = 'rotafit.spotify_tokens';
const SPOTIFY_DEMO_KEY = 'rotafit.spotify_demo_connected';

const SpotifyContext = createContext<SpotifyContextValue | undefined>(undefined);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [isDemoConnected, setIsDemoConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const demo = await getSecureItem(SPOTIFY_DEMO_KEY);
        if (demo === 'true') {
          setIsDemoConnected(true);
        }

        const raw = await getSecureItem(SPOTIFY_TOKENS_STORAGE_KEY);
        if (raw) {
          const parsed: SpotifyTokens = JSON.parse(raw);
          setTokens(parsed);
        }
      } catch (err) {
        console.warn('Erro ao restaurar tokens do Spotify:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveTokens = async (newTokens: SpotifyTokens) => {
    setTokens(newTokens);
    await saveSecureItem(SPOTIFY_TOKENS_STORAGE_KEY, JSON.stringify(newTokens));
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (isDemoConnected) {
      return 'demo-spotify-access-token';
    }

    if (!tokens) return null;

    // Se o token ainda é válido por mais de 60 segundos
    if (Date.now() < tokens.expiresAt - 60000) {
      return tokens.accessToken;
    }

    try {
      const refreshed = await refreshSpotifyToken(tokens.refreshToken);
      await saveTokens(refreshed);
      return refreshed.accessToken;
    } catch {
      await disconnectSpotify();
      return null;
    }
  };

  const connectSpotify = async () => {
    if (!SPOTIFY_CLIENT_ID) {
      // Modo demonstração quando nenhuma Client ID foi configurada no .env
      setIsDemoConnected(true);
      await saveSecureItem(SPOTIFY_DEMO_KEY, 'true');
      return;
    }

    const redirectUri = getSpotifyRedirectUri();
    const request = new AuthSession.AuthRequest({
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync(spotifyDiscovery);

    if (result.type === 'success' && result.params.code) {
      if (!request.codeVerifier) {
        throw new Error('PKCE Code Verifier não encontrado');
      }

      const receivedTokens = await exchangeSpotifyCode(
        result.params.code,
        request.codeVerifier,
        redirectUri,
      );
      await saveTokens(receivedTokens);
      setIsDemoConnected(false);
      await deleteSecureItem(SPOTIFY_DEMO_KEY);
    }
  };

  const disconnectSpotify = async () => {
    setTokens(null);
    setIsDemoConnected(false);
    await deleteSecureItem(SPOTIFY_TOKENS_STORAGE_KEY);
    await deleteSecureItem(SPOTIFY_DEMO_KEY);
  };

  const value = useMemo(
    () => ({
      tokens,
      isConnected: Boolean(tokens || isDemoConnected),
      isLoading,
      connectSpotify,
      disconnectSpotify,
      getValidAccessToken,
      isDemoConnected,
    }),
    [tokens, isDemoConnected, isLoading],
  );

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify(): SpotifyContextValue {
  const ctx = useContext(SpotifyContext);
  if (!ctx) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return ctx;
}
