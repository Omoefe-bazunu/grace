// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   TextInput,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
// } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import {
//   ArrowLeft,
//   Upload,
//   Plus,
//   X,
//   CheckCircle,
//   AlertCircle,
// } from 'lucide-react-native';
// import { LanguageSwitcher } from '../../../../../components/LanguageSwitcher';
// import { Input } from '../../../../../components/ui/Input';
// import { Button } from '../../../../../components/ui/Button';
// import * as DocumentPicker from 'expo-document-picker';
// import { useAuth } from '../../../../../contexts/AuthContext';
// import { apiClient } from '../../../../../utils/api';

// const { width } = Dimensions.get('window');

// const SERMON_CATEGORIES = [
//   'Weekly Sermon Volume 1',
//   'Weekly Sermon Volume 2',
//   "God's Kingdom Advocate Volume 1",
//   "God's Kingdom Advocate Volume 2",
//   "God's Kingdom Advocate Volume 3",
//   'Abridged Bible Subjects',
// ];

// // --- Helper Component: Progress Bar ---
// const ProgressBar = ({ progress, status }) => {
//   if (status === 'idle') return null;

//   let barColor = '#1E3A8A'; // Blue for uploading
//   if (status === 'success') barColor = '#10B981'; // Green
//   if (status === 'error') barColor = '#EF4444'; // Red

//   return (
//     <View style={styles.progressContainer}>
//       <View style={styles.progressHeader}>
//         <Text style={styles.progressText}>
//           {status === 'success'
//             ? 'Upload Complete'
//             : status === 'error'
//             ? 'Upload Failed'
//             : `Uploading... ${progress}%`}
//         </Text>
//         {status === 'success' && <CheckCircle size={16} color="#10B981" />}
//         {status === 'error' && <AlertCircle size={16} color="#EF4444" />}
//       </View>
//       <View style={styles.progressBarBg}>
//         <View
//           style={[
//             styles.progressBarFill,
//             { width: `${progress}%`, backgroundColor: barColor },
//           ]}
//         />
//       </View>
//     </View>
//   );
// };

// export default function UploadScreen() {
//   const { type } = useLocalSearchParams();
//   const { user } = useAuth();
//   const [formData, setFormData] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false); // Global form submission state
//   const [songCategories, setSongCategories] = useState([]);
//   const [sermonVideoCategories, setSermonVideoCategories] = useState([]);
//   const [newCategory, setNewCategory] = useState('');
//   const [showAddCategory, setShowAddCategory] = useState(false);

//   // State structure: { fieldName: { status: 'idle'|'uploading'|'success'|'error', progress: 0 } }
//   const [uploadProgress, setUploadProgress] = useState({});

//   const FILE_SIZE_LIMITS = { audio: 50, video: 100 };

//   useEffect(() => {
//     if (type === 'song') {
//       fetchSongCategories();
//     } else if (type === 'sermonVideo') {
//       fetchSermonVideoCategories();
//     }
//   }, [type]);

//   const fetchSongCategories = async () => {
//     try {
//       const res = await apiClient.get('songs');
//       const categories = new Set();
//       const songs = res.data.songs || res.data || [];
//       songs.forEach((song) => {
//         if (song.category?.trim()) categories.add(song.category.trim());
//       });
//       setSongCategories(Array.from(categories).sort());
//     } catch (err) {
//       console.error('Failed to load categories:', err);
//       Alert.alert('Error', 'Failed to load song categories');
//     }
//   };

//   const fetchSermonVideoCategories = async () => {
//     try {
//       const res = await apiClient.get('sermonVideos');
//       const categories = new Set();
//       const sermonVideos = res.data.sermonVideos || res.data || [];
//       sermonVideos.forEach((video) => {
//         if (video.category?.trim()) categories.add(video.category.trim());
//       });
//       setSermonVideoCategories(Array.from(categories).sort());
//     } catch (err) {
//       console.error('Failed to load sermon video categories:', err);
//       Alert.alert('Error', 'Failed to load sermon video categories');
//     }
//   };

//   const updateField = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const pickAudio = async (field) => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ['audio/*'],
//         copyToCacheDirectory: true,
//       });
//       if (result.canceled) return;
//       const file = result.assets[0];
//       await uploadFile(
//         field,
//         file.uri,
//         file.name,
//         file.mimeType,
//         FILE_SIZE_LIMITS.audio
//       );
//     } catch (error) {
//       console.error('Audio picker error:', error);
//       Alert.alert('Error', 'Failed to pick audio file');
//     }
//   };

//   const pickVideo = async (field = 'videoUrl') => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ['video/*'],
//         copyToCacheDirectory: true,
//       });
//       if (result.canceled) return;
//       const file = result.assets[0];
//       await uploadFile(
//         field,
//         file.uri,
//         file.name,
//         file.mimeType,
//         FILE_SIZE_LIMITS.video
//       );
//     } catch (error) {
//       console.error('Video picker error:', error);
//       Alert.alert('Error', 'Failed to pick video file');
//     }
//   };

//   // const uploadFile = async (field, uri, fileName, mimeType, maxSizeMB) => {
//   //   // Reset progress for this field
//   //   setUploadProgress((prev) => ({
//   //     ...prev,
//   //     [field]: { status: 'uploading', progress: 0 },
//   //   }));

//   //   try {
//   //     // 1. Check File Size locally
//   //     const response = await fetch(uri);
//   //     const blob = await response.blob();
//   //     if (blob.size > maxSizeMB * 1024 * 1024) {
//   //       Alert.alert('File Too Large', `File must be less than ${maxSizeMB}MB`);
//   //       setUploadProgress((prev) => ({
//   //         ...prev,
//   //         [field]: { status: 'error', progress: 0 },
//   //       }));
//   //       return;
//   //     }

