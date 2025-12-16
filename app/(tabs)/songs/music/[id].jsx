import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Repeat,
  Heart,
  Download,
} from 'lucide-react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { usePlayer } from '../../../../app/contexts/PlayContext'; // Use Global Context
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import {
  getSong,
  getFavorites,
  toggleFavorite,
} from '../../../../services/dataService';

// ... Keep your SkeletonSong and Constants ...
const HARDCODED_ALBUM_ART_URL =
  'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/CHOIR.png?alt=media&token=92dd7301-75bd-4ea8-a042-371e94649186';

export default function MusicDetailScreen() {
  const { id, playlistContext } = useLocalSearchParams();
  const { colors } = useTheme();

  // Use Global Player
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    position,
    duration,
    seek,
    isLooping,
    toggleLoop,
  } = usePlayer();

  const [localSongData, setLocalSongData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Animation Refs
  const pulse = useRef(new Animated.Value(1)).current;

  // --- Animation Logic ---
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [isPlaying]);

  // --- Load Data & Start Music ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch Song Details
        const songData = await getSong(id);
        setLocalSongData(songData);

        // 2. Fetch Favorites status
        const favs = await getFavorites();
        setIsFavorite(favs.some((f) => f.songId === id || f.id === id));

        // 3. PLAY LOGIC:
        // Only play if it's a DIFFERENT song than what is currently playing
        if (songData && (!currentSong || currentSong.id !== songData.id)) {
          // If playlistContext is set, play with playlist support
          let queue = null;
          if (playlistContext === 'favorites') {
            queue = favs; // Pass the full array of favorite objects
          }
          await playSong(songData, queue);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleFavorite = async () => {
    try {
      await toggleFavorite(id, isFavorite ? 'remove' : 'add');
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (millis) => {
    if (millis < 0) return '0:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  if (loading || !localSongData)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  // Determine active song data (prefer Context data if playing, else local)
  const displaySong =
    currentSong && currentSong.id === id ? currentSong : localSongData;

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Album Art */}
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <Animated.View
            style={{
              transform: [{ scale: pulse }],
              borderRadius: 125,
              elevation: 10,
            }}
          >
            <Image
              source={{ uri: HARDCODED_ALBUM_ART_URL }}
              style={{ width: 250, height: 250, borderRadius: 125 }}
            />
          </Animated.View>
        </View>

        {/* Titles */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text
            style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
          >
            {displaySong.title}
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            {displaySong.artist || 'Unknown'}
          </Text>
        </View>

        {/* Progress */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              {formatTime(position)}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {formatTime(duration)}
            </Text>
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${(position / duration) * 100}%`,
                height: '100%',
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        {/* Controls */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <TouchableOpacity onPress={toggleLoop}>
            <Repeat
              color={isLooping ? colors.primary : colors.textSecondary}
              size={24}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => seek(position - 10000)}>
            <Rewind color={colors.text} size={32} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 5,
            }}
          >
            {isPlaying ? (
              <Pause color="#fff" size={32} />
            ) : (
              <Play color="#fff" size={32} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => seek(position + 10000)}>
            <FastForward color={colors.text} size={32} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFavorite}>
            <Heart
              color={isFavorite ? '#ff4444' : colors.textSecondary}
              fill={isFavorite ? '#ff4444' : 'none'}
              size={24}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
