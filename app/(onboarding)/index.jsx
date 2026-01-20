import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// --- Updated Slides Data with Background Images ---
const slides = [
  {
    id: '1',
    subtitle: 'Welcome to the',
    title: "God's Kingdom Society",
    description:
      "A Christian Organization where the truth of God's word is preached and practiced in pursuance of the salvation of God.",
    colors: ['#113c83', '#022e68'],
    // Placeholder: Church/Cathedral architecture
    bgImage:
      'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop',
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/high-481fd.firebasestorage.app/o/logo%201.png?alt=media&token=bd2c3552-c369-47cd-81cd-2f50ff40aa8e',
  },
  {
    id: '2',
    subtitle: "Grow in God's word with",
    title: 'Edifying Sermons',
    description:
      'Get easy access to sermons of the GKS in text, audio and video formats and learn the word of God as it is in the Bible.',
    colors: ['#388338', '#1a421a'],
    // Placeholder: Bible/Study
    bgImage:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop',
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/high-481fd.firebasestorage.app/o/mic%201.png?alt=media&token=a54757d1-5375-467c-95eb-5562b954ff45',
  },
  {
    id: '3',
    subtitle: 'Worship God with',
    title: 'Graceful Songs',
    description:
      'Join fellow believers around the world to give honour to God and Christ through melodious songs of praise.',
    colors: ['#e7713d', '#a64d25'],
    // Placeholder: Worship/Choir atmosphere
    bgImage:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/high-481fd.firebasestorage.app/o/MUSCI.png?alt=media&token=b1114017-7b58-4ff7-9b9d-dc16efe11e3b',
  },
  {
    id: '4',
    subtitle: 'EXPLORE MORE',
    title: 'MORE FEATURES',
    description:
      "Learn God's word through animations, and gain access to pictures and videos in the church's archive.",
    colors: ['#400eb6', '#09228f'],
    // Placeholder: Digital Archive/Library
    bgImage:
      'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1000&auto=format&fit=crop',
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/high-481fd.firebasestorage.app/o/GE.png?alt=media&token=96789499-f3ed-4185-9ca1-3fa786c4e7e2',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const navigateToNextScreen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(onboarding)/language-selection');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      router.replace('/(onboarding)/language-selection');
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigateToNextScreen();
    }
  };

  const renderSlide = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const imageTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [100, 0, 100],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width, height, overflow: 'hidden' }}>
        <StatusBar barStyle="light-content" />

        {/* --- Background Image (Faded) --- */}
        <Image
          source={{ uri: item.bgImage }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* --- Gradient Overlay (Adds color and improves text readability) --- */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.3)', // Darker top for the "Skip" button visibility
            item.colors[0] + 'E6', // Adding 'E6' for ~90% opacity
            item.colors[1],
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Background Decorative Circles */}
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ translateY: imageTranslateY }] },
            ]}
          >
            <View style={styles.glowContainer}>
              <Image
                source={{ uri: item.imageSrc }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity, alignItems: 'center' }}>
            <Text style={styles.subtitle}>{item.subtitle.toUpperCase()}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={navigateToNextScreen}
        style={styles.skipButton}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View style={styles.bottomControls}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.indicator,
                  { width: dotWidth, opacity: dotOpacity },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ffffff', '#f0f0f0']}
            style={styles.nextButtonGradient}
          >
            {currentIndex === slides.length - 1 ? (
              <Text
                style={[
                  styles.nextButtonText,
                  { color: slides[currentIndex].colors[1] },
                ]}
              >
                START
              </Text>
            ) : (
              <ArrowRight size={24} color={slides[currentIndex].colors[1]} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundCircleTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backgroundCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 20, // Increased to stay above images
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    // Glow effect for the main icon
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 110,
  },
  image: {
    width: 180,
    height: 180,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 },
    // textShadowRadius: 10,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    height: 10,
    alignItems: 'center',
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  nextButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  nextButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});
