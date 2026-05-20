import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ✅ This MUST be called at the top level (outside any component)
// so the app handles notifications even when foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  // Push notifications only work on real devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Android: create notification channel (required for Android 8+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E3A8A',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  // Check / request permissions (works for both iOS and Android)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  try {
    // projectId is required for managed Expo workflow builds
    const projectId =
      process.env.EXPO_PUBLIC_PROJECT_ID || // set in .env if needed
      ''; // leave empty and Expo will read from app.json automatically

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const token = tokenData.data;
    console.log('Expo push token:', token);
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Called once from _layout.tsx — sets up foreground + tap listeners
export function registerBackgroundHandler() {
  // Foreground notification listener
  const foregroundSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received in foreground:', notification);
    },
  );

  // Tap/interaction listener (e.g. navigate on tap)
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification tapped:', response);
      // You can add navigation logic here if needed:
      // const data = response.notification.request.content.data;
      // router.push(data.route);
    },
  );

  // Return cleanup (called if layout unmounts — unlikely but good practice)
  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
}
