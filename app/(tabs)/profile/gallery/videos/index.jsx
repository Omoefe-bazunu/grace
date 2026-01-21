import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  TextInput,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getGalleryVideos } from '../../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../../../../components/ui/AppText';
import { useTheme } from '../../../../../contexts/ThemeContext'; // ✅ Import Theme Hook

function EventCard({ event, items }) {
  const { colors } = useTheme(); // ✅ Access colors for the card
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / 292);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
      <View style={styles.orangeBar} />
      <View style={styles.cardContent}>
        <AppText style={[styles.eventTitle, { color: colors.text }]}>
          {event || 'Untitled Event'}
        </AppText>
        {items[0]?.description && (
          <AppText style={[styles.desc, { color: colors.textSecondary }]}>
            {items[0].description}
          </AppText>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.videoRow}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {items.map((vid) => (
            <TouchableOpacity key={vid.id} style={styles.videoWrapper}>
              <Video
                source={{ uri: vid.url }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
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
                { backgroundColor: colors.border }, // ✅ Theme-based indicator
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
  const { colors } = useTheme(); // ✅ Access colors for the screen
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getGalleryVideos();
        const grouped = Object.entries(groupBy(data, 'event')).sort(
          ([a], [b]) => b.localeCompare(a),
        );
        setVideos(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
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
        >
          <View style={styles.headerSection}>
            <View style={styles.bannerContainer}>
              <ImageBackground
                source={{
                  uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766007961/GALLERY_c5xle3.png',
                }}
                style={styles.bannerImage}
              >
                <LinearGradient
                  colors={['transparent', 'black']}
                  style={styles.bannerGradient}
                />
                <View style={styles.bannerText}>
                  <AppText style={styles.bannerTitle}>VIDEO GALLERY</AppText>
                  <AppText style={styles.bannerSubtitle}>
                    This screen contains videos of major events across different
                    branches of the church. They are displayed here for the
                    viewing pleasure of all members and non-members.
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
        </ScrollView>
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    overflow: 'hidden',
    height: 200,
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: 200,
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
    paddingHorizontal: 28,
    alignItems: 'center',
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 12,
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
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  eventCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orangeBar: {
    width: 6,
    backgroundColor: '#ca5e0cff',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  videoRow: {
    flexDirection: 'row',
  },
  videoWrapper: {
    marginRight: 12,
  },
  video: {
    width: 280,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorActive: {
    width: 24,
  },
});
