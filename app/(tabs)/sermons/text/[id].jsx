import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Copy,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Calendar,
  User,
  Volume2,
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getSermon } from '../../../../services/dataService';
import { apiClient } from '../../../../utils/api';
import { TopNavigation } from '../../../../components/TopNavigation';
import { AppText } from '../../../../components/ui/AppText';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import * as Clipboard from 'expo-clipboard';

const MAX_CHARS_PER_CHUNK = 4000;
const SENTENCE_ENDINGS = /[.!?]+/;

export default function SermonDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentLanguage } = useLanguage();
  const { colors } = useTheme();

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sound, setSound] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const [currentChunk, setCurrentChunk] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);

  // Configure audio mode on mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Audio mode setup error:', error);
      }
    };
    configureAudio();
  }, []);

  // Split text helper
  const splitTextIntoChunks = (text) => {
    if (!text) return [];
    const chunks = [];
    let tempChunk = '';
    const sentences = text.split(SENTENCE_ENDINGS);
    for (const sentence of sentences) {
      const fullSentence =
        sentence + (text[text.indexOf(sentence) + sentence.length] || '.');
      if ((tempChunk + fullSentence).length <= MAX_CHARS_PER_CHUNK) {
        tempChunk += fullSentence;
      } else {
        if (tempChunk) chunks.push(tempChunk.trim());
        tempChunk = fullSentence;
      }
    }
    if (tempChunk.trim()) chunks.push(tempChunk.trim());
    return chunks;
  };

  useEffect(() => {
    if (!id) return;

    const fetchSermon = async () => {
      setLoading(true);
      try {
        const sermonData = await getSermon(id);
        if (sermonData) {
          setSermon(sermonData);
          const contentObj =
            sermonData.translations?.[currentLanguage] ||
            sermonData.translations?.en ||
            sermonData;
          if (contentObj?.content) {
            const chunks = splitTextIntoChunks(contentObj.content);
            setAudioChunks(chunks);
            setTotalChunks(chunks.length);
          }
        } else {
          setSermon(null);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        setSermon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSermon();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [id, currentLanguage]);

  const playChunk = async (chunkIndex) => {
    if (chunkIndex >= audioChunks.length) {
      handleStop();
      return;
    }

    let fileUri = null;

    try {
      setCurrentChunk(chunkIndex);
      setGenerating(true);

      const config =
        currentLanguage === 'es'
          ? { languageCode: 'es-ES', name: 'es-ES-Neural2-B' }
          : currentLanguage === 'fr'
            ? { languageCode: 'fr-FR', name: 'fr-FR-Neural2-B' }
            : { languageCode: 'en-US', name: 'en-US-Neural2-F' };

      const response = await apiClient.post('tts/synthesize', {
        text: audioChunks[chunkIndex],
        languageCode: config.languageCode,
        name: config.name,
      });

      if (!response.data?.audioContent) {
        throw new Error('No audio content received from server');
      }

      // Unload previous sound completely before creating new one
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch (e) {
          console.log('Error unloading previous sound:', e);
        }
        setSound(null);
      }

      // Write base64 audio to a temporary file
      fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;

      await FileSystem.writeAsStringAsync(fileUri, response.data.audioContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create and load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
        (status) => onPlaybackStatusUpdate(status, fileUri, chunkIndex),
      );

      setSound(newSound);
      setGenerating(false);
    } catch (error) {
      console.error('Audio playback error:', error);
      setGenerating(false);

      // Clean up file if it was created
      if (fileUri) {
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(
          console.error,
        );
      }

      Alert.alert('Audio Error', 'Unable to play audio. Please try again.');
      handleStop();
    }
  };

  const onPlaybackStatusUpdate = (status, fileUri, chunkIndex) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setPlaybackDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        // Clean up the temporary file
        if (fileUri) {
          FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(
            console.error,
          );
        }
        // Play next chunk
        playChunk(chunkIndex + 1);
      }
    } else if (status.error) {
      console.error('Playback status error:', status.error);
    }
  };

  const handleSpeak = async () => {
    try {
      if (isSpeaking && !isPaused) {
        // Pause
        if (sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.pauseAsync();
            setIsPaused(true);
          }
        }
        return;
      }

      if (isSpeaking && isPaused) {
        // Resume
        if (sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.playAsync();
            setIsPaused(false);
          }
        }
        return;
      }

      // Start new playback
      setIsSpeaking(true);
      setIsPaused(false);
      await playChunk(0);
    } catch (error) {
      console.error('Error in handleSpeak:', error);
      Alert.alert('Error', 'Failed to control audio playback');
    }
  };

  const handleStop = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        setSound(null);
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentChunk(0);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    setGenerating(false);
  };

  const handleSkipBack = async () => {
    if (currentChunk > 0 && !generating) {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch (e) {
          console.log('Error during skip back:', e);
        }
        setSound(null);
      }
      await playChunk(currentChunk - 1);
    }
  };

  const handleSkipForward = async () => {
    if (currentChunk < totalChunks - 1 && !generating) {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch (e) {
          console.log('Error during skip forward:', e);
        }
        setSound(null);
      }
      await playChunk(currentChunk + 1);
    }
  };

  const handleCopyToClipboard = async () => {
    const contentObj =
      sermon?.translations?.[currentLanguage] ||
      sermon?.translations?.en ||
      sermon;
    if (!contentObj?.content) return;
    await Clipboard.setStringAsync(contentObj.content);
    Alert.alert('Success', 'Copied to clipboard');
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!sermon) {
    return (
      <SafeAreaWrapper>
        <TopNavigation showBackButton={true} title="Sermon" />
        <View style={styles.center}>
          <AppText style={{ color: colors.textSecondary }}>
            Sermon not found
          </AppText>
        </View>
      </SafeAreaWrapper>
    );
  }

  const contentObj =
    sermon.translations?.[currentLanguage] || sermon.translations?.en || sermon;
  const progress =
    playbackDuration > 0 ? playbackPosition / playbackDuration : 0;
  const overallProgress =
    totalChunks > 0 ? currentChunk / totalChunks + progress / totalChunks : 0;

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} title="Sermon" />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText style={[styles.title, { color: colors.text }]}>
            {contentObj.title || 'Untitled'}
          </AppText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={colors.textSecondary} />
              <AppText
                style={[styles.metaText, { color: colors.textSecondary }]}
              >
                {sermon.date || 'GKS Sermon'}
              </AppText>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.playerCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.playerHeader}>
            <View style={styles.playerInfo}>
              <Volume2 size={18} color={colors.primary} />
              <AppText style={[styles.playerLabel, { color: colors.text }]}>
                Audio Assistant
              </AppText>
            </View>
            <TouchableOpacity
              onPress={handleCopyToClipboard}
              style={[styles.copyIcon, { backgroundColor: colors.background }]}
            >
              <Copy size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBarBase,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${overallProgress * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <AppText
                style={[styles.progressText, { color: colors.textSecondary }]}
              >
                Part {currentChunk + 1} of {totalChunks}
              </AppText>
              <AppText
                style={[styles.progressText, { color: colors.textSecondary }]}
              >
                {Math.round(overallProgress * 100)}%
              </AppText>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handleSkipBack}
              disabled={currentChunk <= 0 || generating}
              style={{ opacity: currentChunk > 0 && !generating ? 1 : 0.3 }}
            >
              <SkipBack size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStop}
              disabled={!isSpeaking}
              style={{ opacity: isSpeaking ? 1 : 0.3 }}
            >
              <Square size={22} color={colors.error} fill={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSpeak}
              style={[styles.mainPlayBtn, { backgroundColor: colors.primary }]}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : isSpeaking && !isPaused ? (
                <Pause size={28} color="#fff" />
              ) : (
                <Play size={28} color="#fff" fill="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSkipForward}
              disabled={currentChunk >= totalChunks - 1 || generating}
              style={{
                opacity:
                  currentChunk < totalChunks - 1 && !generating ? 1 : 0.3,
              }}
            >
              <SkipForward size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentSection}>
          {contentObj.content
            ?.split('\n')
            .filter((p) => p.trim())
            .map((para, i) => (
              <AppText
                key={i}
                style={[styles.paragraph, { color: colors.text }]}
              >
                {para}
              </AppText>
            ))}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '600' },
  playerCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  copyIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: { marginBottom: 20 },
  progressBarBase: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: { fontSize: 10, fontWeight: '700' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  contentSection: { paddingHorizontal: 24, paddingTop: 30 },
  paragraph: { fontSize: 16, lineHeight: 26, marginBottom: 18, opacity: 0.85 },
});
