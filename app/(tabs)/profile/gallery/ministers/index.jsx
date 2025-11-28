// app/gallery/ministers/index.jsx
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getMinisters } from '../../../../../services/dataService';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';

export default function MinistersGallery() {
  const [ministers, setMinisters] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.header}>Our Ministers</Text>

        {ministers.length === 0 ? (
          <Text style={styles.empty}>No ministers listed yet</Text>
        ) : (
          ministers.map((m) => (
            <View key={m.id} style={styles.card}>
              <Image
                source={{
                  uri: m.imageUrl || 'https://via.placeholder.com/120',
                }}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text style={styles.name}>{m.name || 'Unnamed Minister'}</Text>
                {m.category && (
                  <Text style={styles.detail}>Category: {m.category}</Text>
                )}
                {m.station && (
                  <Text style={styles.detail}>Station: {m.station}</Text>
                )}
                {m.maritalStatus && (
                  <Text style={styles.detail}>Status: {m.maritalStatus}</Text>
                )}
                {m.contact && (
                  <Text style={styles.detail}>Contact: {m.contact}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginVertical: 20,
  },
  empty: { textAlign: 'center', color: '#666', fontSize: 18, marginTop: 50 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    elevation: 4,
  },
  photo: { width: 120, height: 120, borderRadius: 60 },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  detail: { fontSize: 15, color: '#444', marginTop: 4 },
});
