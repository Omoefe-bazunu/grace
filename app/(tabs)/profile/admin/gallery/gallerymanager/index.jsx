// AdminGalleryManager.js — FINAL FIXED VERSION (No Text error)
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
import {
  getGalleryPictures,
  getGalleryVideos,
  getMinisters,
} from '@/services/dataService';
import apiClient from '../../../../../../utils/api';
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
      const [pics, vids, ministers] = await Promise.all([
        getGalleryPictures(),
        getGalleryVideos(),
        getMinisters(),
      ]);

      const formatted = [
        ...pics.map((p) => ({
          ...p,
          id: p.id,
          title: p.event || 'Untitled Event',
          type: 'galleryPicture',
          url: p.url,
          description: p.description,
        })),
        ...vids.map((v) => ({
          ...v,
          id: v.id,
          title: v.event || 'Untitled Video',
          type: 'galleryVideo',
          url: v.url,
          description: v.description,
        })),
        ...ministers.map((m) => ({
          ...m,
          id: m.id,
          title: m.name || 'Unnamed Minister',
          type: 'minister',
          imageUrl: m.imageUrl,
          category: m.category,
          station: m.station,
          maritalStatus: m.maritalStatus,
          contact: m.contact,
        })),
      ];

      setItems(
        formatted.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        )
      );
    } catch (err) {
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
      galleryPicture: 'galleryPictures',
      galleryVideo: 'galleryVideos',
      minister: 'ministers',
    };
    return map[type] || 'galleryPictures';
  };

  const handleDelete = (item) => {
    Alert.alert(`Delete ${item.type}`, `Delete "${item.title}"?`, [
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
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    if (item.type === 'minister') {
      setForm({
        name: item.title,
        category: item.category || '',
        station: item.station || '',
        maritalStatus: item.maritalStatus || '',
        contact: item.contact || '',
      });
    } else {
      setForm({
        event: item.title,
        description: item.description || '',
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const collection = getCollectionName(editingItem.type);
    let payload = {};

    if (editingItem.type === 'minister') {
      if (!form.name?.trim()) return Alert.alert('Error', 'Name is required');
      payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        station: form.station.trim(),
        maritalStatus: form.maritalStatus.trim(),
        contact: form.contact.trim(),
      };
    } else {
      if (!form.event?.trim())
        return Alert.alert('Error', 'Event title is required');
      payload = {
        event: form.event.trim(),
        description: form.description.trim(),
      };
    }

    try {
      await apiClient.put(`${collection}/${editingItem.id}`, payload);
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                title: editingItem.type === 'minister' ? form.name : form.event,
                ...payload,
              }
            : i
        )
      );
      setModalVisible(false);
      Alert.alert('Success', 'Updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const getTypeColor = (type) => {
    return type === 'galleryPicture'
      ? '#EC4899'
      : type === 'galleryVideo'
      ? '#F97316'
      : '#6366F1';
  };

  const getTypeIcon = (type) => {
    if (type === 'galleryPicture') return <ImageIcon size={20} color="#fff" />;
    if (type === 'galleryVideo') return <Video size={20} color="#fff" />;
    return <User size={20} color="#fff" />;
  };

  const getTypeLabel = (type) => {
    if (type === 'galleryPicture') return 'Photo';
    if (type === 'galleryVideo') return 'Video';
    return 'Minister';
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
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
      <TopNavigation title="Gallery & Ministers Admin" showBackButton />

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

                {item.url && (
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: '100%',
                      height: 180,
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                    resizeMode="cover"
                  />
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

                  {item.description && (
                    <Text
                      style={{ marginTop: 10, color: colors.textSecondary }}
                    >
                      {item.description}
                    </Text>
                  )}

                  {item.type === 'minister' && (
                    <View style={{ marginTop: 10 }}>
                      {item.category && (
                        <Text style={{ color: '#666' }}>
                          {item.category} • {item.station}
                        </Text>
                      )}
                      {item.contact && (
                        <Text style={{ color: colors.primary, marginTop: 4 }}>
                          {item.contact}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    padding: 16,
                    paddingTop: 0,
                    gap: 24,
                  }}
                >
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Edit2 size={22} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Trash2 size={22} color="#e74c3c" />
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
              maxHeight: '85%',
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
                Edit {editingItem?.type === 'minister' ? 'Minister' : 'Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {editingItem?.type === 'minister' ? (
                <>
                  <TextInput
                    placeholder="Name *"
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                    style={inputStyle(colors)}
                  />
                  <TextInput
                    placeholder="Category"
                    value={form.category}
                    onChangeText={(t) => setForm({ ...form, category: t })}
                    style={inputStyle(colors)}
                  />
                  <TextInput
                    placeholder="Station"
                    value={form.station}
                    onChangeText={(t) => setForm({ ...form, station: t })}
                    style={inputStyle(colors)}
                  />
                  <TextInput
                    placeholder="Marital Status"
                    value={form.maritalStatus}
                    onChangeText={(t) => setForm({ ...form, maritalStatus: t })}
                    style={inputStyle(colors)}
                  />
                  <TextInput
                    placeholder="Contact"
                    value={form.contact}
                    onChangeText={(t) => setForm({ ...form, contact: t })}
                    style={inputStyle(colors)}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    placeholder="Event Title *"
                    value={form.event}
                    onChangeText={(t) => setForm({ ...form, event: t })}
                    style={inputStyle(colors)}
                  />
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
                </>
              )}
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
                  backgroundColor: '#ddd',
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text>Cancel</Text>
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
                <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
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
});
