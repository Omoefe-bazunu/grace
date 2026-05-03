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
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  MapPin,
  Navigation,
  Search,
  Phone,
  List,
  Map,
  RefreshCw,
} from 'lucide-react-native';
import * as Location from 'expo-location';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '@/components/ui/AppText';
import { getDirectories } from '../../services/dataService';

const ZONES_ALL = 'All';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

// const formatDistance = (km) => {
//   if (km < 1) return `${Math.round(km * 1000)}m away`;
//   return `${km}km away`;
// };

const formatDistance = (km) => {
  const dist = km < 1 ? `${Math.round(km * 1000)}m` : `${km}km`;

  const hours = km / 40;
  let drive;
  if (hours < 1 / 40) {
    drive = '<1 min drive';
  } else if (hours < 1) {
    const mins = Math.round(hours * 40);
    drive = `~${mins} min drive`;
  } else {
    const h = Math.floor(hours);
    const mins = Math.round((hours - h) * 40);
    drive = mins > 0 ? `~${h}h ${mins}m drive` : `~${h}h drive`;
  }

  return `${dist} away · ${drive}`;
};

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
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 5.5167,
    longitude: 5.75,
    latitudeDelta: 1.5,
    longitudeDelta: 1.5,
  });

  useEffect(() => {
    fetchData();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(loc.coords);
      }
    } catch {
      // Location unavailable — distance badges simply won't show
    }
  };

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

  // Sort by distance if user location is available
  const sortedBranches = useMemo(() => {
    if (!userLocation) return filteredBranches;
    return [...filteredBranches].sort((a, b) => {
      if (!a.latitude) return 1;
      if (!b.latitude) return -1;
      const distA = parseFloat(
        getDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude,
        ),
      );
      const distB = parseFloat(
        getDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude,
        ),
      );
      return distA - distB;
    });
  }, [filteredBranches, userLocation]);

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
    const distance =
      userLocation && item.latitude
        ? getDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude,
          )
        : null;

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
            <View style={styles.zoneBadgeRow}>
              <AppText style={[styles.zoneText, { color: colors.primary }]}>
                {item.zone?.toUpperCase()}
              </AppText>
              {distance !== null && (
                <View
                  style={[
                    styles.distanceBadge,
                    {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary + '40',
                    },
                  ]}
                >
                  <Navigation size={10} color={colors.primary} />
                  <AppText
                    style={[styles.distanceText, { color: colors.primary }]}
                  >
                    {formatDistance(distance)}
                  </AppText>
                </View>
              )}
            </View>
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
              {userLocation ? ' · sorted by distance' : ''}
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
                      pinColor={
                        selectedBranch?.id === marker.id
                          ? '#e74c3c'
                          : colors.primary
                      }
                      onPress={() => setSelectedBranch(marker)}
                    >
                      <Callout tooltip={false}>
                        <View style={styles.callout}>
                          <AppText style={styles.calloutTitle}>
                            {marker.name}
                          </AppText>
                          <AppText style={styles.calloutAddress}>
                            {marker.address}
                          </AppText>
                          {userLocation && (
                            <AppText
                              style={[
                                styles.calloutDistance,
                                { color: colors.primary },
                              ]}
                            >
                              📍{' '}
                              {formatDistance(
                                getDistance(
                                  userLocation.latitude,
                                  userLocation.longitude,
                                  marker.latitude,
                                  marker.longitude,
                                ),
                              )}
                            </AppText>
                          )}
                        </View>
                      </Callout>
                    </Marker>
                  ) : null,
                )}
              </MapView>
            </View>
          )}

          {/* Branch list — sorted by distance when location is available */}
          <FlatList
            data={sortedBranches}
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
  zoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  zoneText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  distanceText: { fontSize: 11, fontWeight: '600' },
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
  callout: { padding: 10, minWidth: 180, maxWidth: 240 },
  calloutTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  calloutAddress: { fontSize: 12, color: '#666', marginBottom: 4 },
  calloutDistance: { fontSize: 12, fontWeight: '600' },
});
