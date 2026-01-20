// import { Tabs } from 'expo-router';
// import {
//   Home as HomeIcon,
//   Music,
//   Mic,
//   Video,
//   User,
//   Podcast,
//   Archive,
// } from 'lucide-react-native';
// import { useLanguage } from '../../contexts/LanguageContext';
// import { useTheme } from '../../contexts/ThemeContext';

// // Defines the tab navigation layout for the app
// export default function TabLayout() {
//   const { translations } = useLanguage(); // Access translations for tab labels
//   const { colors } = useTheme(); // Access theme colors for styling

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false, // Hide default header
//         tabBarActiveTintColor: colors.primary, // Color for active tab
//         tabBarInactiveTintColor: colors.textSecondary, // Color for inactive tabs
//         tabBarStyle: {
//           backgroundColor: colors.surface, // Background color of tab bar
//           borderTopWidth: 1, // Top border for tab bar
//           borderTopColor: colors.border, // Border color
//           paddingBottom: 5, // Bottom padding
//           paddingTop: 5, // Top padding
//           height: 60, // Fixed height for tab bar
//         },
//         tabBarLabelStyle: {
//           fontSize: 8, // Font size for tab labels
//           fontWeight: '600', // Font weight for tab labels
//         },
//         tabBarScrollEnabled: true,
//       }}
//     >
//       {/* Home tab */}
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: translations.home,
//           tabBarIcon: ({ size, color }) => (
//             <HomeIcon size={size} color={color} />
//           ),
//         }}
//       />
//       {/* Sermons tab */}
//       <Tabs.Screen
//         name="sermons"
//         options={{
//           title: translations.sermons,
//           tabBarIcon: ({ size, color }) => <Mic size={size} color={color} />,
//         }}
//       />
//       {/* Songs tab (replaces hymns) */}
//       <Tabs.Screen
//         name="songs"
//         options={{
//           title: translations.songs,
//           tabBarIcon: ({ size, color }) => <Music size={size} color={color} />,
//         }}
//       />

//       {/* Animations tab */}
//       <Tabs.Screen
//         name="animations"
//         options={{
//           title: translations.animations,
//           tabBarIcon: ({ size, color }) => <Video size={size} color={color} />,
//         }}
//       />
//       {/* Live Stream tab */}
//       <Tabs.Screen
//         name="live"
//         options={{
//           title: 'Live',
//           tabBarIcon: ({ size, color }) => (
//             <Podcast size={size} color={color} />
//           ),
//         }}
//       />
//       {/* Archives tab */}
//       <Tabs.Screen
//         name="archive"
//         options={{
//           title: 'Archive',
//           tabBarIcon: ({ size, color }) => (
//             <Archive size={size} color={color} />
//           ),
//         }}
//       />
//       {/* Profile tab */}
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: translations.profile,
//           tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
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
          height: Platform.OS === 'ios' ? 88 : 68, // Modern taller height
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          // Subtle shadow for light mode depth
          elevation: isDark ? 0 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11, // Increased slightly for better legibility
          fontWeight: '600',
          marginTop: 2,
        },
        // Ensures scrolling works if icons exceed screen width
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
          title: translations.profile,
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}
