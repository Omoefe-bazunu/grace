import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  Play,
  PlayIcon,
  Video as VideoIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaWrapper } from './ui/SafeAreaWrapper';
import { TopNavigation } from './TopNavigation';
import { AppText } from './ui/AppText';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
};

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.videoCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[
          colors.skeleton || '#E5E7EB',
          colors.skeletonHighlight || '#F3F4F6',
        ]}
        style={styles.thumbnail}
      />
      <View style={styles.videoInfo}>
        <LinearGradient
          colors={[
            colors.skeleton || '#E5E7EB',
            colors.skeletonHighlight || '#F3F4F6',
          ]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[
            colors.skeleton || '#E5E7EB',
            colors.skeletonHighlight || '#F3F4F6',
          ]}
          style={styles.skeletonMeta}
        />
      </View>
    </View>
  );
};

/**
 * VideoListScreen — reusable video list screen.
 *
 * Props:
 *   fetchFn         {() => Promise<video[]>}               — initial/refresh fetch; returns array
 *   fetchMoreFn     {(cursor) => Promise<{items, hasMore, nextCursor}>} — optional; enables pagination
 *   searchFn        {(query, cursor) => Promise<{items, hasMore, nextCursor}>} — optional search
 *   itemsKey        {string}                               — key in fetchMoreFn/searchFn result holding items e.g. 'videos'
 *   routePrefix     {string}                               — navigation prefix e.g. '/(tabs)/animations'
 *   urlFields       {string[]}                             — ordered fields to try for YouTube URL
 *   bannerUri       {string}                               — banner image URL
 *   bannerTitle     {string}                               — banner heading
 *   bannerSubtitle  {string}                               — banner subheading
 *   searchPlaceholder {string}                             — search input placeholder
 *   emptyIcon       {ReactComponent}                       — Lucide icon for empty state
 *   emptyText       {string}                               — empty state message
 *   emptySearchText {string}                               — empty state message when searching
 *   showBackButton  {boolean}                              — TopNavigation back button
 *   topNavTitle     {string}                               — optional TopNavigation title
 *   pageSize        {number}                               — items per page (default 12)
 */
export default function VideoListScreen({
  fetchFn,
  fetchMoreFn,
  searchFn,
  itemsKey = 'videos',
  routePrefix,
  urlFields = ['videoUrl', 'youtubeId'],
  bannerUri,
  bannerTitle,
  bannerSubtitle,
  searchPlaceholder = 'Search...',
  emptyIcon: EmptyIcon = VideoIcon,
  emptyText = 'No videos yet',
  emptySearchText = 'No videos found',
  showBackButton = false,
  topNavTitle,
  pageSize = 12,
}) {
  const { colors } = useTheme();
  const { translations } = useLanguage();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      } else setLoading(true);

      if (fetchMoreFn) {
        const result = await fetchMoreFn(pageSize, null);
        setVideos(result[itemsKey] || []);
        setHasMore(result.hasMore || false);
        setNextCursor(result.nextCursor || null);
      } else {
        const data = await fetchFn();
        setVideos(data || []);
        setHasMore(false);
      }
    } catch (err) {
      console.error('VideoListScreen fetch error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !nextCursor || !fetchMoreFn) return;
    try {
      setLoadingMore(true);
      const result = await fetchMoreFn(pageSize, nextCursor);
      setVideos((prev) => [...prev, ...(result[itemsKey] || [])]);
      setHasMore(result.hasMore || false);
      setNextCursor(result.nextCursor || null);
    } catch (err) {
      console.error('VideoListScreen loadMore error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const runSearch = async (query) => {
    if (!query.trim()) {
      load(true);
      return;
    }
    if (!searchFn) {
      // client-side filter fallback (archive/gallery pattern)
      return;
    }
    try {
      setLoading(true);
      const results = await searchFn(query, pageSize, null);
      setVideos(results[itemsKey] || []);
      setHasMore(results.pagination?.hasMore || false);
      setNextCursor(results.pagination?.nextCursor || null);
    } catch (err) {
      console.error('VideoListScreen search error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => runSearch(text), 500));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, []);

  // client-side filter for screens without searchFn
  const displayedVideos =
    searchFn || !searchQuery.trim()
      ? videos
      : videos.filter((v) => {
          const q = searchQuery.toLowerCase();
          return (
            (v.title || '').toLowerCase().includes(q) ||
            (v.event || '').toLowerCase().includes(q)
          );
        });

  const renderItem = ({ item }) => {
    const rawUrl = urlFields.map((f) => item[f]).find(Boolean);
    const ytId = getYouTubeId(rawUrl);
    const thumbnailUrl = ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500';

    return (
      <TouchableOpacity
        style={[styles.videoCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`${routePrefix}/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.thumbnailOverlay}
          />
          <View style={styles.playButtonOverlay}>
            <View
              style={[styles.playButton, { backgroundColor: colors.primary }]}
            >
              <Play size={24} color="#fff" fill="#fff" />
            </View>
          </View>
        </View>
        <View style={styles.videoInfo}>
          <AppText
            style={[styles.videoTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title || item.event}
          </AppText>
          <View style={styles.videoMeta}>
            <View
              style={[
                styles.watchBadge,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <PlayIcon size={12} color={colors.primary} />
              <AppText style={[styles.badgeText, { color: colors.primary }]}>
                {translations.watchNow || 'Watch Now'}
              </AppText>
            </View>
            {item.date && (
              <AppText
                style={[styles.dateText, { color: colors.textSecondary }]}
              >
                {item.date}
              </AppText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: colors.primary + '15' },
        ]}
      >
        <EmptyIcon size={48} color={colors.primary} />
      </View>
      <AppText style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery ? emptySearchText : emptyText}
      </AppText>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={showBackButton} title={topNavTitle} />

      <View style={styles.bannerContainer}>
        <ImageBackground source={{ uri: bannerUri }} style={styles.bannerImage}>
          <LinearGradient
            colors={['transparent', 'black']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <AppText style={styles.bannerTitle}>{bannerTitle}</AppText>
            <AppText style={styles.bannerSubtitle}>{bannerSubtitle}</AppText>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.searchWrapper}>
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <View style={styles.searchIcon}>
            <Search size={18} color={colors.text} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      <FlatList
        data={loading ? [] : displayedVideos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            renderEmpty()
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (!loading && !loadingMore && hasMore && !searchQuery) loadMore();
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  bannerContainer: { height: 120, overflow: 'hidden', marginBottom: 10 },
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
    height: '100%',
  },
  bannerText: { paddingHorizontal: 28, alignItems: 'center' },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  searchWrapper: { marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
  searchContainer: {
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    elevation: 3,
  },
  thumbnailContainer: { position: 'relative', height: 180 },
  thumbnail: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: { padding: 14 },
  videoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 12, opacity: 0.8 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonMeta: { height: 24, width: 80, borderRadius: 8 },
});
