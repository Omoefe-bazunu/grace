import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  FileText,
  ChevronRight,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { getQuizResources } from '@/services/dataService';
import { AppText } from '../../../../components/ui/AppText';
import debounce from 'lodash.debounce';

const QuizCard = ({ item, colors, translations }) => {
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
          style={[styles.detailsBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push(`/(tabs)/profile/quizresources/${item.id}`)
          }
        >
          <AppText style={[styles.detailsBtnText, { color: '#ffffff' }]}>
            {translations.details || 'Details'}
          </AppText>
          <ChevronRight size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function QuizResourcesScreen() {
  const [quizzes, setQuizzes] = useState([]);
  const [groupedByYear, setGroupedByYear] = useState({});
  const [expandedYear, setExpandedYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();
  const { translations } = useLanguage();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getQuizResources();
      setQuizzes(data);

      const grouped = {};
      data.forEach((resource) => {
        const year = resource.year || translations.unknownYear || 'Other';
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(resource);
      });

      const sortedYears = Object.keys(grouped).sort((a, b) =>
        b.localeCompare(a),
      );
      const ordered = {};
      sortedYears.forEach((y) => (ordered[y] = grouped[y]));

      setGroupedByYear(ordered);
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

  const toggleYear = (year) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  const years = Object.keys(groupedByYear);

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton />

      <View style={styles.container}>
        {/* ── Search bar ── */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            placeholder={
              translations.quizSearchPlaceholder ||
              'Search by title, year, or category...'
            }
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
        ) : searchQuery ? (
          // ── Search results — flat list, no year grouping ──
          <FlatList
            data={filteredQuizzes}
            renderItem={({ item }) => (
              <QuizCard
                item={item}
                colors={colors}
                translations={translations}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <AppText style={{ color: colors.textSecondary }}>
                  {translations.noResourcesFound || 'No resources found.'}
                </AppText>
              </View>
            }
          />
        ) : years.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color={colors.textSecondary} />
            <AppText style={[styles.emptyText, { color: colors.text }]}>
              {translations.noQuizResources || 'No quiz resources available'}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={years}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: year }) => {
              const resources = groupedByYear[year];

              return (
                <View style={styles.yearSection}>
                  <TouchableOpacity
                    style={[
                      styles.yearHeader,
                      { backgroundColor: colors.card },
                    ]}
                    onPress={() => toggleYear(year)}
                  >
                    <View style={styles.yearInfo}>
                      <Calendar size={20} color={colors.primary} />
                      <AppText
                        style={[styles.yearText, { color: colors.text }]}
                      >
                        {year}
                      </AppText>
                      <AppText
                        style={[
                          styles.countText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {resources.length}{' '}
                        {resources.length !== 1
                          ? translations.materialsCountPlural || 'materials'
                          : translations.materialCountSingular || 'material'}
                      </AppText>
                    </View>
                    {expandedYear === year ? (
                      <ChevronUp size={24} color={colors.textSecondary} />
                    ) : (
                      <ChevronDown size={24} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  <Modal
                    visible={expandedYear === year}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setExpandedYear(null)}
                  >
                    <View style={styles.modalOverlay}>
                      <View
                        style={[
                          styles.modalContent,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <View style={styles.modalHeader}>
                          <AppText
                            style={[styles.modalTitle, { color: colors.text }]}
                          >
                            {year} {translations.materialsLabel || 'Materials'}{' '}
                            ({resources.length})
                          </AppText>
                          <TouchableOpacity
                            onPress={() => setExpandedYear(null)}
                          >
                            <AppText
                              style={{
                                fontSize: 36,
                                color: colors.textSecondary,
                                marginTop: -8,
                              }}
                            >
                              ×
                            </AppText>
                          </TouchableOpacity>
                        </View>

                        <FlatList
                          data={resources}
                          keyExtractor={(item) => item.id}
                          renderItem={({ item }) => (
                            <QuizCard
                              item={item}
                              colors={colors}
                              translations={translations}
                            />
                          )}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={{
                            paddingBottom: 20,
                            paddingTop: 12,
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
                </View>
              );
            }}
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
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },

  // Year rows
  yearSection: { marginBottom: 16 },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  yearInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yearText: { fontSize: 18, fontWeight: 'bold' },
  countText: { fontSize: 14, marginLeft: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
    marginBottom: 12,
  },
  modalContent: {
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    marginHorizontal: 20,
  },
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  detailsBtnText: { fontSize: 13, fontWeight: '600' },

  empty: { alignItems: 'center', marginTop: 100 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
});
