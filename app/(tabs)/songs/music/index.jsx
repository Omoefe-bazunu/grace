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
  ImageBackground,
} from 'react-native';
import { ArrowLeft, Mic2, Search } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { LanguageSwitcher } from '../../../../components/LanguageSwitcher';
import { AppText } from '../../../../components/ui/AppText';
import {
  getSongsByCategoryPaginated,
  getSongsPaginated,
  searchContentPaginated,
} from '../../../../services/dataService';
import debounce from 'lodash.debounce';
import { TopNavigation } from '../../../../components/TopNavigation';

const HEADER_IMAGE_URI =
  'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FCHOIR.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b';

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
  const { colors } = useTheme(); // ✅ Hook used for dynamic theme

  // === DATA FETCHING LOGIC === (Kept identical as requested)
  const loadSongs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      }
      setError(null);

      let result;
      // ✅ The server now handles the category filtering perfectly
      if (category && category !== 'all') {
        result = await getSongsByCategoryPaginated(
          category,
          15,
          isRefresh ? null : nextCursor,
        );
      } else {
        result = await getSongsPaginated(15, isRefresh ? null : nextCursor);
      }

      if (isRefresh) {
        setSongs(result.songs);
      } else {
        setSongs((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const unique = result.songs.filter((s) => !existingIds.has(s.id));
          return [...prev, ...unique];
        });
      }

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      setError('Failed to load songs');
      Alert.alert('Error', 'Unable to load songs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreSongs = async () => {
    if (loadingMore || !hasMore || !nextCursor || searchQuery) return;
    setLoadingMore(true);
    try {
      let result;
      if (category && category !== 'all') {
        try {
          result = await getSongsByCategoryPaginated(category, 15, nextCursor);
        } catch {
          const all = await getSongsPaginated(15, nextCursor);
          result = {
            songs: all.songs.filter((s) => s.category === category),
            hasMore: all.hasMore,
            nextCursor: all.nextCursor,
          };
        }
      } else {
        result = await getSongsPaginated(15, nextCursor);
      }

      setSongs((prevSongs) => {
        const existingIds = new Set(prevSongs.map((song) => song.id));
        const uniqueNewSongs = result.songs.filter(
          (song) => !existingIds.has(song.id),
        );
        return [...prevSongs, ...uniqueNewSongs];
      });

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        loadSongs(true);
        return;
      }
      setLoading(true);
      try {
        const res = await searchContentPaginated(query, category, 50, null);
        const filtered =
          category && category !== 'all'
            ? res.songs.filter((s) => s.category === category)
            : res.songs;
        setSongs(filtered);
        setHasMore(false);
        setNextCursor(null);
      } catch {
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    [category],
  );

  useEffect(() => {
    loadSongs();
  }, [category]);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return debouncedSearch.cancel;
  }, [searchQuery]);

  const onRefresh = () => loadSongs(true);

  const handleEndReached = () => {
    if (!loading && !loadingMore && hasMore && !searchQuery.trim())
      loadMoreSongs();
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.songItem,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/(tabs)/songs/music/${item.id}`)}
    >
      <View style={styles.songContent}>
        {/* Title is now far more prominent without the extra clutter */}
        <AppText
          numberOfLines={1}
          style={[styles.songTitle, { color: colors.text }]}
        >
          {item.title || 'Untitled'}
        </AppText>

        {/* Small Circle Play Icon on the far right */}
        <View
          style={[styles.miniPlayIcon, { backgroundColor: colors.primary }]}
        >
          <View style={styles.playTriangle} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaWrapper backgroundColor={colors.background}>
        <TopNavigation showBackButton={true} />

        <ImageBackground
          source={{ uri: HEADER_IMAGE_URI }}
          style={styles.headerImageContainer}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <AppText style={styles.headerTitle}>{category || 'Category'}</AppText>
        </ImageBackground>

        <View style={[styles.searchWrapper, { backgroundColor: colors.card }]}>
          <Search
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search songs..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore && (
              <ActivityIndicator
                style={{ margin: 20 }}
                color={colors.primary}
              />
            )
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 50 }}
              />
            ) : (
              <AppText style={[styles.empty, { color: colors.textSecondary }]}>
                No songs found
              </AppText>
            )
          }
        />
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: 180,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    width: '90%',
    marginHorizontal: 'auto',
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16 },
  list: {
    paddingHorizontal: 16, // Slightly tighter padding for a cleaner list
    paddingVertical: 10,
  },

  // ✅ New Sleek List Item Style
  songItem: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Traditional list feel
    borderRadius: 12, // Subtle curve
    marginBottom: 8, // Small gap between items
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1, // Ensures text takes up available space but doesn't push the icon off
    paddingRight: 10,
  },
  miniPlayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderBackWidth: 0,
    borderLeftColor: '#FFF', // White triangle
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3, // Offset to center the triangle visually
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
