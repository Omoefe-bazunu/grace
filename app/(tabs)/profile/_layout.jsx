import { Stack } from 'expo-router';

// Defines the nested layout for the Songs tab
export default function SongsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="about" options={{ title: 'About', href: null }} />
      <Stack.Screen name="admin" options={{ title: 'Admin', href: null }} />
      <Stack.Screen name="contact" options={{ title: 'contact', href: null }} />
      <Stack.Screen
        name="favorite"
        options={{ title: 'favorite', href: null }}
      />
      <Stack.Screen name="notices" options={{ title: 'notices', href: null }} />
      <Stack.Screen
        name="quizresources"
        options={{ title: 'quizresources', href: null }}
      />
    </Stack>
  );
}
