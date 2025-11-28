import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getGalleryVideos } from '../../../../../services/dataService';
import { groupBy } from 'lodash';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';

export default function GalleryVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGalleryVideos();
        const grouped = Object.entries(groupBy(data, 'event')).sort(
          ([a], [b]) => b.localeCompare(a)
        );
        setVideos(grouped);
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
        <Text style={styles.header}>Videos Gallery</Text>
        {videos.length === 0 ? (
          <Text style={styles.empty}>No videos yet</Text>
        ) : (
          videos.map(([event, items]) => (
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
                {items.map((vid) => (
                  <TouchableOpacity key={vid.id} style={styles.videoWrapper}>
                    <Video
                      source={{ uri: vid.url }}
                      style={styles.video}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping={false}
                    />
                  </TouchableOpacity>
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
  videoWrapper: { marginRight: 16 },
  video: { width: 320, height: 180, borderRadius: 12, backgroundColor: '#000' },
});
