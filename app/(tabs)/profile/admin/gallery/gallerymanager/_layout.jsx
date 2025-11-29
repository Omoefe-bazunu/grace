import { Stack } from 'expo-router';

export default function GalleryManagerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
