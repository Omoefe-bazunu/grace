import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { getMinisters } from '../../../../../services/dataService';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../../../../components/ui/AppText';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Phone, BadgeCheck, X, Maximize2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const CATEGORY_ORDER = [
  'Founding Instrument',
  'Past Presidents',
  'Past Chairman of Executive Board',
  'Executive Board Members',
  'Spiritual Advisers',
  'Senior Ministers',
  'Intermediate Ministers',
  'Junior Ministers',
];

export default function MinistersGallery() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const [ministers, setMinisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchMinisters = async () => {
    try {
      const data = await getMinisters();
      setMinisters(data || []);
    } catch (err) {
      console.error('Failed to load ministers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMinisters();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMinisters();
  }, []);

  const filteredMinisters = ministers.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group by category in canonical order
  const groupedMinisters = CATEGORY_ORDER.reduce((acc, cat) => {
    const members = filteredMinisters
      .filter((m) => m.category === cat)
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    if (members.length > 0) acc.push({ category: cat, members });
    return acc;
  }, []);

  // Ministers whose category doesn't match any known one go at the end
  const uncategorised = filteredMinisters.filter(
    (m) => !CATEGORY_ORDER.includes(m.category),
  );
  if (uncategorised.length > 0) {
    groupedMinisters.push({ category: 'Other', members: uncategorised });
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaWrapper>
        <TopNavigation showBackButton={true} />

        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.bannerContainer}>
              <ImageBackground
                source={{
                  uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FHome%2FIMG-20260520-WA0239-01.jpeg?alt=media&token=cd857f08-86b0-4138-9e6f-a80307af5048',
                }}
                style={styles.bannerImage}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.bannerGradient}
                />
                <View style={styles.bannerText}>
                  <AppText style={styles.bannerTitle}>
                    {translations.ministersBannerTitle || 'MINISTERS PROFILE'}
                  </AppText>
                  <AppText style={styles.bannerSubtitle}>
                    {translations.ministersBannerSubtitle ||
                      'Official profiles of the GKS ministers. Identifying and honouring those who labour in the word.'}
                  </AppText>
                </View>
              </ImageBackground>
            </View>

            <View
              style={[styles.searchContainer, { backgroundColor: colors.card }]}
            >
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={translations.searchByName || 'Search by name...'}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Grouped Cards */}
          <View style={styles.listContainer}>
            {groupedMinisters.map(({ category, members }) => (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeaderRow}>
                  <View
                    style={[
                      styles.categoryAccent,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                  <AppText
                    style={[styles.categoryHeader, { color: colors.text }]}
                  >
                    {category}
                  </AppText>
                </View>

                {members.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedImage(m.url)}
                    activeOpacity={0.9}
                    style={styles.card}
                  >
                    <ImageBackground
                      source={{ uri: m.url }}
                      style={StyleSheet.absoluteFill}
                      imageStyle={{ borderRadius: 16 }}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        colors={[
                          'transparent',
                          'rgba(0,0,0,0.45)',
                          'rgba(0,0,0,0.88)',
                        ]}
                        style={styles.cardGradient}
                      />
                      <View style={styles.expandHint}>
                        <Maximize2 size={13} color="rgba(255,255,255,0.85)" />
                      </View>
                      <View style={styles.cardContent}>
                        <AppText style={styles.cardName} numberOfLines={1}>
                          {m.name || 'Unnamed Minister'}
                        </AppText>
                        <View style={styles.cardBadge}>
                          <BadgeCheck
                            size={12}
                            color="rgba(255,255,255,0.85)"
                          />
                          <AppText
                            style={styles.cardBadgeText}
                            numberOfLines={1}
                          >
                            {m.category || 'Minister'}
                          </AppText>
                        </View>
                        {m.duration ? (
                          <View>
                            <AppText
                              style={styles.cardDuration}
                              numberOfLines={1}
                            >
                              {m.duration}
                            </AppText>
                          </View>
                        ) : null}

                        {m.contact ? (
                          <View style={styles.cardContact}>
                            <Phone size={11} color="rgba(255,255,255,0.6)" />
                            <AppText style={styles.cardContactText}>
                              {m.contact}
                            </AppText>
                          </View>
                        ) : null}
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Fullscreen Modal */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setSelectedImage(null)}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.9)', 'black']}
                style={StyleSheet.absoluteFill}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <X color="white" size={32} />
            </TouchableOpacity>

            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  headerSection: { marginBottom: 8 },
  bannerContainer: { overflow: 'hidden', height: 120 },
  bannerImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  bannerGradient: { ...StyleSheet.absoluteFillObject },
  bannerText: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16 },

  // Category groups
  listContainer: { paddingHorizontal: 16, marginTop: 24 },
  categorySection: { marginBottom: 28 },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryAccent: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  categoryHeader: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    height: 320,
    backgroundColor: '#1a1a2e',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  expandHint: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  cardName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  cardBadgeText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '500',
  },
  cardContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardContactText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  cardDuration: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginBottom: 5,
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullImage: { width, height: height * 0.8 },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
