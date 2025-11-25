import { Stack } from 'expo-router';

export default function TextLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false, href: null }} />
    </Stack>
  );
}
