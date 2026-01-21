import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  Rewind,
  Calendar,
  Mic,
  Repeat, // Added
  Download, // Added
} from 'lucide-react-native';

// FileSystem & MediaLibrary for Real Saving
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { useLanguage } from '@/contexts/LanguageContext';
import { AppText } from '../../../../components/ui/AppText';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { getSermon } from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { TopNavigation } from '../../../../components/TopNavigation';

// --- Placeholder/Skeleton Component ---
const SkeletonSermon = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaWrapper>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonHeaderTitle}
        />
      </View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonDate}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonVisual}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonAudio}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default function SermonAudioDetailScreen() {
  const { id } = useLocalSearchParams();
  const { translations } = useLanguage();
  const { colors } = useTheme();

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audio State
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false); // Added Loop State
  const [isDownloading, setIsDownloading] = useState(false); // Added Download State

  // --- ANIMATION STATE ---
  const pulse = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);
  const isMounted = useRef(true);

  // --- PULSE ANIMATION LOGIC ---
  const startPulse = useCallback(() => {
    if (animationRef.current) animationRef.current.stop();
    pulse.setValue(1);

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const stopPulse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
      pulse.setValue(1);
    }
  }, [pulse]);

  // --- AUDIO LOGIC ---
  const onPlaybackStatusUpdate = useCallback(
    (status) => {
      if (!isMounted.current) return;

      if (status.isLoaded) {
        // Pulse Logic
        if (status.isPlaying !== isPlaying) {
          status.isPlaying ? startPulse() : stopPulse();
        }

        setIsPlaying(status.isPlaying);
        setPosition(status.positionMillis);
        if (status.durationMillis) setDuration(status.durationMillis);

        // Loop / End Logic
        if (status.didJustFinish) {
          if (isLooping) {
            // If looping, the player might handle it automatically if setIsLoopingAsync is set,
            // but we ensure logic consistency here.
          } else {
            setIsPlaying(false);
            setPosition(0);
            sound.setPositionAsync(0);
            stopPulse();
          }
        }
      } else if (status.error) {
        console.error('Audio load error:', status.error);
        stopPulse();
      }
    },
    [isPlaying, startPulse, stopPulse, sound, isLooping],
  );

  const loadAudio = async (url) => {
    try {
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false, isLooping: isLooping },
        onPlaybackStatusUpdate,
      );

      if (isMounted.current) setSound(newSound);
    } catch (error) {
      console.error('Audio load error:', error);
      if (isMounted.current)
        Alert.alert('Load Error', 'Failed to load audio source.');
    }
  };

  useEffect(() => {
    isMounted.current = true;
    const fetchAndLoadSermon = async () => {
      try {
        const sermonData = await getSermon(id);
        if (isMounted.current) {
          setSermon(sermonData);
          if (sermonData?.audioUrl) {
            await loadAudio(sermonData.audioUrl);
          }
        }
      } catch (error) {
        console.error('Error loading sermon:', error);
        if (isMounted.current) setSermon(null);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchAndLoadSermon();

    return () => {
      isMounted.current = false;
      if (sound) sound.unloadAsync();
      stopPulse();
    };
  }, [id, stopPulse]);

  // --- CONTROLS ---

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        stopPulse();
      } else {
        await sound.playAsync();
        startPulse();
      }
    }
  };

  const handleToggleLoop = async () => {
    const nextState = !isLooping;
    setIsLooping(nextState);
    if (sound) {
      await sound.setIsLoopingAsync(nextState);
    }
  };

  const handleFastForward = async () => {
    if (sound) {
      const newPos = Math.min(duration, position + 10000);
      await sound.setPositionAsync(newPos);
    }
  };

  const handleRewind = async () => {
    if (sound) {
      const newPos = Math.max(0, position - 10000);
      await sound.setPositionAsync(newPos);
    }
  };

  // --- DOWNLOAD LOGIC (Same as Music Player) ---
  const handleDownload = async () => {
    if (!sermon?.audioUrl) return;

    // 1. Permission Check
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to save sermons to your device.',
      );
      return;
    }

    setIsDownloading(true);
    try {
      // 2. Define path
      const filename = `Sermon_${sermon.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;

      // 3. Download
      const { uri } = await FileSystem.downloadAsync(sermon.audioUrl, fileUri);

      // 4. Save to Gallery/Music
      const asset = await MediaLibrary.createAssetAsync(uri);

      if (Platform.OS === 'android') {
        const album = await MediaLibrary.getAlbumAsync('GraceApp Sermons');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('GraceApp Sermons', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      }

      Alert.alert('Success', 'Sermon saved to your device!');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (millis) => {
    if (!millis || isNaN(millis) || millis < 0) return '0:00';
    const mins = Math.floor(millis / 60000);
    const secs = Math.floor((millis % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <SkeletonSermon />;
  if (!sermon || !sermon.audioUrl) {
    return (
      <SafeAreaWrapper>
        <AppText style={[styles.error, { color: colors.error }]}>
          {translations.errorSermonNotFound || 'Sermon not found or no audio.'}
        </AppText>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
      >
        {/* Visualizer (Pulsing Mic) */}
        <View style={styles.audioVisualContainer}>
          <Animated.View
            style={[
              styles.audioVisualDisc,
              {
                transform: [{ scale: pulse }],
                backgroundColor: colors.card,
                borderColor: colors.border,
                elevation: 10, // Shadow matching music player
              },
            ]}
          >
            <View
              style={[
                styles.micIconContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Mic size={60} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>

        {/* Titles */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <AppText style={[styles.title, { color: colors.text }]}>
            {sermon.title || translations.noTitle}
          </AppText>

          <View style={styles.dateRow}>
            <Calendar size={16} color={colors.textSecondary} />
            <AppText style={[styles.date, { color: colors.textSecondary }]}>
              {sermon.date || translations.unknownDate}
            </AppText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <AppText style={{ color: colors.textSecondary }}>
              {formatTime(position)}
            </AppText>
            <AppText style={{ color: colors.textSecondary }}>
              {formatTime(duration)}
            </AppText>
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: duration ? `${(position / duration) * 100}%` : '0%',
                height: '100%',
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        {/* --- CONTROLS ROW --- */}
        <View style={styles.audioControls}>
          {/* Repeat */}
          <TouchableOpacity onPress={handleToggleLoop}>
            <Repeat
              color={isLooping ? colors.primary : colors.textSecondary}
              size={24}
            />
          </TouchableOpacity>

          {/* Rewind */}
          <TouchableOpacity onPress={handleRewind}>
            <Rewind size={32} color={colors.text} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[
              styles.playPauseButton,
              { backgroundColor: colors.primary },
            ]}
          >
            {isPlaying ? (
              <Pause size={32} color="#FFFFFF" />
            ) : (
              <Play size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {/* Fast Forward */}
          <TouchableOpacity onPress={handleFastForward}>
            <FastForward size={32} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownload}
            disabled={isDownloading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Download
                color={colors.textSecondary}
                size={20}
                style={{ marginRight: 8 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  date: { fontSize: 14 },

  // Visualizer Styles (Matched to Album Art dimensions)
  audioVisualContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  audioVisualDisc: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  micIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Controls
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    elevation: 2,
  },

  // Skeleton
  skeletonHeaderTitle: {
    height: 18,
    width: '60%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  skeletonTitle: {
    height: 28,
    width: '90%',
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'center',
  },
  skeletonDate: {
    height: 16,
    width: '50%',
    borderRadius: 4,
    marginBottom: 20,
    alignSelf: 'center',
  },
  skeletonVisual: {
    width: 250,
    height: 250,
    borderRadius: 125,
    alignSelf: 'center',
    marginVertical: 30,
  },
  skeletonAudio: {
    height: 40,
    width: '100%',
    borderRadius: 4,
    marginBottom: 20,
  },
  error: { fontSize: 18, textAlign: 'center', marginTop: 50 },
});
