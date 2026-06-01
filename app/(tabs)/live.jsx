import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {
  RefreshCw,
  ExternalLink,
  Play,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLiveStream } from '../../contexts/LiveStreamContexts';
import { getYouTubeVideoId } from '../../services/dataService';
import { AppText } from '../../components/ui/AppText';
import DateTimePicker from '@react-native-community/datetimepicker';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

export default function LiveStreamScreen() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const {
    liveStream,
    loading,
    fetchLiveStream,
    comments,
    reactions,
    myReactions,
    canComment,
    postComment,
    toggleReaction,
    streamLog,
    logLoading,
    logHasMore,
    fetchStreamLog,
    fetchLogStreamDetails,
  } = useLiveStream();

  const [refreshing, setRefreshing] = useState(false);
  const [videoLoading, setVideoLoading] = useState({});
  const [videoErrors, setVideoErrors] = useState({});
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [logDetails, setLogDetails] = useState({});
  const [logDetailsLoading, setLogDetailsLoading] = useState({});

  // ── Filter state (past streams only) ──────────────────────────────────────
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const hasActiveFilter = searchTitle.trim() !== '' || selectedDate !== null;

  const filteredStreamLog = streamLog.filter((stream) => {
    const titleMatch =
      searchTitle.trim() === '' ||
      stream.title?.toLowerCase().includes(searchTitle.trim().toLowerCase());

    const dateMatch =
      selectedDate === null ||
      (() => {
        if (!stream.createdAt) return false;
        const streamDate = new Date(stream.createdAt).toDateString();
        return streamDate === selectedDate.toDateString();
      })();

    return titleMatch && dateMatch;
  });

  const clearFilters = () => {
    setSearchTitle('');
    setSelectedDate(null);
  };

  const streams = liveStream ? [liveStream] : [];

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveStream();
    setRefreshing(false);
  };

  const handleVideoLoadStart = (id) =>
    setVideoLoading((p) => ({ ...p, [id]: true }));
  const handleVideoLoad = (id) =>
    setVideoLoading((p) => ({ ...p, [id]: false }));
  const handleVideoError = (id) => {
    setVideoLoading((p) => ({ ...p, [id]: false }));
    setVideoErrors((p) => ({ ...p, [id]: true }));
  };

  const openInBrowser = (url) =>
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open link'),
    );

  const handlePostComment = async (streamId) => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await postComment(streamId, commentText);
      setCommentText('');
    } catch {
      Alert.alert('Error', 'Could not post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLogExpand = async (stream) => {
    if (expandedLogId === stream.id) {
      setExpandedLogId(null);
      return;
    }
    setExpandedLogId(stream.id);
    if (!logDetails[stream.id]) {
      setLogDetailsLoading((p) => ({ ...p, [stream.id]: true }));
      try {
        const details = await fetchLogStreamDetails(stream.id);
        setLogDetails((p) => ({ ...p, [stream.id]: details }));
      } catch (err) {
        console.error('Failed to load stream details:', err);
      } finally {
        setLogDetailsLoading((p) => ({ ...p, [stream.id]: false }));
      }
    }
  };

  // ─── Video Players ────────────────────────────────────────────────────────

  const renderYouTubePlayer = (stream) => {
    const videoId = getYouTubeVideoId(stream.streamUrl) || stream.streamUrl;
    if (!videoId) return renderFallbackPlayer(stream);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1`;
    return (
      <View style={styles.videoContainer}>
        <WebView
          key={`yt-${stream.id}`}
          source={{ uri: embedUrl }}
          style={styles.webView}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          onLoadStart={() => handleVideoLoadStart(stream.id)}
          onLoadEnd={() => setTimeout(() => handleVideoLoad(stream.id), 2000)}
          onError={() => handleVideoError(stream.id)}
          onHttpError={() => handleVideoError(stream.id)}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        />
        {videoLoading[stream.id] && (
          <View style={styles.videoOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <AppText style={styles.overlayText}>Loading stream...</AppText>
          </View>
        )}
        {videoErrors[stream.id] && (
          <View style={styles.videoOverlay}>
            <AppText style={styles.overlayTitle}>
              Stream unavailable in app
            </AppText>
            <AppText style={styles.overlaySubtext}>
              Tap below to watch on YouTube
            </AppText>
            <TouchableOpacity
              style={styles.youtubeBtn}
              onPress={() =>
                openInBrowser(`https://youtube.com/watch?v=${videoId}`)
              }
            >
              <ExternalLink size={18} color="#fff" />
              <AppText style={styles.youtubeBtnText}>Watch on YouTube</AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderHLSPlayer = (stream) => (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: stream.streamUrl }}
        style={styles.videoPlayer}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        onLoadStart={() => handleVideoLoadStart(stream.id)}
        onReadyForDisplay={() => handleVideoLoad(stream.id)}
        onError={() => handleVideoError(stream.id)}
      />
      {videoLoading[stream.id] && (
        <View style={styles.videoOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {videoErrors[stream.id] && (
        <View style={styles.videoOverlay}>
          <AppText style={styles.overlayTitle}>Stream unavailable</AppText>
        </View>
      )}
    </View>
  );

  const renderFallbackPlayer = (stream) => {
    const videoId = getYouTubeVideoId(stream.streamUrl) || stream.streamUrl;
    return (
      <View style={[styles.videoContainer, styles.fallbackContainer]}>
        <Play size={48} color="#fff" opacity={0.8} />
        <TouchableOpacity
          style={[styles.youtubeBtn, { marginTop: 16 }]}
          onPress={() =>
            openInBrowser(`https://www.youtube.com/watch?v=${videoId}`)
          }
        >
          <ExternalLink size={18} color="#fff" />
          <AppText style={styles.youtubeBtnText}>Open in YouTube</AppText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStreamPlayer = (stream) => {
    switch (stream.streamType) {
      case 'youtube':
        return renderYouTubePlayer(stream);
      case 'hls':
        return renderHLSPlayer(stream);
      default:
        return renderFallbackPlayer(stream);
    }
  };

  // ─── Reactions ────────────────────────────────────────────────────────────

  const renderReactions = (streamId, reactionCounts, isActive) => (
    <View style={styles.reactionsRow}>
      {REACTION_EMOJIS.map((emoji) => {
        const isSelected = myReactions[emoji] === true;
        const count = reactionCounts[emoji] || 0;
        return (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.reactionBtn,
              isSelected && styles.reactionBtnSelected,
              !isActive && styles.reactionBtnDisabled,
            ]}
            onPress={() => isActive && toggleReaction(streamId, emoji)}
            activeOpacity={isActive ? 0.7 : 1}
          >
            <AppText style={styles.reactionEmoji}>{emoji}</AppText>
            {count > 0 && (
              <AppText
                style={[
                  styles.reactionCount,
                  isSelected && styles.reactionCountSelected,
                ]}
              >
                {count}
              </AppText>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Comments ─────────────────────────────────────────────────────────────

  const renderComments = (streamId, commentList, commentsOpen) => (
    <View style={styles.commentsSection}>
      <AppText style={[styles.sectionLabel, { color: colors.text }]}>
        💬 Comments ({commentList.length})
      </AppText>
      <ScrollView style={styles.commentsList} nestedScrollEnabled>
        {commentList.length === 0 ? (
          <AppText style={[styles.emptyHint, { color: colors.textSecondary }]}>
            No comments yet. Be the first!
          </AppText>
        ) : (
          commentList.map((c) => (
            <View
              key={c.id}
              style={[
                styles.commentBubble,
                { backgroundColor: colors.surface },
              ]}
            >
              <AppText style={[styles.commentText, { color: colors.text }]}>
                {c.text}
              </AppText>
            </View>
          ))
        )}
      </ScrollView>
      {commentsOpen ? (
        <View
          style={[styles.commentInputRow, { backgroundColor: colors.card }]}
        >
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.commentTextInput, { color: colors.text }]}
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={() => handlePostComment(streamId)}
          />
          <TouchableOpacity
            onPress={() => handlePostComment(streamId)}
            disabled={posting || !commentText.trim()}
            style={styles.sendBtn}
          >
            {posting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Send
                size={20}
                color={
                  commentText.trim() ? colors.primary : colors.textSecondary
                }
              />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <AppText
          style={[styles.commentsClosed, { color: colors.textSecondary }]}
        >
          Comments are closed for this stream
        </AppText>
      )}
    </View>
  );

  // ─── Section Divider ──────────────────────────────────────────────────────

  const renderSectionDivider = (label) => (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      <AppText style={[styles.dividerLabel, { color: colors.textSecondary }]}>
        {label}
      </AppText>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
    </View>
  );

  // ─── Stream Log ───────────────────────────────────────────────────────────

  const renderStreamLog = () => (
    <View style={styles.logSection}>
      {renderSectionDivider('PAST STREAMS')}

      {/* ── Filter bar — scoped to past streams only ── */}

      <View style={styles.filterRow}>
        <View
          style={[styles.filterInputWrap, { backgroundColor: colors.card }]}
        >
          <Search size={13} color={colors.textSecondary} />
          <TextInput
            value={searchTitle}
            onChangeText={setSearchTitle}
            placeholder="Search by title..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.filterTextInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {searchTitle.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTitle('')}>
              <X size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Date picker trigger */}
        <TouchableOpacity
          style={[
            styles.datePickerBtn,
            {
              backgroundColor: colors.card,
              borderColor: selectedDate ? colors.primary : 'transparent',
              borderWidth: selectedDate ? 1 : 0,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <AppText
            style={[
              styles.datePickerText,
              { color: selectedDate ? colors.primary : colors.textSecondary },
            ]}
          >
            {selectedDate
              ? selectedDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '📅 Date'}
          </AppText>
          {selectedDate && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedDate(null);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={13} color={colors.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {hasActiveFilter && (
          <TouchableOpacity
            style={[styles.clearAllBtn, { backgroundColor: colors.card }]}
            onPress={clearFilters}
          >
            <AppText style={[styles.clearAllText, { color: colors.primary }]}>
              Clear
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Date picker modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (event.type === 'set' && date) {
              setSelectedDate(date);
            }
            if (Platform.OS !== 'ios') {
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {/* ── Result count when filtering ── */}
      {hasActiveFilter && (
        <AppText style={[styles.filterResult, { color: colors.textSecondary }]}>
          {filteredStreamLog.length} result
          {filteredStreamLog.length !== 1 ? 's' : ''} found
        </AppText>
      )}

      {/* ── Empty states ── */}
      {filteredStreamLog.length === 0 && !logLoading && (
        <AppText style={[styles.emptyLogText, { color: colors.textSecondary }]}>
          {hasActiveFilter
            ? 'No streams match your search'
            : 'No past streams yet'}
        </AppText>
      )}

      {/* ── Stream cards ── */}
      {filteredStreamLog.map((stream) => {
        const isExpanded = expandedLogId === stream.id;
        const details = logDetails[stream.id];
        const detailsLoading = logDetailsLoading[stream.id];

        return (
          <View
            key={stream.id}
            style={[styles.logCard, { backgroundColor: colors.card }]}
          >
            <TouchableOpacity
              style={styles.logCardHeader}
              onPress={() => handleToggleLogExpand(stream)}
              activeOpacity={0.7}
            >
              <View style={styles.logCardInfo}>
                <AppText
                  style={[styles.logCardTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {stream.title}
                </AppText>
                <View style={styles.logCardMeta}>
                  <AppText
                    style={[
                      styles.logMetaText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    💬 {stream.commentCount || 0}
                  </AppText>
                  <AppText
                    style={[
                      styles.logMetaText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ❤️ {stream.reactionCount || 0}
                  </AppText>
                  {stream.createdAt && (
                    <AppText
                      style={[
                        styles.logMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      📅 {new Date(stream.createdAt).toLocaleDateString()}
                    </AppText>
                  )}
                </View>
              </View>
              {isExpanded ? (
                <ChevronUp size={18} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            {isExpanded && (
              <View
                style={[
                  styles.logCardExpanded,
                  { borderTopColor: colors.border },
                ]}
              >
                {detailsLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ marginVertical: 12 }}
                  />
                ) : (
                  <>
                    {stream.description ? (
                      <AppText
                        style={[
                          styles.logCardDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {stream.description}
                      </AppText>
                    ) : null}

                    {details?.reactions &&
                      Object.keys(details.reactions).length > 0 && (
                        <View style={styles.reactionsRow}>
                          {Object.entries(details.reactions).map(
                            ([emoji, count]) => (
                              <View key={emoji} style={styles.reactionBtn}>
                                <AppText style={styles.reactionEmoji}>
                                  {emoji}
                                </AppText>
                                <AppText style={styles.reactionCount}>
                                  {count}
                                </AppText>
                              </View>
                            ),
                          )}
                        </View>
                      )}

                    <AppText
                      style={[styles.sectionLabel, { color: colors.text }]}
                    >
                      💬 Comments ({(details?.comments || []).length})
                    </AppText>
                    {(details?.comments || []).length === 0 ? (
                      <AppText
                        style={[
                          styles.emptyHint,
                          { color: colors.textSecondary },
                        ]}
                      >
                        No comments on this stream
                      </AppText>
                    ) : (
                      details.comments.map((c) => (
                        <View
                          key={c.id}
                          style={[
                            styles.commentBubble,
                            { backgroundColor: colors.surface },
                          ]}
                        >
                          <AppText
                            style={[styles.commentText, { color: colors.text }]}
                          >
                            {c.text}
                          </AppText>
                        </View>
                      ))
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* Load more — only show when not filtering */}
      {!hasActiveFilter && logHasMore && (
        <TouchableOpacity
          style={[styles.loadMoreBtn, { backgroundColor: colors.card }]}
          onPress={() => fetchStreamLog(false)}
          disabled={logLoading}
        >
          {logLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <AppText style={[styles.loadMoreText, { color: colors.primary }]}>
              Load more
            </AppText>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaWrapper>
        <TopNavigation showBackButton title={translations.live || 'Live'} />
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

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title={translations.live || 'Live'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
          {/* ── Refresh button ── */}
          <View
            style={[
              styles.headerActions,
              { backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.card }]}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={18} color={colors.primary} />
              <AppText
                style={[styles.refreshButtonText, { color: colors.primary }]}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Streams'}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ── Active stream ── */}
          {streams.length > 0 ? (
            streams.map((stream) => (
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
                          backgroundColor: stream.isActive
                            ? '#10B981'
                            : '#6B7280',
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
                    <AppText
                      style={[
                        styles.offlineSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Check back later for live streams
                    </AppText>
                  </View>
                )}

                {renderReactions(stream.id, reactions, stream.isActive)}
                {renderComments(stream.id, comments, canComment(stream))}
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <AppText style={[styles.emptyTitle, { color: colors.text }]}>
                No Active Stream
              </AppText>
              <AppText
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                Check back later for live streams
              </AppText>
            </View>
          )}

          {/* ── Past streams log ── */}
          {renderStreamLog()}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: { marginTop: 12, fontSize: 14 },

  headerActions: { paddingHorizontal: 16, paddingVertical: 8 },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: { fontSize: 14, fontWeight: '600' },

  streamCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  streamTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 10, fontWeight: '600' },

  videoContainer: {
    height: 220,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: { width: '100%', height: '100%' },
  webView: { flex: 1, backgroundColor: '#000' },
  fallbackContainer: { justifyContent: 'center', alignItems: 'center' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayText: { color: '#fff', marginTop: 8, fontSize: 14 },
  overlayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  overlaySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  youtubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  youtubeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  offlineContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  offlineSubtext: { fontSize: 13 },

  // Reactions
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionBtnSelected: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.35)',
  },
  reactionBtnDisabled: { opacity: 0.5 },
  reactionEmoji: { fontSize: 20 },
  reactionCount: { fontSize: 12, fontWeight: '600', color: '#666' },
  reactionCountSelected: { color: '#EF4444' },

  // Comments
  commentsSection: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  commentsList: { maxHeight: 200 },
  commentBubble: { padding: 10, borderRadius: 10, marginBottom: 6 },
  commentText: { fontSize: 14, lineHeight: 20 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    gap: 8,
  },
  commentTextInput: { flex: 1, fontSize: 14, paddingVertical: 6 },
  sendBtn: { padding: 4 },
  commentsClosed: { fontSize: 13, marginTop: 8, textAlign: 'center' },
  emptyHint: { fontSize: 13, marginBottom: 8 },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },

  // Filter bar
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    gap: 8,
  },
  filterInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  filterTextInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterResult: {
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  // Stream log
  logSection: { marginBottom: 8 },

  emptyLogText: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },

  logCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },

  logCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  logCardInfo: { flex: 1 },
  logCardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  logCardMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  logMetaText: { fontSize: 12 },
  logCardExpanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
  logCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    marginTop: 10,
  },
  loadMoreBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadMoreText: { fontSize: 14, fontWeight: '600' },

  emptyState: {
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },

  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

// WORKING VERSION BEFORE COMMENTS AND REACTIONS WERE ADDED - RETAINED FOR REFERENCE
// import React, { useState, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   RefreshControl,
//   Alert,
//   Linking,
//   Dimensions,
// } from 'react-native';
// import { Video, ResizeMode } from 'expo-av';
// import { RefreshCw, ExternalLink, Play } from 'lucide-react-native';
// import { WebView } from 'react-native-webview';
// import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
// import { TopNavigation } from '../../components/TopNavigation';
// import { useTheme } from '../../contexts/ThemeContext';
// import { useLanguage } from '../../contexts/LanguageContext';
// import { useLiveStream } from '../../contexts/LiveStreamContexts';
// import { getYouTubeVideoId } from '../../services/dataService';
// import { AppText } from '../../components/ui/AppText';

// const { width: screenWidth } = Dimensions.get('window');

// export default function LiveStreamScreen() {
//   const { colors } = useTheme();
//   const { translations } = useLanguage();

//   // ✅ All stream data and fetching now comes from the shared context
//   const { liveStream, loading, fetchLiveStream } = useLiveStream();

//   const [refreshing, setRefreshing] = useState(false);
//   const [videoLoading, setVideoLoading] = useState({});
//   const [videoErrors, setVideoErrors] = useState({});
//   const webViewRefs = useRef({});

//   // Derive the streams array from the single liveStream object the context provides
//   const streams = liveStream ? [liveStream] : [];

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchLiveStream();
//     setRefreshing(false);
//   };

//   const handleVideoLoadStart = (streamId) => {
//     setVideoLoading((prev) => ({ ...prev, [streamId]: true }));
//     setVideoErrors((prev) => ({ ...prev, [streamId]: false }));
//   };

//   const handleVideoLoad = (streamId) => {
//     setVideoLoading((prev) => ({ ...prev, [streamId]: false }));
//   };

//   const handleVideoError = (streamId, error) => {
//     setVideoLoading((prev) => ({ ...prev, [streamId]: false }));
//     setVideoErrors((prev) => ({ ...prev, [streamId]: true }));
//   };

//   const openInBrowser = (url) => {
//     Linking.openURL(url).catch(() =>
//       Alert.alert(
//         translations.error || 'Error',
//         translations.openLinkError || 'Could not open link',
//       ),
//     );
//   };

//   const renderYouTubePlayer = (stream) => {
//     const videoId = getYouTubeVideoId(stream.streamUrl) || stream.streamUrl;
//     if (!videoId) return renderFallbackPlayer(stream);

//     // ✅ origin parameter tells YouTube this is a trusted embed
//     const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1&origin=https://mountaingks.org`;

//     const injectedJS = `
//       (function() {
//         var checkInterval = setInterval(function() {
//           var errorScreen = document.querySelector('.ytp-error');
//           if (errorScreen) {
//             clearInterval(checkInterval);
//             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'YT_ERROR' }));
//           }
//         }, 1000);
//         setTimeout(function() { clearInterval(checkInterval); }, 10000);
//       })();
//       true;
//     `;

//     const handleWebViewMessage = (event) => {
//       try {
//         const msg = JSON.parse(event.nativeEvent.data);
//         if (msg.type === 'YT_ERROR') {
//           handleVideoError(stream.id, { type: 'embed_blocked' });
//         }
//       } catch (_) {}
//     };

//     return (
//       <View style={styles.videoContainer}>
//         <WebView
//           key={`yt-${stream.id}`}
//           source={{
//             uri: embedUrl,
//             headers: {
//               // ✅ Referer header makes YouTube treat this as a legitimate embed
//               Referer: 'https://mountaingks.org',
//             },
//           }}
//           style={styles.webView}
//           allowsInlineMediaPlayback={true}
//           mediaPlaybackRequiresUserAction={false}
//           allowsFullscreenVideo={true}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           startInLoadingState={true}
//           scrollEnabled={false}
//           bounces={false}
//           overScrollMode="never"
//           scalesPageToFit={false}
//           mixedContentMode="compatibility"
//           injectedJavaScript={injectedJS}
//           onMessage={handleWebViewMessage}
//           onLoadStart={() => handleVideoLoadStart(stream.id)}
//           onLoadEnd={() => setTimeout(() => handleVideoLoad(stream.id), 2000)}
//           onError={(e) => handleVideoError(stream.id, e.nativeEvent)}
//           onHttpError={(e) => handleVideoError(stream.id, e.nativeEvent)}
//           // ✅ Desktop Chrome userAgent — avoids YouTube's mobile WebView blocking
//           userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//         />
//         {videoLoading[stream.id] && (
//           <View style={styles.videoLoadingOverlay}>
//             <ActivityIndicator size="large" color="#fff" />
//             <AppText style={styles.videoLoadingText}>
//               {translations.loadingStream || 'Loading stream...'}
//             </AppText>
//           </View>
//         )}
//         {videoErrors[stream.id] && (
//           <View style={styles.videoErrorOverlay}>
//             <AppText style={styles.videoErrorText}>
//               {'Stream unavailable in app'}
//             </AppText>
//             <AppText style={styles.videoErrorSubtext}>
//               {'Tap below to watch the live stream on YouTube'}
//             </AppText>
//             <TouchableOpacity
//               style={styles.openBrowserButtonLarge}
//               onPress={() =>
//                 openInBrowser(`https://youtube.com/watch?v=${videoId}`)
//               }
//             >
//               <ExternalLink size={20} color="#fff" />
//               <AppText style={styles.openBrowserTextLarge}>
//                 {'Watch on YouTube'}
//               </AppText>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderHLSPlayer = (stream) => {
//     return (
//       <View style={styles.videoContainer}>
//         <Video
//           source={{ uri: stream.streamUrl }}
//           style={styles.videoPlayer}
//           resizeMode={ResizeMode.CONTAIN}
//           shouldPlay={true}
//           isLooping={false}
//           isMuted={false}
//           useNativeControls={true}
//           onLoadStart={() => handleVideoLoadStart(stream.id)}
//           onReadyForDisplay={() => handleVideoLoad(stream.id)}
//           onError={(error) => handleVideoError(stream.id, error)}
//         />
//         {videoLoading[stream.id] && (
//           <View style={styles.videoLoadingOverlay}>
//             <ActivityIndicator size="large" color="#fff" />
//             <AppText style={styles.videoLoadingText}>
//               {translations.loadingHLSStream || 'Loading HLS stream...'}
//             </AppText>
//           </View>
//         )}
//         {videoErrors[stream.id] && (
//           <View style={styles.videoErrorOverlay}>
//             <AppText style={styles.videoErrorText}>
//               {translations.hlsStreamUnavailable || 'HLS Stream unavailable'}
//             </AppText>
//             <AppText style={styles.videoErrorSubtext}>
//               {translations.couldNotLoadStream || 'Could not load this stream'}
//             </AppText>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderFallbackPlayer = (stream) => {
//     const videoId = getYouTubeVideoId(stream.streamUrl) || stream.streamUrl;
//     return (
//       <View style={styles.videoContainer}>
//         <View style={styles.externalStreamContainer}>
//           <Play size={48} color="#fff" opacity={0.8} />
//           <AppText style={styles.externalStreamText}>
//             {stream.streamType?.toUpperCase() ||
//               translations.external ||
//               'EXTERNAL'}{' '}
//             {translations.streamLabel || 'Stream'}
//           </AppText>
//           <AppText style={styles.externalStreamSubtext}>
//             {stream.streamType === 'youtube'
//               ? translations.tapToWatchYouTube ||
//                 'Tap below to watch in YouTube app'
//               : translations.externalStreamExternalOnly ||
//                 'This stream type must be opened externally'}
//           </AppText>
//           <TouchableOpacity
//             style={[
//               styles.openBrowserButtonLarge,
//               {
//                 backgroundColor:
//                   stream.streamType === 'youtube' ? '#FF0000' : '#3B82F6',
//               },
//             ]}
//             onPress={() => {
//               if (stream.streamType === 'youtube' && videoId) {
//                 openInBrowser(`https://www.youtube.com/watch?v=${videoId}`);
//               } else {
//                 openInBrowser(stream.streamUrl);
//               }
//             }}
//           >
//             <ExternalLink size={20} color="#fff" />
//             <AppText style={styles.openBrowserTextLarge}>
//               {stream.streamType === 'youtube'
//                 ? translations.openInYouTube || 'Open in YouTube'
//                 : translations.watchInBrowser || 'Watch in Browser'}
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderStreamPlayer = (stream) => {
//     switch (stream.streamType) {
//       case 'youtube':
//         return renderYouTubePlayer(stream);
//       case 'hls':
//         return renderHLSPlayer(stream);
//       default:
//         return renderFallbackPlayer(stream);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaWrapper>
//         <TopNavigation
//           showBackButton={true}
//           title={translations.live || 'Live'}
//         />
//         <View
//           style={[
//             styles.centerContainer,
//             { backgroundColor: colors.background },
//           ]}
//         >
//           <ActivityIndicator size="large" color={colors.primary} />
//           <AppText
//             style={[styles.loadingText, { color: colors.textSecondary }]}
//           >
//             {translations.liveStreamLoading || 'Loading streams...'}
//           </AppText>
//         </View>
//       </SafeAreaWrapper>
//     );
//   }

//   return (
//     <SafeAreaWrapper>
//       <TopNavigation
//         showBackButton={true}
//         title={translations.live || 'Live'}
//       />

//       <View
//         style={[styles.headerActions, { backgroundColor: colors.background }]}
//       >
//         <TouchableOpacity
//           style={[styles.refreshButton, { backgroundColor: colors.card }]}
//           onPress={onRefresh}
//           disabled={refreshing}
//         >
//           <RefreshCw
//             size={18}
//             color={colors.primary}
//             style={refreshing && styles.refreshingIcon}
//           />
//           <AppText
//             style={[styles.refreshButtonText, { color: colors.primary }]}
//           >
//             {refreshing
//               ? translations.refreshing || 'Refreshing...'
//               : translations.refreshStreams || 'Refresh Streams'}
//           </AppText>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={{ backgroundColor: colors.background }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {streams.map((stream) => (
//           <View
//             key={stream.id}
//             style={[styles.streamCard, { backgroundColor: colors.card }]}
//           >
//             <View style={styles.streamHeader}>
//               <AppText style={[styles.streamTitle, { color: colors.text }]}>
//                 {stream.title}
//               </AppText>
//               <View
//                 style={[
//                   styles.statusBadge,
//                   {
//                     backgroundColor: stream.isActive
//                       ? '#10B98120'
//                       : '#6B728020',
//                   },
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor: stream.isActive ? '#10B981' : '#6B7280',
//                     },
//                   ]}
//                 />
//                 <AppText
//                   style={[
//                     styles.statusText,
//                     { color: stream.isActive ? '#10B981' : '#6B7280' },
//                   ]}
//                 >
//                   {stream.isActive
//                     ? translations.liveLabel || 'LIVE'
//                     : translations.offlineLabel || 'OFFLINE'}
//                 </AppText>
//               </View>
//             </View>

//             {stream.isActive && stream.streamUrl ? (
//               renderStreamPlayer(stream)
//             ) : (
//               <View style={styles.offlineContainer}>
//                 <AppText style={styles.offlineText}>
//                   {translations.streamOffline || 'Stream Offline'}
//                 </AppText>
//                 <AppText style={styles.offlineSubtext}>
//                   {translations.streamNotActive ||
//                     'This stream is currently not active'}
//                 </AppText>
//               </View>
//             )}

//             <View style={styles.streamInfo}>
//               {stream.description && (
//                 <AppText
//                   style={[
//                     styles.streamDescription,
//                     { color: colors.textSecondary },
//                   ]}
//                 >
//                   {stream.description}
//                 </AppText>
//               )}
//               {stream.schedule && (
//                 <AppText
//                   style={[styles.streamSchedule, { color: colors.primary }]}
//                 >
//                   📅 {stream.schedule}
//                 </AppText>
//               )}
//               <AppText
//                 style={[styles.streamType, { color: colors.textSecondary }]}
//               >
//                 {translations.streamTypeLabel || 'Type:'}{' '}
//                 {stream.streamType?.toUpperCase() ||
//                   translations.unknown ||
//                   'Unknown'}
//               </AppText>
//             </View>
//           </View>
//         ))}

//         {streams.length === 0 && (
//           <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
//             <AppText style={[styles.emptyTitle, { color: colors.text }]}>
//               {translations.noActiveStreams || 'No Active Stream'}
//             </AppText>
//             <AppText
//               style={[styles.emptySubtitle, { color: colors.textSecondary }]}
//             >
//               {translations.checkBackLaterLive ||
//                 'Check back later for live streams'}
//             </AppText>
//             <TouchableOpacity
//               style={[
//                 styles.refreshButtonLarge,
//                 { backgroundColor: colors.primary },
//               ]}
//               onPress={onRefresh}
//             >
//               <RefreshCw size={20} color="#fff" />
//               <AppText style={styles.refreshButtonLargeText}>
//                 {translations.refresh || 'Refresh'}
//               </AppText>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//   },
//   headerActions: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     gap: 8,
//   },
//   refreshButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   refreshingIcon: {
//     transform: [{ rotate: '360deg' }],
//   },
//   streamCard: {
//     margin: 16,
//     borderRadius: 12,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   streamHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     paddingBottom: 8,
//   },
//   streamTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 1,
//     marginRight: 12,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 4,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   videoContainer: {
//     height: 220,
//     backgroundColor: '#000',
//     position: 'relative',
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '100%',
//   },
//   webView: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   videoLoadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   videoLoadingText: {
//     color: '#fff',
//     marginTop: 8,
//     fontSize: 14,
//   },
//   videoErrorOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     zIndex: 10,
//   },
//   videoErrorText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   videoErrorSubtext: {
//     color: '#fff',
//     fontSize: 14,
//     opacity: 0.8,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   externalStreamContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     padding: 20,
//   },
//   externalStreamText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   externalStreamSubtext: {
//     color: '#fff',
//     fontSize: 14,
//     opacity: 0.7,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   openBrowserButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//     gap: 8,
//   },
//   openBrowserText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   openBrowserButtonLarge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     gap: 8,
//   },
//   openBrowserTextLarge: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   offlineContainer: {
//     height: 220,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.1)',
//   },
//   offlineText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//   },
//   offlineSubtext: {
//     fontSize: 14,
//     color: '#999',
//   },
//   streamInfo: {
//     padding: 16,
//   },
//   streamDescription: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   streamSchedule: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   streamType: {
//     fontSize: 11,
//     fontStyle: 'italic',
//   },
//   emptyState: {
//     margin: 20,
//     padding: 40,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   refreshButtonLarge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     gap: 8,
//   },
//   refreshButtonLargeText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
