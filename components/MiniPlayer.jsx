import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { usePlayer } from '../app/contexts/PlayContext';
import { Play, Pause, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';

// Placeholder image if none provided
const DEFAULT_ART =
  'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/CHOIR.png?alt=media&token=92dd7301-75bd-4ea8-a042-371e94649186';

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    closePlayer,
    miniPlayerVisible,
    isLoading,
  } = usePlayer();

  const { colors } = useTheme();
  const router = useRouter();

  if (!miniPlayerVisible || !currentSong) return null;

  const handlePress = () => {
    // Navigate to the full music screen
    router.push({
      pathname: '/(tabs)/songs/music/[id]',
      params: { id: currentSong.songId || currentSong.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[
        styles.container,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      {/* Progress Bar (Simple Top Line) */}
      {/* <View style={{ height: 2, backgroundColor: colors.primary, width: '50%' }} /> */}

      <View style={styles.content}>
        {/* Image */}
        <Image source={{ uri: DEFAULT_ART }} style={styles.artwork} />

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentSong.title}
          </Text>
          <Text
            style={[styles.artist, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {currentSong.artist || 'Unknown Artist'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : isPlaying ? (
              <Pause size={24} color={colors.text} />
            ) : (
              <Play size={24} color={colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              closePlayer();
            }}
            style={styles.button}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Sits above the Tab Bar (adjust if your tabs are taller)
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginRight: 8,
  },
  button: {
    padding: 4,
  },
});
