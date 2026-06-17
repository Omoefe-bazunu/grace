import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Upload,
  CheckCircle,
  X,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '@/utils/api';
import {
  getQuizResources,
  addQuizResource,
  updateQuizResource,
  deleteQuizResource,
} from '@/services/dataService'; // adjust path to wherever dataService.js lives in your project

export default function QuizResourceUploader() {
  const { colors } = useTheme();
  const PDF_SIZE_LIMIT = 5; // MB

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manage'

  // --- Upload tab state ---
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [ageCategory, setAgeCategory] = useState('Senior');
  const [genderCategory, setGenderCategory] = useState('Brothers');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // --- Manage tab state ---
  const [resources, setResources] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- Edit modal state ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editAgeCategory, setEditAgeCategory] = useState('Senior');
  const [editGenderCategory, setEditGenderCategory] = useState('Brothers');
  const [editPdfUrl, setEditPdfUrl] = useState(null);
  const [editIsUploading, setEditIsUploading] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [editIsSaving, setEditIsSaving] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsLoadingResources(true);
    const data = await getQuizResources();
    setResources(data);
    setIsLoadingResources(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchResources();
    }
  }, [activeTab, fetchResources]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchResources();
    setRefreshing(false);
  };

  // Generic upload helper, parameterized so both the upload form and the edit modal can reuse it
  const uploadFile = async (
    file,
    { setUploading, setProgress, setPdfUrl: setUrl },
  ) => {
    setUploading(true);
    setProgress(0);

    try {
      const configRes = await apiClient.getUploadConfig(
        'quizResources',
        file.name,
        'application/pdf',
      );
      const { uploadUrl, fileUrl } = configRes.data;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUrl(fileUrl);
          setUploading(false);
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error');
      };
      xhr.send(blob);
    } catch (error) {
      setUploading(false);
      Alert.alert('Upload Failed', 'Could not upload PDF to server.');
    }
  };

  const pickPDF = async (handlers) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (file.size > PDF_SIZE_LIMIT * 1024 * 1024) {
        return Alert.alert(
          'File too large',
          `The PDF must be smaller than ${PDF_SIZE_LIMIT}MB`,
        );
      }

      await uploadFile(file, handlers);
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const resetForm = () => {
    setTitle('');
    setYear(new Date().getFullYear().toString());
    setAgeCategory('Senior');
    setGenderCategory('Brothers');
    setPdfUrl(null);
  };

  const handleSubmit = async () => {
    if (!title || !pdfUrl)
      return Alert.alert(
        'Missing Fields',
        'Please provide a title and upload a PDF',
      );

    setIsSubmitting(true);
    try {
      await addQuizResource({
        title,
        year,
        ageCategory,
        genderCategory,
        pdfUrl,
      });

      Alert.alert('Success', 'Quiz resource published!', [
        { text: 'Upload Another', onPress: resetForm },
        {
          text: 'View List',
          onPress: () => {
            resetForm();
            setActiveTab('manage');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save quiz details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title || '');
    setEditYear(item.year ? String(item.year) : '');
    setEditAgeCategory(item.ageCategory || 'Senior');
    setEditGenderCategory(item.genderCategory || 'Brothers');
    setEditPdfUrl(item.pdfUrl || null);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingId(null);
  };

  const handleUpdate = async () => {
    if (!editTitle || !editPdfUrl) {
      return Alert.alert('Missing Fields', 'Please provide a title and PDF');
    }

    setEditIsSaving(true);
    try {
      await updateQuizResource(editingId, {
        title: editTitle,
        year: editYear,
        ageCategory: editAgeCategory,
        genderCategory: editGenderCategory,
        pdfUrl: editPdfUrl,
      });

      setResources((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                title: editTitle,
                year: editYear,
                ageCategory: editAgeCategory,
                genderCategory: editGenderCategory,
                pdfUrl: editPdfUrl,
              }
            : r,
        ),
      );
      closeEditModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to update quiz resource');
    } finally {
      setEditIsSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Quiz Resource',
      `Delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuizResource(item.id);
              setResources((prev) => prev.filter((r) => r.id !== item.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete quiz resource');
            }
          },
        },
      ],
    );
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

  const PdfDropZone = ({
    pdfUrl: url,
    isUploading: uploading,
    uploadProgress: progress,
    onPress,
  }) => (
    <TouchableOpacity
      style={[
        styles.dropZone,
        { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
      ]}
      onPress={onPress}
      disabled={uploading}
    >
      {uploading ? (
        <View style={styles.progressCircle}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ marginTop: 8, color: colors.text }}>{progress}%</Text>
        </View>
      ) : url ? (
        <View style={styles.fileSelected}>
          <CheckCircle color="#10B981" size={32} />
          <Text style={{ color: colors.text, marginTop: 8 }}>PDF Ready</Text>
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
  );

  const TabButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === value && {
          borderBottomColor: colors.primary,
          borderBottomWidth: 2,
        },
      ]}
      onPress={() => setActiveTab(value)}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: activeTab === value ? colors.primary : '#888' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ResourceCard = ({ item }) => (
    <View style={[styles.resourceCard, { backgroundColor: colors.surface }]}>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.resourceTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.resourceMeta}>
          {item.year} • {item.ageCategory} • {item.genderCategory}
        </Text>
      </View>
      <View style={styles.resourceActions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => openEditModal(item)}
        >
          <Pencil color={colors.primary} size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDelete(item)}
        >
          <Trash2 color="#EF4444" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton />

      <View style={styles.tabBar}>
        <TabButton label="Upload" value="upload" />
        <TabButton label="Manage" value="manage" />
      </View>

      {activeTab === 'upload' ? (
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
            <PdfDropZone
              pdfUrl={pdfUrl}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onPress={() =>
                pickPDF({
                  setUploading: setIsUploading,
                  setProgress: setUploadProgress,
                  setPdfUrl,
                })
              }
            />
          </View>

          <Button
            title={isSubmitting ? 'Saving...' : 'Publish Quiz'}
            onPress={handleSubmit}
            disabled={isSubmitting || isUploading || !pdfUrl}
            style={{ marginTop: 30 }}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => <ResourceCard item={item} />}
          ListEmptyComponent={
            isLoadingResources ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 40 }}
              />
            ) : (
              <View style={styles.emptyState}>
                <FileText color="#888" size={32} />
                <Text style={{ color: '#888', marginTop: 10 }}>
                  No quiz resources yet
                </Text>
              </View>
            )
          }
        />
      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background || '#FFF' },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Quiz Resource
              </Text>
              <TouchableOpacity onPress={closeEditModal}>
                <X color={colors.text} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Input
                label="Quiz Title"
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="e.g. 2026 Senior Brothers Quiz"
              />

              <Input
                label="Year"
                value={editYear}
                onChangeText={setEditYear}
                keyboardType="numeric"
                maxLength={4}
              />

              <Selector
                label="Age Category"
                options={['Senior', 'Junior']}
                current={editAgeCategory}
                onSelect={setEditAgeCategory}
              />

              <Selector
                label="Gender Category"
                options={['Brothers', 'Sisters', 'Brothers & Sisters']}
                current={editGenderCategory}
                onSelect={setEditGenderCategory}
              />

              <View style={styles.uploadBox}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Study Material (PDF)
                </Text>
                <PdfDropZone
                  pdfUrl={editPdfUrl}
                  isUploading={editIsUploading}
                  uploadProgress={editUploadProgress}
                  onPress={() =>
                    pickPDF({
                      setUploading: setEditIsUploading,
                      setProgress: setEditUploadProgress,
                      setPdfUrl: setEditPdfUrl,
                    })
                  }
                />
              </View>

              <Button
                title={editIsSaving ? 'Saving...' : 'Save Changes'}
                onPress={handleUpdate}
                disabled={editIsSaving || editIsUploading || !editPdfUrl}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabButtonText: { fontSize: 15, fontWeight: '600' },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resourceTitle: { fontSize: 15, fontWeight: '700' },
  resourceMeta: { fontSize: 13, color: '#888', marginTop: 4 },
  resourceActions: { flexDirection: 'row', gap: 12, marginLeft: 12 },
  iconBtn: { padding: 6 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
});
