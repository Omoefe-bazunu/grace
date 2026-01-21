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

// Optional: Import Video Compressor if available in your environment
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

export default function UploadVideos() {
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

  const compressVideoFile = async (uri) => {
    if (!VideoCompressor) return uri;
    try {
      return await VideoCompressor.compress(uri, { compressionMethod: 'auto' });
    } catch (err) {
      return uri;
    }
  };

  const uploadSingleFile = async (file, index) => {
    try {
      setFiles((prev) => {
        const c = [...prev];
        c[index].status = 'uploading';
        return c;
      });

      const finalUri = await compressVideoFile(file.uri);

      // 1. Get Firebase Signed URL from backend
      const configRes = await apiClient.getUploadConfig(
        'archiveVideos',
        file.name,
        'video/mp4',
      );
      const { uploadUrl, fileUrl } = configRes.data;

      // 2. Upload to Firebase Storage using PUT
      const response = await fetch(finalUri);
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

      // 3. Save Metadata to Dedicated Archive Endpoint
      const savePromises = uploadedUrls.map((url) =>
        apiClient.post('archive/upload', {
          type: 'video',
          event: title.trim(),
          description: desc.trim().slice(0, 200),
          url: url,
          date: new Date().toISOString().split('T')[0],
        }),
      );

      await Promise.all(savePromises);
      Alert.alert('Success', 'Archive updated with videos!');
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
      <TopNavigation showBackButton={true} title="Upload Archive Video" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Highlights 2025"
            style={styles.input}
            editable={!isUploading}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Description..."
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
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileCard}>
              <View style={styles.fileRow}>
                <VideoIcon size={30} color="#666" />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.fileName}>
                    {file.name}
                  </Text>
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
  fileName: { fontSize: 14 },
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
