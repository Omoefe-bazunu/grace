import React, { useState } from 'react';
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
import * as ImageManipulator from 'expo-image-manipulator'; // ✅ IMPORT THIS
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';

const ProgressBar = ({ progress }) => (
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
        backgroundColor: '#007AFF',
      }}
    />
  </View>
);

export default function UploadMinister() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    station: '',
    maritalStatus: '',
    contact: '',
  });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
    });
    if (!res.canceled) setFile(res.assets[0]);
  };

  // ✅ COMPRESSION HELPER
  const compressImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to 1080px width
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% quality JPEG
      );
      return result;
    } catch (err) {
      console.log('Compression failed, using original', err);
      return { uri }; // Fallback to original
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const upload = async () => {
    if (!form.name.trim() || !file) {
      return Alert.alert('Required', 'Name and photo are required');
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. ✅ COMPRESS BEFORE UPLOAD
      const compressed = await compressImage(file.uri);

      // 2. Get Signature
      const signRes = await apiClient.get(`sign-upload?folder=ministers`);
      const { signature, timestamp, cloudName, apiKey, folder } = signRes.data;

      // 3. Upload Photo (Direct)
      const formData = new FormData();
      formData.append('file', {
        uri: compressed.uri, // Use compressed URI
        name: file.name.replace(/\.[^/.]+$/, '') + '.jpg', // Ensure .jpg extension
        type: 'image/jpeg', // Force jpeg type
      });
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const imageUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
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

      // 4. Save Minister Data
      await apiClient.post('ministers', {
        name: form.name.trim(),
        category: form.category.trim(),
        station: form.station.trim(),
        maritalStatus: form.maritalStatus.trim(),
        contact: form.contact.trim(),
        imageUrl: imageUrl, // Save the cloud URL
      });

      Alert.alert('Success', 'Minister added successfully!');
      setForm({
        name: '',
        category: '',
        station: '',
        maritalStatus: '',
        contact: '',
      });
      setFile(null);
      setUploadProgress(0);
    } catch (e) {
      Alert.alert('Upload Failed', e.message || 'Please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Name *</Text>
          <TextInput
            value={form.name}
            onChangeText={(t) => handleChange('name', t)}
            placeholder="Full name"
            style={styles.input}
            editable={!uploading}
          />
        </View>

        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Category</Text>
          <TextInput
            value={form.category}
            onChangeText={(t) => handleChange('category', t)}
            placeholder="e.g. Pastor, Deacon, Evangelist"
            style={styles.input}
            editable={!uploading}
          />
        </View>

        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Station</Text>
          <TextInput
            value={form.station}
            onChangeText={(t) => handleChange('station', t)}
            placeholder="e.g. Warri, Lagos, Abuja"
            style={styles.input}
            editable={!uploading}
          />
        </View>

        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Marital Status
          </Text>
          <TextInput
            value={form.maritalStatus}
            onChangeText={(t) => handleChange('maritalStatus', t)}
            placeholder="e.g. Married, Single"
            style={styles.input}
            editable={!uploading}
          />
        </View>

        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Contact (Phone/Email)
          </Text>
          <TextInput
            value={form.contact}
            onChangeText={(t) => handleChange('contact', t)}
            placeholder="Optional"
            style={styles.input}
            editable={!uploading}
          />
        </View>

        <TouchableOpacity
          onPress={pickPhoto}
          disabled={uploading}
          style={styles.pickButton}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {file ? `Photo Selected: ${file.name}` : 'Pick Photo *'}
          </Text>
        </TouchableOpacity>

        {uploading && uploadProgress > 0 && (
          <ProgressBar progress={uploadProgress} />
        )}

        <TouchableOpacity
          onPress={upload}
          disabled={uploading || !form.name || !file}
          style={[
            styles.uploadButton,
            (uploading || !form.name || !file) && styles.disabled,
          ]}
        >
          {uploading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {uploading ? 'Saving...' : 'Save Minister'}
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
    marginBottom: 8,
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
};
