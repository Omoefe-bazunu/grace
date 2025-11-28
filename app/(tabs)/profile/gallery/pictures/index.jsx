import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getGalleryPictures } from '../../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';

export default function GalleryPictures() {
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGalleryPictures();
        const grouped = Object.entries(groupBy(data, 'event')).sort(
          ([a], [b]) => b.localeCompare(a)
        ); // newest first
        setPictures(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#1E3A8A"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Pictures Gallery</Text>
        {pictures.length === 0 ? (
          <Text style={styles.empty}>No pictures yet</Text>
        ) : (
          pictures.map(([event, items]) => (
            <View key={event} style={styles.eventBlock}>
              <Text style={styles.eventTitle}>{event || 'Untitled Event'}</Text>
              {items[0]?.description && (
                <Text style={styles.desc}>{items[0].description}</Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.row}
              >
                {items.map((pic) => (
                  <Image
                    key={pic.id}
                    source={{ uri: pic.url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
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
  eventBlock: { marginBottom: 32, paddingHorizontal: 16 },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  desc: { color: '#555', fontSize: 14, marginBottom: 12, fontStyle: 'italic' },
  row: { flexDirection: 'row' },
  image: { width: 300, height: 200, borderRadius: 12, marginRight: 12 },
});
