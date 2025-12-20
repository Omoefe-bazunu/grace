// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { router, Stack } from 'expo-router';
// import { Heart, PlayCircle, ArrowLeft } from 'lucide-react-native';
// import { useTheme } from '../../../../contexts/ThemeContext';
// import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
// import { getFavorites, toggleFavorite } from '../../../../services/dataService';

// export default function FavoriteScreen() {
//   const [favorites, setFavorites] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { colors } = useTheme();

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const favs = await getFavorites();
//       setFavorites(favs || []);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlayAll = () => {
//     if (favorites.length > 0) {
//       router.push({
//         pathname: '/(tabs)/songs/music/[id]',
//         params: {
//           id: favorites[0].songId || favorites[0].id,
//           playlistContext: 'favorites',
//         },
//       });
//     }
//   };

//   const handleRemove = async (id) => {
//     try {
//       await toggleFavorite(id, 'remove');
//       setFavorites((prev) => prev.filter((f) => (f.songId || f.id) !== id));
//     } catch (e) {
//       Alert.alert('Error', 'Could not remove');
//     }
//   };

//   const renderItem = ({ item, index }) => {
//     const songId = item.songId || item.id;
//     return (
//       <TouchableOpacity
//         style={[styles.card, { backgroundColor: colors.card }]}
//         onPress={() =>
//           router.push({
//             pathname: '/(tabs)/songs/music/[id]',
//             params: { id: songId, playlistContext: 'favorites' },
//           })
//         }
//       >
//         <Text style={[styles.index, { color: colors.primary }]}>
//           {index + 1}
//         </Text>
//         <View style={{ flex: 1 }}>
//           <Text style={{ color: colors.text, fontWeight: '600' }}>
//             {item.title}
//           </Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
//             {item.artist || 'Unknown'}
//           </Text>
//         </View>
//         <TouchableOpacity
//           onPress={() => handleRemove(songId)}
//           style={{ padding: 8 }}
//         >
//           <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaWrapper>
//       {/* Ensure Header is hidden to prevent double headers */}
//       <Stack.Screen options={{ headerShown: false }} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
//           <ArrowLeft size={24} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
//           My Favorites
//         </Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Play All Button */}
//       {favorites.length > 0 && (
//         <View style={{ alignItems: 'center', marginVertical: 10 }}>
//           <TouchableOpacity
//             onPress={handlePlayAll}
//             style={[styles.playAllBtn, { backgroundColor: colors.primary }]}
//           >
//             <PlayCircle size={16} color="#fff" />
//             <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '600' }}>
//               Play All Favorites
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} />
//       ) : (
//         <FlatList
//           data={favorites}
//           renderItem={renderItem}
//           keyExtractor={(item) =>
//             item.songId || item.id || Math.random().toString()
//           }
//           contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//           ListEmptyComponent={
//             <Text
//               style={{
//                 textAlign: 'center',
//                 marginTop: 50,
//                 color: colors.textSecondary,
//               }}
//             >
//               No favorites yet.
//             </Text>
//           }
//         />
//       )}
//     </SafeAreaWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   playAllBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   index: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginRight: 16,
//     width: 24,
//   },
// });
