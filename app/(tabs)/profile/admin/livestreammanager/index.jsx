import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {
  Edit2,
  Trash2,
  X,
  MessageCircle,
  Heart,
  Calendar,
  Radio,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { useTheme } from '../../../../../contexts/ThemeContext';
import {
  getLiveStreamLog,
  updateLiveStream,
  deleteLiveStream,
  getLiveStreamDetails,
  deleteLiveStreamComment,
} from '../../../../../services/dataService';

export default function LiveStreamManager() {
  const { colors } = useTheme();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit title modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // Comments moderation modal
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamComments, setStreamComments] = useState([]);
  const [reactionsTotal, setReactionsTotal] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);

  // Result feedback modal (success / failure of an action)
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'success', // 'success' | 'error'
    message: '',
  });

  const showStatus = (type, message) => {
    setStatusModal({ visible: true, type, message });
  };

  const closeStatus = () => {
    setStatusModal((prev) => ({ ...prev, visible: false }));
  };

  // Auto-dismiss the status modal after a short delay
  useEffect(() => {
    if (statusModal.visible) {
      const timer = setTimeout(closeStatus, 2000);
      return () => clearTimeout(timer);
    }
  }, [statusModal.visible]);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const result = await getLiveStreamLog(50);
      setStreams(result.streams);
    } catch (error) {
      console.error('Error loading streams:', error);
      Alert.alert('Error', 'Failed to load live streams');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStreams();
  };

  // --- Edit title ---

  const openEditTitle = (item) => {
    setEditingStream(item);
    setEditTitleValue(item.title || '');
    setEditModalVisible(true);
  };

  const closeEditTitle = () => {
    setEditModalVisible(false);
    setEditingStream(null);
    setEditTitleValue('');
  };

  const handleSaveTitle = async () => {
    if (!editTitleValue.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    setSavingTitle(true);
    try {
      await updateLiveStream(editingStream.id, {
        title: editTitleValue.trim(),
      });
      setStreams((prev) =>
        prev.map((s) =>
          s.id === editingStream.id
            ? { ...s, title: editTitleValue.trim() }
            : s,
        ),
      );
      closeEditTitle();
      showStatus('success', 'Title updated successfully');
    } catch (error) {
      console.error('Error updating title:', error);
      showStatus('error', 'Failed to update title');
    } finally {
      setSavingTitle(false);
    }
  };

  // --- Delete stream ---

  const handleDeleteStream = (item) => {
    Alert.alert(
      'Delete Stream',
      `Delete "${item.title || 'this stream'}"? This also removes its comments and reactions. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLiveStream(item.id);
              setStreams((prev) => prev.filter((s) => s.id !== item.id));
              showStatus('success', 'Stream deleted successfully');
            } catch (error) {
              console.error('Error deleting stream:', error);
              showStatus('error', 'Failed to delete live stream');
            }
          },
        },
      ],
    );
  };

  // --- Comments moderation ---

  const openComments = async (item) => {
    setSelectedStream(item);
    setCommentsModalVisible(true);
    setLoadingComments(true);
    try {
      const result = await getLiveStreamDetails(item.id);
      setStreamComments(result.comments);
      const total = Object.values(result.reactions || {}).reduce(
        (sum, count) => sum + count,
        0,
      );
      setReactionsTotal(total);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const closeComments = () => {
    setCommentsModalVisible(false);
    setSelectedStream(null);
    setStreamComments([]);
    setReactionsTotal(0);
  };

  const handleDeleteComment = (comment) => {
    Alert.alert('Delete Comment', 'Remove this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLiveStreamComment(selectedStream.id, comment.id);
            setStreamComments((prev) =>
              prev.filter((c) => c.id !== comment.id),
            );
            showStatus('success', 'Comment deleted successfully');
          } catch (error) {
            console.error('Error deleting comment:', error);
            showStatus('error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  const renderStreamCard = ({ item }) => (
    <View style={[styles.streamCard, { backgroundColor: colors.card }]}>
      <View
        style={[
          styles.accentBar,
          {
            backgroundColor: item.isActive
              ? '#10B981'
              : colors.textSecondary + '40',
          },
        ]}
      />
      <View style={styles.streamCardBody}>
        <View style={styles.streamHeader}>
          <Text
            style={[styles.streamTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.title || 'Untitled Stream'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.isActive
                  ? '#10B98115'
                  : colors.textSecondary + '15',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isActive ? '#10B981' : '#9CA3AF' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.isActive ? '#10B981' : '#9CA3AF' },
              ]}
            >
              {item.isActive ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : '—'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MessageCircle size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.commentCount ?? 0}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Heart size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.reactionCount ?? 0}
            </Text>
          </View>
        </View>

        <View style={styles.streamActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary + '12' },
            ]}
            onPress={() => openEditTitle(item)}
          >
            <Edit2 size={15} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Title
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.textSecondary + '12' },
            ]}
            onPress={() => openComments(item)}
          >
            <MessageCircle size={15} color={colors.textSecondary} />
            <Text
              style={[styles.actionButtonText, { color: colors.textSecondary }]}
            >
              Comments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF444412' }]}
            onPress={() => handleDeleteStream(item)}
          >
            <Trash2 size={15} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Live Streams
        </Text>
        <View style={styles.headerSubtitleRow}>
          <Radio size={13} color={colors.textSecondary} />
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {streams.length} entries
          </Text>
        </View>
      </View>

      <FlatList
        data={streams}
        keyExtractor={(item) => item.id}
        renderItem={renderStreamCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Radio size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No stream entries yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Entries appear automatically when the YouTube poller detects a
              stream
            </Text>
          </View>
        }
      />

      {/* Edit Title Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditTitle}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Title
              </Text>
              <TouchableOpacity onPress={closeEditTitle}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                value={editTitleValue}
                onChangeText={setEditTitleValue}
                placeholder="Stream title"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                autoFocus
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={closeEditTitle}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.textSecondary + '20' },
                ]}
              >
                <Text
                  style={{ color: colors.textSecondary, fontWeight: '600' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTitle}
                disabled={savingTitle}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                {savingTitle ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Moderation Modal */}
      <Modal
        visible={commentsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background, maxHeight: '80%' },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.modalTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {selectedStream?.title || 'Comments'}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {streamComments.length} comments • {reactionsTotal} reactions
                </Text>
              </View>
              <TouchableOpacity onPress={closeComments}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingComments ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.commentsList}>
                {streamComments.length === 0 ? (
                  <Text
                    style={[
                      styles.emptyCommentsText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No comments on this stream
                  </Text>
                ) : (
                  streamComments.map((comment) => (
                    <View
                      key={comment.id}
                      style={[
                        styles.commentRow,
                        { borderBottomColor: colors.textSecondary + '15' },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.commentName, { color: colors.text }]}
                        >
                          {comment.name || 'Anonymous'}
                          {comment.location ? ` • ${comment.location}` : ''}
                        </Text>
                        <Text
                          style={[
                            styles.commentText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {comment.text}
                        </Text>
                        <Text
                          style={[
                            styles.commentDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString()
                            : ''}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.commentDeleteBtn}
                        onPress={() => handleDeleteComment(comment)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Modal — confirms success or failure after an action */}
      <Modal
        visible={statusModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeStatus}
      >
        <TouchableOpacity
          style={styles.statusOverlay}
          activeOpacity={1}
          onPress={closeStatus}
        >
          <View
            style={[styles.statusBox, { backgroundColor: colors.background }]}
          >
            {statusModal.type === 'success' ? (
              <CheckCircle size={40} color="#10B981" />
            ) : (
              <XCircle size={40} color="#EF4444" />
            )}
            <Text style={[styles.statusText, { color: colors.text }]}>
              {statusModal.message}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  streamCard: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  accentBar: { width: 4 },
  streamCardBody: { flex: 1, padding: 16 },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { fontSize: 12 },
  streamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: { fontSize: 12, fontWeight: '600' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalSubtitle: { fontSize: 12, marginTop: 3 },
  modalBody: { padding: 20 },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  commentsList: {
    paddingHorizontal: 20,
  },
  emptyCommentsText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 30,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  commentName: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  commentText: { fontSize: 14, lineHeight: 19, marginBottom: 4 },
  commentDate: { fontSize: 11 },
  commentDeleteBtn: { padding: 6 },
  statusOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBox: {
    width: 240,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
});
