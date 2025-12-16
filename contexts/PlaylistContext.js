import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Create the context
const PlayContext = createContext();

// Custom hook for easy access
export const usePlayer = () => useContext(PlayContext);

export const PlayProvider = ({ children }) => {
  // --- STATE ---
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);

  // Playlist / Queue State
  const [playlist, setPlaylist] = useState([]); // Array of song objects
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLooping, setIsLooping] = useState(false); // Repeat One
  const [isShuffle, setIsShuffle] = useState(false);

  // Playback Status
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1); // Avoid div by zero
  const [isLoading, setIsLoading] = useState(false);

  // Refs for logic that doesn't need re-renders
  const soundRef = useRef(null);
  const isMounted = useRef(true);

  // --- INITIALIZATION ---
  useEffect(() => {
    isMounted.current = true;
    configureAudioMode();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const configureAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true, // CRITICAL: Allows app to play while minimized [cite: 5]
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio Mode Setup Error:', error);
    }
  };

  // --- PLAYBACK STATUS MONITOR ---
  const onPlaybackStatusUpdate = useCallback(
    (status) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.error(`Playback Error: ${status.error}`);
          setIsLoading(false);
        }
        return;
      }

      // Update UI State
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isBuffering);

      // Auto-Play Next Logic
      if (status.didJustFinish && !status.isLooping) {
        if (isLooping) {
          // If "Repeat One" is explicitly handled by state instead of sound object
          replayCurrent();
        } else {
          playNext();
        }
      }
    },
    [isLooping, playNext, replayCurrent]
  );

  // --- CORE FUNCTIONS ---

  // 1. Load and Play a Song
  const playSong = async (song, newPlaylist = null) => {
    try {
      setIsLoading(true);

      // If a playlist is provided, update our queue
      if (newPlaylist) {
        setPlaylist(newPlaylist);
        const index = newPlaylist.findIndex(
          (s) => (s.songId || s.id) === (song.songId || song.id)
        );
        setCurrentIndex(index !== -1 ? index : 0);
      } else if (playlist.length === 0) {
        // If no playlist exists, make this song a playlist of one
        setPlaylist([song]);
        setCurrentIndex(0);
      }

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
      }

      setCurrentSong(song);
      setMiniPlayerVisible(true);

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Play Song Error:', error);
      Alert.alert('Error', 'Could not play this song.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Play / Pause Toggle
  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Toggle Error:', error);
    }
  };

  // 3. Next Song
  const playNext = useCallback(async () => {
    if (playlist.length === 0) return;

    let nextIndex = currentIndex + 1;

    // Loop back to start if at end
    if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }

    await playSong(playlist[nextIndex]);
  }, [playlist, currentIndex]);

  // 4. Previous Song
  const playPrev = async () => {
    if (playlist.length === 0) return;

    // If we are more than 3 seconds in, just restart the song
    if (position > 3000) {
      await seek(0);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1; // Go to last song
    }

    await playSong(playlist[prevIndex]);
  };

  // 5. Seek
  const seek = async (millis) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(millis);
  };

  // 6. Replay Current
  const replayCurrent = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.replayAsync();
  }, []);

  // 7. Stop / Close
  const closePlayer = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setSound(null);
    }
    setMiniPlayerVisible(false);
    setIsPlaying(false);
    setCurrentSong(null);
  };

  // 8. Toggle Repeat
  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  // --- EXPORT ---
  return (
    <PlayContext.Provider
      value={{
        sound,
        currentSong,
        playlist,
        isPlaying,
        isLoading,
        position,
        duration,
        miniPlayerVisible,
        isLooping,
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        seek,
        closePlayer,
        toggleLoop,
      }}
    >
      {children}
    </PlayContext.Provider>
  );
};

export default PlayProvider;
