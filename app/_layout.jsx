import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { PlayProvider } from '../contexts/PlayListContext';
import { SafeAreaWrapper } from '../components/ui/SafeAreaWrapper';
import { Audio } from 'expo-av';
import ErrorBoundary from '../components/ErrorBoundary';
import MiniPlayer from '../components/MiniPlayer';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    (async () => {
      // REMOVED: The block that auto-set 'hasSeenOnboarding' to true.
      // This should only happen when the user actually finishes onboarding.

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
            <PlayProvider>
              <SafeAreaWrapper>
                <Stack screenOptions={{ headerShown: false }} />
                <MiniPlayer />
                <StatusBar style="auto" />
              </SafeAreaWrapper>
            </PlayProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
