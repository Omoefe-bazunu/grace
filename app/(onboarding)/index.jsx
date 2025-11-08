import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Music, BookOpen, Globe } from 'lucide-react-native';
import { Button } from '../../components/ui/Button'; // Assuming your Button component is a styled element

// Import Reanimated components and hooks
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list'; // Using FlashList for potentially better performance

const { width, height } = Dimensions.get('window');

// --- Updated Color Palette and Icons ---
// Using more sophisticated and spiritually resonant colors
const slides = [
  {
    id: '1',
    title: 'Welcome to Grace',
    description:
      'Your spiritual journey begins here with multilingual worship and biblical content designed to bring you closer to God.',
    icon: <Heart size={80} color="#FFFFFF" />,
    backgroundColor: '#0d0a38ff', // Deep Charcoal/Near-Black for a premium feel
  },
  {
    id: '2',
    title: 'Rich Content',
    description:
      'Access spiritually edifying hymns, inspiring sermons, gospel music, and animated Bible stories.',
    icon: <BookOpen size={80} color="#FFFFFF" />,
    backgroundColor: '#1C3AA2', // A richer, deep indigo
  },
  {
    id: '3',
    title: 'Beautiful Music',
    description:
      'Enjoy our collection of instrumentals and a cappella performances.',
    icon: <Music size={80} color="#FFFFFF" />,
    backgroundColor: '#723BBA', // A luxurious, deep violet
  },
  {
    id: '4',
    title: 'Multiple Languages',
    description:
      'Experience worship in English, Yoruba, Igbo, Urhobo, Hausa, French, Chinese, Swahili, and other supported languages.',
    icon: <Globe size={80} color="#FFFFFF" />, // Changed Palette to Globe for language/world theme
    backgroundColor: '#B5740F', // A sophisticated, dark gold/bronze
  },
];

// Reanimated FlatList (FlashList)
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Shared Value for background color interpolation
  const scrollOffset = useSharedValue(0);

  // Shared Value for footer/button visibility animation (optional)
  const footerY = useSharedValue(height);

  // --- Animation Hooks ---

  // Animate the footer's position on mount
  React.useEffect(() => {
    footerY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const footerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: footerY.value }],
    };
  });

  // Animated style for the main container background color
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollOffset.value,
      slides.map((_, i) => i * width), // Input range based on scroll position
      slides.map((slide) => slide.backgroundColor) // Output colors
    );

    return {
      backgroundColor: backgroundColor,
    };
  });

  // --- Handlers ---

  const onScroll = (event) => {
    scrollOffset.value = event.nativeEvent.contentOffset.x;
  };

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    // Use runOnJS to update the state on the main thread
    runOnJS(setCurrentIndex)(index);
  };

  const navigateToNextScreen = () => {
    router.replace('/(onboarding)/language-selection');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      // Animate the footer off-screen before navigating
      footerY.value = withTiming(height, { duration: 300 }, (isFinished) => {
        if (isFinished) {
          runOnJS(navigateToNextScreen)();
        }
      });
    }
  };

  const handleSkip = () => {
    footerY.value = withTiming(height, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        runOnJS(navigateToNextScreen)();
      }
    });
  };

  // --- Components ---

  const renderSlide = ({ item }) => (
    // Note: The background color is now applied to the main Animated.View container
    <View style={styles.slide}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{item.icon}</View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const Indicator = ({ index }) => {
    const activeWidth = 24;
    const inactiveWidth = 8;
    const activeColor = '#FFFFFF';
    const inactiveColor = 'rgba(255, 255, 255, 0.4)';

    const indicatorAnimatedStyle = useAnimatedStyle(() => {
      const isCurrent = index === currentIndex;
      return {
        width: withTiming(isCurrent ? activeWidth : inactiveWidth, {
          duration: 200,
        }),
        backgroundColor: withTiming(isCurrent ? activeColor : inactiveColor, {
          duration: 200,
        }),
      };
    });

    return <Animated.View style={[styles.indicator, indicatorAnimatedStyle]} />;
  };

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <AnimatedFlashList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={width}
        keyExtractor={(item) => item.id}
        onScroll={onScroll} // Use the Reanimated onScroll handler
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16} // Important for smooth animation updates
      />

      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <Indicator key={index} index={index} />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Using a primary button style for maximum impact */}
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary" // Assuming 'primary' is a high-contrast style
            style={styles.nextButton}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color is dynamically set by backgroundAnimatedStyle
  },
  slide: {
    width,
    height: height * 0.8, // Take up most of the screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
    // Add a slight elevation or shadow for depth
  },
  title: {
    fontSize: 34,
    fontWeight: '800', // Extra bold for a professional look
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF', // Clean white footer
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align left for a modern look
    marginBottom: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    minWidth: 150, // Give the button a solid, professional size
  },
});
