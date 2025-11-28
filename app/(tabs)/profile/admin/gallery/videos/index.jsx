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
import { uploadGalleryVideo } from '../../../../../../services/dataService';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';

export default function UploadVideos() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickFiles = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: 'video/*',
    });

    if (!res.canceled) {
      setFiles(res.assets.slice(0, 5)); // Max 5 videos (200MB each)
    }
  };

  const upload = async () => {
    if (!title.trim() || files.length === 0) {
      return Alert.alert(
        'Required',
        'Event title and at least one video needed'
      );
    }

    setUploading(true);
    try {
      for (const file of files) {
        await uploadGalleryVideo(file, {
          event: title.trim(),
          description: desc.trim().slice(0, 200),
        });
      }

      Alert.alert(
        'Success',
        `${files.length} video${files.length > 1 ? 's' : ''} uploaded!`
      );
      setTitle('');
      setDesc('');
      setFiles([]);
    } catch (e) {
      Alert.alert('Upload Failed', e.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Event Title */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Event Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Sunday Service Highlights"
            style={styles.input}
          />
        </View>

        {/* Description */}
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
          />
        </View>

        {/* Pick Videos Button */}
        <TouchableOpacity
          onPress={pickFiles}
          disabled={uploading}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Pick Videos – {files.length}/5</Text>
        </TouchableOpacity>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={upload}
          disabled={uploading || !title || files.length === 0}
          style={[
            styles.button,
            {
              backgroundColor:
                uploading || !title || files.length === 0 ? '#aaa' : '#34C759',
            },
          ]}
        >
          {uploading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>
            {uploading ? 'Uploading...' : 'Upload All Videos'}
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
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
};
