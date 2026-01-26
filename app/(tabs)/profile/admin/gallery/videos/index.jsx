import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';
import { X, Video as VideoIcon, CheckCircle } from 'lucide-react-native';

let VideoCompressor;
try {
  VideoCompressor = require('react-native-compressor').Video;
} catch (e) {
  console.log('Video Compressor not available');
}

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

export default function UploadGalleryVideos() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const pickFiles = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: 'video/*',
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      const newFiles = res.assets.map((a) => ({
        ...a,
        status: 'idle',
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const uploadSingleFile = async (file, index) => {
    try {
      setFiles((prev) => {
        const c = [...prev];
        c[index].status = 'uploading';
        return c;
      });

      // 1. Get Firebase Signed URL from backend [cite: 534]
      const configRes = await apiClient.getUploadConfig(
        'galleryVideos',
        file.name,
        'video/mp4',
      );
      const { uploadUrl, fileUrl } = configRes.data;

      // 2. Upload to Firebase Storage using PUT
      const response = await fetch(file.uri);
      const blob = await response.blob();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'video/mp4');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) => {
              const c = [...prev];
              c[index].progress = percent;
              return c;
            });
          }
        };
        xhr.onload = () =>
          xhr.status === 200 || xhr.status === 201 ? resolve() : reject();
        xhr.onerror = () => reject();
        xhr.send(blob);
      });

      setFiles((prev) => {
        const c = [...prev];
        c[index].status = 'success';
        c[index].progress = 100;
        c[index].url = fileUrl;
        return c;
      });

      return fileUrl;
    } catch (error) {
      setFiles((prev) => {
        const c = [...prev];
        c[index].status = 'error';
        return c;
      });
      throw error;
    }
  };

  const handleUploadAll = async () => {
    if (!title.trim() || files.length === 0)
      return Alert.alert('Required', 'Title and video needed');
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        if (file.status === 'success') return file.url;
        return await uploadSingleFile(file, index);
      });
      const uploadedUrls = await Promise.all(uploadPromises);

      // 3. Save Metadata to Dedicated Gallery Endpoint [cite: 530]
      const savePromises = uploadedUrls.map((url) =>
        apiClient.post('gallery/upload', {
          type: 'video',
          event: title.trim(),
          description: desc.trim().slice(0, 200),
          url: url,
          category: 'General',
          date: new Date().toISOString().split('T')[0],
        }),
      );

      await Promise.all(savePromises);
      Alert.alert('Success', 'Gallery updated with videos!');
      setTitle('');
      setDesc('');
      setFiles([]);
    } catch (e) {
      Alert.alert('Error', 'Failed to register videos in database.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} title="Upload Videos" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Service Highlights"
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
          <Text style={styles.buttonText}>Pick Videos – {files.length}/5</Text>
        </TouchableOpacity>
        <View style={{ gap: 12 }}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileCard}>
              <View style={styles.fileRow}>
                <VideoIcon size={30} color="#666" />
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
            {isUploading ? 'Processing...' : 'Upload All Videos'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontWeight: 'bold' },
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
  progressBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
});
