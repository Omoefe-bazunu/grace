import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  X,
  CheckCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react-native';
import { LanguageSwitcher } from '../../../../../components/LanguageSwitcher';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../../../contexts/AuthContext';
import { apiClient } from '../../../../../utils/api';

const { width } = Dimensions.get('window');

const ProgressBar = ({ progress, status, label }) => {
  if (status === 'idle') return null;
  let barColor =
    status === 'success'
      ? '#10B981'
      : status === 'error'
        ? '#EF4444'
        : '#1E3A8A';
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {label}: {status === 'success' ? 'Done' : `${progress}%`}
        </Text>
        {status === 'success' && <CheckCircle size={14} color="#10B981" />}
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
};

export default function NoticeUploadScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    images: [],
    pdfUrl: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const LIMITS = { image: 5, pdf: 10 }; // MB

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const pickImage = async () => {
    if (formData.images.length >= 3)
      return Alert.alert('Limit Reached', 'Maximum 3 images allowed');
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
      if (result.canceled) return;
      const file = result.assets[0];
      const fieldKey = `img_${Date.now()}`;
      const uploadedUrl = await uploadFile(
        fieldKey,
        file.uri,
        file.name,
        file.mimeType,
        LIMITS.image,
      );
      if (uploadedUrl)
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, uploadedUrl],
        }));
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const uploadedUrl = await uploadFile(
        'pdfUrl',
        file.uri,
        file.name,
        file.mimeType,
        LIMITS.pdf,
      );
      if (uploadedUrl) updateField('pdfUrl', uploadedUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF');
    }
  };

  const uploadFile = async (field, uri, fileName, mimeType, maxSizeMB) => {
    setUploadProgress((prev) => ({
      ...prev,
      [field]: { status: 'uploading', progress: 0 },
    }));
    try {
      const configRes = await apiClient.getUploadConfig(
        'notices',
        fileName,
        mimeType,
      );
      const { uploadUrl, fileUrl } = configRes.data;
      const fileResp = await fetch(uri);
      const blob = await fileResp.blob();
      if (blob.size > maxSizeMB * 1024 * 1024) {
        Alert.alert('File Too Large', `File must be less than ${maxSizeMB}MB`);
        setUploadProgress((prev) => ({
          ...prev,
          [field]: { status: 'error', progress: 0 },
        }));
        return null;
      }
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', mimeType);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress((prev) => ({
              ...prev,
              [field]: {
                status: 'uploading',
                progress: Math.round((e.loaded / e.total) * 100),
              },
            }));
          }
        };
        xhr.onload = () => {
          setUploadProgress((prev) => ({
            ...prev,
            [field]: { status: 'success', progress: 100 },
          }));
          resolve(fileUrl);
        };
        xhr.onerror = () => {
          setUploadProgress((prev) => ({
            ...prev,
            [field]: { status: 'error', progress: 0 },
          }));
          resolve(null);
        };
        xhr.send(blob);
      });
    } catch (error) {
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'error', progress: 0 },
      }));
      return null;
    }
  };

  const removeImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

  const handleSubmit = async () => {
    if (!formData.title || !formData.message)
      return Alert.alert('Error', 'Title and Message are required');
    setIsSubmitting(true);
    try {
      await apiClient.post('notices', {
        ...formData,
        uploadedBy: user?.email || 'admin',
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Notice posted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to save notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal transparent visible={isSubmitting} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingTitle}>Posting Notice...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Notice</Text>
        <LanguageSwitcher />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Title *"
          value={formData.title}
          onChangeText={(v) => updateField('title', v)}
          placeholder="Notice Title"
        />

        <Text style={styles.label}>Message *</Text>
        <TextInput
          style={styles.messageInput}
          value={formData.message}
          onChangeText={(v) => updateField('message', v)}
          placeholder="Type your notice message here..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.fieldBlock}>
          <Text style={styles.blockTitle}>Attachments (Optional)</Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={formData.images.length >= 3}
          >
            <ImageIcon size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>
              Add Images ({formData.images.length}/3)
            </Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {formData.images.map((url, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: url }} style={styles.previewThumb} />
                <TouchableOpacity
                  style={styles.removeBadge}
                  onPress={() => removeImage(index)}
                >
                  <X size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, { marginTop: 15 }]}
            onPress={pickPDF}
          >
            <FileText size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>
              {formData.pdfUrl
                ? 'PDF Attached (Tap to change)'
                : 'Add PDF Document (1 max)'}
            </Text>
          </TouchableOpacity>

          {Object.keys(uploadProgress).map((key) => (
            <ProgressBar
              key={key}
              {...uploadProgress[key]}
              label={key.includes('img') ? 'Image' : 'PDF'}
            />
          ))}
        </View>

        <Button
          title="Post Notice"
          onPress={handleSubmit}
          disabled={isSubmitting}
          size="large"
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
  messageInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    height: 150,
    fontSize: 16,
    marginBottom: 20,
  },
  fieldBlock: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imageWrapper: { position: 'relative' },
  previewThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 4,
  },
  progressContainer: { marginTop: 12 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: { fontSize: 11, color: '#64748B' },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    width: width * 0.7,
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingTitle: { marginTop: 12, fontSize: 16, fontWeight: 'bold' },
});
