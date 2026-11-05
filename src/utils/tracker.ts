import { RoutePoint, RunStatus } from '@/types';
import { haversineMeters, isPlausibleJump } from './geo';

export interface TrackerState {
  status: RunStatus;
  points: RoutePoint[];
  distanceMeters: number;
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  endedAt: number | null;
}

export type TrackerAction =
  | { type: 'START'; timestamp?: number }
  | { type: 'ADD_POINT'; point: RoutePoint }
  | { type: 'PAUSE'; timestamp?: number }
  | { type: 'RESUME'; timestamp?: number }
  | { type: 'FINISH'; timestamp?: number }
  | { type: 'RESET' };

export const initialTrackerState: TrackerState = {
  status: 'idle',
  points: [],
  distanceMeters: 0,
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  endedAt: null,
};

export function trackerReducer(state: TrackerState, action: TrackerAction): TrackerState {
  switch (action.type) {
    case 'START': {
      if (state.status !== 'idle') return state;
      const now = action.timestamp ?? Date.now();
      return {
        ...initialTrackerState,
        status: 'running',
        startedAt: now,
      };
    }

    case 'ADD_POINT': {
      if (state.status !== 'running') return state;

      const lastPoint = state.points[state.points.length - 1];
      if (!lastPoint) {
        return {
          ...state,
          points: [action.point],
        };
      }

      if (!isPlausibleJump(lastPoint, action.point)) {
        // Pulo espúrio de GPS descartado
        return state;
      }

      const delta = haversineMeters(
        lastPoint.latitude,
        lastPoint.longitude,
        action.point.latitude,
        action.point.longitude,
      );

      return {
        ...state,
        points: [...state.points, action.point],
        distanceMeters: Math.round(state.distanceMeters + delta),
      };
    }

    case 'PAUSE': {
      if (state.status !== 'running') return state;
      return {
        ...state,
        status: 'paused',
        pausedAt: action.timestamp ?? Date.now(),
      };
    }

    case 'RESUME': {
      if (state.status !== 'paused') return state;
      const now = action.timestamp ?? Date.now();
      const pauseDuration = state.pausedAt ? Math.max(0, now - state.pausedAt) : 0;
      return {
        ...state,
        status: 'running',
        pausedAt: null,
        totalPausedMs: state.totalPausedMs + pauseDuration,
      };
    }

    case 'FINISH': {
      if (state.status !== 'running' && state.status !== 'paused') return state;
      const now = action.timestamp ?? Date.now();
      let additionalPause = 0;
      if (state.status === 'paused' && state.pausedAt) {
        additionalPause = Math.max(0, now - state.pausedAt);
      }
      return {
        ...state,
        status: 'finished',
        endedAt: now,
        pausedAt: null,
        totalPausedMs: state.totalPausedMs + additionalPause,
      };
    }

    case 'RESET':
      return initialTrackerState;

    default:
      return state;
  }
}

export function elapsedSeconds(
  state: TrackerState,
  currentTimestamp: number = Date.now(),
): number {
  if (state.startedAt === null) return 0;

  if (state.status === 'finished') {
    const end = state.endedAt ?? currentTimestamp;
    const activeMs = end - state.startedAt - state.totalPausedMs;
    return Math.max(0, Math.floor(activeMs / 1000));
  }

  if (state.status === 'paused') {
    const pauseTime = state.pausedAt ?? currentTimestamp;
    const activeMs = pauseTime - state.startedAt - state.totalPausedMs;
    return Math.max(0, Math.floor(activeMs / 1000));
  }

  const activeMs = currentTimestamp - state.startedAt - state.totalPausedMs;
  return Math.max(0, Math.floor(activeMs / 1000));
}
