import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://grace-backend-tp3h.onrender.com';

// Auto-attach JWT to all requests
axios.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: GET with query params (returns data directly)
const get = (path, params = {}) => {
  return axios
    .get(`${API_BASE_URL}${path}`, { params })
    .then((res) => res.data);
};

// Helper: POST
const post = (path, data) => {
  return axios.post(`${API_BASE_URL}${path}`, data).then((res) => res.data);
};

// === SERMONS ===
export const getSermons = async () => {
  try {
    const response = await get('/api/sermons');
    return response.sermons || [];
  } catch (error) {
    console.error('Error fetching sermons:', error);
    return [];
  }
};

export const getSermonsByCategory = async (category, limit = null) => {
  try {
    const params = { category };
    if (limit) params.limit = limit;
    const response = await get('/api/sermons', params);
    return response.sermons || [];
  } catch (error) {
    console.error('Error fetching sermons by category:', error);
    return [];
  }
};

// Paginated sermons (all sermons)
export const getSermonsPaginated = async (limit = 15, after = null) => {
  try {
    const params = {
      limit,
      sort: 'createdAt',
      order: 'desc',
    };

    if (after) params.after = after;

    const data = await get('/api/sermons', params);

    return {
      sermons: data.sermons || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated sermons:', error);
    return { sermons: [], hasMore: false, nextCursor: null, totalCount: 0 };
  }
};

// Paginated sermons by category
export const getSermonsByCategoryPaginated = async (
  category,
  limit = 10,
  after = null
) => {
  try {
    const params = {
      category,
      limit,
      sort: 'createdAt',
      order: 'desc',
    };

    if (after) params.after = after;

    const data = await get('/api/sermons', params);

    return {
      sermons: data.sermons || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated sermons by category:', error);

    // Fallback: fetch all and filter client-side
    if (error.message?.includes('index')) {
      console.warn('Index not ready, using fallback');
      try {
        const allSermons = await getSermonsPaginated(100, null);
        const filtered = allSermons.sermons.filter(
          (s) => s.category === category
        );
        return {
          sermons: filtered.slice(0, limit),
          hasMore: filtered.length > limit,
          nextCursor: filtered[limit - 1]?.id || null,
          totalCount: filtered.length,
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return { sermons: [], hasMore: false, nextCursor: null, totalCount: 0 };
  }
};

export const getSermon = async (sermonId) => {
  try {
    const sermon = await get(`/api/sermons/${sermonId}`);
    return sermon ? formatSermon(sermon) : null;
  } catch {
    return null;
  }
};

export const subscribeToSermons = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/sermons');
      callback(response.sermons || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === SONGS ===
export const getSongs = async () => {
  try {
    const response = await get('/api/songs');
    return response.songs || [];
  } catch {
    return [];
  }
};

export const getSongsByCategory = async (category) => {
  try {
    const response = await get('/api/songs', { category });
    return response.songs || [];
  } catch {
    return [];
  }
};

// Paginated songs (all songs)
export const getSongsPaginated = async (limit = 15, after = null) => {
  try {
    const params = {
      limit,
      sort: 'title',
      order: 'asc',
    };

    if (after) params.after = after;

    const data = await get('/api/songs', params);

    return {
      songs: data.songs || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated songs:', error);
    return { songs: [], hasMore: false, nextCursor: null, totalCount: 0 };
  }
};

// Paginated songs by category - FIXED to match backend composite index
export const getSongsByCategoryPaginated = async (
  category,
  limit = 10,
  after = null
) => {
  try {
    const params = {
      category,
      limit,
      // Don't specify sort/order - backend handles it automatically
      // Backend uses: category ASC + title ASC (matches composite index)
    };

    if (after) params.after = after;

    const data = await get('/api/songs', params);

    return {
      songs: data.songs || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated songs by category:', error);

    // Fallback: If index not ready, fetch all and filter client-side
    if (
      error.message?.includes('index') ||
      error.response?.data?.error?.includes('index')
    ) {
      console.warn('Composite index not ready, using fallback method');
      try {
        const allSongs = await getSongsPaginated(100, null);
        const filtered = allSongs.songs.filter((s) => s.category === category);

        return {
          songs: filtered.slice(0, limit),
          hasMore: filtered.length > limit,
          nextCursor: filtered[limit - 1]?.id || null,
          totalCount: filtered.length,
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return { songs: [], hasMore: false, nextCursor: null, totalCount: 0 };
  }
};

export const getSong = async (songId) => {
  try {
    const song = await get(`/api/songs/${songId}`);
    return song ? formatSong(song) : null;
  } catch {
    return null;
  }
};

export const subscribeToSongs = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/songs');
      callback(response.songs || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === VIDEOS ===
export const getVideos = async () => {
  try {
    const response = await get('/api/videos');
    return response.videos || [];
  } catch {
    return [];
  }
};

// Paginated videos
export const getVideosPaginated = async (limit = 12, after = null) => {
  try {
    const params = {
      limit,
      sort: 'createdAt',
      order: 'desc',
    };

    if (after) params.after = after;

    const data = await get('/api/videos', params);

    return {
      videos: data.videos || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated videos:', error);
    return { videos: [], hasMore: false, nextCursor: null, totalCount: 0 };
  }
};

export const getVideo = async (videoId) => {
  try {
    const video = await get(`/api/videos/${videoId}`);
    return video ? formatVideo(video) : null;
  } catch {
    return null;
  }
};

export const subscribeToVideos = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/videos');
      callback(response.videos || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === NOTICES ===
export const getNotices = async () => {
  try {
    const response = await get('/api/notices');
    return response.notices || [];
  } catch {
    return [];
  }
};

export const subscribeToNotices = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/notices');
      callback(response.notices || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

export const markNoticeAsRead = async (userId, noticeId) => {
  try {
    await post(`/api/users/${userId}/readNotices`, { noticeId });
  } catch (error) {
    console.error('Error marking notice as read:', error);
  }
};

export const getReadNoticesIds = async (userId) => {
  try {
    return await get(`/api/users/${userId}/readNotices`);
  } catch {
    return [];
  }
};

export const put = async (path, data) => {
  return axios.put(`${API_BASE_URL}${path}`, data).then((res) => res.data);
};

export const del = async (path, id) => {
  return axios.delete(`${API_BASE_URL}${path}/${id}`).then((res) => res.data);
};

export const subscribeToReadNotices = (userId, callback) => {
  const fetchData = async () => {
    try {
      const ids = await getReadNoticesIds(userId);
      callback(ids);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === QUIZ RESOURCES ===
export const getQuizResources = async () => {
  try {
    const response = await get('/api/quizResources');
    return response.quizResources || [];
  } catch {
    return [];
  }
};

export const getQuiz = async (quizId) => {
  try {
    const quiz = await get(`/api/quizResources/${quizId}`);
    return quiz ? formatQuiz(quiz) : null;
  } catch {
    return null;
  }
};

export const subscribeToQuizzes = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/quizResources');
      callback(response.quizResources || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

export const addQuizResource = async (quizData) => {
  try {
    await post('/api/quizResources', quizData);
  } catch (e) {
    console.error('Error adding quiz:', e);
    throw e;
  }
};

export const addQuizHelpQuestion = async (questionData) => {
  try {
    await post('/api/quizHelpQuestions', questionData);
  } catch (e) {
    console.error('Error adding quiz help:', e);
    throw e;
  }
};

export const subscribeToQuizHelpQuestions = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/quizHelpQuestions');
      callback(response.quizHelpQuestions || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === CONTACT MESSAGES ===
export const addContactMessage = async (messageData) => {
  try {
    await post('/api/contactMessages', messageData);
  } catch (e) {
    console.error('Error adding contact message:', e);
    throw e;
  }
};

export const subscribeToContactMessages = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/contactMessages');
      callback(response.contactMessages || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === RECENT CONTENT ===
export const getRecentContent = async () => {
  try {
    const [sermonsRes, songsRes, videosRes] = await Promise.all([
      get('/api/sermons', { limit: 3 }),
      get('/api/songs', { limit: 3 }),
      get('/api/videos', { limit: 3 }),
    ]);

    // FILTER: Only text sermons (client-side, safe)
    const textSermons = (sermonsRes.sermons || [])
      .filter((s) => !s.audioUrl)
      .slice(0, 5)
      .map(formatSermon);

    return {
      sermons: textSermons,
      songs: (songsRes.songs || []).map(formatSong),
      videos: (videosRes.videos || []).map(formatVideo),
    };
  } catch (error) {
    console.error('getRecentContent ERROR:', error.response || error);
    return { sermons: [], songs: [], videos: [] };
  }
};

// === SEARCH ===
export const searchContent = async (searchTerm, category = null) => {
  try {
    const term = searchTerm.toLowerCase();
    const [allSermons, allSongs, allVideos] = await Promise.all([
      getSermons(),
      getSongs(),
      getVideos(),
    ]);

    return {
      sermons: allSermons.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          (s.content && s.content.toLowerCase().includes(term))
      ),
      songs: allSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(term) &&
          (!category || s.category === category)
      ),
      videos: allVideos.filter((v) => v.title.toLowerCase().includes(term)),
    };
  } catch {
    return { sermons: [], songs: [], videos: [] };
  }
};

// Optimized search with pagination support
export const searchContentPaginated = async (
  searchTerm,
  category = null,
  limit = 20,
  after = null
) => {
  try {
    const term = searchTerm.toLowerCase();

    // Fetch more items initially for better search results
    const [sermonsData, songsData, videosData] = await Promise.all([
      getSermonsPaginated(100, null),
      getSongsPaginated(100, null),
      getVideosPaginated(100, null),
    ]);

    const filteredSermons = sermonsData.sermons.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        (s.content && s.content.toLowerCase().includes(term))
    );

    const filteredSongs = songsData.songs.filter(
      (s) =>
        s.title.toLowerCase().includes(term) &&
        (!category || s.category === category)
    );

    const filteredVideos = videosData.videos.filter((v) =>
      v.title.toLowerCase().includes(term)
    );

    // Combine and sort all results
    const allResults = [
      ...filteredSermons.map((s) => ({ ...s, type: 'sermon' })),
      ...filteredSongs.map((s) => ({ ...s, type: 'song' })),
      ...filteredVideos.map((v) => ({ ...v, type: 'video' })),
    ].sort((a, b) => a.title.localeCompare(b.title));

    // Apply cursor-based pagination
    const startIndex = after
      ? allResults.findIndex((item) => item.id === after) + 1
      : 0;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    // Separate back into types
    const resultsByType = {
      sermons: paginatedResults
        .filter((item) => item.type === 'sermon')
        .map(({ type, ...item }) => item),
      songs: paginatedResults
        .filter((item) => item.type === 'song')
        .map(({ type, ...item }) => item),
      videos: paginatedResults
        .filter((item) => item.type === 'video')
        .map(({ type, ...item }) => item),
    };

    const lastItem = paginatedResults[paginatedResults.length - 1];

    return {
      ...resultsByType,
      pagination: {
        hasMore: endIndex < allResults.length,
        nextCursor: lastItem ? lastItem.id : null,
        totalCount: allResults.length,
      },
    };
  } catch (error) {
    console.error('Error in searchContentPaginated:', error);
    return {
      sermons: [],
      songs: [],
      videos: [],
      pagination: { hasMore: false, nextCursor: null, totalCount: 0 },
    };
  }
};

// === FORMATTERS ===
const formatSermon = (s) => ({
  id: s.id,
  title: s.title,
  content: s.content || '',
  category: s.category || null,
  audioUrl: s.audioUrl || null,
  ttsAudioUrl: s.ttsAudioUrl || null,
  date: s.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
  duration: s.duration || null,
  uploadedBy: s.uploadedBy,
  createdAt: s.createdAt,
});

const formatSong = (s) => ({
  id: s.id,
  title: s.title,
  category: s.category,
  audioUrl: s.audioUrl,
  duration: s.duration || null,
  style: s.style || getStyleByCategory(s.category),
  uploadedBy: s.uploadedBy,
  createdAt: s.createdAt,
});

const formatVideo = (v) => ({
  id: v.id,
  title: v.title,
  duration: v.duration || null,
  languageCategory: v.languageCategory || 'Multi-language',
  videoUrl: v.videoUrl,
  thumbnailUrl: v.thumbnailUrl || getDefaultThumbnail(),
  uploadedBy: v.uploadedBy,
  createdAt: v.createdAt,
});

const formatNotice = (n) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  date: n.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
  uploadedBy: n.uploadedBy,
  createdAt: n.createdAt,
});

const formatQuiz = (q) => ({
  id: q.id,
  title: q.title,
  age: q.age,
  gender: q.gender,
  year: q.year,
  content: q.content,
  uploadedBy: q.uploadedBy,
  createdAt: q.createdAt,
});

const getStyleByCategory = (category) => {
  const styles = {
    acapella: 'A Cappella Gospel',
    native: 'Contemporary Gospel',
    english: 'English Gospel',
  };
  return styles[category] || 'Gospel';
};

const getDefaultThumbnail = () => {
  return 'https://images.pexels.com/photos/8879724/pexels-photo-8879724.jpeg?auto=compress&cs=tinysrgb&w=800';
};

// === APP INFO ===
export const getAppInfo = () => ({
  version: '1.0.0',
  content: `The God's Kingdom Society (GKS) is a Christian organization founded by Jehovah God through His servant, Saint Gideon Meriodere Urhobo. 

Established in 1934, GKS emerged from a divine calling when St. G.M. Urhobo received a vision from Jesus Christ commissioning him to proclaim the Gospel of God's Kingdom and expose false doctrines.

What makes GKS unique:
• Founded on direct biblical revelation and divine calling
• Committed to pure Bible teachings without denominational traditions
• Multilingual ministry reaching people of all backgrounds
• Focused on God's Kingdom as the solution to human suffering

From small beginnings in Lagos, GKS has grown into a vibrant Christian community across Nigeria and beyond, fulfilling the biblical prophecy: "A little one shall become a thousand" (Isaiah 60:22).`,

  mission:
    'To glorify God and make disciples of all nations through multilingual worship and biblical teaching.',

  contactInfo: {
    headquarters: 'Salem City, P.O. Box 424, Warri, Delta State, Nigeria',
    phones: ['+234-810 098 7661', '+234-802 329 5127'],
    emails: [
      'gkssecretariat@mountaingks.org',
      'publicitysecretary@mountaingks.org',
    ],
    socialMedia: {
      facebook: 'www.facebook.com/mountaingks',
      twitter: 'www.twitter.com/mountaingks',
    },
  },

  keyBeliefs: [
    'The Bible as the only authorized law book of God',
    "God's Kingdom as the only remedy for human suffering",
    'The importance of exposing false doctrines',
    'Service and reverence to Jehovah God',
    'Christian unity across all nations and backgrounds',
  ],

  // For a more detailed "About" screen if needed
  detailedHistory: {
    founding: '1934 by St. G.M. Urhobo through divine revelation',
    nameEvolution: [
      "Lagos Division of Jehovah's Witnesses (1934)",
      'Lagos Company of Christian People (1939)',
      'Nigerian Christian Society (1942)',
      "God's Kingdom Society (1943)",
    ],
    earlyCenters: [
      'Lagos (1934)',
      'Port Harcourt (1940)',
      'Warri & Sapele (1942)',
      'Onitsha (1946)',
      'Aba (1948)',
    ],
    significantEvents: [
      '1933: St. Urhobo resigns from government service to preach full-time',
      '1934: Divine commission and start of ministry',
      "1943: Official naming as God's Kingdom Society",
      'Growth from small group to international Christian organization',
    ],
  },
});

// === TTS FUNCTIONS ===
export const generateSermonAudio = async (
  sermonId,
  languageCode = 'en-US',
  voiceName = 'en-US-Neural2-F'
) => {
  try {
    const response = await post(`/api/sermons/${sermonId}/generate-audio`, {
      languageCode,
      voiceName,
    });
    return response;
  } catch (error) {
    console.error('Error generating sermon audio:', error);
    throw error;
  }
};

export const getSermonAudioStatus = async (sermonId) => {
  try {
    const response = await get(`/api/sermons/${sermonId}/audio-status`);
    return response;
  } catch (error) {
    console.error('Error getting sermon audio status:', error);
    throw error;
  }
};

export const synthesizeTTS = async (
  text,
  languageCode = 'en-US',
  voiceName = 'en-US-Neural2-F'
) => {
  try {
    const response = await post('/api/tts/synthesize', {
      text,
      languageCode,
      voiceName,
    });
    return response;
  } catch (error) {
    console.error('Error synthesizing TTS:', error);
    throw error;
  }
};
