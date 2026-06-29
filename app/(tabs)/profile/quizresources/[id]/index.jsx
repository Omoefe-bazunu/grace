import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import {
  FileText,
  HelpCircle,
  Calendar,
  User,
  Users,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizResource } from '@/services/dataService';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';

const toPreviewUrl = (url) => {
  if (!url) return url;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url;
};

const ENABLE_ZOOM_JS = `
  (function() {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
  })();
  true;
`;

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { translations } = useLanguage();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);

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
      <TopNavigation
        showBackButton
        title={translations.quizDetailNavTitle || 'Quiz Details'}
      />
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
            title={translations.openStudyMaterial || 'Open Study Material'}
            onPress={() => {
              setWebViewLoading(true);
              setPdfOpen(true);
            }}
            style={styles.mainBtn}
          />
        </View>

        <View style={styles.helpSection}>
          <AppText style={[styles.helpTitle, { color: colors.text }]}>
            {translations.needClarification || 'Need Clarification?'}
          </AppText>
          <AppText style={[styles.helpDesc, { color: colors.textSecondary }]}>
            {translations.clarificationDesc ||
              "If you're confused about any question in this study material, ask our admins for help."}
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
              {translations.askQuestion || 'Ask a Question'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* In-app PDF Viewer Modal */}
      <Modal
        visible={pdfOpen}
        animationType="slide"
        onRequestClose={() => setPdfOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setPdfOpen(false)}
              style={styles.closeBtn}
            >
              <X size={22} color="#fff" />
            </TouchableOpacity>
            <AppText style={styles.modalTitle} numberOfLines={1}>
              {quiz.title}
            </AppText>
            <View style={{ width: 40 }} />
          </View>

          {/* WebView */}
          <WebView
            source={{ uri: toPreviewUrl(quiz.pdfUrl) }}
            style={{ flex: 1 }}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            injectedJavaScript={ENABLE_ZOOM_JS}
            scalesPageToFit={false} // ← add this
            setSupportMultipleWindows={false} // ← add this
            renderLoading={() => (
              <View style={styles.webViewLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText style={{ color: '#fff', marginTop: 12, fontSize: 13 }}>
                  Loading document...
                </AppText>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
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
  helpBtnText: { fontWeight: 'bold', fontSize: 15 },
  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: { padding: 4 },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
});
