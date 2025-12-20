import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker'; // REMOVED
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { LanguageSwitcher } from '../../../../components/LanguageSwitcher';
import { TopNavigation } from '../../../../components/TopNavigation';

// Import language-specific data
const hymnData = {
  en: require('../../../../assets/data/hymns_en.json'),
  fr: require('../../../../assets/data/hymns_fr.json'),
};

const psalmData = {
  en: require('../../../../assets/data/psalms_en.json'),
  fr: require('../../../../assets/data/psalms_fr.json'),
  yo: require('../../../../assets/data/psalms_yo.json'),
  zh: require('../../../../assets/data/psalms_zh.json'),
  tw: require('../../../../assets/data/psalms_tw.json'),
  zu: require('../../../../assets/data/psalms_zu.json'),
  sw: require('../../../../assets/data/psalms_sw.json'),
  ig: require('../../../../assets/data/psalms_ig.json'),
  ha: require('../../../../assets/data/psalms_ha.json'),
  ur: require('../../../../assets/data/psalms_ur.json'),
};

// Single combined cache
const combinedCache = {
  data: null,
  timestamp: 0,
  get: function () {
    // Cache expiry of 5 minutes (300000ms)
    return Date.now() - this.timestamp < 300000 ? this.data : null;
  },
  set: function (hymnList, psalmList) {
    // 1. Tag hymns and create unique IDs
    const taggedHymns = hymnList.map((item, index) => ({
      ...item,
      type: 'tsps', // Added type
      uniqueId: `tsps_${item.tsp_number}_${index}`,
    }));

    // 2. Tag psalms and create unique IDs
    const taggedPsalms = psalmList.map((item, index) => ({
      ...item,
      type: 'psalms', // Added type
      uniqueId: `psalms_${item.psalm_number}_${index}`,
    }));

    // 3. Combine them: HYMNS FIRST, then PSALMS
    this.data = [...taggedHymns, ...taggedPsalms];
    this.timestamp = Date.now();
  },
};

export default function HymnsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed dataType state

  const { translations, currentLanguage } = useLanguage();
  const { colors } = useTheme();

  // Load items now loads both types
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const cachedData = combinedCache.get();
      if (cachedData) {
        setItems(cachedData);
        return;
      }

      // Load Hymns
      const hymns = hymnData[currentLanguage] || hymnData.en;
      // Load Psalms
      const psalms = psalmData[currentLanguage] || psalmData.en;

      combinedCache.set(hymns, psalms);
      setItems(combinedCache.get());
    } catch (error) {
      console.error('Failed to load combined hymns/psalms:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]); // Simplified dependencies

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const searchTerm = searchQuery.toLowerCase();
    return items.filter((item) => {
      // Determine the correct number field based on item type
      const number =
        (item.type === 'tsps' ? item.tsp_number : item.psalm_number)
          ?.toString()
          .toLowerCase() || '';
      const title = item.title?.toLowerCase() || '';
      return number.includes(searchTerm) || title.includes(searchTerm);
    });
  }, [items, searchQuery]); // Removed dataType dependency

  const renderItem = useCallback(
    ({ item }) => {
      const isExpanded = expandedId === item.uniqueId;

      // Determine label and number based on item.type
      const isHymn = item.type === 'tsps';
      const number = isHymn ? item.tsp_number : item.psalm_number;
      const label = isHymn ? `TSP ${number}` : `Psalm ${number}`;

      return (
        <View style={[styles.hymnContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => setExpandedId(isExpanded ? null : item.uniqueId)}
            style={styles.hymnHeader}
            activeOpacity={0.7}
          >
            <Text style={[styles.hymnTitle, { color: colors.primary }]}>
              {label}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          {isExpanded && (
            <View
              style={[styles.hymnContent, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.hymnName, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  style={[styles.hymnSubtitle, { color: colors.textSecondary }]}
                >
                  {item.subtitle}
                </Text>
              )}
              {item.meter && ( // Meter only exists for hymns
                <Text
                  style={[styles.hymnMeter, { color: colors.textSecondary }]}
                >
                  {item.meter}
                </Text>
              )}
              {item.stanzas.map((stanza, index) => (
                <View
                  key={`${item.uniqueId}_stanza_${index}`}
                  style={styles.stanzaContainer}
                >
                  <Text
                    style={[styles.stanzaNumber, { color: colors.primary }]}
                  >
                    {stanza.number}
                  </Text>
                  <Text
                    style={[styles.hymnBody, { color: colors.text }]}
                    selectable
                  >
                    {stanza.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    },
    [expandedId, colors] // Removed dataType dependency
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <View>
        <ImageBackground
          source={{
            uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/CHOIR_o1kzpt.png',
          }}
          style={styles.headerImageContainer}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <Text style={styles.headerTitle}>{'Theocratic Songs of Praise'}</Text>
        </ImageBackground>
      </View>

      <View
        style={[
          styles.controlsContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <Search
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search by number or title"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        {/* REMOVED PICKER COMPONENT */}
      </View>

      {loading && !items.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.uniqueId}
          contentContainerStyle={[
            styles.scrollContainer,
            { backgroundColor: colors.background },
          ]}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No Hymns or Psalms found matching your search.
            </Text>
          }
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: 180,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    width: '90%',
    marginHorizontal: 'auto',
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  hymnContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hymnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  hymnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  hymnContent: {
    padding: 16,
  },
  hymnName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hymnSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  hymnMeter: {
    fontSize: 14,
    marginBottom: 12,
  },
  stanzaContainer: {
    marginBottom: 12,
  },
  stanzaNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  hymnBody: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
