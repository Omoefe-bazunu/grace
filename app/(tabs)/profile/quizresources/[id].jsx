// quizresources/[id].jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Book, CheckCircle } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getQuiz, addQuizHelpQuestion } from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TopNavigation } from '@/components/TopNavigation';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';

// Component for the skeleton loading state
const SkeletonQuizDetail = ({ colors }) => (
  <SafeAreaView
    style={[styles.container, { backgroundColor: colors.background }]}
  >
    <TopNavigation showBackButton={true} onPress={() => router.back()} />
    <View style={styles.content}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={[styles.skeletonTitle, { alignSelf: 'center' }]}
      />
      <View style={styles.metaContainer}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonMeta}
        />
      </View>
      <View
        style={[styles.resourceContainer, { backgroundColor: colors.card }]}
      >
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonResource}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonResource}
        />
      </View>
    </View>
  </SafeAreaView>
);

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams();
  const { translations } = useLanguage();
  const { colors } = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for the question form
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuiz(id);
        setQuiz(quizData);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleQuestionSubmit = async () => {
    if (!name || !whatsapp || !question) {
      console.log('Error: Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addQuizHelpQuestion({
        name,
        whatsapp,
        question,
        quizId: id,
        quizTitle: quiz?.title,
      });
      setShowSuccessModal(true);
      setName('');
      setWhatsapp('');
      setQuestion('');
    } catch (e) {
      console.error('Failed to submit question:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonQuizDetail colors={colors} />;
  }

  if (!quiz) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.error, { color: colors.error }]}>
          {translations.errorQuizNotFound || 'Quiz not found'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaWrapper
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopNavigation showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          {quiz.title || translations.noTitle}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Book size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {quiz.year} - {quiz.age} - {quiz.gender}
            </Text>
          </View>
        </View>

        <View
          style={[styles.resourceContainer, { backgroundColor: colors.card }]}
        >
          {quiz.content && (
            <Text
              style={[styles.resourceText, { color: colors.textSecondary }]}
            >
              {quiz.content}
            </Text>
          )}
        </View>

        {/* --- Question Submission Form --- */}
        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {translations.askQuestion || 'Ask a Question'}
          </Text>
          <Input
            label={translations.name || 'Name'}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <Input
            label={translations.whatsapp || 'WhatsApp Number'}
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            placeholder="e.g. +23480..."
          />
          <Input
            label={translations.question || 'Your Question'}
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={4}
            placeholder="Enter your question here..."
            style={styles.questionInput}
          />
          <Button
            title={
              isSubmitting
                ? translations.submitting || 'Submitting...'
                : translations.submitQuestion || 'Submit Question'
            }
            onPress={handleQuestionSubmit}
            disabled={isSubmitting}
            size="large"
            style={styles.submitButton}
          />
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
              {translations.questionSubmitted || 'Question Submitted!'}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {translations.questionSubmittedDesc ||
                'Thank you! Your question has been sent and will be answered shortly.'}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.9,
  },
  resourceContainer: {
    borderRadius: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingTop: 40,
    elevation: 5,
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resourceText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    opacity: 0.9,
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  questionInput: {
    textAlignVertical: 'top',
    height: 100,
  },
  submitButton: {
    marginTop: 16,
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  skeletonTitle: {
    height: 28,
    width: '60%',
    borderRadius: 4,
    marginVertical: 8,
  },
  skeletonMeta: {
    height: 14,
    width: 80,
    borderRadius: 4,
  },

  skeletonResource: {
    height: 60,
    width: '100%',
    borderRadius: 4,
    marginBottom: 12,
  },

  backText: {
    color: '#1E3A8A',
    fontSize: 16,
    marginHorizontal: 'auto',
    marginVertical: 10,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
