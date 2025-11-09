// UploadScreen.tsx (updated - sermon categories added)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react-native';
import { LanguageSwitcher } from '../../../../../components/LanguageSwitcher';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../../../contexts/AuthContext';
import { apiClient } from '../../../../../utils/api';

const SERMON_CATEGORIES = [
  'Weekly Sermon Volume 1',
  'Weekly Sermon Volume 2',
  "God's Kingdom Advocate Volume 1",
  "God's Kingdom Advocate Volume 2",
  "God's Kingdom Advocate Volume 3",
  'Abridged Bible Subjects',
];

export default function UploadScreen() {
  const { type } = useLocalSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [songCategories, setSongCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const FILE_SIZE_LIMITS = { audio: 50, video: 100 };

  useEffect(() => {
    if (type === 'song') {
      fetchSongCategories();
    }
  }, [type]);

  const fetchSongCategories = async () => {
    try {
      const res = await apiClient.get('songs');
      const categories = new Set();
      // Backend now returns { songs: [...], pagination: {...} }
      const songs = res.data.songs || res.data || [];
      songs.forEach((song) => {
        if (song.category?.trim()) categories.add(song.category.trim());
      });
      setSongCategories(Array.from(categories).sort());
    } catch (err) {
      console.error('Failed to load categories:', err);
      Alert.alert('Error', 'Failed to load song categories');
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickAudio = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      await uploadFile(
        field,
        file.uri,
        file.name,
        file.mimeType,
        FILE_SIZE_LIMITS.audio
      );
    } catch (error) {
      console.error('Audio picker error:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      await uploadFile(
        'videoUrl',
        file.uri,
        file.name,
        file.mimeType,
        FILE_SIZE_LIMITS.video
      );
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video file');
    }
  };

  const uploadFile = async (field, uri, fileName, mimeType, maxSizeMB) => {
    setUploadProgress((prev) => ({ ...prev, [field]: 'uploading' }));
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      if (blob.size > maxSizeMB * 1024 * 1024) {
        Alert.alert('File Too Large', `File must be less than ${maxSizeMB}MB`);
        setUploadProgress((prev) => ({ ...prev, [field]: 'error' }));
        return;
      }
      let folder =
        type === 'song'
          ? 'songs'
          : type === 'sermonAudio'
          ? 'sermons'
          : 'videos';
      const destinationPath = `${folder}/${Date.now()}_${fileName}`;
      const uploadResponse = await apiClient.upload(
        { uri, name: fileName, type: mimeType },
        destinationPath
      );
      updateField(field, uploadResponse.data.url);
      setUploadProgress((prev) => ({ ...prev, [field]: 'success' }));
      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress((prev) => ({ ...prev, [field]: 'error' }));
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || error.message || 'Upload failed.'
      );
    }
  };

  const addCategory = () => {
    const categoryName = newCategory.trim();
    if (!categoryName) {
      Alert.alert('Invalid Category', 'Category name cannot be empty');
      return;
    }
    if (songCategories.includes(categoryName)) {
      Alert.alert('Category Exists', 'This category already exists');
      return;
    }
    setSongCategories((prev) => [...prev, categoryName].sort());
    updateField('category', categoryName);
    setNewCategory('');
    setShowAddCategory(false);
  };

  const validateForm = () => {
    if (type === 'notice')
      return formData.title?.trim() && formData.message?.trim();
    if (type === 'video') return formData.title?.trim() && formData.videoUrl;
    if (type === 'song')
      return formData.title?.trim() && formData.audioUrl && formData.category;
    if (type === 'sermon')
      return (
        formData.title?.trim() && formData.content?.trim() && formData.category
      );
    if (type === 'sermonAudio')
      return (
        formData.title?.trim() && formData.date?.trim() && formData.audioUrl
      );
    if (type === 'quiz') return formData.title?.trim();
    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }
    setIsUploading(true);
    try {
      const payload = {
        title: formData.title?.trim() || '',
        category: formData.category || '',
        content: formData.content?.trim() || '',
        date: formData.date || '',
        audioUrl: formData.audioUrl || '',
        videoUrl: formData.videoUrl || '',
        message: formData.message?.trim() || '',
        uploadedBy: user?.email || 'admin',
      };
      let collectionName;
      if (type === 'song') collectionName = 'songs';
      else if (type === 'sermon' || type === 'sermonAudio')
        collectionName = 'sermons';
      else collectionName = `${type}s`;

      const response = await apiClient.post(collectionName, payload);
      const sermonId = response.data.id;

      // Auto-generate TTS for text sermons
      if (type === 'sermon' && formData.content?.trim()) {
        Alert.alert(
          'Sermon Uploaded',
          'Sermon uploaded successfully! Generating audio in background...',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Trigger audio generation in background (don't wait)
                apiClient
                  .generateSermonAudio(sermonId, 'en-US', 'en-US-Neural2-F')
                  .then(() => console.log('TTS generated for sermon', sermonId))
                  .catch((err) => console.error('TTS generation failed:', err));
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Success',
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } uploaded successfully!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Failed to upload.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getUploadStatusUI = (field) => {
    const status = uploadProgress[field];
    if (!status) return null;
    const config = {
      uploading: { text: 'Uploading...', color: '#F59E0B' },
      success: { text: 'Uploaded Success', color: '#10B981' },
      error: { text: 'Upload Failed', color: '#EF4444' },
    }[status];
    return config ? (
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.text}
      </Text>
    ) : null;
  };

  const renderFormFields = () => {
    if (type === 'sermon') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            {SERMON_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipActive,
                ]}
                onPress={() => updateField('category', category)}
                disabled={isUploading}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Input
            label="Sermon Content *"
            value={formData.content || ''}
            onChangeText={(value) => updateField('content', value)}
            multiline
            numberOfLines={8}
            placeholder="Enter sermon content..."
            style={styles.textArea}
            editable={!isUploading}
          />
        </View>
      );
    }

    if (type === 'sermonAudio') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={formData.date || ''}
            onChangeText={(value) => updateField('date', value)}
            style={styles.dateInput}
            editable={!isUploading}
          />
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.audio}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabled]}
            onPress={() => pickAudio('audioUrl')}
            disabled={isUploading}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Audio File *</Text>
          </TouchableOpacity>
          {getUploadStatusUI('audioUrl')}
        </View>
      );
    }

    if (type === 'song') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            {songCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipActive,
                ]}
                onPress={() => updateField('category', category)}
                disabled={isUploading}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => setShowAddCategory(true)}
              disabled={isUploading}
            >
              <Plus size={16} color="#1E3A8A" />
              <Text style={styles.addCategoryText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
          {showAddCategory && (
            <View style={styles.addCategoryRow}>
              <TextInput
                placeholder="Enter new category name"
                value={newCategory}
                onChangeText={setNewCategory}
                style={styles.categoryInput}
                autoFocus
                editable={!isUploading}
              />
              <TouchableOpacity
                onPress={addCategory}
                style={styles.categoryAddButton}
                disabled={isUploading}
              >
                <Text style={styles.categoryAddButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
                disabled={isUploading}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.audio}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabled]}
            onPress={() => pickAudio('audioUrl')}
            disabled={isUploading}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Audio File *</Text>
          </TouchableOpacity>
          {getUploadStatusUI('audioUrl')}
        </View>
      );
    }

    if (type === 'video') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.video}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabled]}
            onPress={pickVideo}
            disabled={isUploading}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Video File *</Text>
          </TouchableOpacity>
          {getUploadStatusUI('videoUrl')}
        </View>
      );
    }

    if (type === 'notice') {
      return (
        <View style={styles.fieldBlock}>
          <Input
            label="Message *"
            value={formData.message || ''}
            onChangeText={(value) => updateField('message', value)}
            multiline
            numberOfLines={4}
            placeholder="Enter notice message..."
            editable={!isUploading}
          />
        </View>
      );
    }

    if (type === 'quiz') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.infoText}>
            Quiz content is handled separately
          </Text>
        </View>
      );
    }

    return null;
  };

  const getPageTitle = () => {
    const titles = {
      notice: 'Add Notice',
      sermon: 'Add Text Sermon',
      sermonAudio: 'Upload Sermon Audio',
      song: 'Upload Song',
      video: 'Upload Animation Video',
      quiz: 'Add Quiz Resource',
    };
    return titles[type] || 'Upload';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isUploading}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getPageTitle()}</Text>
        <LanguageSwitcher />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Title *"
          value={formData.title || ''}
          onChangeText={(value) => updateField('title', value)}
          placeholder="Enter title"
          editable={!isUploading}
        />
        {renderFormFields()}
        {isUploading && (
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="small" color="#1E3A8A" />
            <Text style={styles.uploadingText}>Uploading content...</Text>
          </View>
        )}
        <Button
          title={isUploading ? 'Uploading...' : `Upload ${type}`}
          onPress={handleSubmit}
          disabled={isUploading || !validateForm()}
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  categoryScroll: { maxHeight: 60, marginBottom: 16 },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: { backgroundColor: '#EBF4FF', borderColor: '#1E3A8A' },
  categoryChipText: { fontSize: 14, color: '#6B7280' },
  categoryChipTextActive: { color: '#1E3A8A', fontWeight: '600' },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  addCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  categoryAddButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryAddButtonText: { color: '#FFF', fontWeight: '600' },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  textArea: { textAlignVertical: 'top', height: 180 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    borderWidth: 2,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
  },
  disabled: { opacity: 0.6 },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  fieldBlock: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  uploadingText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
  submitButton: { marginVertical: 20 },
});
