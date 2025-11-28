import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Image, Video, Users } from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';

export default function GalleryScreen() {
  const cards = [
    {
      title: 'Pictures',
      icon: <Image size={40} color="#1E3A8A" />,
      route: 'pictures',
    },
    {
      title: 'Videos',
      icon: <Video size={40} color="#1E3A8A" />,
      route: 'videos',
    },
    {
      title: 'Ministers',
      icon: <Users size={40} color="#1E3A8A" />,
      route: 'ministers',
    },
  ];

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <View style={styles.container}>
        <Text style={styles.title}>Gallery</Text>
        <View style={styles.grid}>
          {cards.map((c) => (
            <TouchableOpacity
              key={c.route}
              style={styles.card}
              onPress={() => router.push(`/profile/gallery/${c.route}/`)}
            >
              {c.icon}
              <Text style={styles.cardText}>{c.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '45%',
    marginBottom: 20,
    elevation: 5,
  },
  cardText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});
