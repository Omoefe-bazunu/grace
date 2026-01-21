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
import { apiClient } from '../../../../../../utils/api';
import { Edit2, Trash2, X } from 'lucide-react-native';

export default function AdminArchiveManager() {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ event: '', description: '' });

  const fetchItems = async () => {
    try {
      const [pics, vids] = await Promise.all([
        apiClient.get('archive/pictures'),
        apiClient.get('archive/videos'),
      ]);

      const formatted = [
        ...(pics.data.archivePictures || []).map((p) => ({
          ...p,
          type: 'archivePictures',
        })),
        ...(vids.data.archiveVideos || []).map((v) => ({
          ...v,
          type: 'archiveVideos',
        })),
      ];
      setItems(formatted);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch archive data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = (item) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Hits: DELETE /api/archive/archivePictures/doc_id
            await apiClient.delete(`archive/${item.type}`, item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch {
            Alert.alert('Error', 'Delete failed (404). Check route mounting.');
          }
        },
      },
    ]);
  };

  const handleUpdate = async () => {
    try {
      // Hits: PUT /api/archive/archivePictures/doc_id
      await apiClient.put(`archive/${editingItem.type}`, editingItem.id, {
        event: form.event.trim(),
        description: form.description.trim(),
      });
      fetchItems();
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Update failed.');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Manage Archive" showBackButton />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchItems} />
        }
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Image source={{ uri: item.url }} style={styles.cardImage} />
            <View style={styles.info}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.event || 'No Title'}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingItem(item);
                    setForm({
                      event: item.event,
                      description: item.description,
                    });
                    setModalVisible(true);
                  }}
                >
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
          style={styles.modalCont}
        >
          <View
            style={[styles.modalInner, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Archive Entry
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={form.event}
              onChangeText={(t) => setForm({ ...form, event: t })}
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, height: 80 },
              ]}
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  card: { margin: 15, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 160 },
  info: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 20 },
  modalCont: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalInner: { padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
});
