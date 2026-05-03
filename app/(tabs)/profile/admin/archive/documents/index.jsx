import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';
import { apiClient } from '../../../../../../utils/api';
import { FileText, Link, Check } from 'lucide-react-native';

const convertDriveLink = (url) => {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return null;
};

export default function UploadDocuments() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef(null);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a document title.');
      return;
    }
    if (!driveLink.trim()) {
      Alert.alert('Required', 'Please paste a Google Drive link.');
      return;
    }
    const previewUrl = convertDriveLink(driveLink.trim());
    if (!previewUrl) {
      Alert.alert(
        'Invalid Link',
        'That does not look like a valid Google Drive file link.\n\nIt should contain /file/d/...',
      );
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('archive/documents', {
        title: title.trim(),
        description: desc.trim(),
        url: previewUrl,
        date: new Date().toISOString().split('T')[0],
      });
      setSaved(true);
      setTitle('');
      setDesc('');
      setDriveLink('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Could not save document. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Add Document" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <FileText
              size={18}
              color="#007AFF"
              style={{ marginRight: 8, flexShrink: 0 }}
            />
            <Text style={styles.infoText}>
              Upload your PDF to Google Drive first, set sharing to{' '}
              <Text style={{ fontWeight: '700' }}>
                Anyone with the link → Viewer
              </Text>
              , then paste the link below.
            </Text>
          </View>

          <Text style={styles.label}>Document Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Annual Report 2024"
            style={styles.input}
            editable={!saving}
            returnKeyType="next"
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
            editable={!saving}
            placeholder="Brief summary of the document..."
          />

          <Text style={styles.label}>Google Drive Link *</Text>
          <View style={[styles.linkInputRow, saving && { opacity: 0.6 }]}>
            <Link
              size={18}
              color="#888"
              style={{ marginRight: 8, flexShrink: 0 }}
            />
            <TextInput
              value={driveLink}
              onChangeText={setDriveLink}
              placeholder="https://drive.google.com/file/d/..."
              style={styles.linkInput}
              editable={!saving}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onFocus={() =>
                setTimeout(
                  () => scrollRef.current?.scrollToEnd({ animated: true }),
                  150,
                )
              }
            />
            {driveLink.length > 0 && (
              <TouchableOpacity
                onPress={() => setDriveLink('')}
                style={{ padding: 4 }}
              >
                <Text style={{ color: '#aaa', fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.hint}>
            Both /view and /preview links are accepted — the app converts
            automatically.
          </Text>

          {/* Spacer so Save button clears keyboard */}
          <View style={{ height: 100 }} />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              (saving || !title || !driveLink) && styles.disabled,
              saved && styles.savedBtn,
            ]}
            onPress={handleSave}
            disabled={saving || !title.trim() || !driveLink.trim()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            ) : saved ? (
              <Check size={18} color="#fff" style={{ marginRight: 8 }} />
            ) : null}
            <Text style={styles.btnText}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Document'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 20 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 19 },
  label: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 14,
    color: '#333',
  },
  hint: { fontSize: 11, color: '#888', marginTop: 6, lineHeight: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#111',
  },
  textArea: { textAlignVertical: 'top', height: 80 },
  linkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  linkInput: { flex: 1, fontSize: 14, color: '#111' },
  saveBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  savedBtn: { backgroundColor: '#10B981' },
  disabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
