// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import {
//   ArrowLeft,
//   Play,
//   Pause,
//   FastForward,
//   Rewind,
//   Download,
//   Heart,
//   ListPlus,
//   Repeat,
//   Repeat1,
//   SkipForward,
// } from 'lucide-react-native';
// import { useLanguage } from '../../../../contexts/LanguageContext';
// import { useTheme } from '../../../../contexts/ThemeContext';
// import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
// import {
//   getSong,
//   downloadFile,
//   toggleFavorite,
// } from '../../../../services/dataService'; // Added downloadFile and toggleFavorite
// import { LinearGradient } from 'expo-linear-gradient';
// import { Audio } from 'expo-av';
// import { LanguageSwitcher } from '../../../../components/LanguageSwitcher';
// import { usePlaylist } from '../../../../contexts/PlayListContext';
// import { TopNavigation } from '../../../../components/TopNavigation';

// // --- Placeholder/Skeleton Component (Remains Unchanged) ---
// const SkeletonSong = () => {
//   const { colors } = useTheme();
//   return (
//     <SafeAreaWrapper>
//       <View
//         style={[
//           styles.header,
//           { backgroundColor: colors.surface, borderBottomColor: colors.border },
//         ]}
//       >
//         <LinearGradient
//           colors={[colors.skeleton, colors.skeletonHighlight]}
//           style={styles.skeletonHeaderTitle}
//         />
//       </View>
//       <View style={[styles.content, { backgroundColor: colors.background }]}>
//         <LinearGradient
//           colors={[colors.skeleton, colors.skeletonHighlight]}
//           style={[styles.skeletonTitle, { alignSelf: 'center' }]}
//         />
//         <LinearGradient
//           colors={[colors.skeleton, colors.skeletonHighlight]}
//           style={[styles.skeletonSubtitle, { alignSelf: 'center' }]}
//         />
//         <LinearGradient
//           colors={[colors.skeleton, colors.skeletonHighlight]}
//           style={styles.skeletonAudio}
//         />
//         <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
//           <LinearGradient
//             colors={[colors.skeleton, colors.skeletonHighlight]}
//             style={styles.skeletonInfoTitle}
//           />
//           <LinearGradient
//             colors={[colors.skeleton, colors.skeletonHighlight]}
//             style={styles.skeletonInfoText}
//           />
//           <LinearGradient
//             colors={[colors.skeleton, colors.skeletonHighlight]}
//             style={styles.skeletonInfoText}
//           />
//         </View>
//       </View>
//     </SafeAreaWrapper>
//   );
// };

// export default function MusicDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const { translations } = useLanguage();
//   const { colors } = useTheme();
//   // NEW: Playlist Context Access
//   const { playNext, currentTrack, playTrack, playlist } = usePlaylist();

//   const [song, setSong] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Audio Playback State
//   const [sound, setSound] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [position, setPosition] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // New Features State
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'song', 'all'

//   const isMounted = useRef(true);

//   // --- AUDIO LOGIC ---

//   const onPlaybackStatusUpdate = useCallback(
//     (status) => {
//       if (!isMounted.current) return;
//       setIsPlaying(status.isPlaying);
//       setPosition(status.positionMillis);

//       if (status.durationMillis) {
//         setDuration(status.durationMillis);
//       }

//       if (status.didJustFinish) {
//         if (sound) {
//           // Pause/stop current sound to prevent playing after finish
//           sound.pauseAsync();
//         }

//         if (repeatMode === 'song') {
//           // FIX: Use setStatusAsync to ensure the sound object, if loaded, loops.
//           if (sound) {
//             sound.setStatusAsync({ positionMillis: 0, shouldPlay: true });
//           }
//         } else if (repeatMode === 'all') {
//           // CRITICAL FIX: Skip to the next song in the global playlist
//           playNext();
//         } else {
//           // Default: Stop playback and reset position
//           setIsPlaying(false);
//           setPosition(0);
//           if (sound) {
//             sound.setPositionAsync(0);
//           }
//         }
//       }
//     },
//     [sound, repeatMode, playNext]
//   ); // Added playNext dependency

