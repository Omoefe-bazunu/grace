import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addQuizResource } from '@/services/dataService';
import { Picker } from '@react-native-picker/picker';
import { CheckCircle, XCircle } from 'lucide-react-native';

export default function QuizResourceUploader() {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('2024');
  const [age, setAge] = useState('senior');
  const [gender, setGender] = useState('brothers');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(true);

  const { translations } = useLanguage();
  const { colors } = useTheme();

  const showModal = (message, success) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalVisible(true);
  };

  const handleUpload = async () => {
    if (!title || !year || !age || !gender || !content) {
      showModal(
        translations.fillAllFields || 'Please fill in all fields.',
        false,
      );
      return;
    }

    setIsUploading(true);
    try {
      await addQuizResource({
        title,
        year,
        age,
        gender,
        content,
      });
      showModal(
        translations.uploadSuccess || 'Quiz resource uploaded successfully!',
        true,
      );
      // Reset form
      setTitle('');
      setYear('2024');
      setAge('senior');
      setGender('brothers');
      setContent('');
    } catch (error) {
      console.error('Upload error:', error);
      showModal(
        translations.uploadError ||
          'Failed to upload quiz resource. Please try again.',
        false,
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Generate an array of years from 2015 to 2040
  const years = Array.from({ length: 26 }, (_, i) => 2015 + i);

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.uploadQuiz || 'Upload Quiz'} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>
          {translations.uploadQuizHeader || 'Upload a New Quiz Resource'}
        </Text>

        <View style={[styles.form, { backgroundColor: colors.card }]}>
          <Input
            label={translations.title || 'Title'}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Quiz on the Book of James"
          />

          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            {translations.year || 'Year'}
          </Text>
          <View
            style={[styles.pickerContainer, { borderColor: colors.border }]}
          >
            <Picker
              selectedValue={year}
              onValueChange={(itemValue) => setYear(itemValue)}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.text}
            >
              {years.map((y) => (
                <Picker.Item key={y} label={String(y)} value={String(y)} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            {translations.ageGroup || 'Age Group'}
          </Text>
          <View
            style={[styles.pickerContainer, { borderColor: colors.border }]}
          >
            <Picker
              selectedValue={age}
              onValueChange={(itemValue) => setAge(itemValue)}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="Senior" value="senior" />
              <Picker.Item label="Junior" value="junior" />
            </Picker>
          </View>

          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            {translations.gender || 'Gender'}
          </Text>
          <View
            style={[styles.pickerContainer, { borderColor: colors.border }]}
          >
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="General" value="general" />
              <Picker.Item label="Brothers" value="brothers" />
              <Picker.Item label="Sisters" value="sisters" />
            </Picker>
          </View>

          <Input
            label={translations.quizContent || 'Quiz Content'}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            placeholder="Type or paste the quiz details here..."
            style={styles.contentInput}
          />

          <Button
            title={
              isUploading
                ? translations.uploading || 'Uploading...'
                : translations.upload || 'Upload'
            }
            onPress={handleUpload}
            disabled={isUploading}
            size="large"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Custom Modal for Alerts */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View
            style={[modalStyles.modalContent, { backgroundColor: colors.card }]}
          >
            {modalSuccess ? (
              <CheckCircle
                size={50}
                color={colors.primary}
                style={modalStyles.modalIcon}
              />
            ) : (
              <XCircle
                size={50}
                color={colors.error}
                style={modalStyles.modalIcon}
              />
            )}
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>
              {modalSuccess
                ? translations.success || 'Success'
                : translations.error || 'Error'}
            </Text>
            <Text
              style={[modalStyles.modalText, { color: colors.textSecondary }]}
            >
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={[
                modalStyles.modalButton,
                {
                  backgroundColor: modalSuccess ? colors.primary : colors.error,
                },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={modalStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  contentInput: {
    textAlignVertical: 'top',
    height: 200,
  },
  submitButton: {
    marginTop: 24,
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
