// app/_layout.js
import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { SafeAreaWrapper } from '../components/ui/SafeAreaWrapper';
import { Audio } from 'expo-av';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      } catch (_) {}

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
        });
      } catch (_) {}
    })();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SafeAreaWrapper>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </SafeAreaWrapper>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
