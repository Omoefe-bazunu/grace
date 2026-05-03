import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  MapPin,
  Navigation,
  Search,
  Phone,
  List,
  Map,
  RefreshCw,
} from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '@/components/ui/AppText';
import { getDirectories } from '../../services/dataService';

const ZONES_ALL = 'All';

export default function DirectoryScreen() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const mapRef = useRef(null);

  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone] = useState(ZONES_ALL);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [region, setRegion] = useState({
    latitude: 5.5167,
    longitude: 5.75,
    latitudeDelta: 1.5,
    longitudeDelta: 1.5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await getDirectories();
      setDirectories(data);
      const first = data.find((d) => d.latitude);
      if (first) {
        setRegion({
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 1.5,
          longitudeDelta: 1.5,
        });
      }
    } catch (error) {
      console.error('Directory load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, []);

  const hasAnyCoords = useMemo(
    () => directories.some((d) => d.latitude),
    [directories],
  );

  const filteredBranches = useMemo(() => {
    return directories.filter((item) => {
      const matchesZone =
        selectedZone === ZONES_ALL || item.zone === selectedZone;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.zone?.toLowerCase().includes(q) ||
        item.address?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q);
      return matchesZone && matchesSearch;
    });
  }, [searchQuery, selectedZone, directories]);

  const handleSelectBranch = (item) => {
    setSelectedBranch(item);
    if (item.latitude && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
    }
  };

  const handleGetDirections = (item) => {
    if (item.latitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${item.name}@${item.latitude},${item.longitude}`,
        android: `geo:0,0?q=${item.latitude},${item.longitude}(${item.name})`,
      });
      Linking.openURL(url);
    } else {
      const encoded = encodeURIComponent(item.address);
      const url = Platform.select({
        ios: `maps:?q=${encoded}`,
        android: `geo:0,0?q=${encoded}`,
      });
      Linking.openURL(url);
    }
  };

  const renderBranchItem = ({ item }) => {
    const isSelected = selectedBranch?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => handleSelectBranch(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <AppText style={[styles.zoneText, { color: colors.primary }]}>
              {item.zone?.toUpperCase()}
            </AppText>
            <AppText style={[styles.branchTitle, { color: colors.text }]}>
              {item.name}
            </AppText>
          </View>
          <TouchableOpacity
            style={[styles.navCircle, { backgroundColor: colors.primary }]}
            onPress={() => handleGetDirections(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Navigation size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.addressRow}>
          <MapPin
            size={15}
            color={colors.textSecondary}
            style={{ marginRight: 8, flexShrink: 0 }}
          />
          <AppText
            style={[styles.addressText, { color: colors.textSecondary }]}
          >
            {item.address}
          </AppText>
        </View>

        {item.phone ? (
          <TouchableOpacity
            style={[styles.addressRow, { marginTop: 6 }]}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Phone
              size={15}
              color={colors.primary}
              style={{ marginRight: 8, flexShrink: 0 }}
            />
            <AppText style={[styles.addressText, { color: colors.primary }]}>
              {item.phone}
            </AppText>
          </TouchableOpacity>
        ) : null}

        {!item.latitude && (
          <AppText style={[styles.noMapNote, { color: colors.textSecondary }]}>
            Text directions only
          </AppText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation
        showBackButton
        title={translations.directory || 'Directory'}
        rightComponent={
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={{ padding: 8 }}
          >
            <RefreshCw
              size={20}
              color={refreshing ? colors.textSecondary : colors.primary}
            />
          </TouchableOpacity>
        }
      />

      {/* Search bar + toggle */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={19} color={colors.textSecondary} />
          <TextInput
            placeholder="Search branches, zones, addresses..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {hasAnyCoords && (
          <View style={styles.toggleRow}>
            <View
              style={[
                styles.toggleTrack,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  viewMode === 'list' && { backgroundColor: colors.primary },
                ]}
                onPress={() => setViewMode('list')}
              >
                <List
                  size={15}
                  color={viewMode === 'list' ? '#fff' : colors.textSecondary}
                />
                <AppText
                  style={{
                    fontSize: 13,
                    marginLeft: 5,
                    fontWeight: '600',
                    color: viewMode === 'list' ? '#fff' : colors.textSecondary,
                  }}
                >
                  List
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  viewMode === 'map' && { backgroundColor: colors.primary },
                ]}
                onPress={() => setViewMode('map')}
              >
                <Map
                  size={15}
                  color={viewMode === 'map' ? '#fff' : colors.textSecondary}
                />
                <AppText
                  style={{
                    fontSize: 13,
                    marginLeft: 5,
                    fontWeight: '600',
                    color: viewMode === 'map' ? '#fff' : colors.textSecondary,
                  }}
                >
                  Map
                </AppText>
              </TouchableOpacity>
            </View>
            <AppText style={{ fontSize: 12, color: colors.textSecondary }}>
              {filteredBranches.length} branch
              {filteredBranches.length !== 1 ? 'es' : ''}
            </AppText>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Map view */}
          {viewMode === 'map' && hasAnyCoords && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                showsUserLocation
                showsMyLocationButton
                showsCompass
              >
                {filteredBranches.map((marker) =>
                  marker.latitude ? (
                    <Marker
                      key={marker.id}
                      coordinate={{
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                      }}
                      title={marker.name}
                      description={marker.address}
                      pinColor={
                        selectedBranch?.id === marker.id
                          ? '#e74c3c'
                          : colors.primary
                      }
                      onPress={() => setSelectedBranch(marker)}
                    />
                  ) : null,
                )}
              </MapView>
            </View>
          )}

          {/* Branch list */}
          <FlatList
            data={filteredBranches}
            renderItem={renderBranchItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              viewMode === 'map' && hasAnyCoords && styles.listContentWithMap,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MapPin size={40} color={colors.textSecondary} />
                <AppText
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No branches found
                </AppText>
                <TouchableOpacity
                  style={[styles.retryBtn, { borderColor: colors.primary }]}
                  onPress={onRefresh}
                >
                  <AppText style={{ color: colors.primary, fontWeight: '600' }}>
                    Tap to retry
                  </AppText>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTrack: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 3,
    gap: 2,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  mapContainer: { height: 280, width: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  listContent: { padding: 15, paddingBottom: 40 },
  listContentWithMap: { paddingTop: 10 },
  card: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  zoneText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 3,
  },
  branchTitle: { fontSize: 17, fontWeight: 'bold' },
  navCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressText: { fontSize: 13, flex: 1, lineHeight: 19 },
  noMapNote: { fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
});
