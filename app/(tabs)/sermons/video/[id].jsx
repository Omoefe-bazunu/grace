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

const SkeletonVideo = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
      </View>
      <View style={styles.videoContainer}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.videoPlayer}
        />
      </View>
      <View style={[styles.videoInfo, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
        <View style={styles.metaInfo}>
          <LinearGradient
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonMeta}
          />
          <LinearGradient
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonMeta}
          />
        </View>
      </View>
      <View style={[styles.controls, { backgroundColor: colors.card }]}>
        {[...Array(5)].map((_, index) => (
          <LinearGradient
            key={index}
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonControl}
          />
        ))}
      </View>
    </View>
  );
};

export default function AnimationDetailScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoType, setVideoType] = useState('video'); // 'video' or 'sermonVideo'
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // Create the video player instance
  const player = useVideoPlayer();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // Try to fetch as regular video first
        let videoData = await getVideo(id);

        if (videoData) {
          setVideo(videoData);
          setVideoType('video');
        } else {
          // If not found, try as sermon video
          videoData = await getSermonVideo(id);
          if (videoData) {
            setVideo(videoData);
            setVideoType('sermonVideo');
          } else {
            setVideo(null);
          }
        }
      } catch (error) {
        console.error('Error fetching video:', error);
        // Try alternative approach - check if it's a sermon video
        try {
          const sermonVideoData = await getSermonVideo(id);
          if (sermonVideoData) {
            setVideo(sermonVideoData);
            setVideoType('sermonVideo');
          } else {
            setVideo(null);
          }
        } catch (secondError) {
          console.error('Error fetching sermon video:', secondError);
          setVideo(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  useEffect(() => {
    // Correctly load the video source into the player instance
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
      const shareMessage =
        videoType === 'sermonVideo'
          ? `Sermon Video: ${video.title}\nCategory: ${
              video.category || 'No category'
            }\n${video.videoUrl}`
          : `${video.title || translations.noTitle}: ${video.videoUrl}`;

      await Share.share({
        message: shareMessage,
        title:
          videoType === 'sermonVideo' ? 'Share Sermon Video' : 'Share Video',
      });
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    try {
      // Assuming dateString is in YYYY-MM-DD format
      const [year, month, day] = dateString.split('-');

      // Create date object (month is 0-indexed in JavaScript)
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // Check if date is valid
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
      {/* Header */}
      <TopNavigation showBackButton={true} />

      {/* Video Player - with native controls */}
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

      {/* Video Info */}
      <View style={[styles.videoInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {video.title || translations.noTitle}
        </Text>

        {/* Sermon Video Specific Info */}
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
                  {video.category}
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
              Duration: {video.duration}
            </Text>
          )}
          {video.languageCategory && videoType === 'video' && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Language: {video.languageCategory}
            </Text>
          )}
        </View>
      </View>

      {/* Controls */}
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
