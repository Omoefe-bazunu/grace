// app/(tabs)/sermons/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ImageBackground,
  ScrollView, // Using ScrollView for the main content
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  BookOpen, // Used for Text Sermons
  Mic2, // Lucide icon for Audio (Mic2 or Music2)
  Video, // Lucide icon for Video
} from 'lucide-react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../components/TopNavigation';
// Removed unused data service imports as core logic is moving
import debounce from 'lodash.debounce';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb } from 'lucide-react';

// We only need the categories list for the new Text Sermons screen
const SERMON_CATEGORIES = [
  'Weekly Sermon Volume 1',
  'Weekly Sermon Volume 2',
  "God's Kingdom Advocate Volume 1",
  "God's Kingdom Advocate Volume 2",
  "God's Kingdom Advocate Volume 3",
  'Abridged Bible Subjects',
];

// --- NEW COMPONENT: Feature Tile (Audio/Text/Video) ---
const FeatureTile = ({ title, subtitle, icon: Icon, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.featureTile, { backgroundColor: colors.card }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.featureTileContent}>
      <View
        style={[styles.iconWrapper, { backgroundColor: colors.primary + '20' }]}
      >
        <Icon size={32} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.tileTitle, { color: colors.text }]}>{title}</Text>
        <Text
          style={[styles.tileSubtitle, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// --- MAIN SCREEN COMPONENT ---

export default function SermonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // Debounced search logic is simplified here since category list logic is removed
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        // In a real app, this should navigate to a search results screen
        // or update content on the currently active Text Sermons screen.
        console.log('Searching for:', query);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.sermons} />
      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{
            uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006515/SERMON_xeajaz.png',
          }}
          style={styles.bannerImage}
        >
          <LinearGradient
            colors={['transparent', `black`]}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>EDIFYING SERMONS</Text>
            <Text style={styles.bannerSubtitle}>
              Access inspiring sermons in different languages, sharing God’s
              Word in every tongue.
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={
            translations.searchSermons ||
            'Search sermons, topics, and categories...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Navigation Tiles */}
      <ScrollView
        style={[
          styles.tileListContainer,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tileWrapper}>
          {/* 1. Text Sermons Tile (Navigates to the new category list screen) */}
          <FeatureTile
            title={translations.textSermons || 'Text Sermons'}
            subtitle={
              translations.readSermons || 'Organized by volume and subject'
            }
            icon={BookOpen}
            onPress={() => router.push('/(tabs)/sermons/text')} // NEW SCREEN ROUTE
            colors={colors}
          />

          {/* 2. Audio Clips Tile */}
          <FeatureTile
            title={translations.audioClips || 'Audio Clips'}
            subtitle={
              translations.listenSermons || 'Listen to edifying sermon audio'
            }
            icon={Mic2}
            onPress={() => router.push('/(tabs)/sermons/audio')}
            colors={colors}
          />

          {/* 3. Video Sermons Tile */}
          <FeatureTile
            title={translations.videoSermons || 'Video Sermons'}
            subtitle={
              translations.watchSermons || 'Watch live sessions and recordings'
            }
            icon={Video}
            onPress={() => router.push('/(tabs)/sermons/video')} // You will create this screen
            colors={colors}
          />

          {/* 4. Daily Devotional Tile */}
          <FeatureTile
            title={translations.dailyGuide || 'Daily Guide'}
            subtitle={translations.dailyGuide || "Study God's word daily"}
            icon={BookOpen}
            onPress={() => router.push('/(tabs)/sermons/daily-guide')} // You will create this screen
            colors={colors}
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// --- UPDATED STYLES ---

const styles = StyleSheet.create({
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
    paddingHorizontal: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16 },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  tileListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tileWrapper: {
    gap: 12, // Space between tiles
    paddingBottom: 20,
  },
  // NEW TILE STYLES
  featureTile: {
    borderRadius: 16,
    borderLeftWidth: 4,
    borderColor: '#1E3A8A',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  featureTileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 50,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
});
