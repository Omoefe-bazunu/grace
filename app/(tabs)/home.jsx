import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
import { getRecentContent } from '../../services/dataService';
import { ChevronRight, Play, BookOpen, Video } from 'lucide-react-native'; // Changed Clock to BookOpen for sermons
import { LinearGradient } from 'expo-linear-gradient';

// --- NEW REUSABLE CARD WRAPPER COMPONENT ---
const ContentCardWrapper = ({ children, style, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.cardWrapper, { backgroundColor: colors.card }, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {children}
  </TouchableOpacity>
);

const SkeletonCard = ({ type }) => {
  const { colors } = useTheme();
  const isVideo = type === 'video';

  // Use a modern shimmer effect for richness
  const shimmerColors = [
    colors.skeleton,
    colors.skeletonHighlight,
    colors.skeleton,
  ];

  return (
    <ContentCardWrapper
      colors={colors}
      style={isVideo ? styles.videoCard : styles.sermonSongCard}
    >
      {isVideo && (
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.videoThumbnail}
        />
      )}
      <View style={isVideo ? styles.videoInfo : styles.sermonSongInfo}>
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.skeletonSubtitle}
        />
        {!isVideo && (
          <View style={styles.cardFooter}>
            <LinearGradient
              colors={shimmerColors}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.skeletonAction}
            />
          </View>
        )}
      </View>
    </ContentCardWrapper>
  );
};

export default function HomeScreen() {
  const { translations, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [content, setContent] = useState({
    sermons: [],
    songs: [],
    videos: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching recent content...');
        const data = await getRecentContent();
        console.log('Content loaded:', data);
        setContent(data);
      } catch (error) {
        console.error('Error fetching recent content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const getTranslatedContent = (item) => {
    return (
      item.translations?.[currentLanguage] || item.translations?.en || item
    );
  };

  // --- REFACTORED RENDER FUNCTIONS ---

  const renderSermonCard = (sermon) => {
    const content = getTranslatedContent(sermon);
    return (
      <ContentCardWrapper
        key={sermon.id}
        colors={colors}
        style={styles.sermonSongCard}
        onPress={() => router.push(`/(tabs)/sermons/${sermon.id}`)}
      >
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {content.title}
        </Text>
        <Text
          style={[styles.cardSubtitle, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {content.content || translations.noContent}
        </Text>
        <View style={styles.cardFooter}>
          <BookOpen size={18} color={colors.primary} />
          <Text style={[styles.cardAction, { color: colors.primary }]}>
            Start studying
          </Text>
        </View>
      </ContentCardWrapper>
    );
  };

  const renderSongCard = (song) => (
    <ContentCardWrapper
      key={song.id}
      colors={colors}
      style={styles.sermonSongCard}
      onPress={() => router.push(`/(tabs)/songs/music/${song.id}`)}
    >
      <Text
        style={[styles.cardTitle, { color: colors.text }]}
        numberOfLines={1}
      >
        {song.title}
      </Text>
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
        Category: {song.category || translations.unknownCategory}
      </Text>
      <View style={styles.cardFooter}>
        <Play size={18} color={colors.primary} />
        <Text style={[styles.cardAction, { color: colors.primary }]}>
          Play now
        </Text>
      </View>
    </ContentCardWrapper>
  );

  const renderVideoCard = (video) => (
    <ContentCardWrapper
      key={video.id}
      colors={colors}
      style={styles.videoCard}
      onPress={() => router.push(`/(tabs)/animations/${video.id}`)}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.videoThumbnail}
        />
        {/* Richness: Gradient overlay for a professional video player look */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.videoGradientOverlay}
        />
        {/* Richness: Center Play icon */}
        <View style={styles.playButtonOverlay}>
          <Play size={30} color="#FFFFFF" fill="rgba(0, 0, 0, 0.4)" />
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text
          style={[styles.cardTitle, { color: colors.text, marginBottom: 4 }]}
          numberOfLines={1}
        >
          {video.title}
        </Text>
        <View style={styles.cardFooter}>
          <Video size={16} color={colors.textSecondary} />
          <Text
            style={[
              styles.cardAction,
              { color: colors.textSecondary, fontWeight: '500' },
            ]}
          >
            Watch Now
          </Text>
        </View>
      </View>
    </ContentCardWrapper>
  );

  const renderSkeletonCards = (type) => (
    <>
      <SkeletonCard type={type} />
      <SkeletonCard type={type} />
      <SkeletonCard type={type} />
    </>
  );

  return (
    <SafeAreaWrapper>
      {/* Updated Top Navigation for a modern feel */}
      <TopNavigation title="Grace" />
      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Richer Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.userGreeting, { color: colors.text }]}>
            {user?.email
              ? `Welcome back, ${user.email.split('@')[0]}`
              : 'Welcome, Guest'}
          </Text>
        </View>

        {/* --- Content Sections --- */}

        {/* Sermons section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {translations.latestSermons || 'Latest Sermons'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sermons')}>
              <View style={styles.seeAllContainer}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {translations.seeAll || 'See All'}
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {loading || content.sermons.length === 0
              ? renderSkeletonCards('sermon')
              : content.sermons.map(renderSermonCard)}
          </ScrollView>
        </View>

        {/* Recent Music section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {translations.recentMusic || 'Recent Music'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/songs/music')}
            >
              <View style={styles.seeAllContainer}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {translations.seeAll || 'See All'}
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {loading || content.songs.length === 0
              ? renderSkeletonCards('song')
              : content.songs.map(renderSongCard)}
          </ScrollView>
        </View>

        {/* Animations section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {translations.recentAnimations || 'Recent Animations'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/animations')}>
              <View style={styles.seeAllContainer}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {translations.seeAll || 'See All'}
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {loading || content.videos.length === 0
              ? renderSkeletonCards('video')
              : content.videos.map(renderVideoCard)}
          </ScrollView>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// --- UPDATED STYLES ---

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  // Richer Welcome Section Styles
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userGreeting: {
    fontSize: 24, // Larger greeting
    fontWeight: '700', // Bolder
    letterSpacing: -0.5,
  },
  // Section Header Styles
  section: {
    marginBottom: 32, // More vertical space between sections
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22, // Larger, more impactful title
    fontWeight: '700', // Bolder
    letterSpacing: -0.5,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  // General Card Styles (used by ContentCardWrapper)
  cardWrapper: {
    borderRadius: 12, // Slightly reduced radius for a modern feel
    marginRight: 16,
    marginVertical: 4, // Reduce vertical margin and rely on shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Deeper shadow for "floating" effect
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    width: 240, // Slightly wider cards
  },
  // Sermon and Song Specific Card Styles
  sermonSongCard: {
    padding: 16,
    height: 150, // Fixed height for consistency
    justifyContent: 'space-between',
  },
  sermonSongInfo: {
    // Styling for skeleton info inside sermon/song card
  },
  cardTitle: {
    fontSize: 17, // Slightly larger title
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Video Card Styles (overrides)
  videoCard: {
    overflow: 'hidden',
  },
  videoThumbnailContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 12,
  },
  // Skeleton Styles (Adjusted for new layout)
  skeletonTitle: {
    height: 20,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    width: '50%',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonAction: {
    height: 16,
    width: 80,
    borderRadius: 4,
  },
  bottomSpacer: {
    height: 48,
  },
});
