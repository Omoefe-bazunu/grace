import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import {
  Home as HomeIcon,
  Music,
  Mic,
  Video,
  User,
  Podcast,
  Archive,
} from 'lucide-react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { translations } = useLanguage();
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          elevation: isDark ? 0 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          // THIS PREVENTS SYSTEM FONT SCALING
          allowFontScaling: false,
        },
        // Prevents the tab bar icons from scaling with system accessibility settings
        tabBarAllowFontScaling: false,
        tabBarScrollEnabled: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: translations.home,
          tabBarIcon: ({ color }) => (
            <HomeIcon size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="sermons"
        options={{
          title: translations.sermons,
          tabBarIcon: ({ color }) => (
            <Mic size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: translations.songs,
          tabBarIcon: ({ color }) => (
            <Music size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="animations"
        options={{
          title: translations.animations,
          tabBarIcon: ({ color }) => (
            <Video size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color }) => (
            <Podcast size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => (
            <Archive size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Keeps the profile tab hidden as requested
          title: translations.profile,
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}
