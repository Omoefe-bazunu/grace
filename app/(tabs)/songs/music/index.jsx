// MusicScreen.js
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

// Placeholder for the image path (Ensure this path is correct in your project)
const HEADER_IMAGE_URI =
  'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/CHOIR_o1kzpt.png';

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

  // === DATA FETCHING LOGIC ===

  const loadSongs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setNextCursor(null);
      }
      setError(null);
      let result;
      if (category && category !== 'all') {
        try {
          result = await getSongsByCategoryPaginated(
            category,
            15,
            isRefresh ? null : nextCursor,
          );
        } catch (categoryError) {
          const allSongsResult = await getSongsPaginated(
            15,
            isRefresh ? null : nextCursor,
          );
          result = {
            songs: allSongsResult.songs.filter((s) => s.category === category),
            hasMore: allSongsResult.hasMore,
            nextCursor: allSongsResult.nextCursor,
          };
        }
      } else {
        result = await getSongsPaginated(15, isRefresh ? null : nextCursor);
      }

      // When loading initial data or refreshing, replace the whole list
      if (isRefresh) {
        setSongs(result.songs);
      } else {
        // When initially loading (and not refreshing), ensure no duplicates are added
        setSongs((prev) => {
          const existingIds = new Set(prev.map((song) => song.id));
          const uniqueNewSongs = result.songs.filter(
            (song) => !existingIds.has(song.id),
          );
          return [...prev, ...uniqueNewSongs];
        });
      }

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      setError(error.message || 'Failed to load songs');
      setSongs([]);
      setHasMore(false);
      Alert.alert('Error', 'Unable to load songs. Please try again.');
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

      // === FIX for Duplicate Key Error ===
      setSongs((prevSongs) => {
        const existingIds = new Set(prevSongs.map((song) => song.id));

        // Filter out any new songs whose IDs already exist
        const uniqueNewSongs = result.songs.filter(
          (song) => !existingIds.has(song.id),
        );

        // Combine unique lists
        return [...prevSongs, ...uniqueNewSongs];
      });
      // ====================================

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
      style={styles.songCard}
      onPress={() => router.push(`/(tabs)/songs/music/${item.id}`)}
    >
      <View style={styles.iconContainer}>
        <Mic2 size={24} color={colors.primary} />
      </View>
      <View style={styles.titleContainer}>
        <AppText style={styles.songTitle}>{item.title || 'Untitled'}</AppText>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => router.push(`/(tabs)/songs/music/${item.id}`)}
      >
        <AppText style={styles.playText}>Start Playing</AppText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <TopNavigation showBackButton={true} />

      <ImageBackground
        source={{
          uri: HEADER_IMAGE_URI,
        }}
        style={styles.headerImageContainer}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <AppText style={styles.headerTitle}>{category || 'Category'}</AppText>
      </ImageBackground>

      <View style={styles.searchWrapper}>
        <Search size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search songs..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
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
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && (
            <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />
          )
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator />
          ) : (
            <AppText style={styles.empty}>No songs found</AppText>
          )
        }
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: 180,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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

  backButton: { padding: 8 },
  searchWrapper: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    backgroundColor: '#fff',
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
  list: { paddingHorizontal: 20, paddingVertical: 20 },
  songCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderColor: '#1E3A8A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: { flex: 1 },
  songTitle: { fontSize: 17, fontWeight: '600', color: '#1E3A8A' },
  playButton: {
    backgroundColor: '#ffcc00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  playText: { color: '#000', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});
