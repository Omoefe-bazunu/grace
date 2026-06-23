import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import YoutubeIframe from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SafeAreaWrapper } from './ui/SafeAreaWrapper';
import { TopNavigation } from './TopNavigation';
import { AppText } from './ui/AppText';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 0.5625;

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
};

const isEscapeAttempt = (url) => {
  if (!url) return false;
  return (
    url.includes('youtube.com/watch') ||
    url.includes('youtube.com/channel') ||
    url.includes('youtube.com/c/') ||
    url.includes('youtube.com/@') ||
    url.includes('youtu.be/') ||
    url.startsWith('vnd.youtube') ||
    url.startsWith('youtube://')
  );
};

const injectCSS = `
  (function() {
    const style = document.createElement('style');
    style.textContent = \`
      .ytp-share-button,
      .ytp-watch-later-button,
      .ytp-watermark,
      .ytp-youtube-button,
      .branding-img,
      .ytp-title-channel,
      .ytp-title-text a,
      .ytp-title-link { display: none !important; }
    \`;
    document.head.appendChild(style);
    true;
  })();
`;

const PlayerPlaceholder = () => {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[
        colors.skeleton || '#E5E7EB',
        colors.skeletonHighlight || '#F3F4F6',
      ]}
      style={styles.playerPlaceholderOverlay}
    />
  );
};

const SkeletonVideo = ({ ShareIcon }) => {
  const { colors } = useTheme();
  return (
    <SafeAreaWrapper
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopNavigation showBackButton={true} />
      <View style={styles.videoContainer}>
        <LinearGradient
          colors={[
            colors.skeleton || '#E5E7EB',
            colors.skeletonHighlight || '#F3F4F6',
          ]}
          style={{ width: '100%', height: VIDEO_HEIGHT }}
        />
      </View>
      <View style={[styles.videoInfo, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[
            colors.skeleton || '#E5E7EB',
            colors.skeletonHighlight || '#F3F4F6',
          ]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[
            colors.skeleton || '#E5E7EB',
            colors.skeletonHighlight || '#F3F4F6',
          ]}
          style={styles.skeletonMeta}
        />
      </View>
      <View style={[styles.controls, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[
            colors.skeleton || '#E5E7EB',
            colors.skeletonHighlight || '#F3F4F6',
          ]}
          style={styles.skeletonControl}
        />
      </View>
    </SafeAreaWrapper>
  );
};

/**
 * VideoPlayerScreen — reusable video detail screen.
 *
 * Props:
 *   fetchFn        {(id: string) => Promise<object>}  — async fn that resolves to a video object
 *   defaultTitle   {string}                           — fallback title string e.g. 'Sermon Video'
 *   urlFields      {string[]}                         — ordered list of fields to try for the video URL
 *                                                       e.g. ['videoUrl', 'youtubeId'] or ['videoUrl', 'url', 'youtubeId']
 *   ShareIcon      {ReactComponent}                   — Lucide icon component for the share button
 *                                                       e.g. Share2 or Link2
 */
export default function VideoPlayerScreen({
  fetchFn,
  defaultTitle = 'Video',
  urlFields = ['videoUrl', 'youtubeId'],
  ShareIcon,
}) {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { translations } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFn(id);
        setVideo(data);
      } catch (error) {
        console.error('VideoPlayerScreen fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleShare = async () => {
    if (!video) return;
    const url = urlFields.map((f) => video[f]).find(Boolean) || '';
    try {
      await Share.share({
        message: `${video.title || translations.noTitle || defaultTitle}: ${url}`,
      });
    } catch (error) {
      console.error('Error sharing video:', error);
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
        <AppText style={[styles.error, { color: colors.error || '#EF4444' }]}>
          {translations.errorVideoNotFound || 'Video not found'}
        </AppText>
      </SafeAreaView>
    );
  }

  const rawUrl = urlFields.map((f) => video[f]).find(Boolean);
  const ytId = getYouTubeId(rawUrl);

  return (
    <SafeAreaWrapper
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopNavigation showBackButton={true} />

      <View style={[styles.videoContainer, { height: VIDEO_HEIGHT }]}>
        {ytId ? (
          <View
            style={{ width: width, height: VIDEO_HEIGHT, position: 'relative' }}
          >
            <YoutubeIframe
              videoId={ytId}
              height={VIDEO_HEIGHT}
              width={width}
              play={true}
              onReady={() => setIsVideoReady(true)}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: false,
                iv_load_policy: 3,
                fs: true,
                showinfo: 0,
                end: 0,
              }}
              webViewProps={{
                onShouldStartLoadWithRequest: (request) => {
                  if (isEscapeAttempt(request.url)) {
                    return false;
                  }
                  return true;
                },
                setSupportMultipleWindows: false,
                javaScriptCanOpenWindowsAutomatically: false,
                allowsLinkPreview: false,
                injectedJavaScript: injectCSS,
              }}
            />
            {!isVideoReady && <PlayerPlaceholder />}
          </View>
        ) : (
          <AppText style={{ color: '#fff', textAlign: 'center' }}>
            Invalid or missing YouTube video
          </AppText>
        )}
      </View>

      <View style={[styles.videoInfo, { backgroundColor: colors.card }]}>
        <AppText style={[styles.title, { color: colors.text }]}>
          {video.title || translations.noTitle || defaultTitle}
        </AppText>
        {video.date && (
          <AppText style={[styles.date, { color: colors.textSecondary }]}>
            {video.date}
          </AppText>
        )}
      </View>

      <View style={[styles.controls, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
          <ShareIcon size={24} color={colors.primary} />
          <AppText style={[styles.controlText, { color: colors.primary }]}>
            {translations.share || 'Share'}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoContainer: {
    backgroundColor: '#000',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  playerPlaceholderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  videoInfo: { padding: 20, alignItems: 'center' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: { fontSize: 14, opacity: 0.7 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  controlButton: { alignItems: 'center' },
  controlText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  error: { fontSize: 16, textAlign: 'center', marginTop: 40 },
  skeletonTitle: {
    height: 24,
    width: '70%',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonMeta: {
    height: 16,
    width: '35%',
    borderRadius: 4,
  },
  skeletonControl: {
    height: 40,
    width: 80,
    borderRadius: 4,
    marginVertical: 4,
  },
});
