import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="run/active"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="run/[id]"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