//   //     // 2. Prepare Destination
//   //     let folder =
//   //       type === 'song'
//   //         ? 'songs'
//   //         : type === 'sermonAudio'
//   //         ? 'sermons'
//   //         : type === 'sermonVideo'
//   //         ? 'sermonVideos'
//   //         : 'videos';
//   //     const destinationPath = `${folder}/${Date.now()}_${fileName}`;

//   //     // 3. Upload with Progress Tracking
//   //     // NOTE: We assume apiClient.upload accepts a config object for onUploadProgress.
//   //     // If using raw Axios, this maps directly.
//   //     const uploadResponse = await apiClient.upload(
//   //       { uri, name: fileName, type: mimeType },
//   //       destinationPath,
//   //       {
//   //         onUploadProgress: (progressEvent) => {
//   //           const percentCompleted = Math.round(
//   //             (progressEvent.loaded * 100) / progressEvent.total
//   //           );
//   //           setUploadProgress((prev) => ({
//   //             ...prev,
//   //             [field]: { status: 'uploading', progress: percentCompleted },
//   //           }));
//   //         },
//   //       }
//   //     );

//   //     // 4. Success Handling
//   //     updateField(field, uploadResponse.data.url);
//   //     setUploadProgress((prev) => ({
//   //       ...prev,
//   //       [field]: { status: 'success', progress: 100 },
//   //     }));
//   //     // Optional: Don't alert on every file, the progress bar shows success.
//   //   } catch (error) {
//   //     console.error('Upload error:', error);
//   //     setUploadProgress((prev) => ({
//   //       ...prev,
//   //       [field]: { status: 'error', progress: 0 },
//   //     }));
//   //     Alert.alert(
//   //       'Upload Failed',
//   //       error.response?.data?.error || error.message || 'Upload failed.'
//   //     );
//   //   }
//   // };

//   const uploadFile = async (field, uri, fileName, mimeType, maxSizeMB) => {
//     // 1. Reset Progress UI
//     setUploadProgress((prev) => ({
//       ...prev,
//       [field]: { status: 'uploading', progress: 0 },
//     }));

//     try {
//       // 2. Determine the correct folder based on file type
//       let folderName = 'assets';
//       if (type === 'notice') folderName = 'notices';
//       else if (type === 'sermon' || type === 'sermonAudio')
//         folderName = 'sermons';
//       else if (type === 'song') folderName = 'songs';
//       else if (type === 'video') folderName = 'videos';
//       else if (type === 'sermonVideo') folderName = 'sermonVideos';
//       else if (type === 'dailyDevotional') folderName = 'dailyDevotionals';

//       // 3. Get Signature
//       console.log('Requesting signature for:', folderName);
//       const signRes = await apiClient.get(`sign-upload?folder=${folderName}`);

//       console.log('Server Response:', signRes.data); // Debug log

//       // Safety check: Ensure timestamp exists
//       if (!signRes.data || signRes.data.timestamp === undefined) {
//         throw new Error(
//           'Server returned invalid signature. Check route ordering in server.js.'
//         );
//       }

//       const { signature, timestamp, cloudName, apiKey, folder } = signRes.data;

//       // 4. Check File Size locally
//       const fileResp = await fetch(uri);
//       const blob = await fileResp.blob();
//       if (blob.size > maxSizeMB * 1024 * 1024) {
//         Alert.alert('File Too Large', `File must be less than ${maxSizeMB}MB`);
//         setUploadProgress((prev) => ({
//           ...prev,
//           [field]: { status: 'error', progress: 0 },
//         }));
//         return;
//       }

//       // 5. Create FormData for Cloudinary Direct Upload
//       const formData = new FormData();
//       formData.append('file', {
//         uri: uri,
//         name: fileName,
//         type: mimeType,
//       });
//       formData.append('api_key', apiKey);
//       formData.append('timestamp', timestamp.toString());
//       formData.append('signature', signature);
//       formData.append('folder', folder);

//       // 6. Direct Upload to Cloudinary URL (Bypassing your server)
//       const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

//       return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open('POST', uploadUrl);

//         // Track Progress
//         xhr.upload.onprogress = (event) => {
//           if (event.lengthComputable) {
//             const percentComplete = Math.round(
//               (event.loaded / event.total) * 100
//             );
//             setUploadProgress((prev) => ({
//               ...prev,
//               [field]: { status: 'uploading', progress: percentComplete },
//             }));
//           }
//         };

//         xhr.onload = () => {
//           if (xhr.status >= 200 && xhr.status < 300) {
//             const responseData = JSON.parse(xhr.responseText);

//             // Cloudinary returns the secure_url directly
//             updateField(field, responseData.secure_url);

//             setUploadProgress((prev) => ({
//               ...prev,
//               [field]: { status: 'success', progress: 100 },
//             }));
//             resolve(responseData);
//           } else {
//             console.error('Cloudinary Error:', xhr.responseText);
//             setUploadProgress((prev) => ({
//               ...prev,
//               [field]: { status: 'error', progress: 0 },
//             }));
//             Alert.alert('Upload Failed', 'Cloudinary rejected the file.');
//             reject(new Error('Upload failed'));
//           }
//         };

//         xhr.onerror = (e) => {
//           console.error('Network Error:', e);
//           setUploadProgress((prev) => ({
//             ...prev,
//             [field]: { status: 'error', progress: 0 },
//           }));
//           Alert.alert('Network Error', 'Check your internet connection.');
//           reject(new Error('Network error'));
//         };

//         xhr.send(formData);
//       });
//     } catch (error) {
//       console.error('Upload Process Error:', error);
//       setUploadProgress((prev) => ({
//         ...prev,
//         [field]: { status: 'error', progress: 0 },
//       }));
//       Alert.alert('Upload Error', 'Could not start upload process.');
//     }
//   };

//   const addCategory = () => {
//     const categoryName = newCategory.trim();
//     if (!categoryName) {
//       Alert.alert('Invalid Category', 'Category name cannot be empty');
//       return;
//     }

