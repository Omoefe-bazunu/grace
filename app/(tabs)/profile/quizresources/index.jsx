import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Search, ArrowLeft, Book } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { getQuizResources, searchContent } from '@/services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';

// Component for a single quiz card
const QuizCard = ({ item, translations, colors }) => {
  const title = item.title || translations.noTitle;
  const category = `${item.year} - ${item.age} - ${item.gender}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/profile/quizresources/${item.id}`)}
    >
      <Text
        style={[styles.quizTitle, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text style={[styles.quizMeta, { color: colors.textSecondary }]}>
        {category}
      </Text>
      <TouchableOpacity
        style={styles.studyButton}
        onPress={() => router.push(`/(tabs)/profile/quizresources/${item.id}`)}
      >
        <Text style={[styles.studyButtonText, { color: '#fff' }]}>
          {translations.study || 'Start Study'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Component for a skeleton loading card
const SkeletonCard = ({ colors }) => (
  <View style={[styles.card, { backgroundColor: colors.card }]}>
    <LinearGradient
      colors={[colors.skeleton, colors.skeletonHighlight]}
      style={styles.skeletonTitle}
    />
    <LinearGradient
      colors={[colors.skeleton, colors.skeletonHighlight]}
      style={styles.skeletonMeta}
    />
    <LinearGradient
      colors={[colors.skeleton, colors.skeletonHighlight]}
      style={styles.skeletonCTA}
    />
  </View>
);

const SKELETON_COUNT = 3;

export default function QuizResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // Fetches initial list of quizzes
  const fetchAllQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getQuizResources();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setSearching(true);
      if (!query.trim()) {
        await fetchAllQuizzes();
      } else {
        try {
          const results = await searchContent(query, 'quizResources');
          setQuizzes(results.quizResources || []);
        } catch (error) {
          console.error('Error searching quizzes:', error);
          setQuizzes([]);
        }
      }
      setSearching(false);
    }, 500),
    []
  );

  useEffect(() => {
    fetchAllQuizzes();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const renderQuizItem = ({ item }) => (
    <QuizCard item={item} translations={translations} colors={colors} />
  );

  const renderEmptyList = () => {
    if (loading || searching) {
      return (
        <>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} colors={colors} />
          ))}
        </>
      );
    }
    return (
      <View style={styles.noResultsContainer}>
        <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
          {translations.noResults || 'No quizzes found.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Quiz" />
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <Search
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={translations.search || 'Search by year, age, gender'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searching && (
          <ActivityIndicator
            color={colors.primary}
            style={styles.searchIndicator}
          />
        )}
      </View>
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/profile`)}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Return Back</Text>
      </TouchableOpacity>

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 40,
    paddingVertical: 8,
    height: 40,
    marginBottom: 0,
  },
  searchIndicator: {
    position: 'absolute',
    right: 30,
    zIndex: 1,
  },
  backText: {
    color: '#1E3A8A',
    fontSize: 16,
    marginHorizontal: 'auto',
    marginVertical: 10,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizMeta: {
    fontSize: 14,
    marginBottom: 12,
  },
  studyButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  studyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonMeta: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonCTA: {
    height: 40,
    width: '100%',
    borderRadius: 8,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
