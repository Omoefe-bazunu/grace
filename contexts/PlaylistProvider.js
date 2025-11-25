// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import PlaylistContext from './PlayListContext';

// const PLAYLIST_STORAGE_KEY = '@app_playlist';

// export const PlaylistProvider = ({ children }) => {
//   const [playlist, setPlaylist] = useState([]);
//   const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
//   const [isReady, setIsReady] = useState(false);

//   // Load playlist from storage on mount
//   useEffect(() => {
//     const loadPlaylist = async () => {
//       try {
//         const storedPlaylist = await AsyncStorage.getItem(PLAYLIST_STORAGE_KEY);
//         if (storedPlaylist) {
//           const parsedPlaylist = JSON.parse(storedPlaylist);
//           setPlaylist(parsedPlaylist.items || []);
//           setCurrentTrackIndex(parsedPlaylist.currentIndex || 0);
//         }
//       } catch (error) {
//         console.error('Failed to load playlist from AsyncStorage:', error);
//       } finally {
//         setIsReady(true);
//       }
//     };
//     loadPlaylist();
//   }, []);

//   // Save playlist to storage whenever it changes
//   useEffect(() => {
//     if (isReady) {
//       AsyncStorage.setItem(
//         PLAYLIST_STORAGE_KEY,
//         JSON.stringify({
//           items: playlist,
//           currentIndex: currentTrackIndex,
//         })
//       ).catch((error) =>
//         console.error('Failed to save playlist to AsyncStorage:', error)
//       );
//     }
//   }, [playlist, currentTrackIndex, isReady]);

//   // === Core Playlist Management Functions ===

//   const addTrack = useCallback((track, playNow = false) => {
//     setPlaylist((prev) => {
//       const isAlreadyInList = prev.some((item) => item.id === track.id);
//       if (isAlreadyInList) return prev; // Avoid duplicates

//       const newList = [...prev, track];
//       if (playNow) {
//         setCurrentTrackIndex(newList.length - 1);
//       }
//       return newList;
//     });
//   }, []);

//   const removeTrack = useCallback(
//     (trackId) => {
//       setPlaylist((prev) => {
//         const newPlaylist = prev.filter((item) => item.id !== trackId);
//         const isCurrentTrackRemoved = prev[currentTrackIndex]?.id === trackId;

//         if (isCurrentTrackRemoved) {
//           // If the current track is removed, adjust the index
//           if (newPlaylist.length > 0) {
//             // Play the next track, or the first one if it was the last
//             const newIndex = Math.min(
//               currentTrackIndex,
//               newPlaylist.length - 1
//             );
//             setCurrentTrackIndex(newIndex);
//           } else {
//             // Playlist is now empty
//             setCurrentTrackIndex(0);
//           }
//         } else if (
//           newPlaylist.length > 0 &&
//           currentTrackIndex >= newPlaylist.length
//         ) {
//           // If index is out of bounds after removal (and it wasn't the current track), fix it
//           setCurrentTrackIndex(newPlaylist.length - 1);
//         }
//         return newPlaylist;
//       });
//     },
//     [currentTrackIndex]
//   );

//   const clearPlaylist = useCallback(() => {
//     setPlaylist([]);
//     setCurrentTrackIndex(0);
//   }, []);

//   const playNext = useCallback(() => {
//     setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
//   }, [playlist.length]);

//   const playPrevious = useCallback(() => {
//     setCurrentTrackIndex(
//       (prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length
//     );
//   }, [playlist.length]);

//   const playTrack = useCallback(
//     (index) => {
//       if (index >= 0 && index < playlist.length) {
//         setCurrentTrackIndex(index);
//       }
//     },
//     [playlist.length]
//   );

//   const currentTrack = useMemo(
//     () => playlist[currentTrackIndex] || null,
//     [playlist, currentTrackIndex]
//   );

//   const contextValue = useMemo(
//     () => ({
//       playlist,
//       currentTrackIndex,
//       currentTrack,
//       addTrack,
//       removeTrack,
//       clearPlaylist,
//       playNext,
//       playPrevious,
//       playTrack,
//       isPlaylistEmpty: playlist.length === 0,
//       isReady,
//     }),
//     [
//       playlist,
//       currentTrackIndex,
//       currentTrack,
//       addTrack,
//       removeTrack,
//       clearPlaylist,
//       playNext,
//       playPrevious,
//       playTrack,
//       isReady,
//     ]
//   );

//   // Only render the provider's children when the state is loaded
//   if (!isReady) {
//     // You might render a Loading screen here
//     return null;
//   }

//   return (
//     <PlaylistContext.Provider value={contextValue}>
//       {children}
//     </PlaylistContext.Provider>
//   );
// };
