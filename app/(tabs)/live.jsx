// app/(tabs)/live/LiveStreamScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
import { useTheme } from '../../contexts/ThemeContext';
import { getActiveLiveStreams } from '../../services/dataService';

export default function LiveStreamScreen() {
  const { colors } = useTheme();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState({});
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    const loadStreams = async () => {
      try {
        setError(null);
        const activeStreams = await getActiveLiveStreams();
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
    loadStreams();
  }, []);

  const handleVideoLoadStart = (streamId) => {
    setVideoLoading((prev) => ({ ...prev, [streamId]: true }));
    setVideoErrors((prev) => ({ ...prev, [streamId]: false }));
  };

  const handleVideoLoad = (streamId) => {
    setVideoLoading((prev) => ({ ...prev, [streamId]: false }));
  };

  const handleVideoError = (streamId, error) => {
    console.error(`Video error for stream ${streamId}:`, error);
    setVideoLoading((prev) => ({ ...prev, [streamId]: false }));
    setVideoErrors((prev) => ({ ...prev, [streamId]: true }));
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <TopNavigation title="Live Stream" showBackButton={true} />
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading streams...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper>
        <TopNavigation title="Live Stream" showBackButton={true} />
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            Please check your connection and try again.
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Live Stream" showBackButton={true} />
      <ScrollView style={{ backgroundColor: colors.background }}>
        {streams.map((stream) => (
          <View
            key={stream.id}
            style={[styles.streamCard, { backgroundColor: colors.card }]}
          >
            {/* Stream Header */}
            <View style={styles.streamHeader}>
              <Text style={[styles.streamTitle, { color: colors.text }]}>
                {stream.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: stream.isActive
                      ? '#10B981' + '20'
                      : '#6B7280' + '20',
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
                <Text
                  style={[
                    styles.statusText,
                    { color: stream.isActive ? '#10B981' : '#6B7280' },
                  ]}
                >
                  {stream.isActive ? 'LIVE' : 'OFFLINE'}
                </Text>
              </View>
            </View>

            {/* Video Player - Only show for active streams with URLs */}
            {stream.isActive && stream.streamUrl && (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: stream.streamUrl }}
                  style={styles.videoPlayer}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                  isMuted={true}
                  useNativeControls={true}
                  onLoadStart={() => handleVideoLoadStart(stream.id)}
                  onReadyForDisplay={() => handleVideoLoad(stream.id)}
                  onError={(error) => handleVideoError(stream.id, error)}
                />

                {/* Loading Overlay */}
                {videoLoading[stream.id] && (
                  <View style={styles.videoLoadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.videoLoadingText}>
                      Loading stream...
                    </Text>
                  </View>
                )}

                {/* Error Overlay */}
                {videoErrors[stream.id] && (
                  <View style={styles.videoErrorOverlay}>
                    <Text style={styles.videoErrorText}>
                      Stream unavailable
                    </Text>
                    <Text style={styles.videoErrorSubtext}>
                      Could not load this stream
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Stream Info */}
            <View style={styles.streamInfo}>
              <Text
                style={[
                  styles.streamDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {stream.description}
              </Text>

              {stream.schedule && (
                <Text
                  style={[styles.streamSchedule, { color: colors.primary }]}
                >
                  Schedule: {stream.schedule}
                </Text>
              )}

              <Text
                style={[styles.streamType, { color: colors.textSecondary }]}
              >
                Type: {stream.streamType?.toUpperCase() || 'Unknown'}
              </Text>
            </View>
          </View>
        ))}

        {streams.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Active Streams
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Check back later for live streams
            </Text>
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
    height: 200,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  videoErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoErrorSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
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
  },
});