//     if (type === 'song') {
//       if (songCategories.includes(categoryName)) {
//         Alert.alert('Category Exists', 'This category already exists');
//         return;
//       }
//       setSongCategories((prev) => [...prev, categoryName].sort());
//     } else if (type === 'sermonVideo') {
//       if (sermonVideoCategories.includes(categoryName)) {
//         Alert.alert('Category Exists', 'This category already exists');
//         return;
//       }
//       setSermonVideoCategories((prev) => [...prev, categoryName].sort());
//     }

//     updateField('category', categoryName);
//     setNewCategory('');
//     setShowAddCategory(false);
//   };

//   const validateForm = () => {
//     if (type === 'notice')
//       return formData.title?.trim() && formData.message?.trim();
//     if (type === 'video') return formData.title?.trim() && formData.videoUrl;
//     if (type === 'song')
//       return formData.title?.trim() && formData.audioUrl && formData.category;
//     if (type === 'sermon')
//       return (
//         formData.title?.trim() && formData.content?.trim() && formData.category
//       );
//     if (type === 'sermonAudio')
//       return (
//         formData.title?.trim() && formData.date?.trim() && formData.audioUrl
//       );
//     if (type === 'sermonVideo')
//       return (
//         formData.title?.trim() &&
//         formData.date?.trim() &&
//         formData.videoUrl &&
//         formData.category
//       );
//     if (type === 'dailyDevotional')
//       return (
//         formData.title?.trim() &&
//         formData.date?.trim() &&
//         formData.mainText?.trim()
//       );
//     if (type === 'quiz') return formData.title?.trim();
//     return false;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       Alert.alert('Validation Error', 'Please fill all required fields');
//       return;
//     }

//     // Check if any file is still uploading
//     const activeUploads = Object.values(uploadProgress).some(
//       (p) => p.status === 'uploading'
//     );
//     if (activeUploads) {
//       Alert.alert('Please Wait', 'Files are still uploading.');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const payload = {
//         title: formData.title?.trim() || '',
//         category: formData.category || '',
//         content: formData.content?.trim() || '',
//         mainText: formData.mainText?.trim() || '',
//         date: formData.date || '',
//         audioUrl: formData.audioUrl || '',
//         videoUrl: formData.videoUrl || '',
//         message: formData.message?.trim() || '',
//         uploadedBy: user?.email || 'admin',
//       };
//       let collectionName;
//       if (type === 'song') collectionName = 'songs';
//       else if (type === 'sermon' || type === 'sermonAudio')
//         collectionName = 'sermons';
//       else if (type === 'sermonVideo') collectionName = 'sermonVideos';
//       else if (type === 'dailyDevotional') collectionName = 'dailyDevotionals';
//       else collectionName = `${type}s`;

//       const response = await apiClient.post(collectionName, payload);
//       const sermonId = response.data.id;

//       // Auto-generate TTS for text sermons
//       if (type === 'sermon' && formData.content?.trim()) {
//         Alert.alert(
//           'Sermon Uploaded',
//           'Sermon uploaded successfully! Generating audio in background...',
//           [
//             {
//               text: 'OK',
//               onPress: async () => {
//                 apiClient
//                   .generateSermonAudio(sermonId, 'en-US', 'en-US-Neural2-F')
//                   .then(() => console.log('TTS generated for sermon', sermonId))
//                   .catch((err) => console.error('TTS generation failed:', err));
//                 router.back();
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           'Success',
//           `${
//             type.charAt(0).toUpperCase() + type.slice(1)
//           } uploaded successfully!`,
//           [{ text: 'OK', onPress: () => router.back() }]
//         );
//       }
//     } catch (error) {
//       console.error('Submission error:', error);
//       Alert.alert(
//         'Upload Failed',
//         error.response?.data?.error || 'Failed to upload.'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // --- Helper to get progress for a specific field ---
//   const getFieldProgress = (field) => {
//     return uploadProgress[field] || { status: 'idle', progress: 0 };
//   };

//   const renderFormFields = () => {
//     // 1. SERMON (Text)
//     if (type === 'sermon') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.label}>Category *</Text>
//           <ScrollView
//             horizontal
//             style={styles.categoryScroll}
//             showsHorizontalScrollIndicator={false}
//           >
//             {SERMON_CATEGORIES.map((category) => (
//               <TouchableOpacity
//                 key={category}
//                 style={[
//                   styles.categoryChip,
//                   formData.category === category && styles.categoryChipActive,
//                 ]}
//                 onPress={() => updateField('category', category)}
//                 disabled={isSubmitting}
//               >
//                 <Text
//                   style={[
//                     styles.categoryChipText,
//                     formData.category === category &&
//                       styles.categoryChipTextActive,
//                   ]}
//                 >
//                   {category}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//           <Input
//             label="Sermon Content *"
//             value={formData.content || ''}
//             onChangeText={(value) => updateField('content', value)}
//             multiline
//             numberOfLines={8}
//             placeholder="Enter sermon content..."
//             style={styles.textArea}
//             editable={!isSubmitting}
//           />
//         </View>
//       );
//     }

//     // 2. SERMON AUDIO
//     if (type === 'sermonAudio') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.label}>Date *</Text>
//           <TextInput
//             placeholder="YYYY-MM-DD"
//             value={formData.date || ''}
//             onChangeText={(value) => updateField('date', value)}
//             style={styles.dateInput}
//             editable={!isSubmitting}
//           />
//           <Text style={styles.infoText}>
//             Max file size: {FILE_SIZE_LIMITS.audio}MB
//           </Text>
//           <TouchableOpacity
//             style={[styles.uploadButton, isSubmitting && styles.disabled]}
//             onPress={() => pickAudio('audioUrl')}
//             disabled={isSubmitting}
//           >
//             <Upload size={20} color="#1E3A8A" />
//             <Text style={styles.uploadButtonText}>Select Audio File *</Text>
//           </TouchableOpacity>
//           {/* Progress Bar for Audio */}
//           <ProgressBar {...getFieldProgress('audioUrl')} />
//         </View>
//       );
//     }

