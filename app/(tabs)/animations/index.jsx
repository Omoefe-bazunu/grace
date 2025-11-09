import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  Play,
  Clock,
  Film,
  Sparkles,
  PlayIcon,
} from 'lucide-react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  getVideosPaginated,
  searchContentPaginated,
} from '../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';
import { TopNavigation } from '../../../components/TopNavigation';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.videoCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.thumbnail}
      />
      <View style={styles.videoInfo}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonMeta}
        />
      </View>
    </View>
  );
};

export default function AnimationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      }

      const result = await getVideosPaginated(12, null); // Load first 12 videos
      setVideos(result.videos);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreVideos = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const result = await getVideosPaginated(12, nextCursor);
      setVideos((prev) => [...prev, ...result.videos]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const onRefresh = () => {
    loadVideos(true);
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        // Refetch all videos when search is cleared
        loadVideos(true);
        return;
      }
      try {
        setLoading(true);
        const results = await searchContentPaginated(query, null, 20, null);
        setVideos(results.videos);
        setHasMore(results.pagination?.hasMore || false);
        setNextCursor(results.pagination?.nextCursor || null);
      } catch (error) {
        console.error('Error searching videos:', error);
        setVideos([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 500), // Increased debounce for better performance
    []
  );

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
    }
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/animations/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.thumbnailGradient}
        />
        <View style={styles.playOverlay}>
          <View
            style={[styles.playButton, { backgroundColor: colors.primary }]}
          >
            <Play size={28} color="#fff" fill="#fff" />
          </View>
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text
          style={[styles.videoTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <View
          style={[
            styles.videoBadge,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <PlayIcon size={12} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            Watch Now
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more videos...
        </Text>
      </View>
    );
  };

  const renderSkeletonCards = () => (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: colors.primary + '15' },
        ]}
      >
        <Film size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery ? 'No videos found' : 'No animations available'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery
          ? 'Try adjusting your search terms'
          : 'Check back later for new content'}
      </Text>
    </View>
  );

  const handleEndReached = () => {
    if (!loading && !loadingMore && hasMore && !searchQuery) {
      loadMoreVideos();
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.animations} />

      {/* Enhanced Search Bar */}
      <View style={styles.searchWrapper}>
        <LinearGradient
          colors={[colors.primary + '08', 'transparent']}
          style={styles.searchGradient}
        />
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <View
            style={[
              styles.searchIconContainer,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Search size={18} color={colors.primary} />
          </View>
          <TextInput
            placeholder={translations.search || 'Search animations...'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Count */}
      {!loading && videos.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            {searchQuery ? ' found' : ' available'}
            {hasMore && !searchQuery && '+'}
          </Text>
        </View>
      )}

      <FlatList
        data={loading ? [] : videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.headerSpacer} />}
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
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  searchGradient: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    height: 100,
    borderRadius: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  videoCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 140,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  videoInfo: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 10,
    lineHeight: 20,
    minHeight: 40,
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonMeta: {
    height: 24,
    width: 80,
    borderRadius: 8,
  },
  headerSpacer: {
    height: 4,
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
});
