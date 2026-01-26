import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Send,
  CheckCircle,
  X,
  MessageSquare,
  Mail as MailIcon,
  User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TopNavigation } from '@/components/TopNavigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addContactMessage } from '@/services/dataService';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { AppText } from '../../../../components/ui/AppText';

const { width } = Dimensions.get('window');

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
      alert('Please fill in all fields');
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaWrapper style={{ backgroundColor: colors.background }}>
      <TopNavigation showBackButton={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Modern Hero Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.hero}
        >
          <View style={styles.iconCircle}>
            <MessageSquare size={40} color={colors.primary} />
          </View>
          <AppText style={styles.heroTitle}>Get in Touch</AppText>
          <AppText style={styles.heroSubtitle}>
            {translations.contactDesc ||
              "We'd love to hear from you. Your feedback helps us serve you better."}
          </AppText>
        </LinearGradient>

        <View style={styles.contentBody}>
          <View
            style={[
              styles.formContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <Input
                label={translations.name}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                icon={<User size={18} color={colors.textSecondary} />}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Input
                label={translations.email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                icon={<MailIcon size={18} color={colors.textSecondary} />}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.categoryBox}>
              <AppText style={[styles.label, { color: colors.text }]}>
                {translations.selectCategory || 'What is this regarding?'}
              </AppText>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.background,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <AppText
                        style={[
                          styles.categoryText,
                          { color: isSelected ? '#FFF' : colors.textSecondary },
                        ]}
                      >
                        {translations[cat.id] || cat.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Message Input */}
            <View style={styles.inputWrapper}>
              <Input
                label={translations.message}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                placeholder="Write your message here..."
                style={styles.messageArea}
              />
            </View>

            <Button
              title={isSubmitting ? 'Sending Message...' : 'Send Message'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              size="large"
              style={styles.submitButton}
              icon={<Send size={18} color="#FFF" />}
            />
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[colors.primary + '20', 'transparent']}
              style={styles.modalGlow}
            />
            <CheckCircle size={64} color={colors.primary} strokeWidth={1.5} />
            <AppText style={[styles.modalTitle, { color: colors.text }]}>
              Thank You!
            </AppText>
            <AppText
              style={[styles.modalDesc, { color: colors.textSecondary }]}
            >
              Your message has been sent successfully. We appreciate your
              feedback.
            </AppText>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <AppText style={styles.modalButtonText}>Return to App</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  hero: {
    paddingTop: 30,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  contentBody: {
    paddingHorizontal: 20,
    marginTop: -40, // Pull form up into the hero section
  },
  formContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryBox: {
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 16,
    height: 56,
  },
  infoFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    width: '100%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalGlow: {
    ...StyleSheet.absoluteFillObject,
    height: 150,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalButton: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
