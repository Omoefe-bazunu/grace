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
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Repeat,
  Download,
} from 'lucide-react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { Audio } from 'expo-av';

import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext'; // ✅ Added Language Hook
import { usePlayer } from '../../../../contexts/PlayListContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { getSong } from '../../../../services/dataService';
import { AppText } from '../../../../components/ui/AppText';
import ChoirImage from '../../../../assets/images/CHOIR.png';

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { translations } = useLanguage(); // ✅ Access translations

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

  const pulse = useRef(new Animated.Value(1)).current;

  // === CONFIGURE BACKGROUND AUDIO ===
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to configure audio session:', error);
      }
    };

    configureAudio();
  }, []);

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
        ]),
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

  const handleDownload = async () => {
    const songToDownload = currentSong || localSongData;
    if (!songToDownload?.audioUrl) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        translations.permissionRequired || 'Permission required',
        translations.saveSongsPermission ||
          'Please allow access to save songs to your device.',
      );
      return;
    }

    setIsDownloading(true);
    try {
      const filename = `${songToDownload.title.replace(
        /[^a-z0-9]/gi,
        '_',
      )}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(
        songToDownload.audioUrl,
        fileUri,
      );

      const asset = await MediaLibrary.createAssetAsync(uri);

      if (Platform.OS === 'android') {
        const album = await MediaLibrary.getAlbumAsync('GraceApp Music');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('GraceApp Music', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      }

      Alert.alert(
        translations.success || 'Success',
        translations.songSavedSuccess || 'Song saved to your device!',
      );
    } catch (e) {
      console.error(e);
      Alert.alert(
        translations.error || 'Error',
        translations.saveFileError || 'Could not save file.',
      );
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
      <TopNavigation
        showBackButton={true}
        title={translations.musicPlayerTitle || 'Music Player'}
      />
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Animated.View
            style={{
              transform: [{ scale: pulse }],
              borderRadius: 125,
              elevation: 10,
            }}
          >
            <Image
              source={ChoirImage}
              style={{ width: 250, height: 250, borderRadius: 125 }}
            />
          </Animated.View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <AppText
            style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
          >
            {localSongData.title}
          </AppText>
          <AppText style={{ fontSize: 16, color: colors.textSecondary }}>
            {localSongData.category ||
              translations.unknownCategory ||
              'Unknown'}
          </AppText>
        </View>

        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <AppText style={{ color: colors.textSecondary }}>
              {formatTime(displayPosition)}
            </AppText>
            <AppText style={{ color: colors.textSecondary }}>
              {formatTime(displayDuration)}
            </AppText>
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
