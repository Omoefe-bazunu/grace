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
import { uploadGalleryPicture } from '../../../../../../services/dataService';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';

export default function UploadPictures() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickFiles = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: 'image/*',
    });
    if (!res.canceled) setFiles(res.assets.slice(0, 10));
  };

  const upload = async () => {
    if (!title.trim() || files.length === 0)
      return Alert.alert('Required', 'Event title and images needed');

    setUploading(true);
    try {
      for (const file of files) {
        await uploadGalleryPicture(file, {
          event: title.trim(),
          description: desc.trim().slice(0, 200),
        });
      }
      Alert.alert('Success', `${files.length} pictures uploaded!`);
      setTitle('');
      setDesc('');
      setFiles([]);
    } catch (e) {
      Alert.alert('Upload Failed', e.message || 'Try again');
    } finally {
      setUploading(false);
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
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#fff',
            }}
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
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#fff',
              textAlignVertical: 'top',
            }}
          />
        </View>

        <TouchableOpacity
          onPress={pickFiles}
          disabled={uploading}
          style={{
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Pick Images – {files.length}/10
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={upload}
          disabled={uploading || !title || files.length === 0}
          style={{
            backgroundColor:
              uploading || !title || files.length === 0 ? '#aaa' : '#34C759',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {uploading && <ActivityIndicator color="#fff" />}
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {uploading ? 'Uploading...' : 'Upload All'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