//   const loadAudio = async (url) => {
//     try {
//       if (sound) {
//         await sound.unloadAsync();
//       }
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: url },
//         { shouldPlay: false },
//         onPlaybackStatusUpdate
//       );
//       if (isMounted.current) {
//         setSound(newSound);
//         // Do not call playAsync here, let the user initiate playback
//       }
//     } catch (error) {
//       console.error('Error loading audio:', error);
//       Alert.alert('Audio Error', 'Could not load song audio.');
//     }
//   };

//   useEffect(() => {
//     isMounted.current = true;
//     const fetchAndLoadSong = async () => {
//       // Logic to fetch song details and load audio only runs when ID changes
//       try {
//         const songData = await getSong(id);
//         if (isMounted.current) {
//           setSong(songData);
//           // Assuming you fetch isFavorite status here
//           // setIsFavorite(songData.isFavorite || false);
//           if (songData?.audioUrl) {
//             // Unload old sound and load new one
//             await loadAudio(songData.audioUrl);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching or loading song:', error);
//         if (isMounted.current) {
//           setSong(null);
//         }
//       } finally {
//         if (isMounted.current) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchAndLoadSong();

//     return () => {
//       isMounted.current = false;
//       // CRITICAL FIX: Only unload the sound when the component UNMOUNTS
//       // This prevents the sound object from becoming null prematurely.
//       if (sound) {
//         sound.unloadAsync();
//         setSound(null);
//       }
//     };
//   }, [id]); // Dependency on ID ensures it re-runs when URL parameter changes

//   // Handler to sync component if the global playlist context changes the current track
//   useEffect(() => {
//     if (currentTrack && currentTrack.id !== id) {
//       // If the context changes the current track, navigate to its screen
//       router.replace(`/(tabs)/songs/music/${currentTrack.id}`);
//     }
//   }, [currentTrack]);

//   // --- PLAYER CONTROLS ---

//   const handlePlayPause = async () => {
//     if (sound) {
//       if (isPlaying) {
//         await sound.pauseAsync();
//       } else {
//         await sound.playAsync();
//       }
//     }
//   };

//   const handleFastForward = async () => {
//     if (sound) {
//       const newPosition = position + 10000;
//       await sound.setPositionAsync(newPosition);
//     }
//   };

//   const handleRewind = async () => {
//     if (sound) {
//       const newPosition = Math.max(0, position - 10000);
//       await sound.setPositionAsync(newPosition);
//     }
//   };

//   // --- NEW FEATURE HANDLERS ---
//   const handleToggleFavorite = async () => {
//     try {
//       const action = isFavorite ? 'remove' : 'add';
//       await toggleFavorite(song.id, action);
//       setIsFavorite((prev) => !prev);
//       Alert.alert(
//         'Success',
//         `Song ${isFavorite ? 'removed from' : 'added to'} favorites.`
//       );
//     } catch (e) {
//       Alert.alert('Error', 'Failed to update favorites.');
//     }
//   };

//   const handleDownload = async () => {
//     try {
//       if (!song.audioUrl) {
//         Alert.alert('Error', 'No audio URL available to download.');
//         return;
//       }
//       // NOTE: This uses the placeholder downloadFile function from dataService
//       await downloadFile(song.audioUrl, `${song.title}.mp3`);
//       Alert.alert(
//         'Download Started',
//         `Downloading ${song.title}. This may take a moment.`
//       );
//     } catch (e) {
//       Alert.alert('Error', 'Failed to start download.');
//     }
//   };

//   const handleAddToPlaylist = () => {
//     if (song) {
//       playTrack(playlist.length); // Adds to end of playlist
//       Alert.alert('Playlist', `${song.title} added to playlist.`);
//     }
//   };

//   const handleRepeatToggle = () => {
//     if (repeatMode === 'off') {
//       setRepeatMode('song');
//       Alert.alert('Repeat', 'Single song repeat enabled (Repeat 1).');
//     } else if (repeatMode === 'song') {
//       setRepeatMode('all');
//       Alert.alert('Repeat', 'Playlist loop enabled (Loop All).');
//     } else {
//       setRepeatMode('off');
//       Alert.alert('Repeat', 'Repeat disabled.');
//     }
//   };

