import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Repeat,
  Download,
  Calendar,
} from 'lucide-react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePlayer } from '../../../../contexts/PlayListContext'; // ✅ Hook into global player
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { AppText } from '../../../../components/ui/AppText';
import { getSermon } from '@/services/dataService';
import SermonImage from '../../../../assets/images/SERMONBG.png';

export default function SermonAudioDetailScreen() {
  const { id } = useLocalSearchParams();
  const { translations } = useLanguage();
  const { colors } = useTheme();

  // ✅ Access Global Player State (Exactly like MusicDetailScreen)
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

  const [localSermonData, setLocalSermonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;

  // Pulse Animation Logic
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

  // Load Sermon Data and Sync with Player
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await getSermon(id);
        setLocalSermonData(data);

        // ✅ If this sermon isn't already the global track, play it
        // This triggers the floating controls across the app
        if (data && (!currentSong || currentSong.id !== data.id)) {
          await playSong(data);
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
    if (currentSong && currentSong.id === id) {
      togglePlayPause();
    } else if (localSermonData) {
      await playSong(localSermonData);
    }
  };

  const handleDownload = async () => {
    const itemToDownload = currentSong || localSermonData;
    if (!itemToDownload?.audioUrl) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        translations.permissionRequired || 'Permission required',
        translations.saveSermonPermission ||
          'Please allow access to save sermons.',
      );
      return;
    }

    setIsDownloading(true);
    try {
      const filename = `Sermon_${itemToDownload.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.downloadAsync(itemToDownload.audioUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(fileUri);

      if (Platform.OS === 'android') {
        const album = await MediaLibrary.getAlbumAsync('GraceApp Sermons');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('GraceApp Sermons', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      }
      Alert.alert(
        translations.success || 'Success',
        translations.sermonSaved || 'Sermon saved!',
      );
    } catch (e) {
      Alert.alert(
        translations.error || 'Error',
        translations.fileSaveError || 'Save failed.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (millis) => {
    if (millis < 0) return '0:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading || !localSermonData)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  // Control calculations based on global player state
  const isCurrentSermonLoaded = currentSong && currentSong.id === id;
  const displayIsPlaying = isCurrentSermonLoaded ? isPlaying : false;
  const displayPosition = isCurrentSermonLoaded ? position : 0;
  const displayDuration = isCurrentSermonLoaded ? duration : 1;

  return (
    <SafeAreaWrapper>
      <TopNavigation
        showBackButton={true}
        title={translations.audioPlayer || 'Audio Player'}
      />
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={styles.visualContainer}>
          <Animated.View
            style={{
              transform: [{ scale: pulse }],
              borderRadius: 125,
              elevation: 10,
            }}
          >
            <Image source={SermonImage} style={styles.albumArt} />
          </Animated.View>
        </View>

        <View style={styles.infoContainer}>
          <AppText style={[styles.title, { color: colors.text }]}>
            {localSermonData.title}
          </AppText>
          <View style={styles.dateRow}>
            <Calendar
              size={16}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <AppText style={{ fontSize: 16, color: colors.textSecondary }}>
              {localSermonData.date || translations.unknownDate}
            </AppText>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.timeRow}>
            <AppText style={{ color: colors.textSecondary }}>
              {formatTime(displayPosition)}
            </AppText>
            <AppText style={{ color: colors.textSecondary }}>
              {formatTime(displayDuration)}
            </AppText>
          </View>
          <View
            style={[styles.progressBarBase, { backgroundColor: colors.border }]}
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

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={toggleLoop}>
            <Repeat
              color={isLooping ? colors.primary : colors.textSecondary}
              size={24}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => isCurrentSermonLoaded && seek(position - 10000)}
          >
            <Rewind color={colors.text} size={32} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMainPlayPause}
            style={[styles.mainPlayBtn, { backgroundColor: colors.primary }]}
          >
            {displayIsPlaying ? (
              <Pause color="#fff" size={32} />
            ) : (
              <Play color="#fff" size={32} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => isCurrentSermonLoaded && seek(position + 10000)}
          >
            <FastForward color={colors.text} size={32} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Download color={colors.textSecondary} size={24} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  visualContainer: { alignItems: 'center', marginVertical: 20 },
  albumArt: { width: 250, height: 250, borderRadius: 125 },
  infoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressContainer: { marginBottom: 30 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressBarBase: { height: 4, borderRadius: 2, overflow: 'hidden' },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  mainPlayBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
