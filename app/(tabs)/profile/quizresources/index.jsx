import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Search, FileText, Download, ChevronRight } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { getQuizResources } from '@/services/dataService';
import { AppText } from '../../../../components/ui/AppText';
import debounce from 'lodash.debounce';

const QuizCard = ({ item, colors }) => {
  const openPdf = () => {
    if (item.pdfUrl) Linking.openURL(item.pdfUrl);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardMain}>
        <View style={styles.iconContainer}>
          <FileText size={24} color={colors.primary} />
        </View>
        <View style={styles.infoContainer}>
          <AppText
            style={[styles.quizTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </AppText>
          <View style={styles.tagRow}>
            <View
              style={[styles.tag, { backgroundColor: colors.primary + '15' }]}
            >
              <AppText style={[styles.tagText, { color: colors.primary }]}>
                {item.year}
              </AppText>
            </View>
            <View style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
              <AppText style={styles.tagText}>{item.ageCategory}</AppText>
            </View>
            <View style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
              <AppText style={styles.tagText}>{item.genderCategory}</AppText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={openPdf}
        >
          <Download size={16} color="#FFF" />
          <AppText style={styles.actionBtnText}>Download PDF</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.detailsBtn, { borderColor: colors.border }]}
          onPress={() =>
            router.push(`/(tabs)/profile/quizresources/${item.id}`)
          }
        >
          <AppText
            style={[styles.detailsBtnText, { color: colors.textSecondary }]}
          >
            Details
          </AppText>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function QuizResourcesScreen() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getQuizResources();
      setQuizzes(data);
      setFilteredQuizzes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    debounce((query) => {
      const lowerQuery = query.toLowerCase();
      const filtered = quizzes.filter(
        (q) =>
          q.title.toLowerCase().includes(lowerQuery) ||
          q.year.toString().includes(lowerQuery) ||
          q.ageCategory.toLowerCase().includes(lowerQuery) ||
          q.genderCategory.toLowerCase().includes(lowerQuery),
      );
      setFilteredQuizzes(filtered);
    }, 300),
    [quizzes],
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Quiz " />

      <View style={styles.container}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search by title, year, or category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={filteredQuizzes}
            renderItem={({ item }) => <QuizCard item={item} colors={colors} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <AppText style={{ color: colors.textSecondary }}>
                  No resources found.
                </AppText>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  cardMain: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: { flex: 1 },
  quizTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  detailsBtnText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 100 },
});
