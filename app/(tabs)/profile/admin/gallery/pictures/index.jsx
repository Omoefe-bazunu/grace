import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';
import { X, CheckCircle } from 'lucide-react-native';

const ProgressBar = ({ progress, status }) => {
  if (status === 'idle') return null;
  const color =
    status === 'success'
      ? '#10B981'
      : status === 'error'
        ? '#EF4444'
        : '#007AFF';
  return (
    <View style={styles.progressBg}>
      <View
        style={[
          styles.progressFill,
          { width: `${progress}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
};

export default function UploadGalleryPictures() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const pickFiles = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: 'image/*',
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      const newFiles = res.assets.map((a) => ({
        ...a,
        status: 'idle',
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const compressImage = async (uri) => {
    try {
      return await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
    } catch (err) {
      return { uri };
    }
  };

  const uploadSingleFile = async (file, index) => {
    try {
      setFiles((prev) => {
        const copy = [...prev];
        copy[index].status = 'uploading';
        return copy;
      });

      const compressed = await compressImage(file.uri);

      // 1. Get Firebase Signed URL from backend
      const configRes = await apiClient.getUploadConfig(
        'galleryPictures',
        file.name,
        'image/jpeg',
      );
      const { uploadUrl, fileUrl } = configRes.data;

      // 2. Upload to Firebase Storage
      const response = await fetch(compressed.uri);
      const blob = await response.blob();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'image/jpeg');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) => {
              const copy = [...prev];
              copy[index].progress = percent;
              return copy;
            });
          }
        };
        xhr.onload = () =>
          xhr.status === 200 || xhr.status === 201 ? resolve() : reject();
        xhr.onerror = () => reject();
        xhr.send(blob);
      });

      setFiles((prev) => {
        const copy = [...prev];
        copy[index].status = 'success';
        copy[index].progress = 100;
        copy[index].url = fileUrl;
        return copy;
      });

      return fileUrl;
    } catch (error) {
      setFiles((prev) => {
        const copy = [...prev];
        copy[index].status = 'error';
        return copy;
      });
      throw error;
    }
  };

  const handleUploadAll = async () => {
    if (!title.trim() || files.length === 0)
      return Alert.alert('Error', 'Fields required');
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        if (file.status === 'success') return file.url;
        return await uploadSingleFile(file, index);
      });
      const uploadedUrls = await Promise.all(uploadPromises);

      const savePromises = uploadedUrls.map((url) =>
        apiClient.post('gallery/upload', {
          type: 'picture',
          event: title.trim(),
          description: desc.trim(),
          url: url,
          category: 'General',
          date: new Date().toISOString().split('T')[0],
        }),
      );
      await Promise.all(savePromises);
      Alert.alert('Success', 'Gallery updated!');
      setFiles([]);
      setTitle('');
      setDesc('');
    } catch (e) {
      Alert.alert('Error', 'Failed to register media in database.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} title="Upload Pictures" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Youth Assembly"
            style={styles.input}
            editable={!isUploading}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            editable={!isUploading}
          />
        </View>
        <TouchableOpacity
          onPress={pickFiles}
          disabled={isUploading}
          style={styles.pickButton}
        >
          <Text style={styles.buttonText}>Pick Images – {files.length}/10</Text>
        </TouchableOpacity>
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileCard}>
              <View style={styles.fileRow}>
                <Image source={{ uri: file.uri }} style={styles.preview} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>{file.name}</Text>
                  <ProgressBar progress={file.progress} status={file.status} />
                </View>
                {file.status !== 'uploading' && (
                  <TouchableOpacity
                    onPress={() =>
                      setFiles((f) => f.filter((_, i) => i !== index))
                    }
                  >
                    <X size={20} color="#999" />
                  </TouchableOpacity>
                )}
                {file.status === 'success' && (
                  <CheckCircle size={20} color="#10B981" />
                )}
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity
          onPress={handleUploadAll}
          disabled={isUploading || !title || files.length === 0}
          style={[
            styles.uploadButton,
            (isUploading || !title || files.length === 0) && styles.disabled,
          ]}
        >
          {isUploading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>
            {isUploading ? 'Processing...' : 'Upload All'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, gap: 16 },
  inputGroup: { marginBottom: 8 },
  label: { fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  textArea: { textAlignVertical: 'top', height: 100 },
  pickButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  disabled: { backgroundColor: '#aaa' },
  fileCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preview: { width: 40, height: 40, borderRadius: 4 },
  progressBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  fileList: { gap: 12 },
});
