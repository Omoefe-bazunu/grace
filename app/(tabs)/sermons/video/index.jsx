import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  Play,
  Clock,
  Film,
  PlayIcon,
  Video as VideoIcon,
  X,
} from 'lucide-react-native';

import { Video } from 'expo-av';

import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  getSermonVideosPaginated,
  searchContentPaginated,
  getSermonVideosByCategoryPaginated,
} from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';
import { TopNavigation } from '../../../../components/TopNavigation';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';

const { width: screenWidth } = Dimensions.get('window');

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

const CategoryCard = ({ category, count, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: colors.card }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[colors.primary, colors.primary + 'DD']}
      style={styles.categoryIcon}
    >
      <VideoIcon size={24} color="#fff" />
    </LinearGradient>
    <View style={styles.categoryInfo}>
      <Text
        style={[styles.categoryTitle, { color: colors.text }]}
        numberOfLines={2}
      >
        {category}
      </Text>
      <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
        {count} {count === 1 ? 'video' : 'videos'}
      </Text>
    </View>
    <View style={[styles.chevron, { backgroundColor: colors.primary + '15' }]}>
      <Play size={16} color={colors.primary} />
    </View>
  </TouchableOpacity>
);

const VideoModalItem = ({ item, colors, onPress }) => (
  <TouchableOpacity
    style={[styles.modalVideoCard, { backgroundColor: colors.card }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.modalThumbnailContainer}>
      <Video
        source={{ uri: item.videoUrl }}
        style={styles.modalThumbnail}
        resizeMode="cover"
        shouldPlay={true}
        isLooping={true}
        isMuted={true}
        useNativeControls={false}
        onError={(e) => {
          console.error('Video load error:', e.error);
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.modalThumbnailOverlay}
      />
      <View style={styles.modalPlayButtonOverlay}>
        <View
          style={[styles.modalPlayButton, { backgroundColor: colors.primary }]}
        >
          <Play size={20} color="#fff" fill="#fff" />
        </View>
      </View>
      {item.duration && (
        <View style={styles.modalDurationBadge}>
          <Clock size={10} color="#fff" />
          <Text style={styles.modalDurationText}>
            {formatDuration(item.duration)}
          </Text>
        </View>
      )}
    </View>

    <View style={styles.modalVideoInfo}>
      <Text
        style={[styles.modalVideoTitle, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <View style={styles.modalVideoMeta}>
        <View
          style={[
            styles.modalWatchBadge,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <PlayIcon size={10} color={colors.primary} />
          <Text style={[styles.modalBadgeText, { color: colors.primary }]}>
            Watch
          </Text>
        </View>
        {item.category && (
          <View
            style={[
              styles.modalCategoryBadge,
              { backgroundColor: colors.primary + '10' },
            ]}
          >
            <Text style={[styles.modalCategoryText, { color: colors.primary }]}>
              {item.category}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function SermonVideosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sermonVideos, setSermonVideos] = useState([]);
  const [sermonVideoCategories, setSermonVideoCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryVideos, setCategoryVideos] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // Load initial sermon videos and categories
  const loadInitialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      }

      const sermonVideosResult = await getSermonVideosPaginated(50, null);

      setSermonVideos(sermonVideosResult.sermonVideos);
      setHasMore(sermonVideosResult.hasMore);
      setNextCursor(sermonVideosResult.nextCursor);

      // Extract unique categories from sermon videos
      const categoriesMap = {};
      sermonVideosResult.sermonVideos.forEach((video) => {
        if (video.category) {
          if (!categoriesMap[video.category]) {
            categoriesMap[video.category] = 0;
          }
          categoriesMap[video.category]++;
        }
      });

      const categories = Object.entries(categoriesMap)
        .map(([category, count]) => ({
          category,
          count,
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      setSermonVideoCategories(categories);
    } catch (error) {
      console.error('Error fetching sermon videos:', error);
      setSermonVideos([]);
      setSermonVideoCategories([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategoryVideos = async (category) => {
    try {
      setLoadingCategory(true);
      const result = await getSermonVideosByCategoryPaginated(
        category,
        50,
        null
      );
      setCategoryVideos(result.sermonVideos);
    } catch (error) {
      console.error('Error loading category videos:', error);
      setCategoryVideos([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleCategoryPress = async (category) => {
    setSelectedCategory(category);
    await loadCategoryVideos(category.category);
    setCategoryModalVisible(true);
  };

  const handleVideoPress = (video) => {
    setCategoryModalVisible(false);
    router.push(`/(tabs)/sermons/video/${video.id}`);
  };

  const loadMoreVideos = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const result = await getSermonVideosPaginated(12, nextCursor);
      setSermonVideos((prev) => [...prev, ...result.sermonVideos]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading more sermon videos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const onRefresh = () => {
    loadInitialData(true);
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        loadInitialData(true);
        return;
      }
      try {
        setLoading(true);
        const results = await searchContentPaginated(query, null, 20, null);
        // Filter to only show sermon videos in search results
        setSermonVideos(results.sermonVideos || []);
        setHasMore(results.pagination?.hasMore || false);
        setNextCursor(results.pagination?.nextCursor || null);
      } catch (error) {
        console.error('Error searching sermon videos:', error);
        setSermonVideos([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
    }
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/sermons/video/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
          useNativeControls={false}
          onError={(e) => {
            console.error('Video load error:', e.error);
          }}
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

        {item.duration && (
          <View style={styles.durationBadge}>
            <Clock size={12} color="#fff" />
            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.videoInfo}>
        <Text
          style={[styles.videoTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View style={styles.videoMeta}>
          <View
            style={[
              styles.watchBadge,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <PlayIcon size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              Watch Now
            </Text>
          </View>

          {item.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {item.category}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategorySection = () => {
    if (sermonVideoCategories.length === 0 || searchQuery) return null;

    return (
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sermon Video Categories
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Browse sermons by category
        </Text>

        <View style={styles.categoriesGrid}>
          {sermonVideoCategories.map((cat, index) => (
            <CategoryCard
              key={cat.category}
              category={cat.category}
              count={cat.count}
              colors={colors}
              onPress={() => handleCategoryPress(cat)}
            />
          ))}
        </View>
      </View>
    );
  };

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
        <VideoIcon size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery ? 'No sermon videos found' : 'No sermon videos available'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery
          ? 'Try adjusting your search terms'
          : 'Check back later for new sermon videos'}
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
      <TopNavigation showBackButton={true} />

      {/* Category Videos Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedCategory?.category}
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
            >
              {categoryVideos.length} videos
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loadingCategory ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={[
                  styles.modalLoadingText,
                  { color: colors.textSecondary },
                ]}
              >
                Loading videos...
              </Text>
            </View>
          ) : (
            <FlatList
              data={categoryVideos}
              renderItem={({ item }) => (
                <VideoModalItem
                  item={item}
                  colors={colors}
                  onPress={() => handleVideoPress(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text
                    style={[
                      styles.modalEmptyText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No videos found in this category
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{
            uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006515/SERMON_xeajaz.png',
          }}
          style={styles.bannerImage}
        >
          <LinearGradient
            colors={['transparent', 'black']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>SERMON VIDEOS</Text>
            <Text style={styles.bannerSubtitle}>
              Watch the video versions of sermons organized by categories.
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <View style={styles.searchIcon}>
            <Search size={18} color={colors.text} />
          </View>
          <TextInput
            placeholder="Search sermon videos..."
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

      <FlatList
        data={loading ? [] : sermonVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerSpacer} />
            {renderCategorySection()}
            {sermonVideos.length > 0 && !searchQuery && (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginTop: 20 },
                ]}
              >
                All Sermon Videos
              </Text>
            )}
          </>
        }
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
  bannerContainer: { height: 180, overflow: 'hidden', marginBottom: 10 },
  bannerImage: {
    width: '100%',
    height: '100%',
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  searchContainer: {
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSpacer: {
    height: 4,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  modalCategoryText: {
    fontSize: 9,
    fontWeight: '500',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  chevron: {
    padding: 8,
    borderRadius: 8,
  },
  videoCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    marginHorizontal: 'auto',
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
    backgroundColor: '#f0f0f0',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
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
    width: 48,
    height: 48,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 18,
    width: '90%',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 10,
    marginHorizontal: 'auto',
    lineHeight: 20,
    minHeight: 40,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  languageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  languageText: {
    fontSize: 10,
    fontWeight: '500',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 8,
  },
  modalContent: {
    padding: 20,
  },
  modalVideoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalThumbnailContainer: {
    position: 'relative',
    height: 120,
  },
  modalThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  modalThumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  modalPlayButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 2,
  },
  modalDurationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalVideoInfo: {
    padding: 12,
  },
  modalVideoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalVideoMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  modalWatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  modalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
