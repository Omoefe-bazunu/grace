import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  RefreshControl, // ✅ Added for drag refresh
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getArchiveVideos } from '../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../../../components/ui/AppText';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Play } from 'lucide-react-native'; // ✅ Added for a modern "Video" feel

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

function EventCard({ event, items }) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + 12));
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
      {/* Top Accent Line */}
      <View style={[styles.topAccent, { backgroundColor: colors.primary }]} />

      <View style={styles.cardContent}>
        <View style={styles.textHeader}>
          <AppText style={[styles.eventTitle, { color: colors.text }]}>
            {event || 'Untitled Event'}
          </AppText>
          <AppText style={[styles.videoCount, { color: colors.primary }]}>
            {items.length} {items.length === 1 ? 'Video' : 'Videos'}
          </AppText>
        </View>

        {items[0]?.description && (
          <AppText
            style={[styles.desc, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {items[0].description}
          </AppText>
        )}

        <ScrollView
          horizontal
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          style={styles.videoRow}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {items.map((vid) => (
            <View key={vid.id} style={styles.videoWrapper}>
              <Video
                source={{ uri: vid.url }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping={false}
              />
            </View>
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

export default function archiveVideos() {
  const { colors } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ Added state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVideos = async () => {
    try {
      const data = await getArchiveVideos();
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
        <TopNavigation showBackButton={true} />
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary} // iOS
              colors={[colors.primary]} // Android
            />
          }
        >
          <View style={styles.headerSection}>
            <View style={styles.bannerContainer}>
              <ImageBackground
                source={{
                  uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FARCHIVE.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
                }}
                style={styles.bannerImage}
              >
                <LinearGradient
                  colors={['transparent', 'black']}
                  style={styles.bannerGradient}
                />
                <View style={styles.bannerText}>
                  <AppText style={styles.bannerTitle}>VIDEO ARCHIVE</AppText>
                  <AppText style={styles.bannerSubtitle}>
                    This screen contains videos of old events of the church,
                    kept for reference and memories.
                  </AppText>
                </View>
              </ImageBackground>
            </View>
            <View
              style={[styles.searchContainer, { backgroundColor: colors.card }]}
            >
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search"
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
                  ? 'No events found matching your search'
                  : 'No videos yet'}
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
    lineHeight: 10,
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
  listContainer: { paddingBottom: 40 },
  empty: { textAlign: 'center', fontSize: 16, marginTop: 40 },

  // ✅ Redesigned Modern Card
  eventCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  topAccent: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    paddingRight: 10,
    marginBottom: 4,
  },
  videoCount: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    opacity: 0.8,
  },
  videoRow: {
    flexDirection: 'row',
  },
  videoWrapper: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },

  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 18,
    borderRadius: 3,
  },
});
