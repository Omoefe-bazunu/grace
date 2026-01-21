// app/(tabs)/live/LiveStreamScreen.jsx - COMPLETELY FIXED
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { RefreshCw, ExternalLink, Play } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getActiveLiveStreams,
  getYouTubeVideoId,
} from '../../services/dataService';
import { AppText } from '../../components/ui/AppText';

const { width: screenWidth } = Dimensions.get('window');

export default function LiveStreamScreen() {
  const { colors } = useTheme();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState({});
  const [videoErrors, setVideoErrors] = useState({});
  const webViewRefs = useRef({});

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      setError(null);
      console.log('Loading active streams...');

      const activeStreams = await getActiveLiveStreams();
      console.log('Loaded streams:', activeStreams);

      setStreams(activeStreams);

      // Initialize video loading states
      const loadingStates = {};
      const errorStates = {};
      activeStreams.forEach((stream) => {
        loadingStates[stream.id] = true;
        errorStates[stream.id] = false;
      });
      setVideoLoading(loadingStates);
      setVideoErrors(errorStates);
    } catch (error) {
      console.error('Error loading streams:', error);
      setError('Failed to load streams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStreams();
    } catch (error) {
      console.error('Error refreshing streams:', error);
      Alert.alert('Refresh Failed', 'Could not refresh streams');
    } finally {
      setRefreshing(false);
    }
  };

  const handleVideoLoadStart = (streamId) => {
    console.log(`Video load start: ${streamId}`);
    setVideoLoading((prev) => ({ ...prev, [streamId]: true }));
    setVideoErrors((prev) => ({ ...prev, [streamId]: false }));
  };

  const handleVideoLoad = (streamId) => {
    console.log(`Video loaded successfully: ${streamId}`);
    setVideoLoading((prev) => ({ ...prev, [streamId]: false }));
  };

  const handleVideoError = (streamId, error) => {
    console.error(`Video error for stream ${streamId}:`, error);
    setVideoLoading((prev) => ({ ...prev, [streamId]: false }));
    setVideoErrors((prev) => ({ ...prev, [streamId]: true }));
  };

  const openInBrowser = (url) => {
    Linking.openURL(url).catch((err) =>
      Alert.alert('Error', 'Could not open link'),
    );
  };

  const renderYouTubePlayer = (stream) => {
    const videoId = getYouTubeVideoId(stream.streamUrl) || stream.originalUrl;
    if (!videoId) return renderFallbackPlayer(stream);

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1`;

    return (
      <View style={styles.videoContainer}>
        <WebView
          key={`yt-${stream.id}`}
          source={{ uri: embedUrl }}
          style={styles.webView}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          scalesPageToFit={false}
          mixedContentMode="compatibility"
          onLoadStart={() => handleVideoLoadStart(stream.id)}
          onLoadEnd={() => setTimeout(() => handleVideoLoad(stream.id), 2000)}
          onError={(e) => handleVideoError(stream.id, e.nativeEvent)}
          onHttpError={(e) => handleVideoError(stream.id, e.nativeEvent)}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        />
        {videoLoading[stream.id] && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <AppText style={styles.videoLoadingText}>Loading stream...</AppText>
          </View>
        )}
        {videoErrors[stream.id] && (
          <View style={styles.videoErrorOverlay}>
            <AppText style={styles.videoErrorText}>Stream unavailable</AppText>
            <TouchableOpacity
              style={styles.openBrowserButton}
              onPress={() =>
                openInBrowser(`https://youtube.com/watch?v=${videoId}`)
              }
            >
              <ExternalLink size={16} color="#fff" />
              <AppText style={styles.openBrowserText}>Open in YouTube</AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderHLSPlayer = (stream) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: stream.streamUrl }}
          style={styles.videoPlayer}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          isLooping={false}
          isMuted={false}
          useNativeControls={true}
          onLoadStart={() => handleVideoLoadStart(stream.id)}
          onReadyForDisplay={() => handleVideoLoad(stream.id)}
          onError={(error) => {
            console.error('Video component error:', error);
            handleVideoError(stream.id, error);
          }}
        />

        {videoLoading[stream.id] && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <AppText style={styles.videoLoadingText}>
              Loading HLS stream...
            </AppText>
          </View>
        )}

        {videoErrors[stream.id] && (
          <View style={styles.videoErrorOverlay}>
            <AppText style={styles.videoErrorText}>
              HLS Stream unavailable
            </AppText>
            <AppText style={styles.videoErrorSubtext}>
              Could not load this stream
            </AppText>
          </View>
        )}
      </View>
    );
  };

  const renderStreamPlayer = (stream) => {
    const { streamType } = stream;

    switch (streamType) {
      case 'youtube':
        return renderYouTubePlayer(stream);

      case 'hls':
        return renderHLSPlayer(stream);

      case 'facebook':
      case 'rtmp':
      case 'obs':
      default:
        return renderFallbackPlayer(stream);
    }
  };

  const renderFallbackPlayer = (stream) => {
    const videoId = getYouTubeVideoId(stream.streamUrl) || stream.originalUrl;

    return (
      <View style={styles.videoContainer}>
        <View style={styles.externalStreamContainer}>
          <Play size={48} color="#fff" opacity={0.8} />
          <AppText style={styles.externalStreamText}>
            {stream.streamType?.toUpperCase() || 'EXTERNAL'} Stream
          </AppText>
          <AppText style={styles.externalStreamSubtext}>
            {stream.streamType === 'youtube'
              ? 'Tap below to watch in YouTube app'
              : 'This stream type must be opened externally'}
          </AppText>
          <TouchableOpacity
            style={[
              styles.openBrowserButtonLarge,
              {
                backgroundColor:
                  stream.streamType === 'youtube' ? '#FF0000' : '#3B82F6',
              },
            ]}
            onPress={() => {
              if (stream.streamType === 'youtube' && videoId) {
                openInBrowser(`https://www.youtube.com/watch?v=${videoId}`);
              } else {
                openInBrowser(stream.originalUrl || stream.streamUrl);
              }
            }}
          >
            <ExternalLink size={20} color="#fff" />
            <AppText style={styles.openBrowserTextLarge}>
              {stream.streamType === 'youtube'
                ? 'Open in YouTube'
                : 'Watch in Browser'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <TopNavigation showBackButton={true} />
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText
            style={[styles.loadingText, { color: colors.textSecondary }]}
          >
            Loading streams...
          </AppText>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper>
        <TopNavigation showBackButton={true} />
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <AppText style={[styles.errorText, { color: colors.error }]}>
            {error}
          </AppText>
          <AppText
            style={[styles.errorSubtext, { color: colors.textSecondary }]}
          >
            Please check your connection and try again.
          </AppText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadStreams}
          >
            <RefreshCw size={20} color="#fff" />
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <View
        style={[styles.headerActions, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.card }]}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={18}
            color={colors.primary}
            style={refreshing && styles.refreshingIcon}
          />
          <AppText
            style={[styles.refreshButtonText, { color: colors.primary }]}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Streams'}
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {streams.map((stream) => (
          <View
            key={stream.id}
            style={[styles.streamCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.streamHeader}>
              <AppText style={[styles.streamTitle, { color: colors.text }]}>
                {stream.title}
              </AppText>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: stream.isActive
                      ? '#10B98120'
                      : '#6B728020',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: stream.isActive ? '#10B981' : '#6B7280',
                    },
                  ]}
                />
                <AppText
                  style={[
                    styles.statusText,
                    { color: stream.isActive ? '#10B981' : '#6B7280' },
                  ]}
                >
                  {stream.isActive ? 'LIVE' : 'OFFLINE'}
                </AppText>
              </View>
            </View>

            {stream.isActive && stream.streamUrl ? (
              renderStreamPlayer(stream)
            ) : (
              <View style={styles.offlineContainer}>
                <AppText style={styles.offlineText}>Stream Offline</AppText>
                <AppText style={styles.offlineSubtext}>
                  This stream is currently not active
                </AppText>
              </View>
            )}

            <View style={styles.streamInfo}>
              {stream.description && (
                <AppText
                  style={[
                    styles.streamDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {stream.description}
                </AppText>
              )}

              {stream.schedule && (
                <AppText
                  style={[styles.streamSchedule, { color: colors.primary }]}
                >
                  📅 {stream.schedule}
                </AppText>
              )}

              <AppText
                style={[styles.streamType, { color: colors.textSecondary }]}
              >
                Type: {stream.streamType?.toUpperCase() || 'Unknown'}
              </AppText>
            </View>
          </View>
        ))}

        {streams.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <AppText style={[styles.emptyTitle, { color: colors.text }]}>
              No Active Streams
            </AppText>
            <AppText
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Check back later for live streams
            </AppText>
            <TouchableOpacity
              style={[
                styles.refreshButtonLarge,
                { backgroundColor: colors.primary },
              ]}
              onPress={onRefresh}
            >
              <RefreshCw size={20} color="#fff" />
              <AppText style={styles.refreshButtonLargeText}>Refresh</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  streamCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  videoContainer: {
    height: 220,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoLoadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  videoErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  videoErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoErrorSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  externalStreamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
  },
  externalStreamText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  externalStreamSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  openBrowserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  openBrowserText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  openBrowserButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  openBrowserTextLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  offlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  offlineSubtext: {
    fontSize: 14,
    color: '#999',
  },
  streamInfo: {
    padding: 16,
  },
  streamDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  streamSchedule: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  streamType: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyState: {
    margin: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
