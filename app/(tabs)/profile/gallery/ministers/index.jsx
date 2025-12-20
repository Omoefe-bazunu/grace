import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TextInput,
} from 'react-native';
import { getMinisters } from '../../../../../services/dataService';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { LinearGradient } from 'expo-linear-gradient';

export default function MinistersGallery() {
  const [ministers, setMinisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getMinisters();
        setMinisters(data);
      } catch (err) {
        console.error('Failed to load ministers:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredMinisters = ministers.filter((minister) =>
    minister.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#1E3A8A"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <ScrollView style={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.bannerContainer}>
            <ImageBackground
              source={{
                uri: 'https://res.cloudinary.com/db6lml0b5/image/upload/v1766007961/GALLERY_c5xle3.png',
              }}
              style={styles.bannerImage}
            >
              <LinearGradient
                colors={['transparent', 'black']}
                style={styles.bannerGradient}
              />
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>MINISTERS PROFILE</Text>
                <Text style={styles.bannerSubtitle}>
                  This screen contains profiles of ministers of the church. This
                  information is meant to help members identify the ministers
                  and address them accordingly.
                </Text>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {filteredMinisters.length === 0 ? (
          <Text style={styles.empty}>
            {searchQuery
              ? 'No ministers found matching your search'
              : 'No ministers listed yet'}
          </Text>
        ) : (
          filteredMinisters.map((m) => (
            <View key={m.id} style={styles.card}>
              <View style={styles.orangeBar} />
              <View style={styles.cardInner}>
                <Image
                  source={{
                    uri: m.imageUrl || 'https://via.placeholder.com/150',
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {m.name || 'Unnamed Minister'}
                  </Text>
                  {m.category && (
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Category:</Text>
                      <Text style={styles.value}>{m.category}</Text>
                    </View>
                  )}
                  {m.station && (
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Station:</Text>
                      <Text style={styles.value}>{m.station}</Text>
                    </View>
                  )}
                  {m.maritalStatus && (
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Marital Status:</Text>
                      <Text style={styles.value}>{m.maritalStatus}</Text>
                    </View>
                  )}
                  {m.contact && (
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Contact</Text>
                      <Text style={styles.value}>{m.contact}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    marginBottom: 16,
  },
  bannerContainer: {
    overflow: 'hidden',
    height: 200,
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: 200,
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
  bannerText: {
    paddingHorizontal: 28,
    alignItems: 'center',
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  orangeBar: {
    width: 6,
    backgroundColor: '#FF6B35',
  },
  cardInner: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
  },
  photo: {
    width: 120,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: '#666',
  },
});
