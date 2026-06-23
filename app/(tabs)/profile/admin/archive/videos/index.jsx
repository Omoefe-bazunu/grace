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
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';

export default function UploadVideos() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [date, setDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadAll = async () => {
    if (!title.trim() || !videoUrl.trim() || !date.trim()) {
      return Alert.alert(
        'Required Fields Missing',
        'Please fill in Title, Date, and YouTube URL.',
      );
    }
    setIsUploading(true);
    try {
      await apiClient.post('archive/upload', {
        type: 'video',
        title: title.trim(),
        description: desc.trim().slice(0, 200),
        url: videoUrl.trim(),
        date: date.trim(),
      });

      Alert.alert(
        'Success',
        'Archive updated with video URL entry reference context.',
      );
      setTitle('');
      setDesc('');
      setVideoUrl('');
      setDate('');
    } catch (e) {
      Alert.alert('Error', 'Failed to register video metadata entry.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
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
          <Text style={styles.label}>Date *</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            editable={!isUploading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>YouTube URL or Video ID *</Text>
          <TextInput
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="e.g. https://youtu.be/dQw4w9WgXcQ"
            style={styles.input}
            autoCapitalize="none"
            editable={!isUploading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Description text references..."
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            editable={!isUploading}
          />
        </View>

        <TouchableOpacity
          onPress={handleUploadAll}
          disabled={isUploading || !title || !videoUrl || !date}
          style={[
            styles.uploadButton,
            (isUploading || !title || !videoUrl || !date) && styles.disabled,
          ]}
        >
          {isUploading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>
            {isUploading ? 'Processing...' : 'Upload Video Url Entry'}
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
});
