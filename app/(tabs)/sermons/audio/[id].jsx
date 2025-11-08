// app/sermons/audio/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  Rewind,
  Calendar,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { getSermon } from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

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
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const isMounted = useRef(true);

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
    };
  }, [id]);

  const loadAudio = async (url) => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      if (isMounted.current) setSound(newSound);
    } catch (error) {
      console.error('Audio load error:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!isMounted.current) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    if (status.durationMillis) setDuration(status.durationMillis);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
      sound.setPositionAsync(0);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      isPlaying ? await sound.pauseAsync() : await sound.playAsync();
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

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const mins = Math.floor(millis / 60000);
    const secs = Math.floor((millis % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <SkeletonSermon />;
  if (!sermon || !sermon.audioUrl) {
    return (
      <SafeAreaWrapper>
        <Text style={[styles.error, { color: colors.error }]}>
          {translations.errorSermonNotFound || 'Sermon not found or no audio.'}
        </Text>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations.audioSermon || 'Audio Sermon'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {sermon.title || translations.noTitle}
        </Text>

        <View style={styles.dateRow}>
          <Calendar size={18} color={colors.textSecondary} />
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {sermon.date || translations.unknownDate}
          </Text>
        </View>

        <View style={styles.audioControls}>
          <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
            <Rewind size={24} color={colors.text} />
            <Text style={[styles.controlText, { color: colors.text }]}>
              -10s
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playPauseButton}
          >
            {isPlaying ? (
              <Pause size={48} color="#FFFFFF" />
            ) : (
              <Play size={48} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFastForward}
            style={styles.controlButton}
          >
            <FastForward size={24} color={colors.text} />
            <Text style={[styles.controlText, { color: colors.text }]}>
              +10s
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(position)}
          </Text>
          <View
            style={[styles.progressBarBg, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: duration ? `${(position / duration) * 100}%` : '0%',
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  date: { fontSize: 16 },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  playPauseButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 50,
    padding: 20,
  },
  controlButton: { alignItems: 'center', padding: 10 },
  controlText: { fontSize: 12, marginTop: 4 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  timeText: { fontSize: 12, marginHorizontal: 8 },
  progressBarBg: { flex: 1, height: 4, borderRadius: 2 },
  progressBar: { height: '100%', borderRadius: 2 },
  infoBox: { borderRadius: 12, padding: 20, marginBottom: 30 },
  infoText: { fontSize: 16, lineHeight: 24 },
  error: { fontSize: 18, textAlign: 'center', marginTop: 50 },
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
  skeletonAudio: {
    height: 40,
    width: '100%',
    borderRadius: 4,
    marginBottom: 20,
  },
});
