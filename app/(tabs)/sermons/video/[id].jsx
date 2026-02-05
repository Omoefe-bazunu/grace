import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Share2, Calendar, Folder } from 'lucide-react-native';
import { LanguageSwitcher } from '../../../../components/LanguageSwitcher';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getVideo, getSermonVideo } from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';

// ... SkeletonVideo remains unchanged ...

export default function AnimationDetailScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoType, setVideoType] = useState('video');
  const { translations } = useLanguage();
  const { colors } = useTheme();

  const player = useVideoPlayer();

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getSermonVideo(id);

        if (data && data.videoUrl) {
          setVideo(data);
          setVideoType('sermonVideo');
        } else {
          const animationData = await getVideo(id);
          if (animationData) {
            setVideo(animationData);
            setVideoType('video');
          } else {
            setVideo(null);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  useEffect(() => {
    if (video?.videoUrl) {
      player.replace({ uri: video.videoUrl });
    }
  }, [video, player]);

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(video.videoUrl);
      alert(translations.linkCopied || 'Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleShare = async () => {
    try {
      // ✅ Updated sharing labels to use translation keys
      const shareMessage =
        videoType === 'sermonVideo'
          ? `${translations.shareSermonVideoLabel || 'Sermon Video'}: ${video.title}\n${translations.category || 'Category'}: ${
              video.category || translations.noCategory || 'No category'
            }\n${video.videoUrl}`
          : `${video.title || translations.noTitle}: ${video.videoUrl}`;

      await Share.share({
        message: shareMessage,
        title:
          videoType === 'sermonVideo'
            ? translations.shareSermonVideoTitle || 'Share Sermon Video'
            : translations.shareVideoTitle || 'Share Video',
      });
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const formatDate = (dateString) => {
    // ✅ Updated "Unknown date" to use translation key
    if (!dateString) return translations.unknownDate || 'Unknown date';

    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      if (isNaN(date.getTime())) {
        return dateString;
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <SkeletonVideo />;
  }

  if (!video) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.error, { color: colors.error }]}>
          {translations.errorVideoNotFound || 'Video not found'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaWrapper
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopNavigation showBackButton={true} />

      <View style={styles.videoContainer}>
        <VideoView
          style={styles.videoPlayer}
          player={player}
          nativeControls={true}
          contentFit="contain"
          allowsFullscreen={true}
          allowsPictureInPicture={true}
        />
      </View>

      <View style={[styles.videoInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {video.title || translations.noTitle}
        </Text>

        {videoType === 'sermonVideo' && (
          <View style={styles.sermonMeta}>
            {video.category && (
              <View
                style={[
                  styles.metaItem,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Folder size={16} color={colors.primary} />
                <Text style={[styles.metaItemText, { color: colors.primary }]}>
                  {translations[video.category] || video.category}
                </Text>
              </View>
            )}
            {video.date && (
              <View
                style={[
                  styles.metaItem,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Calendar size={16} color={colors.primary} />
                <Text style={[styles.metaItemText, { color: colors.primary }]}>
                  {formatDate(video.date)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.metaInfo}>
          {video.duration && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {/* ✅ Uses existing 'duration' key from context  */}
              {translations.duration || 'Duration'}: {video.duration}
            </Text>
          )}
          {video.languageCategory && videoType === 'video' && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {/* ✅ Added translation for language label */}
              {translations.languageLabel || 'Language'}:{' '}
              {video.languageCategory}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.controls, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
          <Share2 size={24} color={colors.primary} />
          <Text style={[styles.controlText, { color: colors.primary }]}>
            {translations.share || 'Share'}
          </Text>
        </TouchableOpacity>
      </View>
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
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(30, 58, 138, 0.8)',
    borderRadius: 50,
    padding: 20,
  },
  videoInfo: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  sermonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  metaItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  controlButton: {
    alignItems: 'center',
    margin: 8,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  skeletonTitle: {
    height: 24,
    width: '60%',
    borderRadius: 4,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  skeletonMeta: {
    height: 14,
    width: '40%',
    borderRadius: 4,
  },
  skeletonControl: {
    height: 40,
    width: 60,
    borderRadius: 4,
    margin: 8,
  },
});
