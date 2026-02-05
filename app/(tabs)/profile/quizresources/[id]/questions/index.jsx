import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Send, MessageSquare } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext'; // ✅ Added Language Hook
import { addQuizHelpQuestion } from '@/services/dataService';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '@/components/ui/AppText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function QuizHelpScreen() {
  const { id, title } = useLocalSearchParams();
  const { colors } = useTheme();
  const { translations } = useLanguage(); // ✅ Access translations

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !number.trim() || !question.trim()) {
      return Alert.alert(
        translations.error || 'Error',
        translations.fillAllFields || 'Please fill in all fields',
      );
    }

    setIsSubmitting(true);
    try {
      await addQuizHelpQuestion({
        quizId: id,
        name,
        number,
        question: question.trim(),
        title: title,
      });

      Alert.alert(
        translations.success || 'Success',
        translations.questionSentSuccess ||
          'Your question has been sent. Our admins will get back to you shortly.',
        [{ text: translations.ok || 'OK', onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert(
        translations.error || 'Error',
        translations.questionSendError ||
          'Failed to send your question. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaWrapper style={{ backgroundColor: colors.background }}>
      <TopNavigation
        showBackButton
        title={translations.askHelpNavTitle || 'Ask for Help'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: colors.primary + '10' },
            ]}
          >
            <MessageSquare size={32} color={colors.primary} />
          </View>

          <AppText style={[styles.instruction, { color: colors.text }]}>
            {/* ✅ Handles dynamic title inclusion */}
            {translations.haveQuestionFromTitle?.replace('{title}', title) ||
              `Have a question from "${title}"?`}
          </AppText>
          <AppText
            style={[styles.subInstruction, { color: colors.textSecondary }]}
          >
            {translations.provideDetailsHelp ||
              'Provide your details below and we will help clarify any confusion.'}
          </AppText>

          <View style={styles.form}>
            <Input
              label={translations.yourNameLabel || 'Your Name'}
              value={name}
              onChangeText={setName}
              placeholder={
                translations.enterFullNamePlaceholder || 'Enter your full name'
              }
            />

            <Input
              label={translations.whatsappNumberLabel || 'WhatsApp Number'}
              value={number}
              onChangeText={setNumber}
              keyboardType="phone-pad"
              placeholder={
                translations.whatsappPlaceholder || 'e.g. 08012345678'
              }
            />

            <Input
              label={translations.yourQuestionLabel || 'Your Question'}
              value={question}
              onChangeText={setQuestion}
              placeholder={
                translations.questionPlaceholder ||
                'What part of the material is confusing?'
              }
              multiline
              numberOfLines={5}
              style={styles.textArea}
            />

            <Button
              title={
                isSubmitting
                  ? translations.sending || 'Sending...'
                  : translations.submitQuestion || 'Submit Question'
              }
              onPress={handleSubmit}
              disabled={isSubmitting}
              icon={<Send size={18} color="#FFF" />}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, alignItems: 'center' },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  form: { width: '100%' },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 10,
    height: 55,
    borderRadius: 15,
  },
});
