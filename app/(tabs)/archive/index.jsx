import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Image, Video, Users } from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNavigation } from '../../../components/TopNavigation';
import { AppText } from '../../../components/ui/AppText';

export default function ArchiveScreen() {
  const { colors } = useTheme(); // Access theme colors
  const { translations } = useLanguage(); // Access translations

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
  ];

  return (
    <SafeAreaWrapper
      style={[
        styles.cardsWrapper,
        { flex: 1, backgroundColor: colors.background },
      ]}
    >
      <TopNavigation showBackButton={true} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FARCHIVE.png?alt=media&token=9e197db6-1ed1-43d9-91af-8a1307b6ee2b',
            }}
            style={styles.bannerImage}
          >
            <LinearGradient
              colors={['transparent', 'black']}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerText}>
              <AppText style={styles.bannerTitle}>ARCHIVE</AppText>
              <AppText style={styles.bannerSubtitle}>
                Here you will find pictures and videos from old events of the
                church, kept for reference and memories.
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
                  backgroundColor: colors.card,
                  shadowColor: colors.text, // Using text color for shadow helps visibility in both modes
                },
                index === cards.length - 1 ? styles.lastCardMargin : null,
              ]}
              onPress={() => router.push(`/(tabs)/archive/${card.route}/`)}
            >
              {/* Orange accent bar */}
              <View
                style={[styles.cardAccent, { backgroundColor: '#ca5e0cff' }]}
              />

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
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: 120,
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsWrapper: {
    flex: 1,
    zIndex: 1,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 100,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 10,
    height: '100%',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  cardText: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: '600',
  },
  lastCardMargin: {
    marginBottom: 40,
  },
});
