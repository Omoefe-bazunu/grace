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
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// --- Slides Data with Gradients ---
const slides = [
  {
    id: '1',
    subtitle: 'Welcome to the',
    title: "God's Kingdom Society",
    description:
      "A Christian Organization where the truth of God's word is preached and practiced in pursuance of the salvation of God.",
    // Dark Blue to Deep Purple gradient
    colors: ['#0d326f', '#071d45'],
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/logo%201.png?alt=media&token=63f2b45b-8e01-423e-a9ca-2384f329d4c9',
  },
  {
    id: '2',
    subtitle: "Grow in God's word with",
    title: 'Edifying Sermons',
    description:
      'Get easy access to sermons of the GKS in text, audio and video formats and learn the word of God as it is in the Bible.',
    // Rich Green to Dark Forest gradient
    colors: ['#388338', '#1a421a'],
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/mic%201.png?alt=media&token=2f7584e0-3a71-4a24-b534-03f57dee9d7e',
  },
  {
    id: '3',
    subtitle: 'Worship God with',
    title: 'Graceful Songs',
    description:
      'Join fellow believers around the world to give honour to God and Christ through melodious songs of praise.',
    // Orange to Deep Burnt Orange
    colors: ['#e7713d', '#a64d25'],
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/MUSCI.png?alt=media&token=8629841c-01b7-4f61-8b1e-9b97708e0cbe',
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

  const navigateToNextScreen = () => {
    router.replace('/(onboarding)/language-selection');
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

    // Parallax effect for the image
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

        {/* Full Screen Gradient Background */}
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Abstract Background Shapes for Modern Feel */}
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <View style={styles.contentContainer}>
          {/* Animated Image Section */}
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ translateY: imageTranslateY }, { scale: 1 }] },
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

          {/* Text Section */}
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
      {/* Fixed Skip Button (Top Right) */}
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
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom Controls Area */}
      <View style={styles.bottomControls}>
        {/* Indicators */}
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

        {/* Modern Floating Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ffffff', '#e0e0e0']}
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
  // Abstract Shapes
  backgroundCircleTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backgroundCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', // Glassmorphic feel
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    paddingBottom: 80, // Space for bottom controls
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    // Add a soft shadow glow behind the image
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    width: 180,
    height: 180,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2, // Modern spacing
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800', // Extra bold
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
