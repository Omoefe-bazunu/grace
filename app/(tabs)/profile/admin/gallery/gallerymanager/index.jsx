import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { useTheme } from '../../../../../../contexts/ThemeContext';
// helpers from dataService.js [cite: 491-501]
import {
  getGalleryPictures,
  getGalleryVideos,
  getGalleryMinisters,
  updateGalleryEntry,
  deleteGalleryEntry,
} from '@/services/dataService';
import {
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Video,
  User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
  'Founding Instrument',
  'Past Presidents',
  'Past Chairman of Executive Board',
  'Executive Board Members',
  'Spiritual Advisers',
  'Senior Ministers',
  'Intermediate Ministers',
  'Junior Ministers',
];

export default function AdminGalleryManager() {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  const fetchAll = async () => {
    try {
      // Fetching from three separate collections
      const [pics, vids, mins] = await Promise.all([
        getGalleryPictures(),
        getGalleryVideos(),
        getGalleryMinisters(),
      ]);

      const formatted = [
        ...(pics || []).map((p) => ({
          ...p,
          type: 'galleryPictures',
          displayTitle: p.event || 'No Title',
        })),
        ...(vids || []).map((v) => ({
          ...v,
          type: 'galleryVideos',
          displayTitle: v.event || 'No Title',
        })),
        ...(mins || []).map((m) => ({
          ...m,
          type: 'galleryMinisters',
          displayTitle: m.name || 'No Name',
        })),
      ];

      setItems(
        formatted.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || ''),
        ),
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to load gallery items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = (item) => {
    Alert.alert('Delete', `Remove this ${getTypeLabel(item.type)}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Hits DELETE /api/gallery/:collection/:id [cite: 561]
            await deleteGalleryEntry(item.type, item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };
  const handleSave = async () => {
    try {
      const payload =
        editingItem.type === 'galleryMinisters'
          ? { ...form, rank: form.rank ? parseInt(form.rank, 10) : 999 }
          : form;
      await updateGalleryEntry(editingItem.type, editingItem.id, payload);
      fetchAll();
      setModalVisible(false);
      Alert.alert('Success', 'Updated successfully');
    } catch {
      Alert.alert('Error', 'Update failed');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm(
      item.type === 'galleryMinisters'
        ? {
            name: item.name,
            category: item.category,
            duration: item.duration,
            contact: item.contact,
            rank: item.rank != null ? String(item.rank) : '',
          }
        : { event: item.event, description: item.description },
    );
    setModalVisible(true);
  };

  const getTypeLabel = (type) => {
    if (type === 'galleryPictures') return 'Photo';
    if (type === 'galleryVideos') return 'Video';
    return 'Minister';
  };

  if (loading)
    return (
      <SafeAreaWrapper>
        <TopNavigation title="Manage" showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Manage" showBackButton />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAll} />
        }
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Image source={{ uri: item.url }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.displayTitle}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {getTypeLabel(item.type)}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Edit2 size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
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
            <Text style={[styles.modalHeader, { color: colors.text }]}>
              Edit {getTypeLabel(editingItem?.type)}
            </Text>

            <ScrollView>
              {editingItem?.type === 'galleryMinisters' ? (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                    placeholder="Name"
                  />

                  {/* Category selector */}
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Category
                  </Text>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setForm({ ...form, category: cat })}
                      style={[
                        styles.categoryOption,
                        { borderColor: colors.border },
                        form.category === cat && styles.categorySelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                          form.category === cat && styles.radioSelected,
                        ]}
                      >
                        {form.category === cat && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                      <Text
                        style={[
                          { fontSize: 13, color: colors.text },
                          form.category === cat && styles.categoryTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        marginTop: 12,
                      },
                    ]}
                    value={form.duration}
                    onChangeText={(t) => setForm({ ...form, duration: t })}
                    placeholder="Duration (e.g. 1995 – Present)"
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.contact}
                    onChangeText={(t) => setForm({ ...form, contact: t })}
                    placeholder="Contact"
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.rank}
                    onChangeText={(t) => setForm({ ...form, rank: t })}
                    placeholder="Display order / Rank (e.g. 1)"
                    keyboardType="number-pad"
                  />
                </>
              ) : (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.event}
                    onChangeText={(t) => setForm({ ...form, event: t })}
                    placeholder="Event Title"
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        height: 100,
                      },
                    ]}
                    value={form.description}
                    onChangeText={(t) => setForm({ ...form, description: t })}
                    multiline
                    placeholder="Description"
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 15, borderRadius: 12, overflow: 'hidden', elevation: 3 },
  cardImage: { width: '100%', height: 180 },
  cardBody: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { padding: 20, borderRadius: 15, maxHeight: '80%' },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15 },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  sectionLabel: { fontSize: 12, marginBottom: 8, marginTop: 4 },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  categorySelected: { borderColor: '#007AFF', backgroundColor: '#EFF6FF' },
  categoryTextSelected: { color: '#007AFF', fontWeight: '500' },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
});
