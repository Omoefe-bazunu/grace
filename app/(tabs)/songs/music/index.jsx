// MusicScreen.js (Fixed with Better Error Handling - Pure JavaScript)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, Play, Clock } from 'lucide-react-native';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import {
  getSongsByCategoryPaginated,
  getSongsPaginated,
  searchContentPaginated,
} from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.songCard, { backgroundColor: colors.card }]}>
      <View style={styles.songInfo}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonStyle}
        />
        <View style={styles.songMeta}>
          <LinearGradient
            colors={[colors.skeleton, colors.skeletonHighlight]}
            style={styles.skeletonMeta}
          />
        </View>
      </View>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonPlayButton}
      />
    </View>
  );
};

export default function MusicScreen() {
  const { category } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // Load songs by category with pagination
  const loadSongs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      }

      setError(null);

      // Log the category being requested
      console.log('Loading songs for category:', category);

      let result;

      if (category && category !== 'all') {
        // Try with category filter
        try {
          result = await getSongsByCategoryPaginated(
            category,
            15,
            isRefresh ? null : nextCursor
          );
          console.log('Category result:', {
            count: result.songs.length,
            hasMore: result.hasMore,
            nextCursor: result.nextCursor,
          });
        } catch (categoryError) {
          console.error(
            'Category filter failed, falling back to all songs:',
            categoryError
          );
          // Fallback: Get all songs and filter client-side
          const allSongsResult = await getSongsPaginated(
            15,
            isRefresh ? null : nextCursor
          );
          result = {
            songs: allSongsResult.songs.filter((s) => s.category === category),
            hasMore: allSongsResult.hasMore,
            nextCursor: allSongsResult.nextCursor,
            totalCount: allSongsResult.totalCount,
          };
        }
      } else {
        // Get all songs if no category specified
        result = await getSongsPaginated(15, isRefresh ? null : nextCursor);
        console.log('All songs result:', {
          count: result.songs.length,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        });
      }

      if (isRefresh) {
        setSongs(result.songs);
      } else {
        setSongs(result.songs);
      }

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setError(error.message || 'Failed to load songs');
      setSongs([]);
      setHasMore(false);

      // Show user-friendly error
      Alert.alert(
        'Error Loading Songs',
        'Unable to load songs. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more songs
  const loadMoreSongs = async () => {
    if (loadingMore || !hasMore || !nextCursor || searchQuery) return;

    try {
      setLoadingMore(true);
      console.log('Loading more songs with cursor:', nextCursor);

      let result;

      if (category && category !== 'all') {
        try {
          result = await getSongsByCategoryPaginated(category, 15, nextCursor);
        } catch (categoryError) {
          console.error(
            'Category filter failed for pagination:',
            categoryError
          );
          // Fallback: Get all songs and filter client-side
          const allSongsResult = await getSongsPaginated(15, nextCursor);
          result = {
            songs: allSongsResult.songs.filter((s) => s.category === category),
            hasMore: allSongsResult.hasMore,
            nextCursor: allSongsResult.nextCursor,
            totalCount: allSongsResult.totalCount,
          };
        }
      } else {
        result = await getSongsPaginated(15, nextCursor);
      }

      console.log('More songs loaded:', result.songs.length);

      setSongs((prev) => [...prev, ...result.songs]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading more songs:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, [category]);

  const onRefresh = () => {
    loadSongs(true);
  };

  // Debounced search with pagination
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        // Refetch by category when search is cleared
        loadSongs(true);
        return;
      }

      try {
        setLoading(true);
        console.log('Searching for:', query, 'in category:', category);

        const results = await searchContentPaginated(query, category, 50, null);
        console.log('Search results:', results.songs.length);

        const filtered =
          category && category !== 'all'
            ? results.songs.filter((s) => s.category === category)
            : results.songs;

        setSongs(filtered);
        setHasMore(false); // Disable infinite scroll during search
        setNextCursor(null);
      } catch (error) {
        console.error('Search error:', error);
        setSongs([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 500),
    [category]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.songCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/songs/music/${item.id}`)}
    >
      <View style={styles.songInfo}>
        <Text
          style={[styles.songTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title || translations.noTitle}
        </Text>
        <Text style={[styles.songStyle, { color: colors.textSecondary }]}>
          {item.style || translations.unknownStyle}
        </Text>
        <View style={styles.songMeta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            •
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.category || translations.unknownCategory}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: colors.primaryLight || colors.primary },
        ]}
      >
        <Play size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more songs...
        </Text>
      </View>
    );
  };

  const renderSkeletonCards = () => (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Search size={64} color={colors.textSecondary} opacity={0.5} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {searchQuery
            ? 'No songs found'
            : error
            ? 'Unable to load songs'
            : 'No songs available'}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          {error ||
            (searchQuery ? 'Try a different search term' : 'Check back later')}
        </Text>
        {error && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => loadSongs(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleEndReached = () => {
    if (!loading && !loadingMore && hasMore && !searchQuery.trim()) {
      loadMoreSongs();
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation title={category || translations.music} />
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/songs`)}
        style={styles.backButton}
      >
        <Text style={[styles.backText, { color: colors.primary }]}>
          Return Back
        </Text>
      </TouchableOpacity>

      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={translations.search || 'Search songs...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Results Count */}
      {!loading && songs.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            {searchQuery ? ' found' : ' available'}
            {hasMore && !searchQuery && '+'}
          </Text>
        </View>
      )}

      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { backgroundColor: colors.background },
          songs.length === 0 && styles.listContainerEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? renderSkeletonCards() : renderEmptyState()
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    width: '90%',
    marginHorizontal: 'auto',
    borderRadius: 12,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 16,
    marginHorizontal: 'auto',
    marginVertical: 10,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 40,
    paddingVertical: 8,
    height: 40,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  listContainer: {
    padding: 20,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  songCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songStyle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.9,
  },
  playButton: {
    borderRadius: 25,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonStyle: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonMeta: {
    height: 12,
    width: 100,
    borderRadius: 4,
  },
  skeletonPlayButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
