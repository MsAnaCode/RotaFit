export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number | null;
  speed?: number | null;
  accuracy?: number | null;
}

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface Run {
  id: string;
  user_id: string;
  title: string | null;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number;
  avg_pace_seconds_per_km: number | null;
  calories: number | null;
  route_points: RoutePoint[];
  spotify_track_uri: string | null;
  spotify_track_name: string | null;
  spotify_artist_name: string | null;
  created_at: string;
}

export interface SaveRunInput {
  title?: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number;
  avg_pace_seconds_per_km?: number | null;
  calories?: number | null;
  route_points: RoutePoint[];
  spotify_track_uri?: string | null;
  spotify_track_name?: string | null;
  spotify_artist_name?: string | null;
}

export interface WeeklyStats {
  week_start: string;
  total_distance_km: number;
  total_duration_minutes: number;
  total_runs: number;
  avg_pace_seconds_per_km: number;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp em ms
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCoverUrl: string | null;
  uri: string;
  durationMs: number;
  isPlaying: boolean;
  progressMs: number;
}

export interface SpotifyPlaybackState {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  deviceActive: boolean;
}
