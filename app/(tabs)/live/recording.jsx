// app/(tabs)/live/recording.jsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ExternalLink } from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../components/TopNavigation';
import { AppText } from '../../../components/ui/AppText';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLiveStream } from '../../../contexts/LiveStreamContexts';

export default function RecordingPlayerScreen() {
  const { colors } = useTheme();
  const { videoId, title, streamId } = useLocalSearchParams();
  const { fetchLogStreamDetails } = useLiveStream();

  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // ── Load comments once on mount ──────────────────────────────────────────
  React.useEffect(() => {
    if (!streamId) return;
    fetchLogStreamDetails(streamId)
      .then((details) => setComments(details?.comments || []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [streamId]);

  const openInBrowser = () =>
    Linking.openURL(`https://youtube.com/watch?v=${videoId}`).catch(() =>
      Alert.alert('Error', 'Could not open link'),
    );

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1&origin=https://mountaingks.org`;

  const injectedJS = `
    (function() {
      var checkInterval = setInterval(function() {
        var errorScreen = document.querySelector('.ytp-error');
        if (errorScreen) {
          clearInterval(checkInterval);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'YT_ERROR' }));
        }
      }, 1000);
      setTimeout(function() { clearInterval(checkInterval); }, 10000);
    })();
    true;
  `;

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} onBackPress={() => router.back()} />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        stickyHeaderIndices={[0]}
      >
        {/* ── Sticky video player ── */}
        <View style={styles.playerWrapper}>
          <WebView
            key={`rec-${videoId}`}
            source={{
              uri: embedUrl,
              headers: { Referer: 'https://mountaingks.org' },
            }}
            style={styles.webView}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            mixedContentMode="compatibility"
            injectedJavaScript={injectedJS}
            onMessage={(event) => {
              try {
                const msg = JSON.parse(event.nativeEvent.data);
                if (msg.type === 'YT_ERROR') {
                  setVideoLoading(false);
                  setVideoError(true);
                }
              } catch (_) {}
            }}
            onLoadStart={() => {
              setVideoLoading(true);
              setVideoError(false);
            }}
            onLoadEnd={() => setTimeout(() => setVideoLoading(false), 2000)}
            onError={() => {
              setVideoLoading(false);
              setVideoError(true);
            }}
            onHttpError={() => {
              setVideoLoading(false);
              setVideoError(true);
            }}
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          />

          {videoLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
              <AppText style={styles.overlayText}>Loading recording...</AppText>
            </View>
          )}

          {videoError && (
            <View style={styles.overlay}>
              <AppText style={styles.errorText}>
                Recording unavailable in app
              </AppText>
              <AppText style={styles.errorSubtext}>
                Tap below to watch on YouTube
              </AppText>
              <TouchableOpacity
                style={styles.openYouTubeBtn}
                onPress={openInBrowser}
              >
                <ExternalLink size={18} color="#fff" />
                <AppText style={styles.openYouTubeBtnText}>
                  Watch on YouTube
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Title + open in YouTube ── */}
        <View
          style={[styles.infoSection, { backgroundColor: colors.background }]}
        >
          <AppText style={[styles.recordingTitle, { color: colors.text }]}>
            {title}
          </AppText>
          {/* <TouchableOpacity style={styles.ytLink} onPress={openInBrowser}>
            <ExternalLink size={14} color={colors.primary} />
            <AppText style={[styles.ytLinkText, { color: colors.primary }]}>
              Open in YouTube
            </AppText>
          </TouchableOpacity> */}
        </View>

        {/* ── Comments ── */}
        <View
          style={[
            styles.commentsSection,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.commentsDivider, { backgroundColor: colors.border }]}
          />
          <AppText style={[styles.commentsLabel, { color: colors.text }]}>
            💬 Comments ({comments.length})
          </AppText>

          {commentsLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : comments.length === 0 ? (
            <AppText
              style={[styles.noComments, { color: colors.textSecondary }]}
            >
              No comments on this stream
            </AppText>
          ) : (
            comments.map((c, index) => (
              <View key={c.id}>
                <View style={styles.commentBubble}>
                  <View style={styles.commentMeta}>
                    <AppText
                      style={[styles.commentName, { color: colors.primary }]}
                    >
                      {c.name?.trim() || 'Anonymous'}
                    </AppText>
                    {c.location?.trim() ? (
                      <AppText
                        style={[
                          styles.commentLocation,
                          { color: colors.textSecondary },
                        ]}
                      >
                        📍 {c.location}
                      </AppText>
                    ) : null}
                  </View>
                  <AppText style={[styles.commentText, { color: colors.text }]}>
                    {c.text}
                  </AppText>
                </View>
                {index < comments.length - 1 && (
                  <View
                    style={[
                      styles.commentDivider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                )}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  playerWrapper: {
    height: 220,
    backgroundColor: '#000',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  overlayText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  openYouTubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  openYouTubeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    paddingBottom: 8,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  ytLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ytLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  commentsSection: {
    paddingHorizontal: 16,
  },
  commentsDivider: {
    height: 1,
    marginBottom: 12,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  noComments: {
    fontSize: 13,
    marginBottom: 8,
  },
  commentBubble: {
    paddingVertical: 10,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  commentLocation: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentDivider: {
    height: 1,
    marginVertical: 2,
  },
});
