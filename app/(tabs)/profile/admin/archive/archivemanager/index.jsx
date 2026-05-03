import React, { useState, useEffect, useCallback } from 'react';
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
  FlatList,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import { apiClient } from '../../../../../../utils/api';
import { Edit2, Trash2, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = ['Pictures', 'Videos', 'Documents'];

export default function AdminArchiveManager() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Pictures');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    event: '',
    description: '',
    title: '',
    url: '',
  });

  const insets = useSafeAreaInsets();

  const fetchItems = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [pics, vids, docs] = await Promise.all([
        apiClient.get('archive/pictures'),
        apiClient.get('archive/videos'),
        apiClient.get('archive/documents'),
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
        ...(docs.data.archiveDocuments || []).map((d) => ({
          ...d,
          type: 'archiveDocuments',
        })),
      ];
      setItems(formatted);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch archive data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems(true);
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    if (activeTab === 'Pictures') return item.type === 'archivePictures';
    if (activeTab === 'Videos') return item.type === 'archiveVideos';
    return item.type === 'archiveDocuments';
  });

  const handleDelete = (item) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`archive/${item.type}`, item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch {
            Alert.alert('Error', 'Delete failed.');
          }
        },
      },
    ]);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      event: item.event || '',
      description: item.description || '',
      title: item.title || '',
      url: item.url || '',
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const isDoc = editingItem.type === 'archiveDocuments';
      const payload = isDoc
        ? {
            title: form.title.trim(),
            description: form.description.trim(),
            url: form.url.trim(),
          }
        : { event: form.event.trim(), description: form.description.trim() };

      await apiClient.put(
        `archive/${editingItem.type}`,
        editingItem.id,
        payload,
      );
      fetchItems(true);
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Update failed.');
    }
  };

  const renderMediaItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {item.type !== 'archiveDocuments' ? (
        <Image source={{ uri: item.url }} style={styles.cardImage} />
      ) : (
        <View
          style={[
            styles.docPlaceholder,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <FileText size={36} color={colors.primary} />
        </View>
      )}
      <View style={styles.info}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.itemTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.title || item.event || 'No Title'}
          </Text>
          {item.description ? (
            <Text
              style={[styles.itemDesc, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => openEdit(item)}
          >
            <Edit2 size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Manage" showBackButton />

      {/* Tabs */}
      <View
        style={[
          styles.tabRow,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMediaItem}
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
                No {activeTab.toLowerCase()} yet
              </Text>
            </View>
          }
        />
      )}

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalCont}
        >
          <View
            style={[styles.modalInner, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit{' '}
              {editingItem?.type === 'archiveDocuments' ? 'Document' : 'Entry'}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {editingItem?.type === 'archiveDocuments' ? (
                <>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Title
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.title}
                    onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
                    placeholder="Document title"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                  />
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Description
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        height: 70,
                        textAlignVertical: 'top',
                      },
                    ]}
                    value={form.description}
                    onChangeText={(t) =>
                      setForm((f) => ({ ...f, description: t }))
                    }
                    placeholder="Description"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                  />
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Drive Link
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.url}
                    onChangeText={(t) => setForm((f) => ({ ...f, url: t }))}
                    placeholder="https://drive.google.com/file/d/..."
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="done"
                  />
                </>
              ) : (
                <>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Event
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={form.event}
                    onChangeText={(t) => setForm((f) => ({ ...f, event: t }))}
                    placeholder="Event name"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                  />
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Description
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        height: 70,
                        textAlignVertical: 'top',
                      },
                    ]}
                    value={form.description}
                    onChangeText={(t) =>
                      setForm((f) => ({ ...f, description: t }))
                    }
                    placeholder="Description"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                  />
                </>
              )}

              {/* Spacer so Save is never behind keyboard */}
              <View style={{ height: 20 }} />

              <View
                style={[styles.modalBtns, { marginBottom: insets.bottom + 16 }]}
              >
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 150 },
  docPlaceholder: {
    width: '100%',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  itemTitle: { fontSize: 15, fontWeight: 'bold' },
  itemDesc: { fontSize: 12, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  modalCont: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalInner: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
