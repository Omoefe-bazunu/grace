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
import { Calendar, Phone, BadgeCheck, X, Maximize2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function MinistersGallery() {
  const { colors } = useTheme();
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

  const filteredMinisters = ministers.filter((minister) =>
    minister.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          {/* Header Section */}
          <View style={styles.headerSection}>
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
                    MINISTERS PROFILE
                  </AppText>
                  <AppText style={styles.bannerSubtitle}>
                    Official profiles of the GKS ministry. Identifying and
                    honouring those who labour in the word.
                  </AppText>
                </View>
              </ImageBackground>
            </View>
            <View
              style={[styles.searchContainer, { backgroundColor: colors.card }]}
            >
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search by name..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* List Section */}
          <View style={styles.listContainer}>
            {filteredMinisters.map((m) => (
              <View
                key={m.id}
                style={[styles.card, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.topBorder,
                    { backgroundColor: colors.primary },
                  ]}
                />

                <View style={styles.cardInner}>
                  <TouchableOpacity
                    onPress={() => setSelectedImage(m.url)}
                    activeOpacity={0.9}
                    style={styles.photoContainer}
                  >
                    <Image
                      source={{
                        uri: m.url || 'https://via.placeholder.com/150',
                      }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                    <View style={styles.fullscreenHint}>
                      <Maximize2 size={12} color="white" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.info}>
                    <AppText style={[styles.name, { color: colors.text }]}>
                      {m.name || 'Unnamed Minister'}
                    </AppText>

                    <View style={styles.detailRow}>
                      <BadgeCheck
                        size={14}
                        color={colors.primary}
                        style={styles.icon}
                      />
                      <AppText
                        style={[styles.value, { color: colors.textSecondary }]}
                      >
                        {m.category || 'Minister'}
                      </AppText>
                    </View>

                    <View style={styles.detailRow}>
                      <Calendar
                        size={14}
                        color={colors.textSecondary}
                        style={styles.icon}
                      />
                      <AppText
                        style={[styles.value, { color: colors.textSecondary }]}
                      >
                        Devoted: {m.dateDevoted || 'N/A'}
                      </AppText>
                    </View>

                    {/* ✅ RE-ADDED CONTACT SECTION */}
                    <View style={styles.detailRow}>
                      <Phone
                        size={14}
                        color={colors.textSecondary}
                        style={styles.icon}
                      />
                      <AppText
                        style={[styles.value, { color: colors.textSecondary }]}
                      >
                        {m.contact || 'Contact not provided'}
                      </AppText>
                    </View>
                  </View>
                </View>
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
              style={styles.modalOverlay}
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
  headerSection: { marginBottom: 16 },
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
  listContainer: { marginTop: 20 },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  topBorder: { height: 4, width: '100%' },
  cardInner: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  photoContainer: { position: 'relative' },
  photo: { width: 90, height: 110, borderRadius: 12 },
  fullscreenHint: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 10,
  },
  info: { flex: 1, marginLeft: 18, justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  icon: { marginRight: 8 },
  value: { fontSize: 13, fontWeight: '500' },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalOverlay: { ...StyleSheet.absoluteFillObject },
  fullImage: { width: width, height: height * 0.8 },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    padding: 10,
  },
});
