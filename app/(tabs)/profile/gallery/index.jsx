import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
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
  const { colors } = useTheme();
  const { translations } = useLanguage();

  const cards = [
    {
      title: translations.pictures || 'Pictures',
      icon: <Image size={30} color={colors.primary} />,
      route: 'pictures',
    },
    {
      title: translations.videos || 'Videos',
      icon: <Video size={30} color={colors.primary} />,
      route: 'videos',
    },
    {
      title: translations.ministers || 'Ministers',
      icon: <Users size={30} color={colors.primary} />,
      route: 'ministers',
    },
  ];

  return (
    <SafeAreaWrapper
      style={[
        styles.cardsWrapper,
        { flex: 1, backgroundColor: colors.background },
      ]}
    >
      <TopNavigation
        showBackButton={true}
        title={translations.galleryNavTitle || 'Gallery'}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FGALLERY.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
            }}
            style={styles.bannerImage}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerText}>
              <AppText style={styles.bannerTitle}>
                {translations.galleryBannerTitle || 'GALLERY'}
              </AppText>
              <AppText style={styles.bannerSubtitle}>
                {translations.galleryBannerSubtitle ||
                  'Here you find the profile of ministers of the GKS, pictures and videos of events across the branches of the church.'}
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
              activeOpacity={0.8}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface || colors.card,
                  shadowColor: colors.text,
                  borderColor: colors.border,
                  borderWidth: colors.border ? 1 : 0,
                },
                index === cards.length - 1 ? styles.lastCardMargin : null,
              ]}
              onPress={() => router.push(`/profile/gallery/${card.route}/`)}
            >
              <View style={styles.cardAccent} />

              <View style={styles.cardContent}>
                {card.icon}
                <AppText style={[styles.cardText, { color: colors.text }]}>
                  {card.title}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    overflow: 'hidden',
    height: 120,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  bannerText: {
    paddingHorizontal: 40,
    alignItems: 'center', // Centered
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center', // Centered
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center', // Centered
    lineHeight: 18,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 90,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 8,
    height: '100%',
    backgroundColor: '#FF6B35',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '700',
  },
  lastCardMargin: {
    marginBottom: 40,
  },
});
