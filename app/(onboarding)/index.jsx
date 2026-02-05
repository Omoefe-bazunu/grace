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
import { useLanguage } from '@/contexts/LanguageContext';

// --- Local Image Imports ---
import logoscreen from '../../assets/images/LOGO.png';
import cloudBG from '../../assets/images/CLOUD.png';
import sermonBG from '../../assets/images/SERMONBG.png';
import micIcon from '../../assets/images/MIC.png';
import micBG from '../../assets/images/MICBG.png';
import musicIcon from '../../assets/images/MUSIC.png';
import moreBG from '../../assets/images/MOREBG.png';
import moreIcon from '../../assets/images/MORE.png';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { translations } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: '1',
      subtitle: translations.onboardingSubtitle1,
      title: translations.onboardingTitle1,
      description: translations.onboardingDesc1,
      colors: ['#113c83', '#022e68'],
      bgImage: cloudBG,
      imageSrc: logoscreen,
    },
    {
      id: '2',
      subtitle: translations.onboardingSubtitle2,
      title: translations.onboardingTitle2,
      description: translations.onboardingDesc2,
      colors: ['#388338', '#1a421a'],
      bgImage: sermonBG,
      imageSrc: micIcon,
    },
    {
      id: '3',
      subtitle: translations.onboardingSubtitle3,
      title: translations.onboardingTitle3,
      description: translations.onboardingDesc3,
      colors: ['#e7713d', '#a64d25'],
      bgImage: micBG,
      imageSrc: musicIcon,
    },
    {
      id: '4',
      subtitle: translations.onboardingSubtitle4,
      title: translations.onboardingTitle4,
      description: translations.onboardingDesc4,
      colors: ['#400eb6', '#09228f'],
      bgImage: moreBG,
      imageSrc: moreIcon,
    },
  ];

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
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      router.replace('/(tabs)/home');
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

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      router.replace('/(tabs)/home');
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
      <View style={{ width, height }}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* Full-Screen Background Image  */}
        <Image
          source={item.bgImage}
          style={styles.fullScreenBackground}
          resizeMode="cover"
        />

        {/* Overlay Gradient for Text Readability  */}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', item.colors[0] + 'CC', item.colors[1]]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ translateY: imageTranslateY }] },
            ]}
          >
            <View style={styles.glowContainer}>
              <Image
                source={item.imageSrc}
                style={styles.foregroundImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity, alignItems: 'center' }}>
            <Text style={styles.subtitle}>{item.subtitle?.toUpperCase()}</Text>
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
        onPress={handleSkip}
        style={styles.skipButton}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>{translations.skip || 'Skip'}</Text>
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
                {translations.startBtn || 'START'}
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
  fullScreenBackground: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100, // Shift content up for visibility
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  foregroundImage: {
    width: 160,
    height: 160,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
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
