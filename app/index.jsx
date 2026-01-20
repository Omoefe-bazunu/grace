import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { isLoading } = useAuth(); // We no longer need 'user' here to decide on navigation

  useEffect(() => {
    checkFirstLaunch();
  }, [isLoading]);

  const checkFirstLaunch = async () => {
    if (isLoading) return;

    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      if (!hasSeenOnboarding) {
        // If they haven't seen onboarding, send them there first
        router.replace('/(onboarding)');
      } else {
        // GUEST ACCESS: Send all users to the main tabs, even if not logged in
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      // Fallback to onboarding if there's a storage error
      router.replace('/(onboarding)');
    }
  };

  return <LoadingSpinner />;
}
