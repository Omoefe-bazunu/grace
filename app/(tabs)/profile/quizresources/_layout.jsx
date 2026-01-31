import { Stack } from 'expo-router';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ Globally disabled because we use TopNavigation.js
        animation: 'slide_from_right', // ✅ Smooth transition between details and questions
      }}
    >
      {/* 1. The main Quiz/Resource list */}
      <Stack.Screen name="index" />

      {/* 2. The dynamic Detail screen: [id]/index.js */}
      <Stack.Screen name="[id]/index" />

      {/* 3. The new Help Form screen: [id]/questions/index.js */}
      <Stack.Screen name="[id]/questions/index" />
    </Stack>
  );
}
