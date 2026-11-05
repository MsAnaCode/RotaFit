import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { SpotifyTokens } from '@/types';

WebBrowser.maybeCompleteAuthSession();

export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '';

export const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
];

export const spotifyDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export function getSpotifyRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: 'rotafit',
    path: 'spotify-callback',
  });
}

export async function exchangeSpotifyCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  if (!spotifyDiscovery.tokenEndpoint) {
    throw new Error('Token endpoint não definido');
  }

  const response = await fetch(spotifyDiscovery.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Falha ao trocar código do Spotify: ${errText}`);
  }

  const json = await response.json();
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
}

export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  if (!spotifyDiscovery.tokenEndpoint) {
    throw new Error('Token endpoint não definido');
  }

  const response = await fetch(spotifyDiscovery.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Falha ao renovar token do Spotify: ${errText}`);
  }

  const json = await response.json();
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token || refreshToken,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
}
