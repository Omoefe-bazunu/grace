import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../components/TopNavigation';
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
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_IMAGE_HEIGHT = 200;

const cards = [
  {
    title: 'Songs of Praises',
    subtitle: 'Enjoy rich songs in worship to God.',
    image:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/CHOIR.png?alt=media&token=92dd7301-75bd-4ea8-a042-371e94649186',
    path: '/songs',
    icon: Music,
  },
  {
    title: 'Edifying Sermons',
    subtitle: 'Grow the knowledge of God with sound sermons.',
    image:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/SERMON.png?alt=media&token=b288818c-4d0e-426b-b40a-dd8f532b0a75',
    path: '/sermons',
    icon: Mic,
  },

  {
    title: 'Bible-based Stories',
    subtitle: 'Get inspired & informed by stories of spiritual values.',
    image:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/ANIMATIONS.png?alt=media&token=2e09351a-c50c-4dd8-8ea3-a093f8768ff1',
    path: '/animations',
    icon: Film,
  },
  {
    title: 'Tithes & Offering',
    subtitle: 'Support the work of God with your donations.',
    image:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/PAYMENTS.png?alt=media&token=21f61afe-a674-4520-b346-f5617468d0b5',
    path: '/donations',
    icon: HandCoins,
  },
  {
    title: 'Live Events',
    subtitle: 'Join live services and events.',
    image:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/STREAM.png?alt=media&token=9378a13e-7695-4aff-b5d9-002ce2033b68',
    path: '/live',
    icon: Video,
  },
];

export default function HomeScreen() {
  const { colors } = useTheme();

  const renderCard = (card, index) => {
    const cardScale = useSharedValue(1);
    const imageScale = useSharedValue(1);
    const Icon = card.icon;

    const animatedCardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    const animatedImageStyle = useAnimatedStyle(() => ({
      transform: [{ scale: imageScale.value }],
    }));

    const handlePressIn = () => {
      cardScale.value = withTiming(1.05, { duration: 200 });
      imageScale.value = withTiming(1.1, { duration: 200 });
    };

    const handlePressOut = () => {
      cardScale.value = withTiming(1, { duration: 200 });
      imageScale.value = withTiming(1, { duration: 200 });
    };

    return (
      <TouchableOpacity
        key={index}
        onPress={() => router.push(card.path)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[styles.card, animatedCardStyle, { backgroundColor: '#fff' }]}
        >
          <Animated.View
            style={[styles.cardImageContainer, animatedImageStyle]}
          >
            <Image source={{ uri: card.image }} style={styles.cardImage} />
          </Animated.View>
          <View
            style={[styles.iconCircle, { backgroundColor: colors.primary }]}
          >
            <Icon size={18} color="#fff" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {card.title}
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              {card.subtitle}
            </Text>
            <ChevronRight
              size={20}
              color={colors.textSecondary}
              style={styles.arrow}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Grace" />
      <View style={styles.banner}>
        <Image
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/SHEPHARD.png?alt=media&token=6662b885-56ef-4dc5-8961-d3ef8f8c4565',
          }}
          style={styles.bannerImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.bannerGradient}
        />
        <View style={styles.bannerText}>
          <Text style={styles.bannerSociety}>God's Kingdom Society</Text>
          <Text style={styles.bannerChurch}>The Church of The Living God</Text>
          <Text style={styles.bannerTitle}>
            Towards God's Perfect Government
          </Text>
          <Text style={styles.bannerDesc}>
            Read, Listen, and grow in faith anytime, anywhere.
          </Text>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>{cards.map(renderCard)}</View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 250,
    position: 'relative',
    borderBottomWidth: 4,
    borderColor: '#fff',
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerText: {
    position: 'absolute',
    top: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerSociety: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerChurch: { color: '#fff', fontSize: 12 },
  bannerTitle: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 28,
  },
  bannerDesc: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    width: '80%',
    textAlign: 'center',
  },
  content: { flex: 1 },
  cardsContainer: { flexDirection: 'column', padding: 20, gap: 16 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderBottomColor: '#1E3A8A',
    borderBottomWidth: 2,
  },
  cardImageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  iconCircle: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
  },
  cardTextContainer: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 12, opacity: 0.8, width: '80%' },
  arrow: { position: 'absolute', top: 20, right: 16 },
});
