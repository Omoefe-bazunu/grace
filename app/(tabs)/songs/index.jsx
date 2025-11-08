// SongsScreen.tsx (modern design)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../components/TopNavigation';
import { getSongs } from '../../../services/dataService';
import {
  Music,
  BookOpen,
  ChevronRight,
  Sparkles,
  Music2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SongsScreen() {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedSongs = await getSongs();
        setSongs(fetchedSongs);

        // Extract unique categories from actual data
        const uniqueCategories = [
          ...new Set(
            fetchedSongs
              .map((s) => s.category)
              .filter(Boolean)
              .sort()
          ),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setSongs([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const SkeletonCard = () => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonIcon}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonTitle}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonText}
      />
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.songs || 'Songs'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary + '15', 'transparent']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View
              style={[
                styles.heroIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Music size={32} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Worship Through Music
            </Text>
            <Text
              style={[styles.heroSubtitle, { color: colors.textSecondary }]}
            >
              Explore hymns, psalms, and inspirational songs
            </Text>
          </View>
        </View>

        {/* Hymns Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {`${translations.hymns || 'Hymns'} & ${
                translations.psalms || 'Psalms'
              }`}
            </Text>
            <View
              style={[
                styles.sectionUnderline,
                { backgroundColor: colors.primary },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: colors.card }]}
            onPress={() => router.push('/songs/hymns')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[colors.primary + '12', 'transparent']}
              style={styles.cardGradient}
            />
            <View style={styles.featuredCardContent}>
              <View
                style={[
                  styles.featuredIcon,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <BookOpen size={28} color={colors.primary} />
              </View>
              <View style={styles.featuredTextContent}>
                <Text style={[styles.featuredTitle, { color: colors.text }]}>
                  Theocratic Songs of Praise
                </Text>
                <Text
                  style={[
                    styles.featuredSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {translations.theocraticSongs ||
                    'Explore the collection of Theocratic Songs of Praise'}
                </Text>
                <View style={styles.featuredAction}>
                  <View
                    style={[
                      styles.actionPill,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Text
                      style={[styles.actionText, { color: colors.primary }]}
                    >
                      See all hymns and psalms
                    </Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Music Section - Dynamic Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {translations.music || 'Music'}
            </Text>
            <View
              style={[
                styles.sectionUnderline,
                { backgroundColor: colors.primary },
              ]}
            />
          </View>

          {loading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            >
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </ScrollView>
          ) : categories.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Music size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No songs available
              </Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.card, { backgroundColor: colors.card }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/songs/music',
                      params: { category: item },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary + '10', 'transparent']}
                    style={styles.cardGradient}
                  />
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Music2 size={20} color="#FFF" />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {item}
                    </Text>
                    <View style={styles.cardFooter}>
                      <View
                        style={[
                          styles.actionButton,
                          { backgroundColor: colors.primary + '15' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cardActionText,
                            { color: colors.primary },
                          ]}
                        >
                          Explore
                        </Text>
                        <ChevronRight size={14} color={colors.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  heroContent: {
    padding: 28,
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeaderContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionUnderline: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginTop: 6,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  featuredCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featuredTextContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 12,
    fontWeight: '500',
  },
  featuredAction: {
    flexDirection: 'row',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  listContainer: {
    paddingVertical: 4,
  },
  card: {
    borderRadius: 20,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 20,
    minHeight: 48,
  },
  cardFooter: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  emptyState: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginBottom: 16,
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonText: {
    height: 32,
    width: 80,
    borderRadius: 10,
  },
});
