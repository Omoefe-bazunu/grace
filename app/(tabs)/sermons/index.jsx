// app/(tabs)/sermons/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../components/TopNavigation';
import {
  getSermonsByCategoryPaginated,
  searchContentPaginated,
} from '../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';

const SERMON_CATEGORIES = [
  'Weekly Sermon Volume 1',
  'Weekly Sermon Volume 2',
  "God's Kingdom Advocate Volume 1",
  "God's Kingdom Advocate Volume 2",
  "God's Kingdom Advocate Volume 3",
  'Abridged Bible Subjects',
];

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.categoryCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonCategory}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonCount}
      />
    </View>
  );
};

const SermonItem = ({ sermon, colors, translations, onPress }) => {
  const content = sermon.translations?.[translations.currentLanguage] || sermon;

  return (
    <TouchableOpacity
      style={[styles.sermonItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.sermonItemContent}>
        <Text
          style={[styles.sermonItemTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {content.title || translations.noTitle}
        </Text>
        <View style={styles.sermonItemFooter}>
          <BookOpen size={14} color={colors.primary} />
          <Text style={[styles.readMoreText, { color: colors.primary }]}>
            {translations.readFull || 'Read full sermon'}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const CategoryCard = ({
  category,
  sermons,
  colors,
  translations,
  isExpanded,
  onToggle,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const [animation] = useState(new Animated.Value(isExpanded ? 1 : 0));
  const [localSermons, setLocalSermons] = useState(sermons);
  const [nextCursor, setNextCursor] = useState(null);

  // Update local sermons when prop changes
  useEffect(() => {
    if (sermons.length > 0 && sermons[0]?.id !== localSermons[0]?.id) {
      setLocalSermons(sermons);
      setNextCursor(null);
    }
  }, [sermons]);

  const sortedSermons = [...localSermons].sort((a, b) => {
    const titleA = (
      a.translations?.[translations.currentLanguage]?.title ||
      a.title ||
      ''
    ).toLowerCase();
    const titleB = (
      b.translations?.[translations.currentLanguage]?.title ||
      b.title ||
      ''
    ).toLowerCase();
    return titleA.localeCompare(titleB);
  });

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    try {
      const moreSermons = await onLoadMore(category, nextCursor);
      if (moreSermons.sermons.length > 0) {
        setLocalSermons((prev) => [...prev, ...moreSermons.sermons]);
        setNextCursor(moreSermons.nextCursor);
      }
    } catch (error) {
      console.error('Error loading more sermons:', error);
    }
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.categoryCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.categoryHeaderLeft}>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <ChevronDown size={24} color={colors.primary} />
          </Animated.View>
          <View>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {category}
            </Text>
            <Text
              style={[styles.categoryCount, { color: colors.textSecondary }]}
            >
              {localSermons.length}{' '}
              {localSermons.length === 1
                ? translations.sermon
                : translations.sermons}
              {hasMore && '+'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sermonsContainer}>
          {sortedSermons.map((sermon) => (
            <SermonItem
              key={sermon.id}
              sermon={sermon}
              colors={colors}
              translations={translations}
              onPress={() => router.push(`/(tabs)/sermons/${sermon.id}`)}
            />
          ))}

          {hasMore && (
            <TouchableOpacity
              style={[
                styles.loadMoreButton,
                { borderColor: colors.primary + '30' },
              ]}
              onPress={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                  Load More Sermons
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default function SermonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categorizedSermons, setCategorizedSermons] = useState({});
  const [categoryMetadata, setCategoryMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const { translations, currentLanguage } = useLanguage();
  const { colors } = useTheme();

  // Load initial sermons with pagination
  const loadSermons = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setCategorizedSermons({});
        setCategoryMetadata({});
      }

      const initialSermons = {};
      const metadata = {};

      // Load first page for each category
      for (const category of SERMON_CATEGORIES) {
        const result = await getSermonsByCategoryPaginated(category, 10, null);
        initialSermons[category] = result.sermons;
        metadata[category] = {
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          totalCount: result.totalCount,
        };
      }

      setCategorizedSermons(initialSermons);
      setCategoryMetadata(metadata);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      setCategorizedSermons({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more sermons for a specific category
  const loadMoreSermons = async (category, cursor) => {
    try {
      setLoadingMore(true);
      const result = await getSermonsByCategoryPaginated(category, 10, cursor);

      // Update metadata
      setCategoryMetadata((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        },
      }));

      return result;
    } catch (error) {
      console.error('Error loading more sermons:', error);
      return { sermons: [], hasMore: false, nextCursor: null };
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSermons();
  }, []);

  // Pull to refresh handler
  const onRefresh = () => {
    loadSermons(true);
  };

  // Debounced search with pagination
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        loadSermons(true);
        return;
      }

      try {
        setRefreshing(true);
        const results = await searchContentPaginated(query, null, 50, null);
        const grouped = SERMON_CATEGORIES.reduce((acc, cat) => {
          acc[cat] = [];
          return acc;
        }, {});

        results.sermons.forEach((sermon) => {
          const cat = sermon.category || 'Uncategorized';
          if (grouped[cat]) grouped[cat].push(sermon);
        });

        setCategorizedSermons(grouped);

        // Reset metadata for search results
        const searchMetadata = {};
        SERMON_CATEGORIES.forEach((cat) => {
          searchMetadata[cat] = {
            hasMore: false,
            nextCursor: null,
            totalCount: grouped[cat]?.length || 0,
          };
        });
        setCategoryMetadata(searchMetadata);
      } catch (error) {
        console.error('Search error:', error);
        setCategorizedSermons({});
      } finally {
        setRefreshing(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderCategoryItem = ({ item: category }) => (
    <CategoryCard
      category={category}
      sermons={categorizedSermons[category] || []}
      colors={colors}
      translations={{ ...translations, currentLanguage }}
      isExpanded={expandedCategories[category]}
      onToggle={() => toggleCategory(category)}
      onLoadMore={loadMoreSermons}
      hasMore={categoryMetadata[category]?.hasMore}
      isLoadingMore={loadingMore}
    />
  );

  const renderSkeletonCards = () =>
    SERMON_CATEGORIES.map((cat) => <SkeletonCard key={cat} />);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BookOpen size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery
          ? translations.noSearchResults || 'No sermons found'
          : translations.noSermons || 'No sermons available'}
      </Text>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.sermons} />

      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={translations.search}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>
      <View style={{ height: 10 }} />
      {/* Audio Sermons */}
      <View
        style={[
          styles.categoryCard,
          { backgroundColor: colors.card, marginHorizontal: 18 },
        ]}
      >
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => router.push('/(tabs)/sermons/audio')}
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeaderLeft}>
            <View>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                Sermon Audio Clips
              </Text>
              <Text
                style={[styles.categoryCount, { color: colors.textSecondary }]}
              >
                Listen to your edifying sermons.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {/* Text Sermons */}
      {loading ? (
        <View
          style={[styles.listContainer, { backgroundColor: colors.background }]}
        >
          {renderSkeletonCards()}
        </View>
      ) : (
        <FlatList
          data={SERMON_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          contentContainerStyle={[
            styles.listContainer,
            { backgroundColor: colors.background },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={7}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 40,
    paddingVertical: 8,
    height: 40,
    marginBottom: 0,
  },
  listContainer: {
    padding: 20,
  },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  categoryHeader: {
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    opacity: 0.8,
  },
  sermonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  sermonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#c4c1c1ff',
  },
  sermonItemContent: {
    flex: 1,
  },
  sermonItemTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 20,
  },
  sermonItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadMoreButton: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skeletonCategory: {
    height: 24,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 16,
  },
  skeletonCount: {
    height: 14,
    width: 100,
    borderRadius: 4,
    marginLeft: 16,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
