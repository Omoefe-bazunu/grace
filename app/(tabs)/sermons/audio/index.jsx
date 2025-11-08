// app/(tabs)/sermons/audio/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Mic, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { getSermons } from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonItem = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.item, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonTitle}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonDate}
      />
    </View>
  );
};

export default function AudioSermonsScreen() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const { translations } = useLanguage();

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const data = await getSermons();
      const audioSermons = data.filter((s) => s.audioUrl);
      setSermons(audioSermons);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSermons = sermons.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.date?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/sermons/audio/${item.id}`)}
    >
      <View style={styles.iconContainer}>
        <Mic size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title || translations.noTitle}
        </Text>
        <View style={styles.dateRow}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {item.date || translations.unknownDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <>
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.audioSermons || 'Audio Sermons'} />
      <View style={styles.searchContainer}>
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={translations.searchSermons || 'Search sermons...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {loading ? (
        <View style={styles.listContainer}>{renderSkeleton()}</View>
      ) : filteredSermons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Mic size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {searchQuery
              ? translations.noSermonsFound
              : translations.noAudioSermons}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSermons}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: { fontSize: 14 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDate: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },
});
