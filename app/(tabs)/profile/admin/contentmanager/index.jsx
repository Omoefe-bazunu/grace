import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import {
  getSermons,
  getSongs,
  getVideos,
  getSermonVideos,
  getDailyDevotionals,
} from '@/services/dataService';
import apiClient from '../../../../../utils/api';
import { Edit2, Trash2, X, Video, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ContentManager() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    mainText: '',
    date: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchAllContent = async () => {
    try {
      const [sermons, songs, videos, sermonVideos, devotionals] =
        await Promise.all([
          getSermons(),
          getSongs(),
          getVideos(),
          getSermonVideos(),
          getDailyDevotionals(),
        ]);

      const formatted = [
        ...sermons.map((s) => ({
          id: s.id,
          title: s.title,
          type: 'sermon',
          category: s.category,
          content: s.content,
          date: s.date || s.createdAt.split('T')[0],
          icon: '📖',
        })),
        ...songs.map((s) => ({
          id: s.id,
          title: s.title,
          type: 'song',
          category: s.category,
          date: s.createdAt.split('T')[0],
          icon: '🎵',
        })),
        ...videos.map((v) => ({
          id: v.id,
          title: v.title,
          type: 'video',
          date: v.createdAt.split('T')[0],
          icon: '🎬',
        })),
        ...sermonVideos.map((v) => ({
          id: v.id,
          title: v.title,
          type: 'sermonVideo',
          category: v.category,
          date: v.date || v.createdAt.split('T')[0],
          icon: '🎥',
        })),
        ...devotionals.map((d) => ({
          id: d.id,
          title: d.title,
          type: 'dailyDevotional',
          mainText: d.mainText,
          date: d.date || d.createdAt.split('T')[0],
          icon: '📅',
        })),
      ];

      setContent(formatted.sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllContent();
  };

  const getCollectionName = (type) => {
    const collections = {
      sermon: 'sermons',
      song: 'songs',
      video: 'videos',
      sermonVideo: 'sermonVideos',
      dailyDevotional: 'dailyDevotionals',
    };
    return collections[type] || 'sermons';
  };

  const handleDelete = (item) => {
    Alert.alert(`Delete ${item.type}`, `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const collection = getCollectionName(item.type);
            await apiClient.delete(collection, item.id);
            setContent((prev) => prev.filter((c) => c.id !== item.id));
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content || '',
      category: item.category || '',
      mainText: item.mainText || '',
      date: item.date || '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    setForm({ title: '', content: '', category: '', mainText: '', date: '' });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setSaving(true);
    try {
      const collection = getCollectionName(editingItem.type);

      const payload = { title: form.title };

      // Add type-specific fields
      if (editingItem.type === 'sermon') {
        payload.content = form.content;
      } else if (
        editingItem.type === 'song' ||
        editingItem.type === 'sermonVideo'
      ) {
        payload.category = form.category;
      } else if (editingItem.type === 'dailyDevotional') {
        payload.mainText = form.mainText;
        payload.date = form.date;
      }

      await apiClient.put(collection, editingItem.id, payload);

      setContent((prev) =>
        prev.map((c) =>
          c.id === editingItem.id
            ? {
                ...c,
                title: form.title,
                content: form.content,
                category: form.category,
                mainText: form.mainText,
                date: form.date,
              }
            : c
        )
      );

      closeModal();
      Alert.alert('Success', 'Updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      sermon: '📖',
      song: '🎵',
      video: '🎬',
      sermonVideo: '🎥',
      dailyDevotional: '📅',
    };
    return icons[type] || '📄';
  };

  const getTypeColor = (type) => {
    const colorsMap = {
      sermon: '#3B82F6', // Blue
      song: '#8B5CF6', // Purple
      video: '#EF4444', // Red
      sermonVideo: '#10B981', // Green
      dailyDevotional: '#F59E0B', // Amber
    };
    return colorsMap[type] || colors.primary;
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
      <ScrollView
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {content.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No content available
          </Text>
        ) : (
          content.map((item) => {
            const typeColor = getTypeColor(item.type);
            return (
              <View
                key={item.id}
                style={[styles.item, { backgroundColor: colors.card }]}
              >
                <LinearGradient
                  colors={[typeColor + '20', 'transparent']}
                  style={styles.itemGradient}
                />
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <View
                      style={[styles.typeBadge, { backgroundColor: typeColor }]}
                    >
                      <Text style={styles.typeText}>
                        {getTypeIcon(item.type)}
                      </Text>
                    </View>
                    <View style={styles.titleContainer}>
                      <Text
                        style={[styles.itemTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.itemType, { color: typeColor }]}>
                        {item.type}
                      </Text>
                    </View>
                  </View>

                  {(item.category || item.date) && (
                    <View style={styles.metaContainer}>
                      {item.category && (
                        <Text
                          style={[
                            styles.itemCategory,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.category}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.itemDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.date}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={styles.actionBtn}
                  >
                    <Edit2 size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.actionBtn}
                  >
                    <Trash2 size={18} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Modal */}
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
                Edit {editingItem?.type}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="Title"
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
              />

              {editingItem?.type === 'sermon' && (
                <TextInput
                  value={form.content}
                  onChangeText={(t) => setForm({ ...form, content: t })}
                  placeholder="Content"
                  multiline
                  style={[
                    styles.textarea,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                />
              )}

              {(editingItem?.type === 'song' ||
                editingItem?.type === 'sermonVideo') && (
                <TextInput
                  value={form.category}
                  onChangeText={(t) => setForm({ ...form, category: t })}
                  placeholder="Category"
                  style={[
                    styles.input,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                />
              )}

              {editingItem?.type === 'dailyDevotional' && (
                <>
                  <TextInput
                    value={form.date}
                    onChangeText={(t) => setForm({ ...form, date: t })}
                    placeholder="Date (YYYY-MM-DD)"
                    style={[
                      styles.input,
                      { backgroundColor: colors.card, color: colors.text },
                    ]}
                  />
                  <TextInput
                    value={form.mainText}
                    onChangeText={(t) => setForm({ ...form, mainText: t })}
                    placeholder="Main Text"
                    multiline
                    style={[
                      styles.textarea,
                      { backgroundColor: colors.card, color: colors.text },
                    ]}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={closeModal}
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.textSecondary + '30' },
                ]}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  item: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 4,
  },
  itemGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeText: {
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 13,
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    gap: 12,
  },
  actionBtn: {
    padding: 8,
  },
  bottomSpacer: { height: 40 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
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
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textarea: {
    height: 150,
    textAlignVertical: 'top',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
