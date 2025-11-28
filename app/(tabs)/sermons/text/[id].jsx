import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Copy,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { AudioPlayer } from '../../../../components/AudioPlayer';
import { getSermon } from '../../../../services/dataService';
import { apiClient } from '../../../../utils/api';
import { TopNavigation } from '../../../../components/TopNavigation';
import * as Clipboard from 'expo-clipboard';

// Constants
const MAX_CHARS_PER_CHUNK = 4000; // Safe limit for Google TTS
const SENTENCE_ENDINGS = /[.!?]+/;

export default function SermonDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentLanguage, translations } = useLanguage();
  const { colors } = useTheme();

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sound, setSound] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Chunking state
  const [currentChunk, setCurrentChunk] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [useCachedAudio, setUseCachedAudio] = useState(false);
  const [cachedAudioUrl, setCachedAudioUrl] = useState(null);

  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchSermon = async () => {
      try {
        const sermonData = await getSermon(id);
        setSermon(sermonData);

        // Pre-split content into chunks when sermon loads
        if (sermonData) {
          const content =
            sermonData.translations?.[currentLanguage] ||
            sermonData.translations?.en ||
            sermonData;
          if (content?.content) {
            const chunks = splitTextIntoChunks(content.content);
            setAudioChunks(chunks);
            setTotalChunks(chunks.length);
          }
        }
      } catch (error) {
        console.error('Error fetching sermon:', error);
        setSermon(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSermon();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  // Smart text splitting into chunks
  const splitTextIntoChunks = (text) => {
    if (!text) return [];

    const chunks = [];
    let currentChunk = '';
    const sentences = text.split(SENTENCE_ENDINGS);

    for (const sentence of sentences) {
      const sentenceWithPunctuation =
        sentence + (text[text.indexOf(sentence) + sentence.length] || '.');

      if (
        (currentChunk + sentenceWithPunctuation).length <= MAX_CHARS_PER_CHUNK
      ) {
        currentChunk += sentenceWithPunctuation;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentenceWithPunctuation;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };

  const getVoiceConfig = () => {
    switch (currentLanguage) {
      case 'es':
        return { languageCode: 'es-ES', name: 'es-ES-Neural2-B' };
      case 'fr':
        return { languageCode: 'fr-FR', name: 'fr-FR-Neural2-B' };
      default:
        return { languageCode: 'en-US', name: 'en-US-Neural2-F' };
    }
  };

  const generateTTSAudio = async (text) => {
    try {
      const voiceConfig = getVoiceConfig();

      // Call backend API instead of Google directly
      const response = await apiClient.generateTTS(
        text,
        voiceConfig.languageCode,
        voiceConfig.name
      );

      if (!response.data?.audioContent) {
        throw new Error('No audio content received from server');
      }

      return response.data.audioContent;
    } catch (error) {
      console.error('TTS Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Provide user-friendly error messages
      if (error.response?.status === 500) {
        throw new Error('Server error generating speech. Please try again.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }

      throw new Error(error.message || 'Failed to generate speech');
    }
  };

  const playChunk = async (chunkIndex) => {
    if (chunkIndex >= audioChunks.length) {
      // Finished all chunks
      handleStop();
      return;
    }

    try {
      setCurrentChunk(chunkIndex);
      setGenerating(true);

      const base64Audio = await generateTTSAudio(audioChunks[chunkIndex]);
      const audioUri = `data:audio/mp3;base64,${base64Audio}`;

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setGenerating(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis);
          setPlaybackDuration(status.durationMillis || 0);

          if (status.didJustFinish) {
            // Play next chunk when current finishes
            playChunk(chunkIndex + 1);
          }
        }
      });
    } catch (error) {
      console.error('Error playing chunk:', error);
      setGenerating(false);
      Alert.alert(
        'TTS Error',
        error.message || `Failed to generate speech for part ${chunkIndex + 1}`
      );
      handleStop();
    }
  };

  //Copy text to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      if (!content?.content) {
        Alert.alert('No Content', 'There is no content to copy.');
        return;
      }

      await Clipboard.setStringAsync(content.content);

      // Show success feedback
      Alert.alert(
        'Copied!',
        'Sermon content has been copied to your clipboard.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy content to clipboard.');
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking && !isPaused) {
      await handlePause();
      return;
    }

    if (isSpeaking && isPaused) {
      await handleResume();
      return;
    }

    if (audioChunks.length === 0) {
      Alert.alert(
        'No Content',
        'No sermon content available for speech generation'
      );
      return;
    }

    setIsSpeaking(true);
    setIsPaused(false);
    setCurrentWordIndex(-1);

    // Start from the first chunk
    await playChunk(0);
  };

  const handlePause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPaused(true);
    }
  };

  const handleResume = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPaused(false);
    }
  };

  const handleStop = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setCurrentChunk(0);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    setGenerating(false);
  };

  const skipToNextChunk = async () => {
    if (currentChunk < totalChunks - 1) {
      await playChunk(currentChunk + 1);
    }
  };

  const skipToPrevChunk = async () => {
    if (currentChunk > 0) {
      await playChunk(currentChunk - 1);
    }
  };

  // Simple text rendering without highlighting for now
  const renderTextContent = () => {
    if (!content?.content) return null;

    const paragraphs = content.content
      .split('\n')
      .filter((para) => para.trim() !== '');

    return paragraphs.map((paragraph, index) => (
      <Text
        key={index}
        style={{
          fontSize: 16,
          lineHeight: 26,
          color: colors.textSecondary,
          marginBottom: 16,
        }}
      >
        {paragraph}
      </Text>
    ));
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!sermon) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ color: colors.error }}>
          {translations.errorSermonNotFound || 'Sermon not found'}
        </Text>
      </SafeAreaView>
    );
  }

  const content =
    sermon.translations?.[currentLanguage] || sermon.translations?.en || sermon;
  const progress =
    playbackDuration > 0 ? playbackPosition / playbackDuration : 0;
  const overallProgress =
    totalChunks > 0 ? currentChunk / totalChunks + progress / totalChunks : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TopNavigation showBackButton={true} />

      <ScrollView
        style={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            textAlign: 'center',
            color: colors.primary,
            marginTop: 8,
          }}
        >
          {content.title || translations.noTitle}
        </Text>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            {sermon.date || translations.unknownDate}
          </Text>
        </View>

        {sermon.audioUrl && (
          <AudioPlayer
            url={sermon.audioUrl}
            title={content.title || translations.noTitle}
            duration={sermon.duration || translations.unknownDuration}
          />
        )}

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 20,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          {/* COPY TO CLIPBOARD BUTTON - ADD THIS BLOCK */}
          <TouchableOpacity
            onPress={handleCopyToClipboard}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary + '15',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
              gap: 8,
            }}
          >
            <Copy size={18} color={colors.primary} />
            <Text
              style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}
            >
              Copy Text to Clipboard
            </Text>
          </TouchableOpacity>
          {/* TTS Controls */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Part {currentChunk + 1} of {totalChunks}
            </Text>

            {/* Overall Progress */}
            <View
              style={{
                height: 6,
                backgroundColor: colors.border,
                borderRadius: 3,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  height: 6,
                  backgroundColor: colors.primary,
                  borderRadius: 3,
                  width: `${overallProgress * 100}%`,
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {Math.round(overallProgress * 100)}% Complete
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              gap: 12,
            }}
          >
            {/* Previous Chunk */}
            <TouchableOpacity
              onPress={skipToPrevChunk}
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
                opacity: currentChunk > 0 && !generating ? 1 : 0.5,
              }}
              disabled={currentChunk <= 0 || generating}
            >
              <SkipBack size={20} color="#fff" />
            </TouchableOpacity>

            {/* Stop */}
            <TouchableOpacity
              onPress={handleStop}
              style={{
                backgroundColor: colors.error,
                padding: 12,
                borderRadius: 8,
                opacity: isSpeaking ? 1 : 0.5,
              }}
              disabled={!isSpeaking}
            >
              <Square size={20} color="#fff" fill="#fff" />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              onPress={handleSpeak}
              style={{
                backgroundColor: isSpeaking
                  ? isPaused
                    ? '#F59E0B'
                    : colors.primary
                  : colors.primary,
                padding: 20,
                borderRadius: 100,
                minWidth: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : isSpeaking && !isPaused ? (
                <Pause size={24} color="#fff" />
              ) : (
                <Play size={24} color="#fff" />
              )}
            </TouchableOpacity>

            {/* Next Chunk */}
            <TouchableOpacity
              onPress={skipToNextChunk}
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
                opacity:
                  currentChunk < totalChunks - 1 && !generating ? 1 : 0.5,
              }}
              disabled={currentChunk >= totalChunks - 1 || generating}
            >
              <SkipForward size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Current Chunk Progress */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
              }}
            >
              <View
                style={{
                  height: 4,
                  backgroundColor: colors.primary,
                  borderRadius: 2,
                  width: `${progress * 100}%`,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {generating
                ? 'Generating audio...'
                : `Part Progress: ${Math.round(progress * 100)}%`}
            </Text>
          </View>

          {/* Sermon Content */}
          {renderTextContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, opacity: 0.9 },
  transcriptContainer: {
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
  transcriptTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  transcript: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.9,
    textAlign: 'justify',
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ttsButton: { padding: 6, borderRadius: 6 },
  loadMoreBtn: {
    marginTop: 16,
    padding: 12,
    color: '#fff',
    borderColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: { fontWeight: '600', fontSize: 14 },
  error: { fontSize: 18, textAlign: 'center', marginTop: 50 },
  skeletonTitle: {
    height: 28,
    width: '60%',
    borderRadius: 4,
    marginVertical: 8,
  },
  skeletonMeta: { height: 14, width: 80, borderRadius: 4 },
  skeletonAudio: {
    height: 40,
    width: '100%',
    borderRadius: 4,
    marginVertical: 10,
  },
  skeletonTranscriptTitle: {
    height: 20,
    width: '50%',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonTranscript: {
    height: 60,
    width: '100%',
    borderRadius: 4,
    marginBottom: 12,
  },
});