//   const handleSkipNext = () => {
//     playNext();
//     Alert.alert('Skip', 'Skipping to the next song in the playlist.');
//   };

//   // --- UI HELPERS ---

//   const formatTime = (millis) => {
//     if (isNaN(millis)) return '0:00';
//     const totalSeconds = Math.floor(millis / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   const getRepeatIcon = () => {
//     if (repeatMode === 'song')
//       return <Repeat1 size={24} color={colors.primary} />;
//     if (repeatMode === 'all')
//       return <Repeat size={24} color={colors.primary} />;
//     return <Repeat size={24} color={colors.textSecondary} />;
//   };

//   // --- RENDER ---

//   if (loading) {
//     return <SkeletonSong />;
//   }

//   if (!song || !song.audioUrl) {
//     return (
//       <SafeAreaWrapper>
//         <Text style={[styles.error, { color: colors.error }]}>
//           {translations.errorSongNotFound || 'Song not found or no audio URL.'}
//         </Text>
//       </SafeAreaWrapper>
//     );
//   }

//   return (
//     <SafeAreaWrapper>
//       {/* Header */}
//       <TopNavigation showBackButton={true} />
//       <ScrollView
//         style={[styles.content, { backgroundColor: colors.background }]}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={[styles.title, { color: colors.text }]}>
//           {song.title || translations.noTitle}
//         </Text>

//         {/* --- 1. Audio Controls --- */}
//         <View style={styles.audioControls}>
//           <TouchableOpacity
//             onPress={handleRewind}
//             style={styles.controlButton}
//             disabled={!sound}
//           >
//             <Rewind
//               size={24}
//               color={sound ? colors.text : colors.textSecondary}
//             />
//             <Text
//               style={[
//                 styles.controlText,
//                 { color: sound ? colors.text : colors.textSecondary },
//               ]}
//             >
//               -10s
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handlePlayPause}
//             style={[
//               styles.playPauseButton,
//               { backgroundColor: colors.primary },
//             ]}
//             disabled={!sound}
//           >
//             {isPlaying ? (
//               <Pause size={48} color="#FFFFFF" />
//             ) : (
//               <Play size={48} color="#FFFFFF" />
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleFastForward}
//             style={styles.controlButton}
//             disabled={!sound}
//           >
//             <FastForward
//               size={24}
//               color={sound ? colors.text : colors.textSecondary}
//             />
//             <Text
//               style={[
//                 styles.controlText,
//                 { color: sound ? colors.text : colors.textSecondary },
//               ]}
//             >
//               +10s
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Progress Bar */}
//         <View style={styles.progressContainer}>
//           <Text style={[styles.timeText, { color: colors.textSecondary }]}>
//             {formatTime(position)}
//           </Text>
//           <View
//             style={[
//               styles.progressBarBackground,
//               { backgroundColor: colors.textSecondary + '30' },
//             ]}
//           >
//             <View
//               style={[
//                 styles.progressBar,
//                 {
//                   width: `${(position / duration) * 100}%`,
//                   backgroundColor: colors.primary,
//                 },
//               ]}
//             />
//           </View>
//           <Text style={[styles.timeText, { color: colors.textSecondary }]}>
//             {formatTime(duration)}
//           </Text>
//         </View>

//         {/* --- 2. Feature Controls (Download, Favorite, Playlist) --- */}
//         <View style={styles.featureControls}>
//           {/* Download */}
//           <TouchableOpacity
//             style={styles.featureButton}
//             onPress={handleDownload}
//           >
//             <Download size={24} color={colors.text} />
//             <Text style={[styles.featureText, { color: colors.text }]}>
//               Download
//             </Text>
//           </TouchableOpacity>

//           {/* Favorite */}
//           <TouchableOpacity
//             style={styles.featureButton}
//             onPress={handleToggleFavorite}
//           >
//             <Heart
//               size={24}
//               color={isFavorite ? colors.error : colors.text}
//               fill={isFavorite ? colors.error : 'none'}
//             />
//             <Text style={[styles.featureText, { color: colors.text }]}>
//               {isFavorite ? 'Unfavorite' : 'Favorite'}
//             </Text>
//           </TouchableOpacity>

