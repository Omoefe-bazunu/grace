import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Search, ChevronRight, X } from 'lucide-react-native';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import {
  searchSermons,
  getSermonsByCategoryPaginated,
  searchContentPaginated,
} from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';
import { AppText } from '../../../../components/ui/AppText';
// import { SERMONBG } from '../../../../assets/images';

const { height } = Dimensions.get('window');

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

// ✅ Infers a sermon's language even if the `language` field wasn't written at upload time.
// Covers: new uploads (explicit `language` field), translated-only docs (infer from translations
// keys), and old flat-content docs (no language field, no translations wrapper → English).
const getSermonLanguage = (sermon) => {
  if (sermon.language) return sermon.language;
  if (sermon.translations) {
    const langs = Object.keys(sermon.translations);
    if (langs.length === 1) return langs[0];
  }
  return 'en';
};

export default function TextSermonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categorizedSermons, setCategorizedSermons] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal Pagination States
  const [modalLoadingMore, setModalLoadingMore] = useState(false);
  const [modalHasMore, setModalHasMore] = useState(true);
  const [modalNextCursor, setModalNextCursor] = useState(null);

  const { translations, currentLanguage } = useLanguage();
  const { colors } = useTheme();

  const loadSermons = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const fetchPromises = SERMON_CATEGORIES.map((cat) =>
        getSermonsByCategoryPaginated(cat, 15, null),
      );

      const resultsArray = await Promise.all(fetchPromises);

      const result = {};
      SERMON_CATEGORIES.forEach((cat, index) => {
        const all = resultsArray[index].sermons || [];
        // ✅ Use helper so old docs (no language field) still filter correctly
        result[cat] = all.filter(
          (s) => getSermonLanguage(s) === currentLanguage,
        );
      });

      setCategorizedSermons(result);
    } catch (err) {
      console.error('Parallel Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, [currentLanguage]);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      const trimmed = query.trim();
      if (!trimmed) {
        loadSermons(true);
        return;
      }
      try {
        setRefreshing(true);
        const sermons = await searchSermons(trimmed);
        // const { sermons } = await searchContentPaginated(
        //   trimmed,
        //   null,
        //   100,
        //   null,
        // );
        const grouped = SERMON_CATEGORIES.reduce(
          (acc, cat) => ({ ...acc, [cat]: [] }),
          {},
        );
        sermons
          .filter((s) => getSermonLanguage(s) === currentLanguage)
          .forEach((s) => {
            if (grouped[s.category]) grouped[s.category].push(s);
          });
        setCategorizedSermons(grouped);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setRefreshing(false);
      }
    }, 400),
    [currentLanguage],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const openCategory = async (category) => {
    setExpandedCategory(category);
    setModalLoadingMore(false);

    const initialSermons = categorizedSermons[category] || [];
    if (initialSermons.length > 0) {
      setModalNextCursor(initialSermons[initialSermons.length - 1].id);
      setModalHasMore(initialSermons.length >= 15);
    }
  };

  const loadMoreInModal = async () => {
    if (modalLoadingMore || !modalHasMore || !modalNextCursor) return;

    setModalLoadingMore(true);
    try {
      const res = await getSermonsByCategoryPaginated(
        expandedCategory,
        15,
        modalNextCursor,
      );

      // Filter additional pages by language too
      const filtered = (res.sermons || []).filter(
        (s) => getSermonLanguage(s) === currentLanguage,
      );

      setCategorizedSermons((prev) => ({
        ...prev,
        [expandedCategory]: [...prev[expandedCategory], ...filtered],
      }));

      setModalNextCursor(res.nextCursor);
      setModalHasMore(res.hasMore);
    } catch (err) {
      setModalHasMore(false);
    } finally {
      setModalLoadingMore(false);
    }
  };

  const closeModal = () => {
    setExpandedCategory(null);
    setModalNextCursor(null);
  };

  const categoriesWithSermons = SERMON_CATEGORIES.filter(
    (cat) => categorizedSermons[cat]?.length > 0,
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation
        showBackButton={true}
        title={translations.sermons || 'Sermons'}
      />

      <ImageBackground
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2Fsermonsection.jpeg?alt=media&token=4ed2e960-ac18-401a-a9f6-e15dc5e30d16',
        }}
        style={styles.bannerImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
        />
        <View style={styles.bannerText}>
          <AppText style={styles.bannerTitle}>
            {translations.textSermonsBannerTitle || 'TEXT SERMONS'}
          </AppText>
          <AppText style={styles.bannerSubtitle}>
            {translations.textSermonsBannerSubtitle ||
              "Read and study God's word with full text sermons."}
          </AppText>
        </View>
      </ImageBackground>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={translations.searchPlaceholder || 'Search sermons...'}
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
      ) : (
        <FlatList
          data={categoriesWithSermons}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSermons(true)}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item: category }) => (
            <TouchableOpacity
              style={[
                styles.categoryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => openCategory(category)}
            >
              <View style={styles.categoryHeader}>
                <AppText style={[styles.categoryTitle, { color: colors.text }]}>
                  {translations[category] || category}
                </AppText>
                <AppText
                  style={[
                    styles.categoryCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  {categorizedSermons[category].length}+{' '}
                  {translations.subjectsCountLabel || 'subjects'}
                </AppText>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* MODAL – Infinite Scroll */}
      <Modal visible={!!expandedCategory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <AppText
                style={[styles.modalTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {translations[expandedCategory] || expandedCategory}
              </AppText>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categorizedSermons[expandedCategory] || []}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreInModal}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                modalLoadingMore && (
                  <ActivityIndicator
                    color={colors.primary}
                    style={{ margin: 20 }}
                  />
                )
              }
              renderItem={({ item: sermon }) => (
                <TouchableOpacity
                  style={[
                    styles.sermonRow,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    closeModal();
                    router.push(`/(tabs)/sermons/text/${sermon.id}`);
                  }}
                >
                  <AppText
                    style={[styles.sermonTitleText, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {sermon.translations?.[currentLanguage]?.title ||
                      sermon.title ||
                      'Untitled'}
                  </AppText>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  bannerText: { alignItems: 'center', zIndex: 1, paddingHorizontal: 20 },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -25,
    marginBottom: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryHeader: { flex: 1 },
  categoryTitle: { fontSize: 16, fontWeight: '700' },
  categoryCount: { fontSize: 12, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.85,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: 10 },
  closeBtn: { padding: 5 },
  sermonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 25,
    borderBottomWidth: 1,
  },
  sermonTitleText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
});
