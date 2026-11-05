import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Run, SaveRunInput, WeeklyStats } from '@/types';

const LOCAL_RUNS_KEY = 'rotafit.local_runs';

async function getLocalRuns(): Promise<Run[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_RUNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveLocalRuns(runs: Run[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_RUNS_KEY, JSON.stringify(runs));
}

export async function listRuns(): Promise<Run[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const localRuns = await getLocalRuns();

  if (!session) {
    return localRuns.sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
  }

  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    // Se o banco falhar ou estiver offline, faz fallback para local
    return localRuns;
  }

  return (data as Run[]) || [];
}

export async function getRun(id: string): Promise<Run | null> {
  const localRuns = await getLocalRuns();
  const local = localRuns.find((r) => r.id === id);
  if (local) return local;

  const { data, error } = await supabase.from('runs').select('*').eq('id', id).single();

  if (error || !data) {
    return null;
  }

  return data as Run;
}

export async function saveRun(input: SaveRunInput): Promise<Run> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? '00000000-0000-0000-0000-000000000001';

  const newRun: Run = {
    id: 'run-' + Date.now(),
    user_id: userId,
    title: input.title || 'Corrida RotaFit',
    started_at: input.started_at,
    ended_at: input.ended_at,
    duration_seconds: input.duration_seconds,
    distance_meters: input.distance_meters,
    avg_pace_seconds_per_km: input.avg_pace_seconds_per_km ?? null,
    calories: input.calories ?? null,
    route_points: input.route_points,
    spotify_track_uri: input.spotify_track_uri ?? null,
    spotify_track_name: input.spotify_track_name ?? null,
    spotify_artist_name: input.spotify_artist_name ?? null,
    created_at: new Date().toISOString(),
  };

  // Salva localmente primeiro
  const localRuns = await getLocalRuns();
  await saveLocalRuns([newRun, ...localRuns]);

  if (session) {
    try {
      const { data, error } = await supabase
        .from('runs')
        .insert({
          title: newRun.title,
          started_at: newRun.started_at,
          ended_at: newRun.ended_at,
          duration_seconds: newRun.duration_seconds,
          distance_meters: newRun.distance_meters,
          avg_pace_seconds_per_km: newRun.avg_pace_seconds_per_km,
          calories: newRun.calories,
          route_points: newRun.route_points,
          spotify_track_uri: newRun.spotify_track_uri,
          spotify_track_name: newRun.spotify_track_name,
          spotify_artist_name: newRun.spotify_artist_name,
        })
        .select()
        .single();

      if (!error && data) {
        return data as Run;
      }
    } catch {
      // Retorna a salva localmente se banco estiver inacessível
    }
  }

  return newRun;
}

export async function deleteRun(id: string): Promise<void> {
  const localRuns = await getLocalRuns();
  await saveLocalRuns(localRuns.filter((r) => r.id !== id));

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    await supabase.from('runs').delete().eq('id', id);
  }
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data, error } = await supabase.rpc('weekly_stats');
    if (!error && data && data.length > 0) {
      const s = data[0];
      return {
        week_start: s.week_start,
        total_distance_km: Number(s.total_distance_km) || 0,
        total_duration_minutes: Number(s.total_duration_minutes) || 0,
        total_runs: Number(s.total_runs) || 0,
        avg_pace_seconds_per_km: Number(s.avg_pace_seconds_per_km) || 0,
      };
    }
  }

  // Fallback computado a partir de corridas locais
  const runs = await getLocalRuns();
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Segunda = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const thisWeekRuns = runs.filter(
    (r) => new Date(r.started_at).getTime() >= monday.getTime(),
  );

  const totalDistMeters = thisWeekRuns.reduce((acc, r) => acc + r.distance_meters, 0);
  const totalDurationSec = thisWeekRuns.reduce((acc, r) => acc + r.duration_seconds, 0);
  const count = thisWeekRuns.length;

  const totalKm = totalDistMeters / 1000;
  const avgPace = totalKm > 0 ? Math.round(totalDurationSec / totalKm) : 0;

  return {
    week_start: monday.toISOString(),
    total_distance_km: Number(totalKm.toFixed(2)),
    total_duration_minutes: Math.round(totalDurationSec / 60),
    total_runs: count,
    avg_pace_seconds_per_km: avgPace,
  };
}