//     // 3. SERMON VIDEO
//     if (type === 'sermonVideo') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.label}>Category *</Text>
//           <ScrollView
//             horizontal
//             style={styles.categoryScroll}
//             showsHorizontalScrollIndicator={false}
//           >
//             {sermonVideoCategories.map((category) => (
//               <TouchableOpacity
//                 key={category}
//                 style={[
//                   styles.categoryChip,
//                   formData.category === category && styles.categoryChipActive,
//                 ]}
//                 onPress={() => updateField('category', category)}
//                 disabled={isSubmitting}
//               >
//                 <Text
//                   style={[
//                     styles.categoryChipText,
//                     formData.category === category &&
//                       styles.categoryChipTextActive,
//                   ]}
//                 >
//                   {category}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity
//               style={styles.addCategoryButton}
//               onPress={() => setShowAddCategory(true)}
//               disabled={isSubmitting}
//             >
//               <Plus size={16} color="#1E3A8A" />
//               <Text style={styles.addCategoryText}>Add</Text>
//             </TouchableOpacity>
//           </ScrollView>
//           {showAddCategory && (
//             <View style={styles.addCategoryRow}>
//               <TextInput
//                 placeholder="Enter new category name"
//                 value={newCategory}
//                 onChangeText={setNewCategory}
//                 style={styles.categoryInput}
//                 autoFocus
//                 editable={!isSubmitting}
//               />
//               <TouchableOpacity
//                 onPress={addCategory}
//                 style={styles.categoryAddButton}
//                 disabled={isSubmitting}
//               >
//                 <Text style={styles.categoryAddButtonText}>Add</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   setShowAddCategory(false);
//                   setNewCategory('');
//                 }}
//                 disabled={isSubmitting}
//               >
//                 <X size={20} color="#666" />
//               </TouchableOpacity>
//             </View>
//           )}
//           <Text style={styles.label}>Date *</Text>
//           <TextInput
//             placeholder="YYYY-MM-DD"
//             value={formData.date || ''}
//             onChangeText={(value) => updateField('date', value)}
//             style={styles.dateInput}
//             editable={!isSubmitting}
//           />
//           <Text style={styles.infoText}>
//             Max file size: {FILE_SIZE_LIMITS.video}MB
//           </Text>
//           <TouchableOpacity
//             style={[styles.uploadButton, isSubmitting && styles.disabled]}
//             onPress={() => pickVideo('videoUrl')}
//             disabled={isSubmitting}
//           >
//             <Upload size={20} color="#1E3A8A" />
//             <Text style={styles.uploadButtonText}>Select Video File *</Text>
//           </TouchableOpacity>
//           {/* Progress Bar for Sermon Video */}
//           <ProgressBar {...getFieldProgress('videoUrl')} />
//         </View>
//       );
//     }

//     // 4. DAILY DEVOTIONAL
//     if (type === 'dailyDevotional') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.label}>Date *</Text>
//           <TextInput
//             placeholder="YYYY-MM-DD"
//             value={formData.date || ''}
//             onChangeText={(value) => updateField('date', value)}
//             style={styles.dateInput}
//             editable={!isSubmitting}
//           />
//           <Input
//             label="Main Text *"
//             value={formData.mainText || ''}
//             onChangeText={(value) => updateField('mainText', value)}
//             multiline
//             numberOfLines={6}
//             placeholder="Enter daily devotional main text..."
//             style={styles.textArea}
//             editable={!isSubmitting}
//           />
//         </View>
//       );
//     }

//     // 5. SONG
//     if (type === 'song') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.label}>Category *</Text>
//           <ScrollView
//             horizontal
//             style={styles.categoryScroll}
//             showsHorizontalScrollIndicator={false}
//           >
//             {songCategories.map((category) => (
//               <TouchableOpacity
//                 key={category}
//                 style={[
//                   styles.categoryChip,
//                   formData.category === category && styles.categoryChipActive,
//                 ]}
//                 onPress={() => updateField('category', category)}
//                 disabled={isSubmitting}
//               >
//                 <Text
//                   style={[
//                     styles.categoryChipText,
//                     formData.category === category &&
//                       styles.categoryChipTextActive,
//                   ]}
//                 >
//                   {category}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity
//               style={styles.addCategoryButton}
//               onPress={() => setShowAddCategory(true)}
//               disabled={isSubmitting}
//             >
//               <Plus size={16} color="#1E3A8A" />
//               <Text style={styles.addCategoryText}>Add</Text>
//             </TouchableOpacity>
//           </ScrollView>
//           {showAddCategory && (
//             <View style={styles.addCategoryRow}>
//               <TextInput
//                 placeholder="Enter new category name"
//                 value={newCategory}
//                 onChangeText={setNewCategory}
//                 style={styles.categoryInput}
//                 autoFocus
//                 editable={!isSubmitting}
//               />
//               <TouchableOpacity
//                 onPress={addCategory}
//                 style={styles.categoryAddButton}
//                 disabled={isSubmitting}
//               >
//                 <Text style={styles.categoryAddButtonText}>Add</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   setShowAddCategory(false);
//                   setNewCategory('');
//                 }}
//                 disabled={isSubmitting}
//               >
//                 <X size={20} color="#666" />
//               </TouchableOpacity>
//             </View>
//           )}
//           <Text style={styles.infoText}>
//             Max file size: {FILE_SIZE_LIMITS.audio}MB
//           </Text>
//           <TouchableOpacity
//             style={[styles.uploadButton, isSubmitting && styles.disabled]}
//             onPress={() => pickAudio('audioUrl')}
//             disabled={isSubmitting}
//           >
//             <Upload size={20} color="#1E3A8A" />
//             <Text style={styles.uploadButtonText}>Select Audio File *</Text>
//           </TouchableOpacity>
//           {/* Progress Bar for Song */}
//           <ProgressBar {...getFieldProgress('audioUrl')} />
//         </View>
//       );
//     }

