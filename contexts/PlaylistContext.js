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

const PlayContext = createContext();
export const usePlayer = () => useContext(PlayContext);

export const PlayProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLooping, setIsLooping] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const soundRef = useRef(null);
  const isMounted = useRef(true);

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
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio Mode Setup Error:', error);
    }
  };

  const onPlaybackStatusUpdate = useCallback(
    (status) => {
      if (!status.isLoaded) {
        if (status.error) setIsLoading(false);
        return;
      }
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isBuffering);

      if (status.didJustFinish && !status.isLooping) {
        if (isLooping) {
          replayCurrent();
        } else {
          if (currentIndex < playlist.length - 1) {
            playNext();
          } else {
            setIsPlaying(false);
            if (soundRef.current) {
              soundRef.current.setPositionAsync(0);
              soundRef.current.pauseAsync();
            }
          }
        }
      }
    },
    [isLooping, currentIndex, playlist]
  );

  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }
  }, [sound, onPlaybackStatusUpdate]);

  const playSong = async (song, newPlaylist = null) => {
    try {
      setIsLoading(true);

      if (newPlaylist) {
        setPlaylist(newPlaylist);
        const index = newPlaylist.findIndex(
          (s) => (s.songId || s.id) === (song.songId || song.id)
        );
        setCurrentIndex(index !== -1 ? index : 0);
      } else if (playlist.length === 0) {
        setPlaylist([song]);
        setCurrentIndex(0);
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
      }

      setCurrentSong(song);
      setMiniPlayerVisible(true);

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

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    isPlaying
      ? await soundRef.current.pauseAsync()
      : await soundRef.current.playAsync();
  };

  const playNext = async () => {
    if (playlist.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;

    const nextSong = playlist[nextIndex];
    if (nextSong) {
      setCurrentIndex(nextIndex);
      await playSong(nextSong);
    }
  };

  const playPrev = async () => {
    if (playlist.length === 0) return;
    if (position > 3000) {
      await seek(0);
      return;
    }
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    setCurrentIndex(prevIndex);
    await playSong(playlist[prevIndex]);
  };

  const seek = async (millis) => {
    if (soundRef.current) await soundRef.current.setPositionAsync(millis);
  };

  const replayCurrent = async () => {
    if (soundRef.current) await soundRef.current.replayAsync();
  };

  const closePlayer = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setSound(null);
    }
    setMiniPlayerVisible(false);
    setIsPlaying(false);
    setCurrentSong(null); // This clears the player memory
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

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
