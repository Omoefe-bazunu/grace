// FavoritesScreen.js - Create this file in app/(tabs)/songs/favorites.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Music, Download } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { getFavorites, toggleFavorite } from '../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.songCard, { backgroundColor: colors.card }]}>
      <View style={styles.leftSection}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonNumber}
        />
      </View>
      <View style={styles.songInfo}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonTitle}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonStyle}
        />
      </View>
      <View style={styles.actionButtons}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonIcon}
        />
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight]}
          style={styles.skeletonIcon}
        />
      </View>
    </View>
  );
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState({});
  const { translations } = useLanguage();
  const { colors } = useTheme();

  const loadFavorites = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Unable to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = () => {
    loadFavorites(true);
  };

  // Function to start playing the loop
  const handlePlayAll = () => {
    if (favorites.length > 0) {
      // Start with the first song, tell it we are in 'favorites' context
      router.push({
        pathname: '/(tabs)/songs/music/[id]',
        params: {
          id: favorites[0].songId || favorites[0].id,
          playlistContext: 'favorites',
        },
      });
    }
  };

  const handleRemoveFavorite = async (song) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove "${song.title}" from your favorites?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await toggleFavorite(song.songId, song);
              setFavorites((prev) =>
                prev.filter((f) => f.songId !== song.songId)
              );
              Alert.alert('Success', 'Removed from favorites');
            } catch (error) {
              console.error('Remove favorite error:', error);
              Alert.alert('Error', 'Unable to remove from favorites');
            }
          },
        },
      ]
    );
  };

  const handleDownload = async (song) => {
    if (!song.audioUrl) {
      Alert.alert('Error', 'No audio file available for this song');
      return;
    }

    setDownloadingIds((prev) => ({ ...prev, [song.songId]: true }));

    try {
      const filename = `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResumable = FileSystem.createDownloadResumable(
        song.audioUrl,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
        Alert.alert('Success', 'Song downloaded successfully!');
      } else {
        Alert.alert('Success', `Song saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Unable to download the song');
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [song.songId]: false }));
    }
  };

  const renderSongItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.songCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(tabs)/songs/music/${item.songId}`)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <Text style={[styles.songNumber, { color: colors.primary }]}>
          {index + 1}
        </Text>
      </View>

      <View style={styles.songInfo}>
        <Text
          style={[styles.songTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title || 'Untitled'}
        </Text>
        <Text style={[styles.songStyle, { color: colors.textSecondary }]}>
          {item.style || item.category || 'Unknown'}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDownload(item);
          }}
          disabled={downloadingIds[item.songId]}
        >
          {downloadingIds[item.songId] ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Download size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(item);
          }}
        >
          <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Heart size={64} color={colors.textSecondary} opacity={0.5} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No favorites yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          Start adding songs to your favorites by tapping the heart icon
        </Text>
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Music size={20} color="#FFFFFF" />
          <Text style={styles.browseButtonText}>Browse Songs</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      <View style={styles.headerSection}>
        {!loading && favorites.length > 0 && (
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
          </Text>
        )}
      </View>
      {/* NEW PLAY ALL BUTTON */}
      {!loading && favorites.length > 0 && (
        <TouchableOpacity
          onPress={handlePlayAll}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <PlayCircle size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 12 }}>
            Play All
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.listContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.songId || item.id}
          contentContainerStyle={[
            styles.listContainer,
            { backgroundColor: colors.background },
            favorites.length === 0 && styles.listContainerEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  songCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  leftSection: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  songNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songStyle: {
    fontSize: 14,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonNumber: {
    height: 24,
    width: 24,
    borderRadius: 12,
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonStyle: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
  skeletonIcon: {
    height: 36,
    width: 36,
    borderRadius: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
