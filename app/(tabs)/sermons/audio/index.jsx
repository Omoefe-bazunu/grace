// app/(tabs)/sermons/audio/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Mic, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import {
  getSermonsPaginated,
  searchContentPaginated,
} from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonItem = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.item, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonTitle}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonDate}
      />
    </View>
  );
};

export default function AudioSermonsScreen() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const { translations } = useLanguage();

  // Load audio sermons with pagination
  const loadSermons = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      }

      const result = await getSermonsPaginated(15, null);
      const audioSermons = result.sermons.filter((s) => s.audioUrl);

      if (isRefresh) {
        setSermons(audioSermons);
      } else {
        setSermons(audioSermons);
      }

      setHasMore(result.hasMore && audioSermons.length > 0);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      setSermons([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more sermons
  const loadMoreSermons = async () => {
    if (loadingMore || !hasMore || !nextCursor || searchQuery) return;

    try {
      setLoadingMore(true);
      const result = await getSermonsPaginated(15, nextCursor);
      const moreAudioSermons = result.sermons.filter((s) => s.audioUrl);

      if (moreAudioSermons.length > 0) {
        setSermons((prev) => [...prev, ...moreAudioSermons]);
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor);
      } else {
        // If no audio sermons in this batch but hasMore is true, try next batch
        if (result.hasMore) {
          setTimeout(() => loadMoreSermons(), 100);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more sermons:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, []);

  const onRefresh = () => {
    loadSermons(true);
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchAudioSermons = async () => {
        try {
          setLoading(true);
          const results = await searchContentPaginated(
            searchQuery,
            null,
            50,
            null
          );
          const audioSermons = results.sermons.filter((s) => s.audioUrl);
          setSermons(audioSermons);
          setHasMore(false); // Disable infinite scroll during search
        } catch (error) {
          console.error('Error searching sermons:', error);
          setSermons([]);
        } finally {
          setLoading(false);
        }
      };

      const timeoutId = setTimeout(searchAudioSermons, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // If search is cleared, reload paginated sermons
      loadSermons(true);
    }
  }, [searchQuery]);

  const filteredSermons = searchQuery.trim()
    ? sermons.filter(
        (s) =>
          s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.date?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sermons;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/sermons/audio/${item.id}`)}
    >
      <View style={styles.iconContainer}>
        <Mic size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title || translations.noTitle}
        </Text>
        <View style={styles.dateRow}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {item.date || translations.unknownDate}
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
          Loading more sermons...
        </Text>
      </View>
    );
  };

  const renderSkeleton = () => (
    <>
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </>
  );

  const handleEndReached = () => {
    if (!loading && !loadingMore && hasMore && !searchQuery.trim()) {
      loadMoreSermons();
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.audioSermons || 'Audio Sermons'} />

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { borderColor: colors.textSecondary + '30' },
        ]}
      >
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={translations.searchSermons || 'Search sermons...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Results Count */}
      {!loading && filteredSermons.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {filteredSermons.length}{' '}
            {filteredSermons.length === 1 ? 'sermon' : 'sermons'}
            {searchQuery ? ' found' : ' available'}
            {hasMore && !searchQuery && '+'}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.listContainer}>{renderSkeleton()}</View>
      ) : filteredSermons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Mic size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {searchQuery
              ? translations.noSermonsFound || 'No sermons found'
              : translations.noAudioSermons || 'No audio sermons available'}
          </Text>
          {!searchQuery && (
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Check back later for new audio content
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSermons}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
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
  item: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 14,
  },
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
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDate: {
    height: 14,
    width: '50%',
    borderRadius: 4,
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
