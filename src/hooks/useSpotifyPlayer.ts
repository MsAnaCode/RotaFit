import { useEffect, useState, useCallback, useRef } from 'react';
import { useSpotify } from '@/context/SpotifyContext';
import { SpotifyPlaybackState } from '@/types';
import {
  fetchCurrentlyPlaying,
  pausePlayback,
  resumePlayback,
  skipToNext,
  skipToPrevious,
} from '@/services/spotify';

export function useSpotifyPlayer() {
  const { isConnected, getValidAccessToken } = useSpotify();
  const [playerState, setPlayerState] = useState<SpotifyPlaybackState>({
    track: null,
    isPlaying: false,
    deviceActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshState = useCallback(async () => {
    if (!isConnected) return;
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      const state = await fetchCurrentlyPlaying(token);
      setPlayerState(state);
    } catch (e) {
      console.warn('Erro ao atualizar tocador do Spotify:', e);
    }
  }, [isConnected, getValidAccessToken]);

  useEffect(() => {
    if (isConnected) {
      refreshState();
      pollTimerRef.current = setInterval(refreshState, 3500);
    } else {
      setPlayerState({ track: null, isPlaying: false, deviceActive: false });
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [isConnected, refreshState]);

  const togglePlay = async () => {
    const token = await getValidAccessToken();
    if (!token) return;

    setIsLoading(true);
    try {
      if (playerState.isPlaying) {
        setPlayerState((s) => ({ ...s, isPlaying: false }));
        await pausePlayback(token);
      } else {
        setPlayerState((s) => ({ ...s, isPlaying: true }));
        await resumePlayback(token);
      }
      setTimeout(refreshState, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const next = async () => {
    const token = await getValidAccessToken();
    if (!token) return;
    setIsLoading(true);
    try {
      await skipToNext(token);
      setTimeout(refreshState, 600);
    } finally {
      setIsLoading(false);
    }
  };

  const previous = async () => {
    const token = await getValidAccessToken();
    if (!token) return;
    setIsLoading(true);
    try {
      await skipToPrevious(token);
      setTimeout(refreshState, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    track: playerState.track,
    isPlaying: playerState.isPlaying,
    deviceActive: playerState.deviceActive,
    isLoading,
    togglePlay,
    next,
    previous,
    refreshState,
  };
}
