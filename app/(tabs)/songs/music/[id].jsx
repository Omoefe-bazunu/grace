import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// 1. Removed Heart Import
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Repeat,
  Download,
} from 'lucide-react-native';

// 2. FileSystem & MediaLibrary for Real Saving
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { useTheme } from '../../../../contexts/ThemeContext';
import { usePlayer } from '../../../../contexts/PlayListContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { getSong } from '../../../../services/dataService';

const HARDCODED_ALBUM_ART_URL =
  'https://res.cloudinary.com/db6lml0b5/image/upload/v1766006527/CHOIR_o1kzpt.png';

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

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
  const [isDownloading, setIsDownloading] = useState(false);

  // Animation Refs
  const pulse = useRef(new Animated.Value(1)).current;

  // Animation Logic
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

  // Load Song Data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const songData = await getSong(id);
        setLocalSongData(songData);

        // Auto-play only if it's a NEW song request
        if (songData && (!currentSong || currentSong.id !== songData.id)) {
          await playSong(songData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleMainPlayPause = async () => {
    if (currentSong && (currentSong.id === id || currentSong.songId === id)) {
      togglePlayPause();
    } else {
      if (localSongData) await playSong(localSongData);
    }
  };

  // === REAL SAVE TO DEVICE LOGIC ===
  const handleDownload = async () => {
    const songToDownload = currentSong || localSongData;
    if (!songToDownload?.audioUrl) return;

    // 1. Permission Check
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to save songs to your device.'
      );
      return;
    }

    setIsDownloading(true);
    try {
      // 2. Define path
      const filename = `${songToDownload.title.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;

      // 3. Download to app cache
      const { uri } = await FileSystem.downloadAsync(
        songToDownload.audioUrl,
        fileUri
      );

      // 4. Move to System Music/Gallery
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Optional: Organize into an Album on Android
      if (Platform.OS === 'android') {
        const album = await MediaLibrary.getAlbumAsync('GraceApp Music');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('GraceApp Music', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      }

      Alert.alert('Success', 'Song saved to your device!');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save file.');
    } finally {
      setIsDownloading(false);
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

  const isCurrentSongLoaded =
    currentSong && (currentSong.id === id || currentSong.songId === id);
  const displayIsPlaying = isCurrentSongLoaded ? isPlaying : false;
  const displayPosition = isCurrentSongLoaded ? position : 0;
  const displayDuration = isCurrentSongLoaded ? duration : 1;

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Album Art */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
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
            {localSongData.title}
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            {localSongData.category || 'Unknown'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              {formatTime(displayPosition)}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {formatTime(displayDuration)}
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
                width: `${(displayPosition / displayDuration) * 100}%`,
                height: '100%',
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        {/* --- CONTROLS ROW (No Heart) --- */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity onPress={toggleLoop}>
            <Repeat
              color={isLooping ? colors.primary : colors.textSecondary}
              size={24}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => isCurrentSongLoaded && seek(position - 10000)}
          >
            <Rewind color={colors.text} size={32} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMainPlayPause}
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
            {displayIsPlaying ? (
              <Pause color="#fff" size={32} />
            ) : (
              <Play color="#fff" size={32} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => isCurrentSongLoaded && seek(position + 10000)}
          >
            <FastForward color={colors.text} size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={isDownloading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Download
                color={colors.textSecondary}
                size={20}
                style={{ marginRight: 8 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
