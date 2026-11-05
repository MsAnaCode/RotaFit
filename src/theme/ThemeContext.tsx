import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeTokens, lightTheme, darkTheme } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeTokens;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => Promise<void>;
  isDark: boolean;
}

const THEME_STORAGE_KEY = 'rotafit.theme-preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreferenceState(saved);
        }
      } catch {
        // Fallback silencioso para 'system'
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setPreference = async (newPref: ThemePreference) => {
    setPreferenceState(newPref);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newPref);
    } catch {
      // Ignora falha de gravação local
    }
  };

  const activeMode: 'light' | 'dark' = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  const theme = useMemo(() => {
    return activeMode === 'dark' ? darkTheme : lightTheme;
  }, [activeMode]);

  const value = useMemo(
    () => ({
      theme,
      preference,
      setPreference,
      isDark: activeMode === 'dark',
    }),
    [theme, preference, activeMode],
  );

  if (!isReady) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
