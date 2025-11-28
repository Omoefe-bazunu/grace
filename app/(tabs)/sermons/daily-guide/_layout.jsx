import { Stack } from 'expo-router';

export default function DailyGuideLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
