import { Stack } from 'expo-router';

export default function GalleryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pictures" options={{ headerShown: false }} />
      <Stack.Screen name="videos" options={{ headerShown: false }} />
      <Stack.Screen name="ministers" options={{ headerShown: false }} />
      <Stack.Screen name="gallerymanager" options={{ headerShown: false }} />
    </Stack>
  );
}
