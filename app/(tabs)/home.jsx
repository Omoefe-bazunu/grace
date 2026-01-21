import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
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
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const cards = [
  {
    title: 'Songs of Praises',
    subtitle: 'Sacred melodies for worship and reflection.',
    image:
      'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/CHOIR_o1kzpt.png',
    path: '/songs',
    icon: Music,
    accent: '#3B82F6',
  },
  {
    title: 'Edifying Sermons',
    subtitle: 'Deepen your understanding with sound biblical teaching.',
    image:
      'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006515/SERMON_xeajaz.png',
    path: '/sermons',
    icon: Mic,
    accent: '#10B981',
  },
  {
    title: 'Bible-based Stories',
    subtitle: 'Spiritual values brought to life through narrative.',
    image:
      'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006506/ANIMATIONS_hkemjy.png',
    path: '/animations',
    icon: Film,
    accent: '#F59E0B',
  },
  {
    title: 'Tithes & Offering',
    subtitle: 'Contribute to the global mission of the GKS.',
    image:
      'https://res.cloudinary.com/db6lml0b5/image/upload/v1766007156/PAYMENTS_ccgkod.png',
    path: '',
    icon: HandCoins,
    accent: '#EF4444',
  },
  {
    title: 'Live Events',
    subtitle: 'Stream services and special events in real-time.',
    image:
      'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006543/STREAM_og07ye.png',
    path: '/live',
    icon: Video,
    accent: '#8B5CF6',
  },
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();

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
      {/* Background Motif */}
      <Image
        source={{
          uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/SHEPHARD_izw9ve.png',
        }}
        style={[styles.fixedBackground, { opacity: isDark ? 0.05 : 0.03 }]}
      />

      <TopNavigation title="Grace" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Modern Editorial Banner */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/SHEPHARD_izw9ve.png',
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextContainer}>
            <AppText style={styles.heroLabel}>GOD'S KINGDOM SOCIETY</AppText>
            <AppText style={styles.heroTitle}>
              Towards God's Perfect Government
            </AppText>
            <AppText style={styles.heroDesc}>
              Read, listen, and grow in faith through the Church of the Living
              God.
            </AppText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            Explore Resources
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