//     // 6. VIDEO (Generic/Animation) - ✅ FIX WAS APPLIED HERE
//     if (type === 'video') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.infoText}>
//             Max file size: {FILE_SIZE_LIMITS.video}MB
//           </Text>
//           <TouchableOpacity
//             style={[styles.uploadButton, isSubmitting && styles.disabled]}
//             // ✅ CHANGED: explicit arrow function to pass string 'videoUrl'
//             onPress={() => pickVideo('videoUrl')}
//             disabled={isSubmitting}
//           >
//             <Upload size={20} color="#1E3A8A" />
//             <Text style={styles.uploadButtonText}>Select Video File *</Text>
//           </TouchableOpacity>

//           {/* Progress Bar for Video */}
//           <ProgressBar {...getFieldProgress('videoUrl')} />
//         </View>
//       );
//     }

//     // 7. NOTICE
//     if (type === 'notice') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Input
//             label="Message *"
//             value={formData.message || ''}
//             onChangeText={(value) => updateField('message', value)}
//             multiline
//             numberOfLines={4}
//             placeholder="Enter notice message..."
//             editable={!isSubmitting}
//           />
//         </View>
//       );
//     }

//     // 8. QUIZ
//     if (type === 'quiz') {
//       return (
//         <View style={styles.fieldBlock}>
//           <Text style={styles.infoText}>
//             Quiz content is handled separately
//           </Text>
//         </View>
//       );
//     }

//     return null;
//   };

//   const getPageTitle = () => {
//     const titles = {
//       notice: 'Add Notice',
//       sermon: 'Add Text Sermon',
//       sermonAudio: 'Upload Sermon Audio',
//       sermonVideo: 'Upload Sermon Video',
//       song: 'Upload Song',
//       video: 'Upload Animation Video',
//       dailyDevotional: 'Add Daily Devotional',
//       quiz: 'Add Quiz Resource',
//     };
//     return titles[type] || 'Upload';
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Global Loading Overlay for Final Submission */}
//       <Modal transparent={true} visible={isSubmitting} animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.loadingBox}>
//             <ActivityIndicator size="large" color="#1E3A8A" />
//             <Text style={styles.loadingTitle}>Saving Content...</Text>
//             <Text style={styles.loadingSubtitle}>
//               Please wait while we finalize the upload.
//             </Text>
//           </View>
//         </View>
//       </Modal>

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
//           <ArrowLeft size={24} color="#1F2937" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{getPageTitle()}</Text>
//         <LanguageSwitcher />
//       </View>
//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         <Input
//           label="Title *"
//           value={formData.title || ''}
//           onChangeText={(value) => updateField('title', value)}
//           placeholder="Enter title"
//           editable={!isSubmitting}
//         />
//         {renderFormFields()}

//         <Button
//           title={isSubmitting ? 'Processing...' : `Upload ${type}`}
//           onPress={handleSubmit}
//           disabled={isSubmitting || !validateForm()}
//           size="large"
//           style={styles.submitButton}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#FFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
//   content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
//   label: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 12,
//   },
//   categoryScroll: { maxHeight: 60, marginBottom: 16 },
//   categoryChip: {
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   categoryChipActive: { backgroundColor: '#EBF4FF', borderColor: '#1E3A8A' },
//   categoryChipText: { fontSize: 14, color: '#6B7280' },
//   categoryChipTextActive: { color: '#1E3A8A', fontWeight: '600' },
//   addCategoryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EBF4FF',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#1E3A8A',
//     borderStyle: 'dashed',
//   },
//   addCategoryText: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#1E3A8A',
//     fontWeight: '600',
//   },
//   addCategoryRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 8,
//   },
//   categoryInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     backgroundColor: '#FFF',
//   },
//   categoryAddButton: {
//     backgroundColor: '#1E3A8A',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   categoryAddButtonText: { color: '#FFF', fontWeight: '600' },
//   dateInput: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     backgroundColor: '#FFF',
//     marginBottom: 16,
//   },
//   textArea: { textAlignVertical: 'top', height: 180 },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#EBF4FF',
//     borderWidth: 2,
//     borderColor: '#1E3A8A',
//     borderStyle: 'dashed',
//     borderRadius: 8,
//     paddingVertical: 16,
//     marginTop: 16,
//     marginBottom: 12,
//   },
//   disabled: { opacity: 0.6 },
//   uploadButtonText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#1E3A8A',
//     fontWeight: '600',
//   },
//   fieldBlock: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   infoText: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginBottom: 8,
//     fontStyle: 'italic',
//   },
//   submitButton: { marginVertical: 20 },

//   // Progress Bar Styles
//   progressContainer: {
//     marginTop: 8,
//     width: '100%',
//   },
//   progressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#4B5563',
//     fontWeight: '500',
//   },
//   progressBarBg: {
//     height: 8,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     borderRadius: 4,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingBox: {
//     width: width * 0.8,
//     backgroundColor: 'white',
//     padding: 24,
//     borderRadius: 16,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   loadingTitle: {
//     marginTop: 16,
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1F2937',
//   },
//   loadingSubtitle: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { LanguageSwitcher } from '../../../../../components/LanguageSwitcher';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../../../contexts/AuthContext';
import { apiClient } from '../../../../../utils/api';

// ✅ SAFE IMPORT: This prevents the crash in Expo Go
let VideoCompressor;
try {
  // We use 'require' instead of 'import' so it doesn't crash if missing
  VideoCompressor = require('react-native-compressor').Video;
} catch (e) {
  console.log('Video Compressor not available (running in Expo Go?)');
}

const { width } = Dimensions.get('window');

