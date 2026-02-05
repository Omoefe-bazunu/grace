import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getGalleryVideos } from '../../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../../../../components/ui/AppText';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../../contexts/LanguageContext'; // ✅ Added Language Hook

const { width } = Dimensions.get('window');

function EventCard({ event, items }) {
  const { colors } = useTheme();
  const { translations } = useLanguage(); // ✅ Access translations
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / 292);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
      <View style={[styles.topBorder, { backgroundColor: colors.primary }]} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <AppText style={[styles.eventTitle, { color: colors.text }]}>
            {event || translations.untitledEvent || 'Untitled Event'}
          </AppText>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <AppText style={[styles.countText, { color: colors.primary }]}>
              {items.length}{' '}
              {items.length === 1
                ? translations.videoLabel || 'Video'
                : translations.videosLabel || 'Videos'}
            </AppText>
          </View>
        </View>

        {items[0]?.description && (
          <AppText style={[styles.desc, { color: colors.textSecondary }]}>
            {items[0].description}
          </AppText>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageRow}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={292}
          decelerationRate="fast"
        >
          {items.map((vid) => (
            <TouchableOpacity
              key={vid.id}
              style={styles.videoWrapper}
              activeOpacity={0.9}
            >
              <Video
                source={{ uri: vid.url }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping={false}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.indicatorContainer}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: colors.border },
                index === currentIndex && [
                  styles.indicatorActive,
                  { backgroundColor: colors.primary },
                ],
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function GalleryVideos() {
  const { colors } = useTheme();
  const { translations } = useLanguage(); // ✅ Access translations
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVideos = async () => {
    try {
      const data = await getGalleryVideos();
      const grouped = Object.entries(groupBy(data, 'event')).sort(([a], [b]) =>
        b.localeCompare(a),
      );
      setVideos(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(([event]) =>
    event.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaWrapper>
        <TopNavigation
          showBackButton={true}
          title={translations.videoGalleryTitle || 'Video Gallery'}
        />
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.headerSection}>
            <View style={styles.bannerContainer}>
              <ImageBackground
                source={{
                  uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FGALLERY.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
                }}
                style={styles.bannerImage}
              >
                <LinearGradient
                  colors={['transparent', 'black']}
                  style={styles.bannerGradient}
                />
                <View style={styles.bannerText}>
                  <AppText style={styles.bannerTitle}>
                    {translations.videoGalleryTitle || 'VIDEO GALLERY'}
                  </AppText>
                  <AppText style={styles.bannerSubtitle}>
                    {translations.videoGallerySubtitle ||
                      'Major events across our branches, kept for your viewing pleasure.'}
                  </AppText>
                </View>
              </ImageBackground>
            </View>
            <View
              style={[styles.searchContainer, { backgroundColor: colors.card }]}
            >
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={translations.search || 'Search'}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.listContainer}>
            {filteredVideos.length === 0 ? (
              <AppText style={[styles.empty, { color: colors.textSecondary }]}>
                {searchQuery
                  ? translations.noEventsFound ||
                    'No events found matching your search'
                  : translations.noVideosYet || 'No videos yet'}
              </AppText>
            ) : (
              filteredVideos.map(([event, items]) => (
                <EventCard key={event} event={event} items={items} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bannerContainer: { overflow: 'hidden', height: 120, marginBottom: 10 },
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
    height: 300,
  },
  bannerText: { paddingHorizontal: 28, alignItems: 'center', zIndex: 1 },
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
    lineHeight: 12,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 12,
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
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16 },
  listContainer: { paddingBottom: 30 },
  empty: { textAlign: 'center', fontSize: 16, marginTop: 40 },

  // ✅ Modern Card Styling
  eventCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topBorder: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  videoRow: {
    flexDirection: 'row',
  },
  videoWrapper: {
    width: 280,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 20,
  },
});