//           {/* Add to Playlist */}
//           <TouchableOpacity
//             style={styles.featureButton}
//             onPress={handleAddToPlaylist}
//           >
//             <ListPlus size={24} color={colors.text} />
//             <Text style={[styles.featureText, { color: colors.text }]}>
//               Playlist
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* --- 3. Playback Controls (Repeat, Skip Next) --- */}
//         <View style={styles.playbackControls}>
//           {/* Repeat/Loop */}
//           <TouchableOpacity
//             style={styles.playbackButton}
//             onPress={handleRepeatToggle}
//           >
//             {getRepeatIcon()}
//             <Text style={[styles.featureText, { color: colors.text }]}>
//               {repeatMode === 'song'
//                 ? 'Repeat 1'
//                 : repeatMode === 'all'
//                 ? 'Loop All'
//                 : 'Repeat Off'}
//             </Text>
//           </TouchableOpacity>

//           {/* Skip Next */}
//           <TouchableOpacity
//             style={styles.playbackButton}
//             onPress={handleSkipNext}
//             disabled={playlist.length < 2} // Disable if playlist has 0 or 1 track
//           >
//             <SkipForward
//               size={24}
//               color={playlist.length > 1 ? colors.text : colors.textSecondary}
//             />
//             <Text
//               style={[
//                 styles.featureText,
//                 {
//                   color:
//                     playlist.length > 1 ? colors.text : colors.textSecondary,
//                 },
//               ]}
//             >
//               Next Song
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Info Container */}
//         <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
//           <Text style={[styles.infoText, { color: colors.textSecondary }]}>
//             {translations.category}:{' '}
//             {song.category || translations.unknownCategory}
//           </Text>
//           <Text style={[styles.infoText, { color: colors.textSecondary }]}>
//             {translations.duration}: {formatTime(duration)}
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'center',
//     marginHorizontal: 10,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   audioControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   playPauseButton: {
//     borderRadius: 50,
//     padding: 20,
//     backgroundColor: '#1E3A8A', // Use primary color for main button
//   },
//   controlButton: {
//     alignItems: 'center',
//     padding: 10,
//   },
//   controlText: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   progressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   timeText: {
//     fontSize: 12,
//     marginHorizontal: 8,
//   },
//   progressBarBackground: {
//     flex: 1,
//     height: 4,
//     borderRadius: 2,
//     opacity: 0.5,
//   },
//   progressBar: {
//     height: '100%',
//     borderRadius: 2,
//   },
//   featureControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderTopWidth: 1,
//     borderColor: '#E5E7EB',
//     marginVertical: 10,
//   },
//   featureButton: {
//     alignItems: 'center',
//     padding: 8,
//     minWidth: 80,
//   },
//   featureText: {
//     fontSize: 12,
//     fontWeight: '500',
//     marginTop: 4,
//   },
//   playbackControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingBottom: 15,
//     marginBottom: 20,
//   },
//   playbackButton: {
//     alignItems: 'center',
//     padding: 8,
//     minWidth: 80,
//   },
//   infoContainer: {
//     borderRadius: 12,
//     padding: 20,
//     marginTop: 20,
//     marginBottom: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   infoText: {
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 8,
//     opacity: 0.9,
//   },
//   error: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginTop: 50,
//   },
//   skeletonHeaderTitle: {
//     height: 18,
//     width: '60%',
//     borderRadius: 4,
//     alignSelf: 'center',
//   },
//   skeletonTitle: {
//     height: 28,
//     width: '80%',
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   skeletonSubtitle: {
//     height: 16,
//     width: '60%',
//     borderRadius: 4,
//     marginBottom: 20,
//   },
//   skeletonAudio: {
//     height: 40,
//     width: '100%',
//     borderRadius: 4,
//     marginBottom: 20,
//   },
//   skeletonInfoTitle: {
//     height: 20,
//     width: '50%',
//     borderRadius: 4,
//     marginBottom: 16,
//   },
//   skeletonInfoText: {
//     height: 16,
//     width: '70%',
//     borderRadius: 4,
//     marginBottom: 8,
//   },
// });
