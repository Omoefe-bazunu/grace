import { Tabs } from 'expo-router';
import {
  Home as HomeIcon,
  Music,
  Mic,
  Video,
  User,
  Podcast,
} from 'lucide-react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

// Defines the tab navigation layout for the app
export default function TabLayout() {
  const { translations } = useLanguage(); // Access translations for tab labels
  const { colors } = useTheme(); // Access theme colors for styling

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide default header
        tabBarActiveTintColor: colors.primary, // Color for active tab
        tabBarInactiveTintColor: colors.textSecondary, // Color for inactive tabs
        tabBarStyle: {
          backgroundColor: colors.surface, // Background color of tab bar
          borderTopWidth: 1, // Top border for tab bar
          borderTopColor: colors.border, // Border color
          paddingBottom: 5, // Bottom padding
          paddingTop: 5, // Top padding
          height: 60, // Fixed height for tab bar
        },
        tabBarLabelStyle: {
          fontSize: 12, // Font size for tab labels
          fontWeight: '600', // Font weight for tab labels
        },
      }}
    >
      {/* Home tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: translations.home,
          tabBarIcon: ({ size, color }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      {/* Songs tab (replaces hymns) */}
      <Tabs.Screen
        name="songs"
        options={{
          title: translations.songs,
          tabBarIcon: ({ size, color }) => <Music size={size} color={color} />,
        }}
      />
      {/* Sermons tab */}
      <Tabs.Screen
        name="sermons"
        options={{
          title: translations.sermons,
          tabBarIcon: ({ size, color }) => <Mic size={size} color={color} />,
        }}
      />
      {/* Animations tab */}
      <Tabs.Screen
        name="animations"
        options={{
          title: translations.animations,
          tabBarIcon: ({ size, color }) => <Video size={size} color={color} />,
        }}
      />
      {/* Live Stream tab */}
      <Tabs.Screen
        name="live"
        options={{
          title: translations.stream,
          tabBarIcon: ({ size, color }) => (
            <Podcast size={size} color={color} />
          ),
        }}
      />
      {/* Profile tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: translations.profile,
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
