import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '@/utils/api';

export default function QuizResourceUploader() {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [ageCategory, setAgeCategory] = useState('Senior');
  const [genderCategory, setGenderCategory] = useState('Brothers');
  const [pdfUrl, setPdfUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { colors } = useTheme();
  const PDF_SIZE_LIMIT = 5; // MB

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Check file size
      if (file.size > PDF_SIZE_LIMIT * 1024 * 1024) {
        return Alert.alert(
          'File too large',
          `The PDF must be smaller than ${PDF_SIZE_LIMIT}MB`,
        );
      }

      await uploadFile(file);
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get Signed URL from your backend
      const configRes = await apiClient.getUploadConfig(
        'quizResources',
        file.name,
        'application/pdf',
      );
      const { uploadUrl, fileUrl } = configRes.data;

      // 2. Prepare Blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // 3. Upload to Firebase Storage via PUT
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setPdfUrl(fileUrl);
          setIsUploading(false);
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error');
      };
      xhr.send(blob);
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Upload Failed', 'Could not upload PDF to server.');
    }
  };

  const handleSubmit = async () => {
    if (!title || !pdfUrl)
      return Alert.alert(
        'Missing Fields',
        'Please provide a title and upload a PDF',
      );

    setIsSubmitting(true);
    try {
      await apiClient.post('quiz/resources', {
        title,
        year,
        ageCategory,
        genderCategory,
        pdfUrl,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Quiz resource published!', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save quiz details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Selector = ({ label, options, current, onSelect }) => (
    <View style={styles.selectorGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.chip,
              { backgroundColor: colors.surface },
              current === opt && { backgroundColor: colors.primary },
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text },
                current === opt && { color: '#FFF' },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Upload Quiz" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Quiz Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. 2026 Senior Brothers Quiz"
        />

        <Input
          label="Year"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          maxLength={4}
        />

        <Selector
          label="Age Category"
          options={['Senior', 'Junior']}
          current={ageCategory}
          onSelect={setAgeCategory}
        />

        <Selector
          label="Gender Category"
          options={['Brothers', 'Sisters', 'Brothers & Sisters']}
          current={genderCategory}
          onSelect={setGenderCategory}
        />

        <View style={styles.uploadBox}>
          <Text style={[styles.label, { color: colors.text }]}>
            Study Material (PDF)
          </Text>
          <TouchableOpacity
            style={[
              styles.dropZone,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primary + '08',
              },
            ]}
            onPress={pickPDF}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.progressCircle}>
                <ActivityIndicator color={colors.primary} />
                <Text style={{ marginTop: 8 }}>{uploadProgress}%</Text>
              </View>
            ) : pdfUrl ? (
              <View style={styles.fileSelected}>
                <CheckCircle color="#10B981" size={32} />
                <Text style={{ color: colors.text, marginTop: 8 }}>
                  PDF Ready
                </Text>
              </View>
            ) : (
              <View style={styles.idleState}>
                <Upload color={colors.primary} size={32} />
                <Text style={{ color: colors.primary, marginTop: 8 }}>
                  Select PDF (Max 5MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Button
          title={isSubmitting ? 'Saving...' : 'Publish Quiz'}
          onPress={handleSubmit}
          disabled={isSubmitting || isUploading || !pdfUrl}
          style={{ marginTop: 30 }}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 50 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  selectorGroup: { marginBottom: 20 },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  uploadBox: { marginTop: 10 },
  dropZone: {
    height: 140,
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleState: { alignItems: 'center' },
  fileSelected: { alignItems: 'center' },
  progressCircle: { alignItems: 'center' },
});
