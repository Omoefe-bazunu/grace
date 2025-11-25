import { Stack } from 'expo-router';

// Defines the nested layout for the Songs tab
export default function SongsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide default header for all screens in Songs tab
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Sermons' }} />{' '}
      {/* Main Songs screen */}
      <Stack.Screen
        name="audio"
        options={{ title: 'Audio', href: null }}
      />{' '}
      {/* Hymns list screen */}
      <Stack.Screen name="text" options={{ title: 'Text', href: null }} />{' '}
      {/* Music list screen */}
      <Stack.Screen
        name="audio/[id]"
        options={{ title: 'Audio Details', href: null }}
      />{' '}
      {/* Hymn detail screen */}
      <Stack.Screen
        name="text/[id]"
        options={{ title: 'Text Details', href: null }}
      />{' '}
      {/* Music detail screen */}
    </Stack>
  );
}
