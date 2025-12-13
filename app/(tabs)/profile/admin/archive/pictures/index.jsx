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
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // ✅ IMPORT THIS
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';
import { X, CheckCircle } from 'lucide-react-native';

// Simple Progress Bar Component
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

export default function UploadPictures() {
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

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ NEW: COMPRESSION HELPER
  const compressImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize width to 1080px (HD), height auto-adjusts
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% quality JPEG
      );
      return result;
    } catch (err) {
      console.log('Compression failed, using original', err);
      return { uri }; // Fallback to original if compression fails
    }
  };

  const uploadSingleFile = async (file, index) => {
    try {
      setFiles((prev) => {
        const copy = [...prev];
        copy[index].status = 'uploading';
        return copy;
      });

      // 1. ✅ COMPRESS BEFORE UPLOAD
      // This reduces file size from ~5MB to ~300KB
      const compressed = await compressImage(file.uri);

      // 2. Get Signature
      const signRes = await apiClient.get(`sign-upload?folder=archivePictures`);
      const { signature, timestamp, cloudName, apiKey, folder } = signRes.data;

      // 3. Form Data (Use COMPRESSED uri)
      const formData = new FormData();
      formData.append('file', {
        uri: compressed.uri,
        name: file.name.replace(/\.[^/.]+$/, '') + '.jpg', // Ensure .jpg extension
        type: 'image/jpeg',
      });
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      // 4. Upload XHR
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const secureUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUrl);
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
        xhr.onload = () => {
          if (xhr.status < 300)
            resolve(JSON.parse(xhr.responseText).secure_url);
          else reject(xhr.responseText);
        };
        xhr.onerror = () => reject('Network Error');
        xhr.send(formData);
      });

      // 5. Update File State
      setFiles((prev) => {
        const copy = [...prev];
        copy[index].status = 'success';
        copy[index].progress = 100;
        copy[index].url = secureUrl;
        return copy;
      });

      return secureUrl;
    } catch (error) {
      console.error(error);
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
      return Alert.alert('Required', 'Title and images needed');

    setIsUploading(true);

    try {
      // Upload images
      const uploadPromises = files.map(async (file, index) => {
        if (file.status === 'success') return file.url;
        return await uploadSingleFile(file, index);
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Save to backend
      const savePromises = uploadedUrls.map((url) =>
        apiClient.post('archivePictures', {
          event: title.trim(),
          description: desc.trim().slice(0, 200),
          url: url,
          category: 'General',
          date: new Date().toISOString().split('T')[0],
        })
      );

      await Promise.all(savePromises);

      Alert.alert('Success', 'All pictures uploaded successfully!');
      setTitle('');
      setDesc('');
      setFiles([]);
    } catch (e) {
      Alert.alert(
        'Partial Error',
        'Some files failed to upload. Check the list.'
      );
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
            placeholder="e.g. Youth Conference 2025"
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
            Pick Images – {files.length}/10
          </Text>
        </TouchableOpacity>

        {/* File List */}
        <View style={{ gap: 12 }}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileCard}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                {/* Display preview image */}
                <Image
                  source={{ uri: file.uri }}
                  style={{ width: 40, height: 40, borderRadius: 4 }}
                />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14 }}>
                    {file.name}
                  </Text>
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
            {isUploading ? 'Processing...' : 'Upload All'}
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
