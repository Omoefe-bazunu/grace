// app/(tabs)/sermons/text/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Search, BookOpen, ChevronRight } from 'lucide-react-native';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import {
  getSermonsByCategoryPaginated,
  searchContentPaginated,
} from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';
import { AppText } from '../../../../components/ui/AppText';

const SERMON_CATEGORIES = [
  'Weekly Sermon Volume 1',
  'Weekly Sermon Volume 2',
  "God's Kingdom Advocate Volume 1",
  "God's Kingdom Advocate Volume 2",
  "God's Kingdom Advocate Volume 3",
  'Abridged Bible Subjects',
  'The Ten Fundamental Truths',
  "GKS President's Feast Message",
  "GKS President's Freedom Day Message",
  "GKS President's Youth Assembly Message",
  'Sermon Summaries',
  'Questions and Answers',
];

export default function TextSermonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categorizedSermons, setCategorizedSermons] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  const loadSermons = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const result = {};

      for (const cat of SERMON_CATEGORIES) {
        const data = await getSermonsByCategoryPaginated(cat, 1000, null);
        result[cat] = data.sermons || [];
      }

      setCategorizedSermons(result);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        loadSermons(true);
        return;
      }
      try {
        setRefreshing(true);
        const { sermons } = await searchContentPaginated(
          query,
          null,
          100,
          null,
        );
        const grouped = SERMON_CATEGORIES.reduce(
          (acc, cat) => ({ ...acc, [cat]: [] }),
          {},
        );
        sermons.forEach((s) => {
          if (grouped[s.category]) grouped[s.category].push(s);
        });
        setCategorizedSermons(grouped);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setRefreshing(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const openCategory = (category) => setExpandedCategory(category);
  const closeModal = () => setExpandedCategory(null);

  const categoriesWithSermons = SERMON_CATEGORIES.filter(
    (cat) => categorizedSermons[cat]?.length > 0,
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FSERMON.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
          }}
          style={styles.bannerImage}
        >
          <LinearGradient
            colors={['transparent', 'black']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <AppText style={styles.bannerTitle}>TEXT SERMONS</AppText>
            <AppText style={styles.bannerSubtitle}>
              Read and study God's word with full text sermons.
            </AppText>
          </View>
        </ImageBackground>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: '#fff' }]}>
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search sermons..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : categoriesWithSermons.length === 0 ? (
        <View style={styles.empty}>
          <BookOpen size={64} color={colors.textSecondary} />
          <AppText style={[styles.emptyText, { color: colors.text }]}>
            {searchQuery ? 'No sermons found' : 'No text sermons available'}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={categoriesWithSermons}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSermons(true)}
            />
          }
          renderItem={({ item: category }) => {
            const sermons = categorizedSermons[category] || [];
            const filtered = searchQuery
              ? sermons.filter((s) =>
                  (s.translations?.en?.title || s.title || '')
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
              : sermons;

            if (filtered.length === 0 && searchQuery) return null;

            return (
              <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: colors.card }]}
                onPress={() => openCategory(category)}
              >
                <View style={styles.categoryHeader}>
                  <AppText
                    style={[styles.categoryTitle, { color: colors.text }]}
                  >
                    {category}
                  </AppText>
                  <AppText
                    style={[
                      styles.categoryCount,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {filtered.length} sermon{filtered.length !== 1 ? 's' : ''}
                  </AppText>
                </View>
                <ChevronRight size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* MODAL – Replaces old accordion */}
      <Modal
        visible={!!expandedCategory}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <AppText style={{ fontSize: 36, color: colors.textSecondary }}>
                  ×
                </AppText>
              </TouchableOpacity>
              <AppText style={[styles.modalTitle, { color: colors.text }]}>
                {expandedCategory} (
                {categorizedSermons[expandedCategory]?.length || 0})
              </AppText>
            </View>

            <FlatList
              data={categorizedSermons[expandedCategory] || []}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item: sermon }) => {
                const title =
                  sermon.translations?.[translations.currentLanguage]?.title ||
                  sermon.title ||
                  'Untitled';
                return (
                  <TouchableOpacity
                    style={styles.sermonRow}
                    onPress={() => {
                      closeModal();
                      router.push(`/(tabs)/sermons/text/${sermon.id}`);
                    }}
                  >
                    <View style={styles.sermonText}>
                      <AppText
                        style={[styles.sermonTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {title}
                      </AppText>
                    </View>
                    <ChevronRight size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  bannerContainer: { height: 180, overflow: 'hidden', marginBottom: 10 },
  bannerImage: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  bannerText: { paddingHorizontal: 40, alignItems: 'center' },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -100,
    marginBottom: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeader: { flex: 1 },
  categoryTitle: { fontSize: 17, fontWeight: '600' },
  categoryCount: { fontSize: 14, marginTop: 4, opacity: 0.8 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: { fontSize: 18, marginTop: 16, textAlign: 'center' },

  // Modal styles – centered & spacious
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // safe from bottom tab
  },
  modalContent: {
    maxHeight: '88%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  sermonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  sermonText: { flex: 1 },
  sermonTitle: { fontSize: 17, fontWeight: '600' },
});
