import { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { trackerReducer, initialTrackerState, elapsedSeconds } from '@/utils/tracker';
import { averagePaceSecPerKm, estimateCalories } from '@/utils/geo';
import { RoutePoint } from '@/types';

export function useRunTracker() {
  const [state, dispatch] = useReducer(trackerReducer, initialTrackerState);
  const [seconds, setSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Ticker de tempo decorrido
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (state.status === 'running') {
      interval = setInterval(() => {
        setSeconds(elapsedSeconds(state));
      }, 500);
    } else {
      setSeconds(elapsedSeconds(state));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  const stopWatching = useCallback(() => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  }, []);

  const startWatching = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permissão de localização foi negada.');
        return;
      }

      setPermissionError(null);

      // Pega posição inicial de alta precisão
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const initialPoint: RoutePoint = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        timestamp: current.timestamp,
        altitude: current.coords.altitude,
        speed: current.coords.speed,
        accuracy: current.coords.accuracy,
      };

      dispatch({ type: 'ADD_POINT', point: initialPoint });

      // Inicia observador contínuo
      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 4,
        },
        (loc) => {
          const pt: RoutePoint = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp,
            altitude: loc.coords.altitude,
            speed: loc.coords.speed,
            accuracy: loc.coords.accuracy,
          };
          dispatch({ type: 'ADD_POINT', point: pt });
        },
      );
    } catch (err) {
      console.warn('Erro ao acessar GPS:', err);
    }
  }, []);

  const start = async () => {
    dispatch({ type: 'START' });
    await startWatching();
  };

  const pause = () => {
    stopWatching();
    dispatch({ type: 'PAUSE' });
  };

  const resume = async () => {
    dispatch({ type: 'RESUME' });
    await startWatching();
  };

  const finish = () => {
    stopWatching();
    dispatch({ type: 'FINISH' });
  };

  const reset = () => {
    stopWatching();
    dispatch({ type: 'RESET' });
    setSeconds(0);
  };

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  const currentPace = averagePaceSecPerKm(seconds, state.distanceMeters);
  const currentCalories = estimateCalories(state.distanceMeters, seconds);

  return {
    status: state.status,
    points: state.points,
    distanceMeters: state.distanceMeters,
    seconds,
    currentPace,
    calories: currentCalories,
    startedAt: state.startedAt,
    endedAt: state.endedAt,
    permissionError,
    start,
    pause,
    resume,
    finish,
    reset,
  };
}
