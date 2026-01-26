import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl, // ✅ Added for drag to refresh
} from 'react-native';
import { getArchivePictures } from '../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Maximize2 } from 'lucide-react-native'; // ✅ Added Maximize2
import { AppText } from '../../../../components/ui/AppText';
import { useTheme } from '../../../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

function EventCard({ event, items, onImagePress }) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / 292);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
      {/* ✅ Modern Top Accent Border */}
      <View style={[styles.topBorder, { backgroundColor: colors.primary }]} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <AppText style={[styles.eventTitle, { color: colors.text }]}>
            {event || 'Untitled Event'}
          </AppText>
          {/* ✅ Photo Count Badge */}
          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <AppText style={[styles.countText, { color: colors.primary }]}>
              {items.length} {items.length === 1 ? 'Photo' : 'Photos'}
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
          {items.map((pic) => (
            <TouchableOpacity
              key={pic.id}
              onPress={() => onImagePress(pic.url)}
              activeOpacity={0.9}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: pic.url }}
                style={styles.image}
                resizeMode="cover"
              />
              {/* ✅ Fullscreen Indicator Hint */}
              <View style={styles.fullscreenHint}>
                <Maximize2 size={16} color="white" />
              </View>
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

export default function ArchivePictures() {
  const { colors } = useTheme();
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ Added state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchPictures = async () => {
    try {
      const data = await getArchivePictures();
      const grouped = Object.entries(groupBy(data, 'event')).sort(([a], [b]) =>
        b.localeCompare(a),
      );
      setPictures(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPictures();
  }, []);

  const filteredPictures = pictures.filter(([event]) =>
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
              tintColor={colors.primary}
              colors={[colors.primary]}
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
                  <AppText style={styles.bannerTitle}>PICTURE ARCHIVE</AppText>
                  <AppText style={styles.bannerSubtitle}>
                    Sacred memories and old events of the church, kept for
                    reference.
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
            {filteredPictures.length === 0 ? (
              <AppText style={[styles.empty, { color: colors.textSecondary }]}>
                {searchQuery ? 'No events found' : 'No pictures yet'}
              </AppText>
            ) : (
              filteredPictures.map(([event, items]) => (
                <EventCard
                  key={event}
                  event={event}
                  items={items}
                  onImagePress={(url) => setSelectedImage(url)}
                />
              ))
            )}
          </View>
        </ScrollView>

        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSelectedImage(null)}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.9)', 'black']}
                style={StyleSheet.absoluteFill}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <X color="white" size={32} />
            </TouchableOpacity>

            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
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
  imageRow: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 280,
    height: 200, // ✅ Reduced height for a modern, compact look
  },
  fullscreenHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    padding: 10,
  },
});
