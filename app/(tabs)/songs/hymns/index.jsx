import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { AudioPlayer } from '../../../../components/AudioPlayer';

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
  sw: require('../../../../assets/data/psalms_sw.json'),
  ha: require('../../../../assets/data/psalms_ha.json'),
  ur: require('../../../../assets/data/psalms_ur.json'),
};

// Separate caches
const createCache = (dataType) => ({
  data: null,
  timestamp: 0,
  get: function () {
    return Date.now() - this.timestamp < 300000 ? this.data : null;
  },
  set: function (data) {
    this.data = data.map((item, index) => ({
      ...item,
      uniqueId: `${dataType}_${item.tsp_number || item.psalm_number}_${index}`,
    }));
    this.timestamp = Date.now();
  },
});

export default function HymnsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState('tsps'); // "tsps" for hymns, "psalms" for psalms

  const { translations, currentLanguage } = useLanguage();
  const { colors } = useTheme();

  const cache = useMemo(
    () => createCache(dataType),
    [dataType, currentLanguage]
  );

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const cachedData = cache.get();
      if (cachedData) {
        setItems(cachedData);
        return;
      }

      const dataSource = dataType === 'tsps' ? hymnData : psalmData;
      const langData = dataSource[currentLanguage] || dataSource.en;
      cache.set(langData);
      setItems(cache.get());
    } catch (error) {
      console.error(`Failed to load ${dataType}:`, error);
    } finally {
      setLoading(false);
    }
  }, [dataType, currentLanguage, cache]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const searchTerm = searchQuery.toLowerCase();
    return items.filter((item) => {
      const number =
        (dataType === 'tsps' ? item.tsp_number : item.psalm_number)
          ?.toString()
          .toLowerCase() || '';
      const title = item.title?.toLowerCase() || '';
      return number.includes(searchTerm) || title.includes(searchTerm);
    });
  }, [items, searchQuery, dataType]);

  const renderItem = useCallback(
    ({ item }) => {
      const isExpanded = expandedId === item.uniqueId;
      const number = dataType === 'tsps' ? item.tsp_number : item.psalm_number;
      const label = dataType === 'tsps' ? `TSP ${number}` : `Psalm ${number}`;

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
              <Text style={[styles.hymnMeter, { color: colors.textSecondary }]}>
                {item.meter}
              </Text>
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
              <AudioPlayer url={item.audio} title={label} />
            </View>
          )}
        </View>
      );
    },
    [expandedId, dataType, colors]
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title={translations.hymns} />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Return Back</Text>
      </TouchableOpacity>
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
            placeholder="Search by number"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <Picker
          selectedValue={dataType}
          onValueChange={(value) => {
            setDataType(value);
            setItems([]);
            setSearchQuery('');
            setExpandedId(null);
          }}
          style={[
            styles.picker,
            { backgroundColor: colors.surface, color: colors.text },
          ]}
          itemStyle={[styles.pickerItem, { color: colors.text }]}
        >
          <Picker.Item label="Hymns (TSPs)" value="tsps" />
          <Picker.Item label="Psalms" value="psalms" />
        </Picker>
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
              No {dataType === 'tsps' ? 'Hymns' : 'Psalms'} found
            </Text>
          }
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  backText: {
    color: '#1E3A8A',
    fontSize: 16,
    marginHorizontal: 'auto',
    marginVertical: 10,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#000', // fallback
    height: 40,
  },
  picker: {
    height: 55,
    borderRadius: 8,
    marginTop: 10,
  },
  pickerItem: {
    fontSize: 16,
  },
  scrollContainer: {
    padding: 20,
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
