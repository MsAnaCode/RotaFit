import {
  trackerReducer,
  initialTrackerState,
  elapsedSeconds,
  TrackerState,
} from '@/utils/tracker';
import { RoutePoint } from '@/types';

describe('Tracker State Machine', () => {
  it('inicia no estado idle', () => {
    expect(initialTrackerState.status).toBe('idle');
    expect(initialTrackerState.points).toHaveLength(0);
    expect(initialTrackerState.distanceMeters).toBe(0);
  });

  it('transiciona para running ao receber START', () => {
    const t0 = 1000;
    const state = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: t0,
    });
    expect(state.status).toBe('running');
    expect(state.startedAt).toBe(t0);
  });

  it('ignora START se já estiver rodando', () => {
    const s1 = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: 1000,
    });
    const s2 = trackerReducer(s1, { type: 'START', timestamp: 2000 });
    expect(s2.startedAt).toBe(1000);
  });

  it('acumula pontos e calcula distância ao receber ADD_POINT', () => {
    let state = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: 1000,
    });
    const p1: RoutePoint = { latitude: 0, longitude: 0, timestamp: 1000 };
    const p2: RoutePoint = { latitude: 0.001, longitude: 0, timestamp: 20000 };

    state = trackerReducer(state, { type: 'ADD_POINT', point: p1 });
    expect(state.points).toHaveLength(1);
    expect(state.distanceMeters).toBe(0);

    state = trackerReducer(state, { type: 'ADD_POINT', point: p2 });
    expect(state.points).toHaveLength(2);
    expect(state.distanceMeters).toBeGreaterThan(100);
  });

  it('ignora pontos que configuram saltos de GPS absurdos', () => {
    let state = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: 1000,
    });
    const p1: RoutePoint = { latitude: 0, longitude: 0, timestamp: 1000 };
    const teleport: RoutePoint = { latitude: 10, longitude: 10, timestamp: 2000 };

    state = trackerReducer(state, { type: 'ADD_POINT', point: p1 });
    state = trackerReducer(state, { type: 'ADD_POINT', point: teleport });

    expect(state.points).toHaveLength(1);
    expect(state.distanceMeters).toBe(0);
  });

  it('pausa e retoma contabilizando o tempo pausado', () => {
    const tStart = 1000;
    let state = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: tStart,
    });

    // Pausa aos 10 segundos
    state = trackerReducer(state, { type: 'PAUSE', timestamp: 11000 });
    expect(state.status).toBe('paused');
    expect(state.pausedAt).toBe(11000);

    // Retoma 5 segundos depois
    state = trackerReducer(state, { type: 'RESUME', timestamp: 16000 });
    expect(state.status).toBe('running');
    expect(state.pausedAt).toBeNull();
    expect(state.totalPausedMs).toBe(5000);

    // Tempo corrido total aos 20s (20s corridos - 5s pausa = 15s líquidos)
    const elapsed = elapsedSeconds(state, 21000);
    expect(elapsed).toBe(15);
  });

  it('finaliza a corrida e congela o tempo', () => {
    let state = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: 0,
    });
    state = trackerReducer(state, { type: 'FINISH', timestamp: 60000 });

    expect(state.status).toBe('finished');
    expect(state.endedAt).toBe(60000);

    // Mesmo com timestamp posterior, o tempo decorrido deve permanecer 60 segundos
    expect(elapsedSeconds(state, 120000)).toBe(60);
  });

  it('reseta para o estado inicial', () => {
    let state = trackerReducer(initialTrackerState, {
      type: 'START',
      timestamp: 0,
    });
    state = trackerReducer(state, { type: 'RESET' });
    expect(state).toEqual(initialTrackerState);
  });
});
