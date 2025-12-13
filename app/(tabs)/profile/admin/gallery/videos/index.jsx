import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';
import { X, Video as VideoIcon, CheckCircle } from 'lucide-react-native';

// ✅ SAFE IMPORT: This prevents the crash in Expo Go
let VideoCompressor;
try {
  // We use 'require' instead of 'import' so it doesn't crash if missing
  VideoCompressor = require('react-native-compressor').Video;
} catch (e) {
  console.log('Video Compressor not available (running in Expo Go?)');
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
    <View
      style={{
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: color,
        }}
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

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ UPDATED COMPRESSION HELPER
  const compressVideoFile = async (uri) => {
    // Safety Check: If the library didn't load (Expo Go), skip compression
    if (!VideoCompressor) {
      console.log('Skipping compression (Library not loaded)');
      return uri;
    }

    try {
      const result = await VideoCompressor.compress(uri, {
        compressionMethod: 'auto',
      });
      return result;
    } catch (err) {
      console.log('Video compression failed, using original', err);
      return uri; // Fallback to original
    }
  };

  const uploadSingleFile = async (file, index) => {
    try {
      setFiles((prev) => {
        const c = [...prev];
        c[index].status = 'uploading';
        return c;
      });

      // 1. Compress (or skip if in Expo Go)
      const finalUri = await compressVideoFile(file.uri);

      // 2. Get Signature
      const signRes = await apiClient.get(`sign-upload?folder=galleryVideos`);
      const { signature, timestamp, cloudName, apiKey, folder } = signRes.data;

      // 3. Upload XHR
      const formData = new FormData();
      formData.append('file', {
        uri: finalUri,
        name: file.name.replace(/\.[^/.]+$/, '') + '.mp4', // Force mp4 extension
        type: 'video/mp4',
      });
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const secureUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUrl);
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
        xhr.onload = () => {
          if (xhr.status < 300)
            resolve(JSON.parse(xhr.responseText).secure_url);
          else reject(xhr.responseText);
        };
        xhr.onerror = () => reject('Network Error');
        xhr.send(formData);
      });

      setFiles((prev) => {
        const c = [...prev];
        c[index].status = 'success';
        c[index].progress = 100;
        c[index].url = secureUrl;
        return c;
      });
      return secureUrl;
    } catch (error) {
      console.error(error);
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

      // Save to Backend
      const savePromises = uploadedUrls.map((url) =>
        apiClient.post('galleryVideos', {
          event: title.trim(),
          description: desc.trim().slice(0, 200),
          url: url,
          category: 'General',
          date: new Date().toISOString().split('T')[0],
        })
      );

      await Promise.all(savePromises);
      Alert.alert('Success', 'All videos uploaded!');
      setTitle('');
      setDesc('');
      setFiles([]);
    } catch (e) {
      Alert.alert('Error', 'Some uploads failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Event Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Sunday Service Highlights"
            style={styles.input}
            editable={!isUploading}
          />
        </View>

        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Description (optional)
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Short description..."
            multiline
            numberOfLines={4}
            style={[styles.input, { textAlignVertical: 'top' }]}
            editable={!isUploading}
          />
        </View>

        <TouchableOpacity
          onPress={pickFiles}
          disabled={isUploading}
          style={styles.pickButton}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Pick Videos – {files.length}/5
          </Text>
        </TouchableOpacity>

        <View style={{ gap: 12 }}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileCard}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <VideoIcon size={30} color="#666" />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14 }}>
                    {file.name}
                  </Text>
                  {/* Show status text if compressing */}
                  {file.status === 'uploading' && file.progress === 0 && (
                    <Text style={{ fontSize: 10, color: '#F59E0B' }}>
                      {VideoCompressor ? 'Compressing...' : 'Preparing...'}
                    </Text>
                  )}
                  <ProgressBar progress={file.progress} status={file.status} />
                </View>
                {file.status !== 'uploading' && (
                  <TouchableOpacity onPress={() => removeFile(index)}>
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
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {isUploading ? 'Processing...' : 'Upload All Videos'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
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
  disabled: { backgroundColor: '#aaa' },
  fileCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
};
