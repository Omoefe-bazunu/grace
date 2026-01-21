import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * Entry point of the application.
 * Redirects every user to onboarding regardless of auth status.
 */
export default function Index() {
  useEffect(() => {
    // We use a small timeout or immediate replace to ensure
    // the layout is ready before navigating.
    const timer = setTimeout(() => {
      router.replace('/(onboarding)');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return <LoadingSpinner />;
}
