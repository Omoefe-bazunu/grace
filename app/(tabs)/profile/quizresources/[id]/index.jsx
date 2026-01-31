import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  FileText,
  HelpCircle,
  Send,
  X,
  Calendar,
  User,
  Users,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizResource } from '@/services/dataService';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [name, setName] = useState(false);
  const [number, setNumber] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const data = await getQuizResource(id);
      setQuiz(data);
      setLoading(false);
    };
    fetchQuiz();
  }, [id]);

  if (loading || !quiz) return null;

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Quiz Details" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.iconCircle}>
            <FileText size={40} color={colors.primary} />
          </View>
          <AppText style={[styles.title, { color: colors.text }]}>
            {quiz.title}
          </AppText>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <AppText style={styles.metaLabel}>{quiz.year}</AppText>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color={colors.textSecondary} />
              <AppText style={styles.metaLabel}>{quiz.ageCategory}</AppText>
            </View>
            <View style={styles.metaItem}>
              <User size={16} color={colors.textSecondary} />
              <AppText style={styles.metaLabel}>{quiz.genderCategory}</AppText>
            </View>
          </View>

          <Button
            title="Open Study Material (PDF)"
            onPress={() => Linking.openURL(quiz.pdfUrl)}
            style={styles.mainBtn}
          />
        </View>

        <View style={styles.helpSection}>
          <AppText style={[styles.helpTitle, { color: colors.text }]}>
            Need Clarification?
          </AppText>
          <AppText style={[styles.helpDesc, { color: colors.textSecondary }]}>
            If you're confused about any question in this study material, ask
            our admins for help.
          </AppText>
          <TouchableOpacity
            style={[styles.helpBtn, { backgroundColor: colors.primary + '10' }]}
            onPress={() =>
              router.push({
                pathname: `/profile/quizresources/${id}/questions`,
                params: { id, title: quiz.title },
              })
            }
          >
            <HelpCircle size={20} color={colors.primary} />
            <AppText style={[styles.helpBtnText, { color: colors.primary }]}>
              Ask a Question
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  card: { padding: 25, borderRadius: 20, alignItems: 'center', elevation: 4 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  metaGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  mainBtn: { width: '100%' },

  helpSection: { marginTop: 40, alignItems: 'center' },
  helpTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  helpDesc: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    gap: 10,
  },
  divider: {
    height: 0.5,
    width: '100%',
    color: '#666',
    backgroundColor: '#666',
    marginBottom: 10,
  },
  helpBtnText: { fontWeight: 'bold', fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalSub: { fontSize: 14, color: '#666', marginBottom: 10 },
  messageInput: { textAlignVertical: 'top', height: 120, marginBottom: 20 },
});
