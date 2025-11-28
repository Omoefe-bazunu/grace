import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  Rewind,
} from 'lucide-react-native';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { getSong } from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { LanguageSwitcher } from '../../../../components/LanguageSwitcher';
import { TopNavigation } from '../../../../components/TopNavigation';

// --- Placeholder/Skeleton Component (Remains Unchanged) ---
const SkeletonSong = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaWrapper>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonHeaderTitle}
        />
      </View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={[styles.skeletonTitle, { alignSelf: 'center' }]}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={[styles.skeletonSubtitle, { alignSelf: 'center' }]}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonCD}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonAudio}
        />
        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonInfoTitle}
          />
          <LinearGradient
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonInfoText}
          />
          <LinearGradient
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonInfoText}
          />
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const HARDCODED_ALBUM_ART_URL =
  'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/CHOIR.png?alt=media&token=92dd7301-75bd-4ea8-a042-371e94649186';

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams();
  const { translations } = useLanguage();
  const { colors } = useTheme();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audio Playback State
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- ANIMATION STATE ---
  // The animated value now controls the scale for the pulse effect
  const pulse = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null); // Reference to the running animation loop

  const isMounted = useRef(true);
  const isUnmounting = useRef(false);

  // --- PULSE ANIMATION LOGIC ---

  const startPulse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    pulse.setValue(1); // Reset to original size

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05, // Scale slightly up (5% larger)
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1, // Scale back down
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const stopPulse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null; // Clear the ref
      // Optionally reset the scale immediately, though the stop should leave it at 1
      pulse.setValue(1);
    }
  }, [pulse]);

  // --- AUDIO LOGIC ---

  const onPlaybackStatusUpdate = useCallback(
    (status) => {
      if (isUnmounting.current || !isMounted.current) return;

      if (status.isLoaded) {
        // Crucial logic: Check if the playing state has changed
        if (status.isPlaying !== isPlaying) {
          if (status.isPlaying) {
            startPulse();
          } else {
            stopPulse();
          }
        }

        setIsPlaying(status.isPlaying);
        setPosition(status.positionMillis || 0);

        if (status.durationMillis) {
          setDuration(status.durationMillis);
        }

        if (status.didJustFinish) {
          // Song finished: stop all activity
          setIsPlaying(false);
          setPosition(0);
          stopPulse();
        }
      } else {
        if (status.error) {
          console.error('Audio playback error:', status.error);
        }
      }
    },
    [startPulse, stopPulse, isPlaying]
  );

  const loadAudio = async (url) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        stopPulse();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      if (isMounted.current && !isUnmounting.current) {
        setSound(newSound);
      } else {
        await newSound.unloadAsync();
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      if (isMounted.current) {
        Alert.alert('Audio Error', 'Could not load song audio.');
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    isUnmounting.current = false;

    const fetchSong = async () => {
      try {
        const songData = await getSong(id);
        if (isMounted.current && !isUnmounting.current) {
          setSong(songData);
        }
      } catch (error) {
        console.error('Error fetching song:', error);
        if (isMounted.current) {
          setSong(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchSong();

    return () => {
      isMounted.current = false;
      isUnmounting.current = true;
      stopPulse(); // Clean up animation on component unmount
    };
  }, [id, stopPulse]);

  useEffect(() => {
    if (song?.audioUrl) {
      loadAudio(song.audioUrl);
    }

    return () => {
      if (sound) {
        isUnmounting.current = true;
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [song?.audioUrl]);

  // --- PLAYER CONTROLS ---

  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        stopPulse();
      } else {
        await sound.playAsync();
        startPulse();
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
      Alert.alert('Error', 'Unable to play/pause audio');
    }
  };

  const handleFastForward = async () => {
    if (!sound || !duration) return;

    try {
      const newPosition = Math.min(position + 10000, duration);
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Fast forward error:', error);
    }
  };

  const handleRewind = async () => {
    if (!sound) return;

    try {
      const newPosition = Math.max(0, position - 10000);
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Rewind error:', error);
    }
  };

  // --- UI HELPERS ---

  const formatTime = (millis) => {
    if (isNaN(millis) || millis < 0) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- RENDER ---

  if (loading) {
    return <SkeletonSong />;
  }

  if (!song || !song.audioUrl) {
    return (
      <SafeAreaWrapper>
        <Text style={[styles.error, { color: colors.error }]}>
          {translations.errorSongNotFound || 'Song not found or no audio URL.'}
        </Text>
      </SafeAreaWrapper>
    );
  }

  const albumArtSource = { uri: HARDCODED_ALBUM_ART_URL };

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <TopNavigation showBackButton={true} />

      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {song.title || translations.noTitle}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {song.artist || translations.unknownArtist}
        </Text>

        {/* --- Pulsing CD / Album Art --- */}
        <View style={styles.albumArtContainer}>
          <Animated.View
            style={[
              styles.albumArtDisc,
              {
                // Applying the pulse (scale) style
                transform: [{ scale: pulse }],
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Image for the album art */}
            <Image
              source={albumArtSource}
              style={styles.albumArtImage}
              resizeMode="cover"
            />
            {/* Center hole */}
            <View style={[styles.cdHole]} />
          </Animated.View>
        </View>

        {/* --- Audio Controls: Rewind, Play/Pause, FastForward --- */}
        <View style={styles.audioControls}>
          {/* Rewind -10s */}
          <TouchableOpacity
            onPress={handleRewind}
            style={styles.controlButton}
            disabled={!sound}
          >
            <Rewind
              size={24}
              color={sound ? colors.text : colors.textSecondary}
            />
            <Text
              style={[
                styles.controlText,
                { color: sound ? colors.text : colors.textSecondary },
              ]}
            >
              -10s
            </Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[
              styles.playPauseButton,
              { backgroundColor: colors.primary },
            ]}
            disabled={!sound}
          >
            {isPlaying ? (
              <Pause size={48} color="#FFFFFF" />
            ) : (
              <Play size={48} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {/* Fast Forward +10s */}
          <TouchableOpacity
            onPress={handleFastForward}
            style={styles.controlButton}
            disabled={!sound}
          >
            <FastForward
              size={24}
              color={sound ? colors.text : colors.textSecondary}
            />
            <Text
              style={[
                styles.controlText,
                { color: sound ? colors.text : colors.textSecondary },
              ]}
            >
              +10s
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(position)}
          </Text>
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: colors.textSecondary + '30' },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width:
                    duration > 0 ? `${(position / duration) * 100}%` : '0%',
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>

        {/* Info Container */}
        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {translations.category}:{' '}
            {song.category || translations.unknownCategory}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {translations.duration}: {formatTime(duration)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  albumArtContainer: {
    alignItems: 'center',
  },
  albumArtDisc: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cdHole: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
    backgroundColor: '#919191ff',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  playPauseButton: {
    borderRadius: 50,
    padding: 20,
    backgroundColor: '#1E3A8A',
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlText: {
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  infoContainer: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    opacity: 0.9,
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  skeletonHeaderTitle: {
    height: 18,
    width: '60%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  skeletonTitle: {
    height: 28,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonCD: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignSelf: 'center',
    marginVertical: 30,
  },
  skeletonAudio: {
    height: 40,
    width: '100%',
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonInfoTitle: {
    height: 20,
    width: '50%',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonInfoText: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
});
