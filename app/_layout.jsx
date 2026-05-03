// EXPO PUSH NOTIFICATIONS SETUP

import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { PlayProvider } from '../contexts/PlayListContext';
import { SafeAreaWrapper } from '../components/ui/SafeAreaWrapper';
import { Audio } from 'expo-av';
import ErrorBoundary from '../components/ErrorBoundary';
import MiniPlayer from '../components/MiniPlayer';
import {
  registerForPushNotifications,
  registerBackgroundHandler,
} from '../services/notificationService';
import { API_BASE_URL, prefetchCommonRoutes } from '../utils/api';
import Constants from 'expo-constants';

function RootLayoutContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Kick off data prefetch immediately — warms cache before any screen loads
    prefetchCommonRoutes();

    // Push notifications — skip in Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';
    if (!isExpoGo) {
      registerBackgroundHandler();

      (async () => {
        const pushToken = await registerForPushNotifications();
        if (pushToken) {
          try {
            await fetch(`${API_BASE_URL}/api/push-tokens/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: pushToken }),
            });
            console.log('Push token registered with backend');
          } catch (error) {
            console.error('Failed to register push token:', error);
          }
        }
      })();
    } else {
      console.log('Push notifications disabled in Expo Go');
    }
  }, []);

  return (
    <SafeAreaWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <MiniPlayer />
    </SafeAreaWrapper>
  );
}

function AudioSetup() {
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

  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <PlayProvider>
              <AudioSetup />
              <RootLayoutContent />
            </PlayProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// EXPO PUSH NOTIFICATIONS SETUP

// import 'react-native-url-polyfill/auto';
// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '../hooks/useFrameworkReady';
// import { LanguageProvider } from '../contexts/LanguageContext';
// import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
// import { AuthProvider } from '../contexts/AuthContext';
// import { PlayProvider } from '../contexts/PlayListContext';
// import { SafeAreaWrapper } from '../components/ui/SafeAreaWrapper';
// import { Audio } from 'expo-av';
// import ErrorBoundary from '../components/ErrorBoundary';
// import MiniPlayer from '../components/MiniPlayer';
// import {
//   registerForPushNotifications,
//   registerBackgroundHandler,
// } from '../services/notificationService';
// import { API_BASE_URL } from '../utils/api';
// import Constants from 'expo-constants';

// function RootLayoutContent() {
//   const { isDark } = useTheme();

//   useEffect(() => {
//     // ✅ Only register push in dev/production builds, not Expo Go
//     const isExpoGo = Constants.appOwnership === 'expo';

//     if (!isExpoGo) {
//       registerBackgroundHandler();

//       (async () => {
//         const pushToken = await registerForPushNotifications();

//         if (pushToken) {
//           try {
//             await fetch(`${API_BASE_URL}/api/push-tokens/register`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ token: pushToken }),
//             });
//             console.log('Push token registered with backend');
//           } catch (error) {
//             console.error('Failed to register push token:', error);
//           }
//         }
//       })();
//     } else {
//       console.log('Push notifications disabled in Expo Go');
//     }
//   }, []);

//   return (
//     <SafeAreaWrapper>
//       <StatusBar style={isDark ? 'light' : 'dark'} />
//       <Stack screenOptions={{ headerShown: false }} />
//       <MiniPlayer />
//     </SafeAreaWrapper>
//   );
// }

// // ✅ Audio setup runs before providers mount
// function AudioSetup() {
//   useEffect(() => {
//     (async () => {
//       try {
//         await Audio.setAudioModeAsync({
//           allowsRecordingIOS: false,
//           playsInSilentModeIOS: true,
//           staysActiveInBackground: true,
//           interruptionModeIOS: 1,
//           shouldDuckAndroid: true,
//           interruptionModeAndroid: 1,
//         });
//       } catch (_) {}
//     })();
//   }, []);

//   return null;
// }

// export default function RootLayout() {
//   useFrameworkReady();

//   return (
//     <ErrorBoundary>
//       {/* ✅ Providers now wrap everything including all route groups */}
//       <ThemeProvider>
//         <LanguageProvider>
//           <AuthProvider>
//             <PlayProvider>
//               <AudioSetup />
//               <RootLayoutContent />
//             </PlayProvider>
//           </AuthProvider>
//         </LanguageProvider>
//       </ThemeProvider>
//     </ErrorBoundary>
//   );
// }
