// api.js (updated - sermon videos and daily devotionals added)
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

// === SERMON VIDEOS ===
export const getSermonVideos = async () => {
  try {
    const response = await get('/api/sermonVideos');
    return response.sermonVideos || [];
  } catch (error) {
    console.error('Error fetching sermon videos:', error);
    return [];
  }
};

export const getSermonVideosByCategory = async (category, limit = null) => {
  try {
    const params = { category };
    if (limit) params.limit = limit;
    const response = await get('/api/sermonVideos', params);
    return response.sermonVideos || [];
  } catch (error) {
    console.error('Error fetching sermon videos by category:', error);
    return [];
  }
};

// Paginated sermon videos
export const getSermonVideosPaginated = async (limit = 12, after = null) => {
  try {
    const params = {
      limit,
      sort: 'createdAt',
      order: 'desc',
    };

    if (after) params.after = after;

    const data = await get('/api/sermonVideos', params);

    return {
      sermonVideos: data.sermonVideos || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated sermon videos:', error);
    return {
      sermonVideos: [],
      hasMore: false,
      nextCursor: null,
      totalCount: 0,
    };
  }
};

// Paginated sermon videos by category
export const getSermonVideosByCategoryPaginated = async (
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

    const data = await get('/api/sermonVideos', params);

    return {
      sermonVideos: data.sermonVideos || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated sermon videos by category:', error);

    // Fallback: fetch all and filter client-side
    if (error.message?.includes('index')) {
      console.warn('Index not ready, using fallback');
      try {
        const allVideos = await getSermonVideosPaginated(100, null);
        const filtered = allVideos.sermonVideos.filter(
          (v) => v.category === category
        );
        return {
          sermonVideos: filtered.slice(0, limit),
          hasMore: filtered.length > limit,
          nextCursor: filtered[limit - 1]?.id || null,
          totalCount: filtered.length,
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return {
      sermonVideos: [],
      hasMore: false,
      nextCursor: null,
      totalCount: 0,
    };
  }
};

export const getSermonVideo = async (videoId) => {
  try {
    const video = await get(`/api/sermonVideos/${videoId}`);
    return video ? formatSermonVideo(video) : null;
  } catch {
    return null;
  }
};

export const subscribeToSermonVideos = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/sermonVideos');
      callback(response.sermonVideos || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
};

// === DAILY DEVOTIONALS ===
export const getDailyDevotionals = async () => {
  try {
    const response = await get('/api/dailyDevotionals');
    return response.dailyDevotionals || [];
  } catch (error) {
    console.error('Error fetching daily devotionals:', error);
    return [];
  }
};

// Paginated daily devotionals
export const getDailyDevotionalsPaginated = async (
  limit = 10,
  after = null
) => {
  try {
    const params = {
      limit,
      sort: 'date',
      order: 'desc',
    };

    if (after) params.after = after;

    const data = await get('/api/dailyDevotionals', params);

    return {
      dailyDevotionals: data.dailyDevotionals || [],
      hasMore: data.pagination?.hasMore || false,
      nextCursor: data.pagination?.nextCursor || null,
      totalCount: data.pagination?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching paginated daily devotionals:', error);
    return {
      dailyDevotionals: [],
      hasMore: false,
      nextCursor: null,
      totalCount: 0,
    };
  }
};

export const getDailyDevotional = async (devotionalId) => {
  try {
    const devotional = await get(`/api/dailyDevotionals/${devotionalId}`);
    return devotional ? formatDailyDevotional(devotional) : null;
  } catch {
    return null;
  }
};

export const getDailyDevotionalByDate = async (date) => {
  try {
    const devotionals = await getDailyDevotionals();
    return devotionals.find((devotional) => devotional.date === date) || null;
  } catch {
    return null;
  }
};

export const subscribeToDailyDevotionals = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/dailyDevotionals');
      callback(response.dailyDevotionals || []);
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

export const toggleFavorite = async (songId, action) => {
  try {
    if (!['add', 'remove'].includes(action)) {
      throw new Error("Action must be 'add' or 'remove'");
    }
    // The server-side route is: app.post("/api/songs/:id/favorite", ...)
    const response = await post(`/api/songs/${songId}/favorite`, { action });
    return response;
  } catch (error) {
    console.error(`Error toggling favorite for song ${songId}:`, error);
    throw error;
  }
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
    const [sermonsRes, songsRes, videosRes, sermonVideosRes, devotionalsRes] =
      await Promise.all([
        get('/api/sermons', { limit: 3 }),
        get('/api/songs', { limit: 3 }),
        get('/api/videos', { limit: 3 }),
        get('/api/sermonVideos', { limit: 3 }),
        get('/api/dailyDevotionals', { limit: 3 }),
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
      sermonVideos: (sermonVideosRes.sermonVideos || []).map(formatSermonVideo),
      dailyDevotionals: (devotionalsRes.dailyDevotionals || []).map(
        formatDailyDevotional
      ),
    };
  } catch (error) {
    console.error('getRecentContent ERROR:', error.response || error);
    return {
      sermons: [],
      songs: [],
      videos: [],
      sermonVideos: [],
      dailyDevotionals: [],
    };
  }
};

// === SEARCH ===
export const searchContent = async (searchTerm, category = null) => {
  try {
    const term = searchTerm.toLowerCase();
    const [allSermons, allSongs, allVideos, allSermonVideos, allDevotionals] =
      await Promise.all([
        getSermons(),
        getSongs(),
        getVideos(),
        getSermonVideos(),
        getDailyDevotionals(),
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
      sermonVideos: allSermonVideos.filter((v) =>
        v.title.toLowerCase().includes(term)
      ),
      dailyDevotionals: allDevotionals.filter(
        (d) =>
          d.title.toLowerCase().includes(term) ||
          d.mainText.toLowerCase().includes(term)
      ),
    };
  } catch {
    return {
      sermons: [],
      songs: [],
      videos: [],
      sermonVideos: [],
      dailyDevotionals: [],
    };
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
    const [
      sermonsData,
      songsData,
      videosData,
      sermonVideosData,
      devotionalsData,
    ] = await Promise.all([
      getSermonsPaginated(100, null),
      getSongsPaginated(100, null),
      getVideosPaginated(100, null),
      getSermonVideosPaginated(100, null),
      getDailyDevotionalsPaginated(100, null),
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

    const filteredSermonVideos = sermonVideosData.sermonVideos.filter((v) =>
      v.title.toLowerCase().includes(term)
    );

    const filteredDevotionals = devotionalsData.dailyDevotionals.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        d.mainText.toLowerCase().includes(term)
    );

    // Combine and sort all results
    const allResults = [
      ...filteredSermons.map((s) => ({ ...s, type: 'sermon' })),
      ...filteredSongs.map((s) => ({ ...s, type: 'song' })),
      ...filteredVideos.map((v) => ({ ...v, type: 'video' })),
      ...filteredSermonVideos.map((v) => ({ ...v, type: 'sermonVideo' })),
      ...filteredDevotionals.map((d) => ({ ...d, type: 'dailyDevotional' })),
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
      sermonVideos: paginatedResults
        .filter((item) => item.type === 'sermonVideo')
        .map(({ type, ...item }) => item),
      dailyDevotionals: paginatedResults
        .filter((item) => item.type === 'dailyDevotional')
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
      sermonVideos: [],
      dailyDevotionals: [],
      pagination: { hasMore: false, nextCursor: null, totalCount: 0 },
    };
  }
};

// === LIVE STREAMS ===
export const getLiveStreams = async () => {
  try {
    const response = await get('/api/liveStreams');
    return response.liveStreams || [];
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return [];
  }
};

export const getActiveLiveStreams = async () => {
  try {
    // First try the specific active endpoint
    try {
      const response = await get('/api/liveStreams/active');
      return response.liveStreams || [];
    } catch (activeError) {
      // If active endpoint fails, get all and filter client-side
      console.log('Active endpoint failed, filtering client-side');
      const allStreams = await getLiveStreams();
      return allStreams.filter((stream) => stream.isActive === true);
    }
  } catch (error) {
    console.error('Error fetching active live streams:', error);
    return [];
  }
};

export const getLiveStream = async (streamId) => {
  try {
    const stream = await get(`/api/liveStreams/${streamId}`);
    return stream ? formatLiveStream(stream) : null;
  } catch {
    return null;
  }
};

export const createLiveStream = async (streamData) => {
  try {
    const response = await post('/api/liveStreams', streamData);
    return response;
  } catch (error) {
    console.error('Error creating live stream:', error);
    throw error;
  }
};

export const updateLiveStream = async (streamId, streamData) => {
  try {
    const response = await put(`/api/liveStreams/${streamId}`, streamData);
    return response;
  } catch (error) {
    console.error('Error updating live stream:', error);
    throw error;
  }
};

export const deleteLiveStream = async (streamId) => {
  try {
    const response = await del(`/api/liveStreams/${streamId}`);
    return response;
  } catch (error) {
    console.error('Error deleting live stream:', error);
    throw error;
  }
};

export const subscribeToLiveStreams = (callback) => {
  const fetchData = async () => {
    try {
      const response = await get('/api/liveStreams/active');
      callback(response.liveStreams || []);
    } catch {
      callback([]);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 30000); // Update every 30 seconds
  return () => clearInterval(interval);
};

// Format live stream data
const formatLiveStream = (stream) => ({
  id: stream.id,
  title: stream.title,
  description: stream.description,
  streamUrl: stream.streamUrl,
  streamType: stream.streamType || 'hls',
  isActive: stream.isActive || false,
  schedule: stream.schedule || '',
  thumbnailUrl: stream.thumbnailUrl,
  customData: stream.customData || {},
  uploadedBy: stream.uploadedBy,
  createdAt: stream.createdAt,
  updatedAt: stream.updatedAt,
});

// Helper to generate platform-specific URLs
export const generateStreamUrl = (streamType, customData) => {
  const generators = {
    youtube: (data) => `https://www.youtube.com/embed/${data.videoId}`,
    facebook: (data) =>
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        data.videoUrl
      )}`,
    hls: (data) => data.streamUrl,
    rtmp: (data) => data.streamUrl,
    obs: (data) => data.streamUrl,
  };

  const generator = generators[streamType] || generators.hls;
  return generator(customData);
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

const formatSermonVideo = (v) => ({
  id: v.id,
  title: v.title,
  category: v.category || null,
  videoUrl: v.videoUrl,
  date:
    v.date ||
    v.createdAt?.split('T')[0] ||
    new Date().toISOString().split('T')[0],
  duration: v.duration || null,
  uploadedBy: v.uploadedBy,
  createdAt: v.createdAt,
});

const formatDailyDevotional = (d) => ({
  id: d.id,
  title: d.title,
  mainText: d.mainText || '',
  date:
    d.date ||
    d.createdAt?.split('T')[0] ||
    new Date().toISOString().split('T')[0],
  uploadedBy: d.uploadedBy,
  createdAt: d.createdAt,
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
