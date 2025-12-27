import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { getGalleryPictures } from '../../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native'; // Ensure lucide-react-native is installed

const { width, height } = Dimensions.get('window');

function EventCard({ event, items, onImagePress }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / 292); // 280 width + 12 margin
    setCurrentIndex(index);
  };

  return (
    <View style={styles.eventCard}>
      <View style={styles.orangeBar} />
      <View style={styles.cardContent}>
        <Text style={styles.eventTitle}>{event || 'Untitled Event'}</Text>
        {items[0]?.description && (
          <Text style={styles.desc}>{items[0].description}</Text>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageRow}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {items.map((pic) => (
            <TouchableOpacity
              key={pic.id}
              onPress={() => onImagePress(pic.url)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: pic.url }}
                style={styles.image}
                resizeMode="cover"
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
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function GalleryPictures() {
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGalleryPictures();
        const grouped = Object.entries(groupBy(data, 'event')).sort(
          ([a], [b]) => b.localeCompare(a)
        );
        setPictures(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPictures = pictures.filter(([event]) =>
    event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#1E3A8A"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView style={styles.container}>
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
                <Text style={styles.bannerTitle}>PICTURE GALLERY</Text>
                <Text style={styles.bannerSubtitle}>
                  This screen contains pictures of major events across different
                  branches of the church. They are displayed here for the
                  viewing pleasure of all members and non-members.
                </Text>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {filteredPictures.length === 0 ? (
          <Text style={styles.empty}>
            {searchQuery
              ? 'No events found matching your search'
              : 'No pictures yet'}
          </Text>
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
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
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
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    color: '#000',
    marginBottom: 8,
  },
  desc: {
    color: '#666',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  imageRow: {
    flexDirection: 'row',
  },
  image: {
    width: 280,
    height: 300,
    borderRadius: 8,
    marginRight: 12,
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
    backgroundColor: '#D1D5DB',
  },
  indicatorActive: {
    backgroundColor: '#1E3A8A',
    width: 24,
  },
  // Modal Styles
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
