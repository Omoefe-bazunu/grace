// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useColorScheme } from 'react-native';

// const lightColors = {
//   primary: '#1E3A8A',
//   secondary: '#F59E0B',
//   background: '#F8FAFC',
//   surface: '#FFFFFF',
//   text: '#1F2937',
//   textSecondary: '#6B7280',
//   border: '#E5E7EB',
//   card: '#FFFFFF',
//   error: '#EF4444',
//   success: '#059669',
//   warning: '#F59E0B',
//   skeleton: '#E0E0E0',
//   skeletonHighlight: '#F5F5F5',
// };

// const darkColors = {
//   primary: '#3B82F6',
//   secondary: '#FBBF24',
//   background: '#111827',
//   surface: '#1F2937',
//   text: '#F9FAFB',
//   textSecondary: '#D1D5DB',
//   border: '#374151',
//   card: '#1F2937',
//   error: '#F87171',
//   success: '#34D399',
//   warning: '#FBBF24',
//   skeleton: '#374151',
//   skeletonHighlight: '#4B5563',
// };

// const ThemeContext = createContext(undefined);

// export function ThemeProvider({ children }) {
//   const systemColorScheme = useColorScheme();
//   const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

//   useEffect(() => {
//     loadThemePreference();
//   }, []);

//   const loadThemePreference = async () => {
//     try {
//       const savedTheme = await AsyncStorage.getItem('themePreference');
//       if (savedTheme !== null) {
//         setIsDark(savedTheme === 'dark');
//       }
//     } catch (error) {
//       console.error('Error loading theme preference:', error);
//     }
//   };

//   const toggleTheme = async () => {
//     try {
//       const newTheme = !isDark;
//       setIsDark(newTheme);
//       await AsyncStorage.setItem(
//         'themePreference',
//         newTheme ? 'dark' : 'light'
//       );
//     } catch (error) {
//       console.error('Error saving theme preference:', error);
//     }
//   };

//   const colors = isDark ? darkColors : lightColors;

//   const value = {
//     isDark,
//     toggleTheme,
//     colors,
//   };

//   return (
//     <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
//   );
// }

// export function useTheme() {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// }

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const lightColors = {
  primary: '#4F46E5', // Modern Indigo
  secondary: '#0EA5E9', // Sky Blue
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  text: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  card: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  skeleton: '#F1F5F9', // Slate 100
  skeletonHighlight: '#E2E8F0', // Slate 200
  accent: '#F472B6', // Pink for highlights
};

const darkColors = {
  primary: '#6366F1', // Indigo 500
  secondary: '#38BDF8', // Sky 400
  background: '#09090B', // Zinc 950
  surface: '#18181B', // Zinc 900
  text: '#FAFAFA', // Zinc 50
  textSecondary: '#A1A1AA', // Zinc 400
  border: '#27272A', // Zinc 800
  card: '#18181B', // Zinc 900
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  skeleton: '#27272A', // Zinc 800
  skeletonHighlight: '#3F3F46', // Zinc 700
  accent: '#F472B6',
};

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    const syncTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme === null) {
        setIsDark(systemColorScheme === 'dark');
      }
    };
    syncTheme();
  }, [systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(
        'themePreference',
        newTheme ? 'dark' : 'light'
      );
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
