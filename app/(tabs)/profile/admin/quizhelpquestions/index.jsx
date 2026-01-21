import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  MessageCircle,
  User,
  BookOpen,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getQuizHelpQuestions,
  updateQuizHelpStatus,
  del,
} from '@/services/dataService';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '../../../../../components/ui/AppText';

export default function AdminQuizHelpScreen() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuizHelpQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await updateQuizHelpStatus(id, 'resolved');
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'resolved' } : q)),
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this inquiry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await del('quiz/help', id);
          setQuestions((prev) => prev.filter((q) => q.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'resolved' ? '#ECFDF5' : '#FFF7ED',
            },
          ]}
        >
          {item.status === 'resolved' ? (
            <CheckCircle size={12} color="#10B981" />
          ) : (
            <Clock size={12} color="#F97316" />
          )}
          <AppText
            style={[
              styles.statusText,
              { color: item.status === 'resolved' ? '#10B981' : '#F97316' },
            ]}
          >
            {item.status.toUpperCase()}
          </AppText>
        </View>
        <AppText style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </AppText>
      </View>

      {/* Student Info Bar */}
      <View style={styles.studentInfoBar}>
        <View style={styles.studentNameContainer}>
          <User size={16} color={colors.textSecondary} />
          <AppText style={[styles.studentName, { color: colors.text }]}>
            {item.name || 'Anonymous'}
          </AppText>
        </View>

        <TouchableOpacity>
          <AppText>{item.number}</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.quizMeta}>
        <BookOpen size={14} color={colors.primary} />
        <AppText style={[styles.quizTitle, { color: colors.primary }]}>
          {item.title || 'General Quiz'}
        </AppText>
      </View>

      <AppText style={[styles.questionText, { color: colors.text }]}>
        {item.question}
      </AppText>

      <View style={styles.cardActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.resolveBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleResolve(item.id)}
          >
            <AppText style={styles.btnText}>Mark Resolved</AppText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.trashBtn, { borderColor: colors.error }]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Quiz Support" />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} />
      ) : (
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <AlertCircle size={48} color={colors.textSecondary} />
              <AppText style={{ color: colors.textSecondary, marginTop: 10 }}>
                No student questions.
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  date: { fontSize: 11, opacity: 0.6 },
  studentInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  studentNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  studentName: { fontSize: 15, fontWeight: '700' },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  whatsappBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  quizTitle: { fontSize: 13, fontWeight: '600' },
  questionText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  resolveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  trashBtn: { padding: 8, borderRadius: 8, borderWidth: 1 },
  emptyState: { alignItems: 'center', marginTop: 100 },
});
