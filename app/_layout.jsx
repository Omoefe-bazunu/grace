import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'; // ✅ Added useTheme
import { AuthProvider } from '../contexts/AuthContext';
import { PlayProvider } from '../contexts/PlayListContext';
import { SafeAreaWrapper } from '../components/ui/SafeAreaWrapper';
import { Audio } from 'expo-av';
import ErrorBoundary from '../components/ErrorBoundary';
import MiniPlayer from '../components/MiniPlayer';

// ✅ Sub-component to access theme context
function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <SafeAreaWrapper>
      {/* ✅ Status bar icons will now turn white in dark mode and dark in light mode */}
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack screenOptions={{ headerShown: false }} />
      <MiniPlayer />
    </SafeAreaWrapper>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    (async () => {
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
              <RootLayoutContent />
            </PlayProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