const SERMON_CATEGORIES = [
  'Weekly Sermon Volume 1',
  'Weekly Sermon Volume 2',
  "God's Kingdom Advocate Volume 1",
  "God's Kingdom Advocate Volume 2",
  "God's Kingdom Advocate Volume 3",
  'Abridged Bible Subjects',
];

// --- Helper Component: Progress Bar ---
const ProgressBar = ({ progress, status }) => {
  if (status === 'idle') return null;

  let barColor = '#1E3A8A'; // Blue for uploading
  if (status === 'success') barColor = '#10B981'; // Green
  if (status === 'error') barColor = '#EF4444'; // Red
  if (status === 'compressing') barColor = '#F59E0B'; // Orange for compressing

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Upload Complete';
      case 'error':
        return 'Upload Failed';
      case 'compressing':
        return 'Compressing Video...';
      default:
        return `Uploading... ${progress}%`;
    }
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>{getStatusText()}</Text>
        {status === 'success' && <CheckCircle size={16} color="#10B981" />}
        {status === 'error' && <AlertCircle size={16} color="#EF4444" />}
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: status === 'compressing' ? '100%' : `${progress}%`,
              backgroundColor: barColor,
              // Add a pulsing opacity if compressing? simplified for now
              opacity: status === 'compressing' ? 0.5 : 1,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default function UploadScreen() {
  const { type } = useLocalSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Global form submission state
  const [songCategories, setSongCategories] = useState([]);
  const [sermonVideoCategories, setSermonVideoCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // State structure: { fieldName: { status: 'idle'|'compressing'|'uploading'|'success'|'error', progress: 0 } }
  const [uploadProgress, setUploadProgress] = useState({});

  const FILE_SIZE_LIMITS = { audio: 50, video: 100 };

  useEffect(() => {
    if (type === 'song') {
      fetchSongCategories();
    } else if (type === 'sermonVideo') {
      fetchSermonVideoCategories();
    }
  }, [type]);

  const fetchSongCategories = async () => {
    try {
      const res = await apiClient.get('songs');
      const categories = new Set();
      const songs = res.data.songs || res.data || [];
      songs.forEach((song) => {
        if (song.category?.trim()) categories.add(song.category.trim());
      });
      setSongCategories(Array.from(categories).sort());
    } catch (err) {
      console.error('Failed to load categories:', err);
      Alert.alert('Error', 'Failed to load song categories');
    }
  };

  const fetchSermonVideoCategories = async () => {
    try {
      const res = await apiClient.get('sermonVideos');
      const categories = new Set();
      const sermonVideos = res.data.sermonVideos || res.data || [];
      sermonVideos.forEach((video) => {
        if (video.category?.trim()) categories.add(video.category.trim());
      });
      setSermonVideoCategories(Array.from(categories).sort());
    } catch (err) {
      console.error('Failed to load sermon video categories:', err);
      Alert.alert('Error', 'Failed to load sermon video categories');
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ UPDATED COMPRESSION HELPER
  const compressVideoFile = async (uri) => {
    // Safety Check: If the library didn't load (Expo Go), skip compression
    if (!VideoCompressor) {
      console.log('Skipping compression (Library not loaded / Expo Go)');
      return uri;
    }

    try {
      console.log('Starting video compression...');
      const result = await VideoCompressor.compress(uri, {
        compressionMethod: 'auto',
      });
      console.log('Video compression successful');
      return result;
    } catch (err) {
      console.log('Video compression failed, using original', err);
      return uri; // Fallback to original
    }
  };

  const pickAudio = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      await uploadFile(
        field,
        file.uri,
        file.name,
        file.mimeType,
        FILE_SIZE_LIMITS.audio
      );
    } catch (error) {
      console.error('Audio picker error:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const pickVideo = async (field = 'videoUrl') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];

      // Update UI to show compression state
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'compressing', progress: 0 },
      }));

      // Compress (will return original URI if in Expo Go)
      const finalUri = await compressVideoFile(file.uri);

      // Ensure filename has correct extension if we compressed it
      const finalName = file.name.replace(/\.[^/.]+$/, '') + '.mp4';

      await uploadFile(
        field,
        finalUri,
        finalName,
        'video/mp4',
        FILE_SIZE_LIMITS.video
      );
    } catch (error) {
      console.error('Video picker error:', error);
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'error', progress: 0 },
      }));
      Alert.alert('Error', 'Failed to pick video file');
    }
  };

  const uploadFile = async (field, uri, fileName, mimeType, maxSizeMB) => {
    // 1. Reset Progress UI (Switch from 'compressing' to 'uploading')
    setUploadProgress((prev) => ({
      ...prev,
      [field]: { status: 'uploading', progress: 0 },
    }));

    try {
      // 2. Determine the correct folder based on file type
      let folderName = 'assets';
      if (type === 'notice') folderName = 'notices';
      else if (type === 'sermon' || type === 'sermonAudio')
        folderName = 'sermons';
      else if (type === 'song') folderName = 'songs';
      else if (type === 'video') folderName = 'videos';
      else if (type === 'sermonVideo') folderName = 'sermonVideos';
      else if (type === 'dailyDevotional') folderName = 'dailyDevotionals';

      // 3. Get Signature
      console.log('Requesting signature for:', folderName);
      const signRes = await apiClient.get(`sign-upload?folder=${folderName}`);

      // Safety check: Ensure timestamp exists
      if (!signRes.data || signRes.data.timestamp === undefined) {
        throw new Error(
          'Server returned invalid signature. Check route ordering in server.js.'
        );
      }

      const { signature, timestamp, cloudName, apiKey, folder } = signRes.data;

      // 4. Check File Size locally
      const fileResp = await fetch(uri);
      const blob = await fileResp.blob();
      if (blob.size > maxSizeMB * 1024 * 1024) {
        Alert.alert('File Too Large', `File must be less than ${maxSizeMB}MB`);
        setUploadProgress((prev) => ({
          ...prev,
          [field]: { status: 'error', progress: 0 },
        }));
        return;
      }

      // 5. Create FormData for Cloudinary Direct Upload
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: mimeType,
      });
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      // 6. Direct Upload to Cloudinary URL (Bypassing your server)
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);

        // Track Progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress((prev) => ({
              ...prev,
              [field]: { status: 'uploading', progress: percentComplete },
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const responseData = JSON.parse(xhr.responseText);

            // Cloudinary returns the secure_url directly
            updateField(field, responseData.secure_url);

            setUploadProgress((prev) => ({
              ...prev,
              [field]: { status: 'success', progress: 100 },
            }));
            resolve(responseData);
          } else {
            console.error('Cloudinary Error:', xhr.responseText);
            setUploadProgress((prev) => ({
              ...prev,
              [field]: { status: 'error', progress: 0 },
            }));
            Alert.alert('Upload Failed', 'Cloudinary rejected the file.');
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = (e) => {
          console.error('Network Error:', e);
          setUploadProgress((prev) => ({
            ...prev,
            [field]: { status: 'error', progress: 0 },
          }));
          Alert.alert('Network Error', 'Check your internet connection.');
          reject(new Error('Network error'));
        };

        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload Process Error:', error);
      setUploadProgress((prev) => ({
        ...prev,
        [field]: { status: 'error', progress: 0 },
      }));
      Alert.alert('Upload Error', 'Could not start upload process.');
    }
  };

  const addCategory = () => {
    const categoryName = newCategory.trim();
    if (!categoryName) {
      Alert.alert('Invalid Category', 'Category name cannot be empty');
      return;
    }

    if (type === 'song') {
      if (songCategories.includes(categoryName)) {
        Alert.alert('Category Exists', 'This category already exists');
        return;
      }
      setSongCategories((prev) => [...prev, categoryName].sort());
    } else if (type === 'sermonVideo') {
      if (sermonVideoCategories.includes(categoryName)) {
        Alert.alert('Category Exists', 'This category already exists');
        return;
      }
      setSermonVideoCategories((prev) => [...prev, categoryName].sort());
    }

    updateField('category', categoryName);
    setNewCategory('');
    setShowAddCategory(false);
  };

  const validateForm = () => {
    if (type === 'notice')
      return formData.title?.trim() && formData.message?.trim();
    if (type === 'video') return formData.title?.trim() && formData.videoUrl;
    if (type === 'song')
      return formData.title?.trim() && formData.audioUrl && formData.category;
    if (type === 'sermon')
      return (
        formData.title?.trim() && formData.content?.trim() && formData.category
      );
    if (type === 'sermonAudio')
      return (
        formData.title?.trim() && formData.date?.trim() && formData.audioUrl
      );
    if (type === 'sermonVideo')
      return (
        formData.title?.trim() &&
        formData.date?.trim() &&
        formData.videoUrl &&
        formData.category
      );
    if (type === 'dailyDevotional')
      return (
        formData.title?.trim() &&
        formData.date?.trim() &&
        formData.mainText?.trim()
      );
    if (type === 'quiz') return formData.title?.trim();
    return false;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    // Check if any file is still uploading OR compressing
    const activeUploads = Object.values(uploadProgress).some(
      (p) => p.status === 'uploading' || p.status === 'compressing'
    );
    if (activeUploads) {
      Alert.alert('Please Wait', 'Files are still processing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title?.trim() || '',
        category: formData.category || '',
        content: formData.content?.trim() || '',
        mainText: formData.mainText?.trim() || '',
        date: formData.date || '',
        audioUrl: formData.audioUrl || '',
        videoUrl: formData.videoUrl || '',
        message: formData.message?.trim() || '',
        uploadedBy: user?.email || 'admin',
      };
      let collectionName;
      if (type === 'song') collectionName = 'songs';
      else if (type === 'sermon' || type === 'sermonAudio')
        collectionName = 'sermons';
      else if (type === 'sermonVideo') collectionName = 'sermonVideos';
      else if (type === 'dailyDevotional') collectionName = 'dailyDevotionals';
      else collectionName = `${type}s`;

      const response = await apiClient.post(collectionName, payload);
      const sermonId = response.data.id;

      // Auto-generate TTS for text sermons
      if (type === 'sermon' && formData.content?.trim()) {
        Alert.alert(
          'Sermon Uploaded',
          'Sermon uploaded successfully! Generating audio in background...',
          [
            {
              text: 'OK',
              onPress: async () => {
                apiClient
                  .generateSermonAudio(sermonId, 'en-US', 'en-US-Neural2-F')
                  .then(() => console.log('TTS generated for sermon', sermonId))
                  .catch((err) => console.error('TTS generation failed:', err));
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Success',
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } uploaded successfully!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Failed to upload.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper to get progress for a specific field ---
  const getFieldProgress = (field) => {
    return uploadProgress[field] || { status: 'idle', progress: 0 };
  };

  const renderFormFields = () => {
    // 1. SERMON (Text)
    if (type === 'sermon') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            {SERMON_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipActive,
                ]}
                onPress={() => updateField('category', category)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Input
            label="Sermon Content *"
            value={formData.content || ''}
            onChangeText={(value) => updateField('content', value)}
            multiline
            numberOfLines={8}
            placeholder="Enter sermon content..."
            style={styles.textArea}
            editable={!isSubmitting}
          />
        </View>
      );
    }

    // 2. SERMON AUDIO
    if (type === 'sermonAudio') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={formData.date || ''}
            onChangeText={(value) => updateField('date', value)}
            style={styles.dateInput}
            editable={!isSubmitting}
          />
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.audio}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isSubmitting && styles.disabled]}
            onPress={() => pickAudio('audioUrl')}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Audio File *</Text>
          </TouchableOpacity>
          {/* Progress Bar for Audio */}
          <ProgressBar {...getFieldProgress('audioUrl')} />
        </View>
      );
    }

    // 3. SERMON VIDEO
    if (type === 'sermonVideo') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            {sermonVideoCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipActive,
                ]}
                onPress={() => updateField('category', category)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => setShowAddCategory(true)}
              disabled={isSubmitting}
            >
              <Plus size={16} color="#1E3A8A" />
              <Text style={styles.addCategoryText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
          {showAddCategory && (
            <View style={styles.addCategoryRow}>
              <TextInput
                placeholder="Enter new category name"
                value={newCategory}
                onChangeText={setNewCategory}
                style={styles.categoryInput}
                autoFocus
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={addCategory}
                style={styles.categoryAddButton}
                disabled={isSubmitting}
              >
                <Text style={styles.categoryAddButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
                disabled={isSubmitting}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.label}>Date *</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={formData.date || ''}
            onChangeText={(value) => updateField('date', value)}
            style={styles.dateInput}
            editable={!isSubmitting}
          />
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.video}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isSubmitting && styles.disabled]}
            onPress={() => pickVideo('videoUrl')}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Video File *</Text>
          </TouchableOpacity>
          {/* Progress Bar for Sermon Video */}
          <ProgressBar {...getFieldProgress('videoUrl')} />
        </View>
      );
    }

    // 4. DAILY DEVOTIONAL
    if (type === 'dailyDevotional') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={formData.date || ''}
            onChangeText={(value) => updateField('date', value)}
            style={styles.dateInput}
            editable={!isSubmitting}
          />
          <Input
            label="Main Text *"
            value={formData.mainText || ''}
            onChangeText={(value) => updateField('mainText', value)}
            multiline
            numberOfLines={6}
            placeholder="Enter daily devotional main text..."
            style={styles.textArea}
            editable={!isSubmitting}
          />
        </View>
      );
    }

    // 5. SONG
    if (type === 'song') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            {songCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipActive,
                ]}
                onPress={() => updateField('category', category)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => setShowAddCategory(true)}
              disabled={isSubmitting}
            >
              <Plus size={16} color="#1E3A8A" />
              <Text style={styles.addCategoryText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
          {showAddCategory && (
            <View style={styles.addCategoryRow}>
              <TextInput
                placeholder="Enter new category name"
                value={newCategory}
                onChangeText={setNewCategory}
                style={styles.categoryInput}
                autoFocus
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={addCategory}
                style={styles.categoryAddButton}
                disabled={isSubmitting}
              >
                <Text style={styles.categoryAddButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
                disabled={isSubmitting}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.audio}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isSubmitting && styles.disabled]}
            onPress={() => pickAudio('audioUrl')}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Audio File *</Text>
          </TouchableOpacity>
          {/* Progress Bar for Song */}
          <ProgressBar {...getFieldProgress('audioUrl')} />
        </View>
      );
    }

    // 6. VIDEO (Generic/Animation)
    if (type === 'video') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.infoText}>
            Max file size: {FILE_SIZE_LIMITS.video}MB
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, isSubmitting && styles.disabled]}
            // ✅ CHANGED: explicit arrow function to pass string 'videoUrl'
            onPress={() => pickVideo('videoUrl')}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>Select Video File *</Text>
          </TouchableOpacity>

          {/* Progress Bar for Video */}
          <ProgressBar {...getFieldProgress('videoUrl')} />
        </View>
      );
    }

    // 7. NOTICE
    if (type === 'notice') {
      return (
        <View style={styles.fieldBlock}>
          <Input
            label="Message *"
            value={formData.message || ''}
            onChangeText={(value) => updateField('message', value)}
            multiline
            numberOfLines={4}
            placeholder="Enter notice message..."
            editable={!isSubmitting}
          />
        </View>
      );
    }

    // 8. QUIZ
    if (type === 'quiz') {
      return (
        <View style={styles.fieldBlock}>
          <Text style={styles.infoText}>
            Quiz content is handled separately
          </Text>
        </View>
      );
    }

    return null;
  };

  const getPageTitle = () => {
    const titles = {
      notice: 'Add Notice',
      sermon: 'Add Text Sermon',
      sermonAudio: 'Upload Sermon Audio',
      sermonVideo: 'Upload Sermon Video',
      song: 'Upload Song',
      video: 'Upload Animation Video',
      dailyDevotional: 'Add Daily Devotional',
      quiz: 'Add Quiz Resource',
    };
    return titles[type] || 'Upload';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Loading Overlay for Final Submission */}
      <Modal transparent={true} visible={isSubmitting} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingTitle}>Saving Content...</Text>
            <Text style={styles.loadingSubtitle}>
              Please wait while we finalize the upload.
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getPageTitle()}</Text>
        <LanguageSwitcher />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Title *"
          value={formData.title || ''}
          onChangeText={(value) => updateField('title', value)}
          placeholder="Enter title"
          editable={!isSubmitting}
        />
        {renderFormFields()}

        <Button
          title={isSubmitting ? 'Processing...' : `Upload ${type}`}
          onPress={handleSubmit}
          disabled={isSubmitting || !validateForm()}
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  categoryScroll: { maxHeight: 60, marginBottom: 16 },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: { backgroundColor: '#EBF4FF', borderColor: '#1E3A8A' },
  categoryChipText: { fontSize: 14, color: '#6B7280' },
  categoryChipTextActive: { color: '#1E3A8A', fontWeight: '600' },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  addCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  categoryAddButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryAddButtonText: { color: '#FFF', fontWeight: '600' },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  textArea: { textAlignVertical: 'top', height: 180 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    borderWidth: 2,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  disabled: { opacity: 0.6 },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  fieldBlock: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  submitButton: { marginVertical: 20 },

  // Progress Bar Styles
  progressContainer: {
    marginTop: 8,
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    width: width * 0.8,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
