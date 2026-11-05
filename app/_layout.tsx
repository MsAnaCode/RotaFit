import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SpotifyProvider } from '@/context/SpotifyContext';
import { LoadingView } from '@/components/StateViews';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return <LoadingView message="Iniciando RotaFit..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bgStart },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SpotifyProvider>
            <RootNavigation />
          </SpotifyProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
