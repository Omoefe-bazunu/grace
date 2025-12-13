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
} from 'react-native';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import { getArchivePictures, getArchiveVideos } from '@/services/dataService';
import apiClient from '../../../../../../utils/api';
import {
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Video,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminArchiveManager() {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  const fetchAll = async () => {
    try {
      // Helper to safely extract array from response
      const getArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.archivePictures))
          return data.archivePictures;
        if (data && Array.isArray(data.archiveVideos))
          return data.archiveVideos;
        return [];
      };

      const [picsData, vidsData] = await Promise.all([
        getArchivePictures(),
        getArchiveVideos(),
      ]);

      const pics = getArray(picsData);
      const vids = getArray(vidsData);

      const formatted = [
        ...pics.map((p) => ({
          ...p,
          id: p.id,
          title: p.event || 'Untitled Event',
          type: 'archivePicture',
          url: p.url,
          description: p.description,
        })),
        ...vids.map((v) => ({
          ...v,
          id: v.id,
          title: v.event || 'Untitled Video',
          type: 'archiveVideo',
          url: v.url,
          description: v.description,
        })),
      ];

      setItems(
        formatted.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        )
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const getCollectionName = (type) => {
    const map = {
      archivePicture: 'archivePictures',
      archiveVideo: 'archiveVideos',
    };
    return map[type] || 'archivePictures';
  };

  const handleDelete = (item) => {
    Alert.alert(
      `Delete ${getTypeLabel(item.type)}`,
      `Delete "${item.title}"?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const collection = getCollectionName(item.type);
              await apiClient.delete(`${collection}/${item.id}`);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
              Alert.alert('Success', 'Deleted successfully');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      event: item.title,
      description: item.description || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const collection = getCollectionName(editingItem.type);

    if (!form.event?.trim()) {
      return Alert.alert('Error', 'Event title is required');
    }

    const payload = {
      event: form.event.trim(),
      description: form.description.trim(),
    };

    try {
      // Pass 3 arguments (collection, id, payload) explicitly
      await apiClient.put(collection, editingItem.id, payload);

      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                title: form.event,
                ...payload,
              }
            : i
        )
      );
      setModalVisible(false);
      Alert.alert('Success', 'Updated successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const getTypeColor = (type) => {
    return type === 'archivePicture' ? '#EC4899' : '#F97316';
  };

  const getTypeIcon = (type) => {
    if (type === 'archivePicture') return <ImageIcon size={20} color="#fff" />;
    return <Video size={20} color="#fff" />;
  };

  const getTypeLabel = (type) => {
    if (type === 'archivePicture') return 'Photo';
    return 'Video';
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <TopNavigation title="Archive Manager" showBackButton />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Archive Admin" showBackButton />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ backgroundColor: colors.background }}
      >
        {items.length === 0 ? (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 50,
              color: colors.textSecondary,
            }}
          >
            No items yet
          </Text>
        ) : (
          items.map((item) => {
            const color = getTypeColor(item.type);
            const displayImage = item.url;

            return (
              <View
                key={item.id}
                style={{
                  marginHorizontal: 20,
                  marginVertical: 8,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: colors.card,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <LinearGradient
                  colors={[color + '20', 'transparent']}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                  }}
                />

                {displayImage ? (
                  <Image
                    source={{ uri: displayImage }}
                    style={{
                      width: '100%',
                      height: 180,
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      backgroundColor: '#f0f0f0',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      height: 180,
                      backgroundColor: '#eee',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#999' }}>No Image</Text>
                  </View>
                )}

                <View style={{ padding: 16 }}>
                  <View
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: color,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{ fontSize: 13, color: color, marginTop: 2 }}
                      >
                        {getTypeLabel(item.type)}
                      </Text>
                    </View>
                  </View>

                  {/* Safety Check: Ensure string exists before rendering */}
                  {!!item.description && (
                    <Text
                      style={{ marginTop: 10, color: colors.textSecondary }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    padding: 16,
                    paddingTop: 0,
                    gap: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={{ padding: 8 }}
                  >
                    <Edit2 size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={{ padding: 8 }}
                  >
                    <Trash2 size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '90%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 20,
                borderBottomWidth: 1,
                borderColor: '#eee',
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: '600', color: colors.text }}
              >
                Edit {getTypeLabel(editingItem?.type)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <Text style={labelStyle(colors)}>Title</Text>
              <TextInput
                placeholder="Event Title *"
                value={form.event}
                onChangeText={(t) => setForm({ ...form, event: t })}
                style={inputStyle(colors)}
              />
              <Text style={labelStyle(colors)}>Description</Text>
              <TextInput
                placeholder="Description"
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                multiline
                style={[
                  inputStyle(colors),
                  { height: 120, textAlignVertical: 'top' },
                ]}
              />
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                padding: 20,
                gap: 12,
                borderTopWidth: 1,
                borderColor: '#eee',
              }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  padding: 15,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  flex: 1,
                  padding: 15,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaWrapper>
  );
}

const inputStyle = (colors) => ({
  backgroundColor: colors.card,
  color: colors.text,
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  fontSize: 16,
  borderWidth: 1,
  borderColor: '#E5E7EB',
});

const labelStyle = (colors) => ({
  fontSize: 14,
  fontWeight: '600',
  color: colors.textSecondary,
  marginBottom: 6,
  marginLeft: 4,
});
