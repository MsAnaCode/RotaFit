import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listRuns, getRun, saveRun, deleteRun, getWeeklyStats } from '@/services/runs';
import { SaveRunInput } from '@/types';

export const RUNS_QUERY_KEY = ['runs'];
export const WEEKLY_STATS_KEY = ['weekly_stats'];

export function useRuns() {
  return useQuery({
    queryKey: RUNS_QUERY_KEY,
    queryFn: listRuns,
  });
}

export function useRun(id: string) {
  return useQuery({
    queryKey: ['run', id],
    queryFn: () => getRun(id),
    enabled: Boolean(id),
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: WEEKLY_STATS_KEY,
    queryFn: getWeeklyStats,
  });
}

export function useSaveRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveRunInput) => saveRun(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WEEKLY_STATS_KEY });
    },
  });
}

export function useDeleteRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WEEKLY_STATS_KEY });
    },
  });
}
