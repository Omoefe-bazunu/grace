import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Youtube,
  Facebook,
  Video,
  Calendar,
  Podcast,
} from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { useTheme } from '../../../../../contexts/ThemeContext';
import {
  getLiveStreams,
  createLiveStream,
  updateLiveStream,
  deleteLiveStream,
} from '../../../../../services/dataService';

const STREAM_TYPES = [
  { id: 'youtube', name: 'YouTube Live', icon: Youtube, color: '#FF0000' },
  { id: 'facebook', name: 'Facebook Live', icon: Facebook, color: '#1877F2' },
  { id: 'hls', name: 'HLS Stream', icon: Video, color: '#10B981' },
  { id: 'rtmp', name: 'RTMP Stream', icon: Podcast, color: '#8B5CF6' },
  { id: 'obs', name: 'OBS Stream', icon: Podcast, color: '#F59E0B' },
];

export default function LiveStreamManager() {
  const { colors } = useTheme();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    streamType: 'youtube',
    streamUrl: '',
    isActive: false,
    schedule: '',
    thumbnailUrl: '',
    customData: {},
  });

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const streamData = await getLiveStreams();
      setStreams(streamData);
    } catch (error) {
      console.error('Error loading streams:', error);
      Alert.alert('Error', 'Failed to load live streams');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStream(null);
    setForm({
      title: '',
      description: '',
      streamType: 'youtube',
      streamUrl: '',
      isActive: false,
      schedule: '',
      thumbnailUrl: '',
      customData: {},
    });
    setModalVisible(true);
  };

  const openEditModal = (stream) => {
    setEditingStream(stream);
    setForm({
      title: stream.title,
      description: stream.description,
      streamType: stream.streamType,
      streamUrl: stream.streamUrl,
      isActive: stream.isActive,
      schedule: stream.schedule,
      thumbnailUrl: stream.thumbnailUrl,
      customData: stream.customData || {},
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingStream(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.streamUrl.trim()) {
      Alert.alert('Error', 'Title and Stream URL are required');
      return;
    }

    setSaving(true);
    try {
      const streamData = {
        title: form.title.trim(),
        description: form.description.trim(),
        streamType: form.streamType,
        streamUrl: form.streamUrl.trim(),
        isActive: form.isActive,
        schedule: form.schedule.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        customData: form.customData,
      };

      if (editingStream) {
        await updateLiveStream(editingStream.id, streamData);
        Alert.alert('Success', 'Live stream updated successfully');
      } else {
        await createLiveStream(streamData);
        Alert.alert('Success', 'Live stream created successfully');
      }

      closeModal();
      loadStreams();
    } catch (error) {
      console.error('Error saving stream:', error);
      Alert.alert('Error', 'Failed to save live stream');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (stream) => {
    Alert.alert(
      'Delete Stream',
      `Are you sure you want to delete "${stream.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLiveStream(stream.id);
              loadStreams();
              Alert.alert('Success', 'Live stream deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete live stream');
            }
          },
        },
      ]
    );
  };

  const getStreamTypeConfig = (type) => {
    return STREAM_TYPES.find((t) => t.id === type) || STREAM_TYPES[0];
  };

  const renderFormFields = () => {
    return (
      <ScrollView style={styles.formContent}>
        {/* Stream Type Selection */}
        <Text style={[styles.label, { color: colors.text }]}>
          Platform Type
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeScroll}
        >
          {STREAM_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.card },
                  form.streamType === type.id && {
                    borderColor: type.color,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setForm({ ...form, streamType: type.id })}
              >
                <Icon
                  size={20}
                  color={
                    form.streamType === type.id
                      ? type.color
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        form.streamType === type.id
                          ? type.color
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Basic Information */}
        <TextInput
          placeholder="Stream Title *"
          value={form.title}
          onChangeText={(text) => setForm({ ...form, title: text })}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholderTextColor={colors.textSecondary}
        />

        <TextInput
          placeholder="Description"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />

        {/* Platform-specific URL Fields */}
        {form.streamType === 'youtube' && (
          <View>
            <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
              YouTube Video ID or Embed URL
            </Text>
            <TextInput
              placeholder="e.g., dQw4w9WgXcQ or full embed URL"
              value={form.streamUrl}
              onChangeText={(text) => setForm({ ...form, streamUrl: text })}
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}

        {form.streamType === 'facebook' && (
          <View>
            <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
              Facebook Video URL
            </Text>
            <TextInput
              placeholder="e.g., https://facebook.com/watch/live/?v=123456"
              value={form.streamUrl}
              onChangeText={(text) => setForm({ ...form, streamUrl: text })}
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}

        {(form.streamType === 'hls' ||
          form.streamType === 'rtmp' ||
          form.streamType === 'obs') && (
          <View>
            <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
              Stream URL ({form.streamType.toUpperCase()})
            </Text>
            <TextInput
              placeholder={`e.g., https://yourserver.com/stream.m3u8`}
              value={form.streamUrl}
              onChangeText={(text) => setForm({ ...form, streamUrl: text })}
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}

        {/* Schedule */}
        <TextInput
          placeholder="Schedule (e.g., Sundays 10:00 AM)"
          value={form.schedule}
          onChangeText={(text) => setForm({ ...form, schedule: text })}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholderTextColor={colors.textSecondary}
        />

        {/* Thumbnail URL */}
        <TextInput
          placeholder="Thumbnail URL (optional)"
          value={form.thumbnailUrl}
          onChangeText={(text) => setForm({ ...form, thumbnailUrl: text })}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholderTextColor={colors.textSecondary}
        />

        {/* Active Switch */}
        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            Active Stream
          </Text>
          <Switch
            value={form.isActive}
            onValueChange={(value) => setForm({ ...form, isActive: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={form.isActive ? '#fff' : '#f4f3f4'}
          />
        </View>
      </ScrollView>
    );
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

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      {/* Add Stream Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={openCreateModal}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Live Stream</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {streams.length === 0 ? (
          <View style={styles.emptyState}>
            <Podcast size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No Live Streams
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Add your first live stream to get started
            </Text>
          </View>
        ) : (
          streams.map((stream) => {
            const typeConfig = getStreamTypeConfig(stream.streamType);
            const Icon = typeConfig.icon;

            return (
              <View
                key={stream.id}
                style={[styles.streamCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.streamHeader}>
                  <View style={styles.streamType}>
                    <Icon size={20} color={typeConfig.color} />
                    <Text
                      style={[
                        styles.streamTypeText,
                        { color: typeConfig.color },
                      ]}
                    >
                      {typeConfig.name}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
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

                <Text style={[styles.streamTitle, { color: colors.text }]}>
                  {stream.title}
                </Text>

                {stream.description && (
                  <Text
                    style={[
                      styles.streamDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {stream.description}
                  </Text>
                )}

                {stream.schedule && (
                  <View style={styles.scheduleInfo}>
                    <Calendar size={14} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.scheduleText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {stream.schedule}
                    </Text>
                  </View>
                )}

                <View style={styles.streamActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(stream)}
                  >
                    <Edit2 size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(stream)}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
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
                {editingStream ? 'Edit Live Stream' : 'Add Live Stream'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {renderFormFields()}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={closeModal}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.textSecondary + '30' },
                ]}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    {editingStream ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  streamCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  streamType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streamTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  streamDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 12,
  },
  streamActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContent: {
    padding: 20,
    maxHeight: 500,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  typeScroll: {
    marginBottom: 16,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 120,
  },
  typeText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
});
