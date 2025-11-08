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
} from 'react-native';
import { router } from 'expo-router';
import { Search, Play, Clock } from 'lucide-react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { useTheme } from '../../../contexts/ThemeContext';
import { getVideos, searchContent } from '../../../services/dataService';
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
  const { translations } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getVideos();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        try {
          const data = await getVideos();
          setVideos(data);
        } catch (error) {
          console.error('Error fetching videos:', error);
          setVideos([]);
        }
        return;
      }
      try {
        const results = await searchContent(query);
        setVideos(results.videos);
      } catch (error) {
        console.error('Error searching videos:', error);
        setVideos([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/animations/${item.id}`)}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.playOverlay}>
          <Play size={32} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text
          style={[styles.videoTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {/* <View style={styles.videoMeta}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.duration || translations.unknownDuration}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            •
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.languageCategory || translations.unknownCategory}
          </Text>
        </View> */}
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonCards = () => (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.animations} />
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
        data={loading || videos.length === 0 ? [] : videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.headerSpacer} />}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 120,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.9,
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonMeta: {
    height: 16,
    width: '60%',
    borderRadius: 4,
  },
  headerSpacer: {
    height: 8,
  },
});
