// MusicScreen.tsx (final - uses dataService + category param)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, Play, Clock } from 'lucide-react-native';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { getSongs, searchContent } from '../../../../services/dataService';
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
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // Fetch songs by category
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const allSongs = await getSongs();
        const filtered = category
          ? allSongs.filter((s) => s.category === category)
          : allSongs;
        setSongs(filtered);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [category]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setLoading(true);
      if (!query.trim()) {
        // Refetch by category
        try {
          const allSongs = await getSongs();
          const filtered = category
            ? allSongs.filter((s) => s.category === category)
            : allSongs;
          setSongs(filtered);
        } catch {
          setSongs([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const results = await searchContent(query);
        const filtered = results.songs.filter((s) =>
          category ? s.category === category : true
        );
        setSongs(filtered);
      } catch {
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [category]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
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
        <Play size={20} style={styles.playButton} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSkeletonCards = () => (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title={category || translations.music} />
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/songs`)}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Return Back</Text>
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
          placeholder={translations.search}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>
      <FlatList
        data={loading || songs.length === 0 ? [] : songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderSkeletonCards}
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
  backText: {
    color: '#1E3A8A',
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
  listContainer: {
    padding: 20,
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
    color: '#FFFFFF',
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
});
