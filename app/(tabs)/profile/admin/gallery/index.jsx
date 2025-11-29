import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Image, Video, Users, Pen } from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../components/TopNavigation';

export default function AdminGalleryManagement() {
  const cards = [
    {
      title: 'Upload Pictures',
      icon: <Image size={40} color="#1E3A8A" />,
      route: 'pictures',
    },
    {
      title: 'Upload Videos',
      icon: <Video size={40} color="#1E3A8A" />,
      route: 'videos',
    },
    {
      title: 'Upload Ministers Data',
      icon: <Users size={40} color="#1E3A8A" />,
      route: 'ministers',
    },
    {
      title: 'Update Gallery Data',
      icon: <Pen size={40} color="#1E3A8A" />,
      route: 'gallerymanager',
    },
  ];

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <View style={styles.container}>
        <Text style={styles.title}>Gallery Management</Text>
        <View style={styles.grid}>
          {cards.map((c) => (
            <TouchableOpacity
              key={c.route}
              style={styles.card}
              onPress={() => router.push(`/profile/admin/gallery/${c.route}/`)}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    width: '45%',
    marginBottom: 20,
    elevation: 4,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});
