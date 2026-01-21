import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  RefreshControl, // ✅ Import RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../components/TopNavigation';
import { getSongsPaginated } from '../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../../components/ui/AppText';

const { width } = Dimensions.get('window');

const featuredPlaylist = {
  title: 'Theocratic Songs of Praise',
  subtitle: '(Hymns & Psalms)',
  button: 'Get Started',
  isFeatured: true,
};

export default function SongsScreen() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ Refreshing state

  // ✅ Extracted fetching logic to reuse it
  const loadSongs = async () => {
    try {
      let allSongs = [];
      let cursor = null;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const result = await getSongsPaginated(50, cursor);
        allSongs = [...allSongs, ...result.songs];
        hasMore = result.hasMore;
        cursor = result.nextCursor;
      }

      // Process categories
      const uniqueCategories = [
        ...new Set(allSongs.map((s) => s.category).filter(Boolean)),
      ].sort();

      const counts = {};
      allSongs.forEach((s) => {
        if (s.category) {
          counts[s.category] = (counts[s.category] || 0) + 1;
        }
      });

      setCategories(uniqueCategories);
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSongs();
      setLoading(false);
    };
    init();
  }, []);

  // ✅ Refresh Handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  }, []);

  const SkeletonCard = () => (
    <View style={styles.playlistCard}>
      <View
        style={[styles.cardTopLine, { backgroundColor: colors.skeleton }]}
      />
      <View style={styles.cardContent}>
        <View
          style={{
            height: 24,
            width: '60%',
            backgroundColor: colors.skeleton,
            marginBottom: 4,
            borderRadius: 4,
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            height: 16,
            width: '40%',
            backgroundColor: colors.skeleton,
            marginBottom: 16,
            borderRadius: 4,
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            height: 40,
            width: 120,
            backgroundColor: colors.skeleton,
            borderRadius: 30,
            alignSelf: 'center',
          }}
        />
      </View>
    </View>
  );

  const renderPlaylist = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.playlistCard}
      onPress={() => {
        if (item.isFeatured) {
          router.push('/songs/hymns');
        } else {
          router.push({
            pathname: '/(tabs)/songs/music',
            params: { category: item.title },
          });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.cardTopLine, { backgroundColor: colors.primary }]} />
      <View style={styles.cardContent}>
        <AppText style={[styles.playlistTitle, { color: colors.primary }]}>
          {item.title}
        </AppText>
        <AppText
          style={[styles.playlistSubtitle, { color: colors.textSecondary }]}
        >
          {item.subtitle}
        </AppText>
        <TouchableOpacity style={styles.button}>
          <AppText style={[styles.buttonText, { color: colors.text }]}>
            {item.button}
          </AppText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Songs" />
      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{
            uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/CHOIR_o1kzpt.png',
          }}
          style={styles.bannerImage}
        >
          <LinearGradient
            colors={['transparent', `black`]}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <AppText style={styles.bannerTitle}>SONGS OF PRAISE</AppText>
            <AppText style={styles.bannerSubtitle}>
              Worship through a collection of uplifting spiritual songs and
              hymns that strengthen your faith.
            </AppText>
          </View>
        </ImageBackground>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android spinner color
            tintColor={colors.primary} // iOS spinner color
          />
        }
      >
        <View style={styles.playlistsContainer}>
          {renderPlaylist(featuredPlaylist, 'featured')}
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat, i) =>
                renderPlaylist(
                  {
                    title: cat,
                    subtitle: `(${categoryCounts[cat] || 0} songs)`,
                    button: 'See Playlist',
                  },
                  i,
                ),
              )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    overflow: 'hidden',
    height: 120,
    marginBottom: 10,
  },
  bannerImage: {
    width: width,
    height: 120,
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
  bannerText: {
    paddingHorizontal: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  playlistsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  playlistCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardTopLine: {
    height: 2,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playlistSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
