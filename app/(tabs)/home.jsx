import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
// ADDED: Import the Video component for the home screen preview
import { Video } from 'expo-av';

import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
import { getRecentContent } from '../../services/dataService';
import {
  ChevronRight,
  Play,
  Clock,
  Sparkles,
  Music2,
  Music,
  Music2Icon,
  BookAIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, Music3Icon } from 'lucide-react';

const SkeletonCard = ({ type }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        type === 'video' ? styles.videoCard : {},
        { backgroundColor: colors.card },
      ]}
    >
      {type === 'video' && (
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.videoThumbnail}
        />
      )}
      <View style={type === 'video' ? styles.videoInfo : {}}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonSubtitle}
        />
        {type !== 'video' && (
          <View style={styles.cardFooter}>
            <LinearGradient
              colors={[colors.skeleton, colors.skeletonHighlight]}
              style={styles.skeletonAction}
            />
          </View>
        )}
      </View>
    </View>
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      console.log('Fetching recent content...');
      const data = await getRecentContent();
      console.log('Content loaded:', data);
      setContent(data);
    } catch (error) {
      console.error('Error fetching recent content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContent();
  };

  const getTranslatedContent = (item) => {
    return (
      item.translations?.[currentLanguage] || item.translations?.en || item
    );
  };

  const renderSermonCard = (sermon) => {
    const content = getTranslatedContent(sermon);
    return (
      <TouchableOpacity
        key={sermon.id}
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/(tabs)/sermons/${sermon.id}`)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colors.primary + '15', 'transparent']}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
            <BookAIcon size={18} color="#fff" />
          </View>
          <Text
            style={[styles.cardTitle, { color: colors.text }]}
            numberOfLines={2}
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
            <View
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <Text style={[styles.cardAction, { color: colors.primary }]}>
                Start studying
              </Text>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSongCard = (song) => (
    <TouchableOpacity
      key={song.id}
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/songs/music/${song.id}`)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[colors.primary + '15', 'transparent']}
        style={styles.cardGradient}
      />
      <View style={styles.cardContent}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
          <Music2 size={18} color="#fff" fill={colors.primary} />
        </View>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {song.title}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {song.category || translations.unknownCategory}
        </Text>
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Text style={[styles.cardAction, { color: colors.primary }]}>
              Play now
            </Text>
            <ChevronRight size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVideoCard = (video) => (
    <TouchableOpacity
      key={video.id}
      style={[styles.videoCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/animations/${video.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.videoThumbnailContainer}>
        {/* MODIFIED: Using Video component for auto-playing preview */}
        <Video
          source={{ uri: video.videoUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
          shouldPlay={true} // Auto-play the video snippet
          isLooping={true} // Loop the video
          isMuted={true} // Mute for automatic playback
          useNativeControls={false} // Hide controls for a cleaner snippet look
          onError={(e) => {
            console.error('Video load error:', e.error);
          }}
          // Fallback poster image can be used if video fails to load immediately
          // posterSource={{ uri: video.thumbnailUrl }}
          // usePoster={true}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.videoGradientOverlay}
        />
        <View style={styles.playButtonOverlay}>
          <View
            style={[styles.playButton, { backgroundColor: colors.primary }]}
          >
            <Play size={24} color="#fff" fill="#fff" />
          </View>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Text style={[styles.cardAction, { color: colors.primary }]}>
              Watch Now
            </Text>
            <ChevronRight size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <TopNavigation title="Grace" />
      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.welcomeSection}>
          <LinearGradient
            colors={[colors.primary + '10', 'transparent']}
            style={styles.welcomeGradient}
          />
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || translations.guest}
          </Text>
        </View>

        {/* Sermons section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                {translations.latestSermons}
              </Text>
              <View
                style={[
                  styles.sectionUnderline,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/sermons')}
              style={styles.seeAllButton}
            >
              <View style={styles.seeAllContainer}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {translations.seeAll}
                </Text>
                <ChevronRight size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.scrollContent}
          >
            {loading || content.sermons.length === 0
              ? renderSkeletonCards('sermon')
              : content.sermons.map(renderSermonCard)}
          </ScrollView>
        </View>

        {/* Recent Music section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                {translations.recentMusic}
              </Text>
              <View
                style={[
                  styles.sectionUnderline,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/songs')}
              style={styles.seeAllButton}
            >
              <View style={styles.seeAllContainer}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {translations.seeAll}
                </Text>
                <ChevronRight size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.scrollContent}
          >
            {loading || content.songs.length === 0
              ? renderSkeletonCards('song')
              : content.songs.map(renderSongCard)}
          </ScrollView>
        </View>

        {/* Animations section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                {translations.recentAnimations}
              </Text>
              <View
                style={[
                  styles.sectionUnderline,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/animations')}
              style={styles.seeAllButton}
            >
              <View style={styles.seeAllContainer}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {translations.seeAll}
                </Text>
                <ChevronRight size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.scrollContent}
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    position: 'relative',
  },
  welcomeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderRadius: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    opacity: 0.7,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionUnderline: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginTop: 6,
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    borderRadius: 20,
    marginRight: 16,
    marginVertical: 4,
    width: 240,

    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.12,
    // shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  // cardGradient: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   height: '100%',
  //   borderRadius: 20,
  // },
  cardContent: {
    padding: 20,
    flexGrow: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
    lineHeight: 24,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 20,
    opacity: 0.75,
    marginBottom: 16,
    fontWeight: '500',
    flexGrow: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  videoCard: {
    borderRadius: 20,
    marginRight: 16,
    marginVertical: 4,
    width: 260,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.12,
    // shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 160,
  },
  videoGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  videoInfo: {
    padding: 16,
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    width: '60%',
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonAction: {
    height: 16,
    width: 60,
    borderRadius: 6,
  },
  bottomSpacer: {
    height: 32,
  },
});
