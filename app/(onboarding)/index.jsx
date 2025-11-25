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
} from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- Slides Data ---
const slides = [
  {
    id: '1',
    subtitle: 'Welcome to the',
    title: "God's Kingdom Society",
    description:
      "A Christian Organization where the truth of God's word is preached and practiced in pursuance of the salvation of God in His Kingdom",
    backgroundColor: '#0d326f',
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/logo%201.png?alt=media&token=63f2b45b-8e01-423e-a9ca-2384f329d4c9',
  },
  {
    id: '2',
    subtitle: "Grow in God's word with",
    title: 'Edifying Sermons',
    description:
      'Get easy access to sermons of the GKS in text, audio and video formats and learn the word of God as it is in the Bible.',
    backgroundColor: '#388338',
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/mic%201.png?alt=media&token=2f7584e0-3a71-4a24-b534-03f57dee9d7e',
  },
  {
    id: '3',
    subtitle: 'Worship God with',
    title: 'Graceful Songs',
    description:
      'Join fellow believers around the word to give honour to God and Christ through melodious songs of praise.',
    backgroundColor: '#e7713d',
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

  const handleSkip = () => {
    navigateToNextScreen();
  };

  const renderSlide = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        {/* Top Left Curve */}
        <View style={styles.topLeftCurve} />

        {/* Skip Button */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <View style={styles.skipButtonInner}>
            <Text style={styles.skipText}>Skip</Text>
          </View>
        </TouchableOpacity>

        <Animated.View
          style={[styles.content, { opacity, transform: [{ scale }] }]}
        >
          {/* Icon Circle with Image */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Image
                source={{ uri: item.imageSrc }}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Title and Description */}
          <Text style={styles.description}>{item.subtitle}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Indicator Dots */}
          <View style={styles.indicators}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicator,
                  {
                    width: currentIndex === i ? 24 : 8,
                    backgroundColor:
                      currentIndex === i
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.5)',
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Bottom Right Arrow Button */}
        <TouchableOpacity onPress={handleNext} style={styles.nextArrowButton}>
          <ArrowRight size={24} color={item.backgroundColor} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  topLeftCurve: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
  },
  skipButtonInner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 20,
    borderWidth: 5,
    borderRadius: 100,
    padding: 20,
    borderColor: '#fff',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF',
  },
  iconImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  nextArrowButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
