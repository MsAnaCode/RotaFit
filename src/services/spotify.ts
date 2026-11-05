import { SpotifyPlaybackState, SpotifyTrack } from '@/types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const DEMO_PLAYLIST: SpotifyTrack[] = [
  {
    id: 'demo-track-1',
    name: 'Canção do Corredor (Speed Mix)',
    artist: 'RotaFit Beats',
    album: 'Treino de Rua Vol. 1',
    albumCoverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    uri: 'spotify:track:demo1',
    durationMs: 215000,
    isPlaying: true,
    progressMs: 45000,
  },
  {
    id: 'demo-track-2',
    name: 'Ritmo Constante (170 BPM)',
    artist: 'Marathon Beats',
    album: 'Frequência Cardíaca',
    albumCoverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
    uri: 'spotify:track:demo2',
    durationMs: 198000,
    isPlaying: true,
    progressMs: 12000,
  },
];

let demoCurrentIndex = 0;
let demoIsPlaying = true;

export async function fetchCurrentlyPlaying(
  accessToken: string,
): Promise<SpotifyPlaybackState> {
  if (accessToken === 'demo-spotify-access-token') {
    const track = {
      ...DEMO_PLAYLIST[demoCurrentIndex],
      isPlaying: demoIsPlaying,
    };
    return {
      track,
      isPlaying: demoIsPlaying,
      deviceActive: true,
    };
  }

  const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204 || response.status === 404) {
    return { track: null, isPlaying: false, deviceActive: false };
  }

  if (!response.ok) {
    return { track: null, isPlaying: false, deviceActive: false };
  }

  const data = await response.json();
  const item = data.item;

  if (!item) {
    return { track: null, isPlaying: false, deviceActive: true };
  }

  const track: SpotifyTrack = {
    id: item.id,
    name: item.name,
    artist: item.artists?.map((a: { name: string }) => a.name).join(', ') ?? '',
    album: item.album?.name ?? '',
    albumCoverUrl: item.album?.images?.[0]?.url ?? null,
    uri: item.uri,
    durationMs: item.duration_ms ?? 0,
    isPlaying: data.is_playing ?? false,
    progressMs: data.progress_ms ?? 0,
  };

  return {
    track,
    isPlaying: data.is_playing ?? false,
    deviceActive: true,
  };
}

export async function pausePlayback(accessToken: string): Promise<void> {
  if (accessToken === 'demo-spotify-access-token') {
    demoIsPlaying = false;
    return;
  }
  await fetch(`${SPOTIFY_API_BASE}/me/player/pause`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function resumePlayback(accessToken: string): Promise<void> {
  if (accessToken === 'demo-spotify-access-token') {
    demoIsPlaying = true;
    return;
  }
  await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function skipToNext(accessToken: string): Promise<void> {
  if (accessToken === 'demo-spotify-access-token') {
    demoCurrentIndex = (demoCurrentIndex + 1) % DEMO_PLAYLIST.length;
    return;
  }
  await fetch(`${SPOTIFY_API_BASE}/me/player/next`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function skipToPrevious(accessToken: string): Promise<void> {
  if (accessToken === 'demo-spotify-access-token') {
    demoCurrentIndex =
      (demoCurrentIndex - 1 + DEMO_PLAYLIST.length) % DEMO_PLAYLIST.length;
    return;
  }
  await fetch(`${SPOTIFY_API_BASE}/me/player/previous`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
