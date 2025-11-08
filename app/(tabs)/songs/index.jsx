// SongsScreen.tsx (final - confirmed data from dataService)
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

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.songs || 'Songs'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/songs/hymns')}
          >
            <Text style={[styles.tabText, { color: colors.text }]}>
              {translations.hymns || 'Hymns'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/songs/music')}
          >
            <Text style={[styles.tabText, { color: colors.text }]}>
              {translations.music || 'Music'}
            </Text>
          </TouchableOpacity>
        </View> */}
        {/* Hymns Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {`${translations.hymns || 'Hymns'} & ${
              translations.psalms || 'Psalms'
            }`}
          </Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/songs/hymns')}
          >
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text, marginBottom: 4 },
              ]}
            >
              Theocratic Songs of Praise (TSPs)
            </Text>
            <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
              {translations.theocraticSongs ||
                'Explore the collection of Theocratic Songs of Praise.'}
            </Text>
            <Text style={[styles.metaText, { color: colors.primary }]}>
              See all hymns and psalms
            </Text>
          </TouchableOpacity>
        </View>
        {/* Music Section - Dynamic Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {translations.music || 'Music'}
          </Text>
          {loading ? (
            <Text
              style={{ color: colors.textSecondary, paddingHorizontal: 20 }}
            >
              Loading categories...
            </Text>
          ) : categories.length === 0 ? (
            <Text
              style={{ color: colors.textSecondary, paddingHorizontal: 20 }}
            >
              No songs available
            </Text>
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
                >
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {item}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    See all songs in this category
                  </Text>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flexGrow: 1,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
});
