import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext'; // ✅ Added Language Hook
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../components/TopNavigation';
import { getSongsPaginated } from '../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../../components/ui/AppText';

const { width } = Dimensions.get('window');

export default function SongsScreen() {
  const { colors } = useTheme();
  const { translations } = useLanguage(); // ✅ Access translations
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Moved featuredPlaylist inside to use translations
  const featuredPlaylist = {
    title: translations.featuredSongsTitle || 'Theocratic Songs of Praise',
    subtitle: translations.featuredSongsSubtitle || '(Hymns & Psalms)',
    button: translations.getStarted || 'Get Started',
    isFeatured: true,
  };

  const loadSongs = async () => {
    try {
      let allSongs = [];
      let cursor = null;
      let hasMore = true;

      while (hasMore) {
        const result = await getSongsPaginated(50, cursor);
        allSongs = [...allSongs, ...result.songs];
        hasMore = result.hasMore;
        cursor = result.nextCursor;
      }

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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSongs();
      setLoading(false);
    };
    init();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  }, []);

  const SkeletonCard = () => (
    <View style={[styles.playlistCard, { backgroundColor: colors.card }]}>
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
      style={[styles.playlistCard, { backgroundColor: colors.card }]}
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
        <View style={[styles.button, { backgroundColor: '#FFD700' }]}>
          <AppText style={[styles.buttonText, { color: '#000' }]}>
            {item.button}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaWrapper>
        <TopNavigation title={translations.songsNavTitle || 'Songs'} />
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FCHOIR.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
            }}
            style={styles.bannerImage}
          >
            <LinearGradient
              colors={['transparent', 'black']}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerText}>
              <AppText style={styles.bannerTitle}>
                {translations.songsBannerTitle || 'SONGS OF PRAISE'}
              </AppText>
              <AppText style={styles.bannerSubtitle}>
                {translations.songsBannerSubtitle ||
                  'Worship through a collection of uplifting spiritual songs and hymns that strengthen your faith.'}
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
              colors={[colors.primary]}
              tintColor={colors.primary}
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
                      subtitle: `(${categoryCounts[cat] || 0} ${translations.songsCountLabel || 'songs'})`,
                      button: translations.seePlaylist || 'See Playlist',
                    },
                    i,
                  ),
                )}
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    </View>
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
    borderRadius: 20,
    overflow: 'hidden',
    // Elevation for Android
    elevation: 3,
    // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
