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
import { X, CheckCircle, User } from 'lucide-react-native';

export default function UploadMinisters() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [dateDevoted, setDateDevoted] = useState('');
  const [contact, setContact] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: 'image/*',
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      setFile(res.assets[0]);
    }
  };

  const compressImage = async (uri) => {
    try {
      return await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Standard size for profile pics
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
    } catch (err) {
      return { uri };
    }
  };

  const handleUpload = async () => {
    if (!name.trim() || !category.trim() || !file) {
      return Alert.alert('Error', 'Name, Category, and Picture are required');
    }

    setIsUploading(true);
    try {
      // 1. Compress Image
      const compressed = await compressImage(file.uri);

      // 2. Get Firebase Signed URL
      const configRes = await apiClient.getUploadConfig(
        'galleryMinisters',
        file.name,
        'image/jpeg',
      );
      const { uploadUrl, fileUrl } = configRes.data;

      // 3. Upload to Firebase Storage
      const response = await fetch(compressed.uri);
      const blob = await response.blob();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'image/jpeg');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () =>
          xhr.status === 200 || xhr.status === 201 ? resolve() : reject();
        xhr.onerror = () => reject();
        xhr.send(blob);
      });

      // 4. Save Metadata to Backend
      await apiClient.post('gallery/upload', {
        type: 'minister',
        name: name.trim(),
        category: category.trim(),
        dateDevoted: dateDevoted.trim(),
        contact: contact.trim(),
        url: fileUrl,
      });

      Alert.alert('Success', 'Minister profile created successfully!');
      setName('');
      setCategory('');
      setDateDevoted('');
      setContact('');
      setFile(null);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'Failed to save minister data. Check server routes.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} title="Add Minister" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Minister's Name"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category / Title *</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Senior Minister, Intermediate Minister"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date Devoted</Text>
          <TextInput
            value={dateDevoted}
            onChangeText={setDateDevoted}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="Phone number"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={pickFile} style={styles.imagePicker}>
          {file ? (
            <View style={styles.previewCont}>
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => setFile(null)}
                style={styles.removeBtn}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <User size={40} color="#999" />
              <Text style={{ color: '#999', marginTop: 8 }}>
                Select Profile Picture
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.progressCont}>
            <View
              style={[styles.progressBar, { width: `${uploadProgress}%` }]}
            />
            <Text style={styles.progressText}>
              {uploadProgress}% Uploading...
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploading}
          style={[styles.saveBtn, isUploading && styles.disabled]}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Minister Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontWeight: 'bold', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  imagePicker: {
    height: 150,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  previewCont: { flex: 1 },
  previewImage: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 15,
  },
  progressCont: {
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disabled: { backgroundColor: '#aaa' },
});
