import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView, // Import ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopNavigation } from '@/components/TopNavigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addContactMessage } from '@/services/dataService';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';

const CATEGORIES = [
  { id: 'complaint', label: 'Complaint' },
  { id: 'suggestion', label: 'Suggestion' },
  { id: 'request', label: 'Request' },
  { id: 'appreciation', label: 'Appreciation' },
];

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { translations } = useLanguage();
  const { colors } = useTheme();

  const handleSubmit = async () => {
    if (!name || !email || !message || !category) {
      console.log('Error: Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addContactMessage({ name, email, message, category });
      setShowSuccessModal(true);
      setName('');
      setEmail('');
      setMessage('');
      setCategory('');
    } catch (e) {
      console.error('Failed to submit message:', e);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <View>
        <Text
          style={[
            {
              marginHorizontal: 'auto',
              fontWeight: 'bold',
              fontSize: 24,
              marginVertical: 12,
            },
          ]}
        >
          Contact
        </Text>
      </View>

      {/* Wrap the content in a ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {translations.contactDesc ||
              "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          </Text>

          <View
            style={[
              styles.form,
              { backgroundColor: colors.card, shadowColor: colors.shadow },
            ]}
          >
            <Input
              label={translations.name}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />

            <Input
              label={translations.email}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />

            <View style={styles.categoryContainer}>
              <Text style={[styles.categoryLabel, { color: colors.text }]}>
                {translations.selectCategory || 'Category'}
              </Text>
              <View style={styles.categoryOptions}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primaryLight,
                      },
                      category === cat.id && styles.selectedCategory,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.primary },
                        category === cat.id && styles.selectedCategoryText,
                      ]}
                    >
                      {translations[cat.id] || cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label={translations.message}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholder="Enter your message"
              style={styles.messageInput}
            />

            <Button
              title={isSubmitting ? 'Sending...' : translations.submit}
              onPress={handleSubmit}
              disabled={isSubmitting}
              size="large"
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <CheckCircle
              size={50}
              color={colors.primary}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Message Sent!
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Thank you for your feedback. We will get back to you as soon as
              possible.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
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

  scrollViewContent: {
    paddingBottom: 60, // Add padding at the bottom for the tabs
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    borderRadius: 12,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedCategory: {
    backgroundColor: '#EBF4FF',
    borderColor: '#1E3A8A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    fontWeight: '600',
  },
  messageInput: {
    textAlignVertical: 'top',
    height: 100,
  },
  submitButton: {
    marginTop: 4,
    marginBottom: 20,
  },
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
