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
  RefreshControl,
  ImageBackground,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  Mic,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { getSermonsPaginated } from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';

export default function AudioSermonsScreen() {
  const [allSermons, setAllSermons] = useState([]);
  const [groupedByYear, setGroupedByYear] = useState({});
  const [expandedYear, setExpandedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const { translations } = useLanguage();

  // Fetch all audio sermons
  const loadSermons = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const result = await getSermonsPaginated(1000, null); // large limit to get all
      const audioSermons = result.sermons.filter((s) => s.audioUrl);

      // Group by year
      const grouped = {};
      audioSermons.forEach((sermon) => {
        const date = sermon.date || '';
        const year = date.split('-')[0] || 'Unknown';
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(sermon);
      });

      // Sort years descending
      const sortedYears = Object.keys(grouped).sort((a, b) =>
        b.localeCompare(a)
      );
      const ordered = {};
      sortedYears.forEach((y) => (ordered[y] = grouped[y]));

      setGroupedByYear(ordered);
      setAllSermons(audioSermons);
    } catch (error) {
      console.error('Error loading sermons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, []);

  const onRefresh = () => loadSermons(true);

  const toggleYear = (year) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  const openSermon = (id) => {
    setExpandedYear(null);
    router.push(`/sermons/audio/${id}`);
  };

  const years = Object.keys(groupedByYear);

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/SERMON.png?alt=media&token=b288818c-4d0e-426b-b40a-dd8f532b0a75',
          }}
          style={styles.bannerImage}
        >
          <LinearGradient
            colors={['transparent', 'black']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>AUDIO SERMONS</Text>
            <Text style={styles.bannerSubtitle}>
              Learn the word of God with audio sermons, organized by year.
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View
        style={[
          styles.searchContainer,
          { borderColor: colors.textSecondary + '30' },
        ]}
      >
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
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : years.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Mic size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No audio sermons available
          </Text>
        </View>
      ) : (
        <FlatList
          data={years}
          keyExtractor={(item) => item}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContainer}
          renderItem={({ item: year }) => {
            const sermons = groupedByYear[year];
            const filtered = searchQuery
              ? sermons.filter((s) =>
                  s.title?.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : sermons;

            if (filtered.length === 0 && searchQuery) return null;

            return (
              <View style={styles.yearSection}>
                <TouchableOpacity
                  style={[styles.yearHeader, { backgroundColor: colors.card }]}
                  onPress={() => toggleYear(year)}
                >
                  <View style={styles.yearInfo}>
                    <Calendar size={20} color={colors.primary} />
                    <Text style={[styles.yearText, { color: colors.text }]}>
                      {year}
                    </Text>
                    <Text
                      style={[
                        styles.countText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {filtered.length} sermon{filtered.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {expandedYear === year ? (
                    <ChevronUp size={24} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={24} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                <Modal
                  visible={expandedYear === year}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setExpandedYear(null)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                          {year} Sermons ({filtered.length})
                        </Text>
                        <TouchableOpacity onPress={() => setExpandedYear(null)}>
                          <Text
                            style={{
                              fontSize: 36,
                              color: colors.textSecondary,
                              marginTop: -8,
                            }}
                          >
                            ×
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item: sermon }) => (
                          <TouchableOpacity
                            style={styles.sermonItem}
                            onPress={() => openSermon(sermon.id)}
                          >
                            <Mic size={22} color={colors.primary} />
                            <View style={styles.sermonText}>
                              <Text
                                style={styles.sermonTitle}
                                numberOfLines={2}
                              >
                                {sermon.title || 'Untitled Sermon'}
                              </Text>
                              <Text style={styles.sermonDate}>
                                {sermon.date || 'No date'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                      />
                    </View>
                  </View>
                </Modal>
              </View>
            );
          }}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  bannerContainer: { overflow: 'hidden', height: 180, marginBottom: 10 },
  bannerImage: {
    width: '100%',
    height: 180,
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
  bannerText: { paddingHorizontal: 40, alignItems: 'center', zIndex: 1 },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  yearSection: { marginBottom: 16 },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  yearInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yearText: { fontSize: 18, fontWeight: 'bold' },
  countText: { fontSize: 14, marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center', // Center vertically
    paddingHorizontal: 20,
    paddingBottom: 100,
    marginBottom: 12, // Safe space from bottom tab bar
  },
  modalContent: {
    maxHeight: '88%', // Prevent touching edges
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  sermonItem: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#9b9b9bff',
    alignItems: 'center',
    gap: 16,
  },
  sermonText: { flex: 1 },
  sermonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3b3c3dff',
    marginBottom: 4,
  },
  sermonDate: {
    fontSize: 14,
    color: '#3b3c3dff',
    opacity: 0.8,
  },
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
    fontWeight: '600',
  },
});
