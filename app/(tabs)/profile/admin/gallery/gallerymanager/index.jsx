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
      // Hits PUT /api/gallery/:collection/:id [cite: 560]
      await updateGalleryEntry(editingItem.type, editingItem.id, form);
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
            dateDevoted: item.dateDevoted,
            contact: item.contact,
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
        <TopNavigation title="Gallery Admin" showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Gallery Admin" showBackButton />
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
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.category}
                    onChangeText={(t) => setForm({ ...form, category: t })}
                    placeholder="Category"
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.dateDevoted}
                    onChangeText={(t) => setForm({ ...form, dateDevoted: t })}
                    placeholder="Date Devoted"
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
});
