import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ Added Language Hook
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
import { AppText } from '../../components/ui/AppText';
import {
  ChevronRight,
  Mic,
  Music,
  Film,
  HandCoins,
  Video,
  ImageDownIcon,
  ImageIcon,
  Brain,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { translations } = useLanguage(); // ✅ Access translations

  // ✅ Updated cards to use translation keys
  const cards = [
    {
      title: translations.homeCardTitleSermons,
      subtitle: translations.homeCardSubtitleSermons,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FSERMON.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/sermons',
      icon: Mic,
      accent: '#10B981',
    },
    {
      title: translations.homeCardTitleSongs,
      subtitle: translations.homeCardSubtitleSongs,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FCHOIR.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/songs',
      icon: Music,
      accent: '#3B82F6',
    },
    {
      title: translations.homeCardTitleStories,
      subtitle: translations.homeCardSubtitleStories,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FANIMATION.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/animations',
      icon: Film,
      accent: '#F59E0B',
    },
    {
      title: translations.homeCardTitleArchive,
      subtitle: translations.homeCardSubtitleArchive,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FARCHIVE.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/archive',
      icon: ImageDownIcon,
      accent: '#6366F1',
    },
    {
      title: translations.homeCardTitleGallery,
      subtitle: translations.homeCardSubtitleGallery,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FGALLERY.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/profile/gallery',
      icon: ImageIcon,
      accent: '#EC4899',
    },
    {
      title: translations.homeCardTitleQuiz,
      subtitle: translations.homeCardSubtitleQuiz,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FQUIZ.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/profile/quizresources',
      icon: Brain,
      accent: '#14B8A6',
    },
    {
      title: translations.homeCardTitleGiving,
      subtitle: translations.homeCardSubtitleGiving,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FPAYMENTS.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '',
      icon: HandCoins,
      accent: '#EF4444',
    },
    {
      title: translations.homeCardTitleLive,
      subtitle: translations.homeCardSubtitleLive,
      image:
        'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FSTREAM.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
      path: '/live',
      icon: Video,
      accent: '#8B5CF6',
    },
  ];

  const renderCard = (card, index) => {
    const scale = useSharedValue(1);
    const Icon = card.icon;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <TouchableOpacity
        key={index}
        onPress={() => router.push(card.path)}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.card,
            animatedStyle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Image source={{ uri: card.image }} style={styles.cardImage} />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardGradient}
          />

          <View style={styles.cardContent}>
            <View style={[styles.iconBadge, { backgroundColor: card.accent }]}>
              <Icon size={14} color="#fff" />
            </View>
            <View style={styles.textStack}>
              <AppText style={styles.cardTitle}>{card.title}</AppText>
              <AppText style={styles.cardSubtitle} numberOfLines={1}>
                {card.subtitle}
              </AppText>
            </View>
            <ChevronRight size={18} color="#fff" style={styles.cardArrow} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaWrapper>
      <Image
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FHERO.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
        }}
        style={[styles.fixedBackground, { opacity: isDark ? 0.05 : 0.03 }]}
      />

      <TopNavigation title={translations.homeNavTitle || 'Grace'} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FHERO.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextContainer}>
            <AppText style={styles.heroLabel}>
              {translations.heroLabel || "GOD'S KINGDOM SOCIETY"}
            </AppText>
            <AppText style={styles.heroTitle}>
              {translations.heroTitle || "Towards God's Perfect Government"}
            </AppText>
            <AppText style={styles.heroDesc}>
              {translations.heroDesc ||
                'Read, listen, and grow in faith with the Church of the Living God.'}
            </AppText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            {translations.exploreResources || 'Explore Resources'}
          </AppText>
          <View
            style={[styles.titleLine, { backgroundColor: colors.primary }]}
          />
        </View>

        <View style={styles.cardsGrid}>{cards.map(renderCard)}</View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedBackground: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    top: 100,
    right: -width * 0.5,
    tintColor: 'gray', // Makes it feel more like a watermark
  },
  heroSection: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  heroLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  titleLine: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  cardsGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textStack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  cardArrow: {
    marginLeft: 10,
    opacity: 0.8,
  },
});
