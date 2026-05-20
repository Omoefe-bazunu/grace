// components/LiveFAB.jsx
import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, AppState } from 'react-native';
import { Video } from 'lucide-react-native';
import { router } from 'expo-router';
import { AppText } from './ui/AppText';
import { usePlayer } from '../contexts/PlayListContext';
import { getActiveLiveStreams } from '../services/dataService';

const POLL_INTERVAL = 60_000;

export default function LiveFAB() {
  const { miniPlayerVisible } = usePlayer();
  const [isLive, setIsLive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const checkLive = async () => {
    try {
      const streams = await getActiveLiveStreams();
      setIsLive(streams.some((s) => s.isActive));
    } catch {
      // silently fail
    }
  };

  // Poll on mount + every 60s
  useEffect(() => {
    checkLive();
    intervalRef.current = setInterval(checkLive, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Re-check when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        checkLive();
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  // Pulse animation when live
  useEffect(() => {
    if (!isLive) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isLive]);

  if (!isLive) return null;

  const bottomOffset = miniPlayerVisible ? 190 : 120;

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          bottom: bottomOffset,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/live')}
        activeOpacity={0.85}
      >
        <Video size={18} color="#fff" />
        <AppText style={styles.label}>LIVE</AppText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    zIndex: 999,
    elevation: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
