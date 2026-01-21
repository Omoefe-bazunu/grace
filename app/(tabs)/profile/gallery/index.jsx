import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Image, Video, Users } from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNavigation } from '../../../../components/TopNavigation';
import { AppText } from '../../../../components/ui/AppText';

export default function GalleryScreen() {
  const { colors } = useTheme(); // Access theme colors
  const { translations } = useLanguage(); // Access translations

  const cards = [
    {
      title: translations.pictures || 'Pictures',
      icon: <Image size={30} color={colors.primary} />, // Use theme primary color
      route: 'pictures',
    },
    {
      title: translations.videos || 'Videos',
      icon: <Video size={30} color={colors.primary} />, // Use theme primary color
      route: 'videos',
    },
    {
      title: translations.ministers || 'Ministers',
      icon: <Users size={30} color={colors.primary} />, // Use theme primary color
      route: 'ministers',
    },
  ];

  return (
    <View>
      <TopNavigation showBackButton={true} />
      <SafeAreaWrapper style={styles.cardsWrapper}>
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{
              uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766007961/GALLERY_c5xle3.png',
            }}
            style={styles.bannerImage}
          >
            <LinearGradient
              colors={['transparent', `black`]}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerText}>
              <AppText style={styles.bannerTitle}>GALLERY</AppText>
              <AppText style={styles.bannerSubtitle}>
                Here you find the profile of ministers of the GKS, pictures and
                videos of events acrros the branches of the church.
              </AppText>
            </View>
          </ImageBackground>
        </View>
        <View
          style={[
            styles.cardsContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.route}
              style={[
                styles.card,
                { backgroundColor: colors.card, shadowColor: colors.shadow }, // Use theme colors
                index === cards.length - 1 ? styles.lastCardMargin : null, // Add bottom margin to all but the last card
              ]}
              onPress={() => router.push(`/profile/gallery/${card.route}/`)}
            >
              {/* Orange accent bar */}
              <View
                style={[styles.cardAccent, { backgroundColor: '#ca5e0cff' }]}
              />
              {/* Hardcoded orange from design */}
              <View style={styles.cardContent}>
                {card.icon}
                <AppText style={[styles.cardText, { color: colors.text }]}>
                  {/* Use theme text color */}
                  {card.title}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    overflow: 'hidden',
    height: 200,
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  bannerText: {
    paddingHorizontal: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  imageBackground: {
    width: '100%',
    height: 250, // Height based on design approximation
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -50, // Pull up the cards container to overlap
  },
  imageBackgroundStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  cardsWrapper: {
    flex: 1,
    zIndex: 1, // Ensure cards are above the image if there's any overflow
  },
  cardsContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Background color for the card section
    borderTopLeftRadius: 30, // Rounded top corners
    borderTopRightRadius: 30,
    paddingTop: 30, // Padding inside the rounded container
    paddingHorizontal: 20,
    alignItems: 'center', // Center cards horizontally
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // Full width as per design
    height: 100, // Fixed height for each card
    // backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20, // Space between cards
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    overflow: 'hidden', // Ensures accent bar is clipped
  },
  cardAccent: {
    width: 10, // Width of the orange accent bar
    height: '100%',
    backgroundColor: '#ca5e0cff', // Orange color from design
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20, // Padding after the accent bar
  },
  cardText: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#333333', // Default dark text, can be overridden by theme
  },
  lastCardMargin: {
    marginBottom: 40, // Add more margin to the last card to prevent it from hugging the bottom tab bar
  },
  // Skeleton styles (adapt if you have a SkeletonGallery component)
  skeletonHeaderTitle: {
    height: 34,
    width: '70%',
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skeletonHeaderDescription: {
    height: 16,
    width: '90%',
    borderRadius: 4,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skeletonCard: {
    height: 100,
    width: '100%',
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
