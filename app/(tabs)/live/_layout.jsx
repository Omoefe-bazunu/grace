import { Stack } from 'expo-router';

export default function LiveLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="recording"
        options={{ headerShown: false, href: null }}
      />
    </Stack>
  );
}
