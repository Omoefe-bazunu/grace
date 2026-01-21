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
  Modal,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { LanguageSwitcher } from '../../../../../components/LanguageSwitcher';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../../../contexts/AuthContext';
import { apiClient } from '../../../../../utils/api';

let VideoCompressor;
try {
  VideoCompressor = require('react-native-compressor').Video;
} catch (e) {
  console.log('Video Compressor not available');
}

const { width } = Dimensions.get('window');

const SERMON_CATEGORIES = [
  'Weekly Sermon Volume 1',
  'Weekly Sermon Volume 2',
  "God's Kingdom Advocate Volume 1",
  "God's Kingdom Advocate Volume 2",
  "God's Kingdom Advocate Volume 3",
  'Abridged Bible Subjects',
  "GKS President's Feast Message",
  "GKS President's Freedom Day Message",
  "GKS President's Youth Assembly Message",
  'Sermon Summaries',
  'Questions and Answers',
];

const ProgressBar = ({ progress, status }) => {
  if (status === 'idle') return null;
  let barColor =
    status === 'success'
      ? '#10B981'
      : status === 'error'
        ? '#EF4444'
        : status === 'compressing'
          ? '#F59E0B'
          : '#1E3A8A';

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {status === 'success'
            ? 'Upload Complete'
            : status === 'error'
              ? 'Upload Failed'
              : status === 'compressing'
                ? 'Compressing Video...'
                : `Uploading... ${progress}%`}
        </Text>
        {status === 'success' && <CheckCircle size={16} color="#10B981" />}
        {status === 'error' && <AlertCircle size={16} color="#EF4444" />}
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: status === 'compressing' ? '100%' : `${progress}%`,
              backgroundColor: barColor,
              opacity: status === 'compressing' ? 0.5 : 1,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default function UploadScreen() {
  const { type } = useLocalSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [songCategories, setSongCategories] = useState([]);
  const [sermonVideoCategories, setSermonVideoCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const FILE_SIZE_LIMITS = { audio: 50, video: 100 };

  useEffect(() => {
    if (type === 'song') fetchSongCategories();
    else if (type === 'sermonVideo') fetchSermonVideoCategories();
  }, [type]);

  const fetchSongCategories = async () => {
    try {
      const res = await apiClient.get('songs');
      const categories = new Set();
      const items = res.data.songs || [];
      items.forEach((s) => s.category && categories.add(s.category.trim()));
      setSongCategories(Array.from(categories).sort());
    } catch (err) {
      console.log('Category load error', err);
    }
  };

  const fetchSermonVideoCategories = async () => {
    try {
      const res = await apiClient.get('sermonVideos');
      const categories = new Set();
      const items = res.data.sermonVideos || [];
      items.forEach((v) => v.category && categories.add(v.category.trim()));
      setSermonVideoCategories(Array.from(categories).sort());
    } catch (err) {
      console.log('Category load error', err);
    }
  };

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const pickAudio = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
      });
      if (result.canceled) return;
      const file = result.assets[0];
      await uploadFile(
        field,
        file.uri,
        file.name,
        file.mimeType,
        FILE_SIZE_LIMITS.audio,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const pickVideo = async (field = 'videoUrl') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'compressing', progress: 0 },
      }));

      let finalUri = file.uri;
      if (VideoCompressor) {
        finalUri = await VideoCompressor.compress(file.uri, {
          compressionMethod: 'auto',
        });
      }

      const finalName = file.name.replace(/\.[^/.]+$/, '') + '.mp4';
      await uploadFile(
        field,
        finalUri,
        finalName,
        'video/mp4',
        FILE_SIZE_LIMITS.video,
      );
    } catch (error) {
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'error', progress: 0 },
      }));
      Alert.alert('Error', 'Failed to pick video file');
    }
  };

  const uploadFile = async (field, uri, fileName, mimeType, maxSizeMB) => {
    setUploadProgress((prev) => ({
      ...prev,
      [field]: { status: 'uploading', progress: 0 },
    }));

    try {
      let folderName = 'assets';
      if (type === 'sermon' || type === 'sermonAudio') folderName = 'sermons';
      else if (type === 'song') folderName = 'songs';
      else if (type === 'video') folderName = 'videos';
      else if (type === 'sermonVideo') folderName = 'sermonVideos';
      else if (type === 'dailyDevotional') folderName = 'devotionals';

      // 1. Get Firebase Signed URL
      const configRes = await apiClient.getUploadConfig(
        folderName,
        fileName,
        mimeType,
      );
      const { uploadUrl, fileUrl } = configRes.data;

      // 2. Prepare Blob
      const fileResp = await fetch(uri);
      const blob = await fileResp.blob();

      if (blob.size > maxSizeMB * 1024 * 1024) {
        Alert.alert('File Too Large', `File must be less than ${maxSizeMB}MB`);
        setUploadProgress((prev) => ({
          ...prev,
          [field]: { status: 'error', progress: 0 },
        }));
        return;
      }

      // 3. Direct PUT Upload to Firebase
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', mimeType);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({
              ...prev,
              [field]: { status: 'uploading', progress: percent },
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            updateField(field, fileUrl);
            setUploadProgress((prev) => ({
              ...prev,
              [field]: { status: 'success', progress: 100 },
            }));
            resolve(fileUrl);
          } else {
            setUploadProgress((prev) => ({
              ...prev,
              [field]: { status: 'error', progress: 0 },
            }));
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => {
          setUploadProgress((prev) => ({
            ...prev,
            [field]: { status: 'error', progress: 0 },
          }));
          reject(new Error('Network error'));
        };

        xhr.send(blob);
      });
    } catch (error) {
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'error', progress: 0 },
      }));
      Alert.alert('Upload Error', 'Could not start upload process.');
    }
  };

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    if (type === 'song') setSongCategories((prev) => [...prev, name].sort());
    else if (type === 'sermonVideo')
      setSermonVideoCategories((prev) => [...prev, name].sort());
    updateField('category', name);
    setNewCategory('');
    setShowAddCategory(false);
  };

  const validateForm = () => {
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
    if (type === 'sermonVideo')
      return (
        formData.title?.trim() &&
        formData.date?.trim() &&
        formData.videoUrl &&
        formData.category
      );
    if (type === 'dailyDevotional')
      return (
        formData.title?.trim() &&
        formData.date?.trim() &&
        formData.mainText?.trim()
      );
    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm())
      return Alert.alert('Validation Error', 'Please fill all required fields');
    setIsSubmitting(true);

    try {
      const payload = { ...formData, uploadedBy: user?.email || 'admin' };
      const collectionMap = {
        song: 'songs',
        sermon: 'sermons',
        sermonAudio: 'sermons',
        sermonVideo: 'sermons',
        dailyDevotional: 'devotionals',
        video: 'animations',
      };

      const response = await apiClient.post(
        collectionMap[type] || `${type}s`,
        payload,
      );

      if (type === 'sermon' && formData.content?.trim()) {
        apiClient.generateSermonAudio(
          response.data.id,
          'en-US',
          'en-US-Neural2-F',
        );
      }

      Alert.alert('Success', 'Uploaded successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Failed to save to database.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    if (type === 'sermon')
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            {SERMON_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.categoryChip,
                  formData.category === c && styles.categoryChipActive,
                ]}
                onPress={() => updateField('category', c)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === c && styles.categoryChipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Input
            label="Sermon Content *"
            value={formData.content || ''}
            onChangeText={(v) => updateField('content', v)}
            multiline
            numberOfLines={8}
            style={styles.textArea}
            editable={!isSubmitting}
          />
        </View>
      );

    if (type === 'sermonAudio' || type === 'song')
      return (
        <View style={styles.fieldBlock}>
          {type === 'song' && (
            <>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal style={styles.categoryScroll}>
                {songCategories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.categoryChip,
                      formData.category === c && styles.categoryChipActive,
                    ]}
                    onPress={() => updateField('category', c)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === c &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => setShowAddCategory(true)}
                  disabled={isSubmitting}
                >
                  <Plus size={16} color="#1E3A8A" />
                  <Text style={styles.addCategoryText}>Add</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
          {type === 'sermonAudio' && (
            <TextInput
              placeholder="YYYY-MM-DD"
              value={formData.date || ''}
              onChangeText={(v) => updateField('date', v)}
              style={styles.dateInput}
            />
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickAudio('audioUrl')}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Audio File *</Text>
          </TouchableOpacity>
          <ProgressBar
            {...(uploadProgress['audioUrl'] || { status: 'idle', progress: 0 })}
          />
        </View>
      );

    if (type === 'sermonVideo' || type === 'video')
      return (
        <View style={styles.fieldBlock}>
          {type === 'sermonVideo' && (
            <>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                style={styles.categoryScroll}
                showsHorizontalScrollIndicator={false}
              >
                {sermonVideoCategories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.categoryChip,
                      formData.category === c && styles.categoryChipActive,
                    ]}
                    onPress={() => updateField('category', c)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === c &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => setShowAddCategory(true)}
                  disabled={isSubmitting}
                >
                  <Plus size={16} color="#1E3A8A" />
                  <Text style={styles.addCategoryText}>Add</Text>
                </TouchableOpacity>
              </ScrollView>

              <Text style={styles.label}>Date *</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formData.date || ''}
                onChangeText={(v) => updateField('date', v)}
                style={styles.dateInput}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickVideo('videoUrl')}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Video File *</Text>
          </TouchableOpacity>
          <ProgressBar
            {...(uploadProgress['videoUrl'] || { status: 'idle', progress: 0 })}
          />
        </View>
      );

    if (type === 'dailyDevotional')
      return (
        <View style={styles.fieldBlock}>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={formData.date || ''}
            onChangeText={(v) => updateField('date', v)}
            style={styles.dateInput}
          />
          <Input
            label="Main Text *"
            value={formData.mainText || ''}
            onChangeText={(v) => updateField('mainText', v)}
            multiline
            numberOfLines={6}
            style={styles.textArea}
          />
        </View>
      );

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal transparent visible={isSubmitting} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingTitle}>Processing...</Text>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload {type}</Text>
        <LanguageSwitcher />
      </View>
      <ScrollView style={styles.content}>
        <Input
          label="Title *"
          value={formData.title || ''}
          onChangeText={(v) => updateField('title', v)}
          placeholder="Enter title"
          editable={!isSubmitting}
        />
        {renderFormFields()}
        {showAddCategory && (
          <View style={styles.addCategoryRow}>
            <TextInput
              value={newCategory}
              onChangeText={setNewCategory}
              style={styles.categoryInput}
              autoFocus
            />
            <TouchableOpacity
              onPress={addCategory}
              style={styles.categoryAddButton}
            >
              <Text style={{ color: '#FFF' }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddCategory(false)}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <Button
          title={`Upload ${type}`}
          onPress={handleSubmit}
          disabled={isSubmitting || !validateForm()}
          size="large"
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
    backgroundColor: '#FFF',
  },
  categoryAddButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
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
    marginBottom: 12,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  fieldBlock: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  progressContainer: { marginTop: 8, width: '100%' },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    width: width * 0.8,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingTitle: { marginTop: 16, fontSize: 18, fontWeight: 'bold' },
});
