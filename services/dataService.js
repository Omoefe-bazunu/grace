import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../utils/api';

const API_BASE_URL = 'https://grace-backend-tp3h.onrender.com';

// Auto-attach JWT to all requests
axios.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: GET with query params
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
    const sermons = await get('/api/sermons');
    return sermons.map(formatSermon);
  } catch (error) {
    console.error('Error fetching sermons:', error);
    return [];
  }
};

export const getSermonsByCategory = async (category, limit = null) => {
  try {
    const params = { category };
    if (limit) params.limit = limit;
    const sermons = await get('/api/sermons', params);
    return sermons.map(formatSermon);
  } catch (error) {
    console.error('Error fetching sermons by category:', error);
    return [];
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
      const sermons = await get('/api/sermons');
      callback(sermons.map(formatSermon));
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
    const songs = await get('/api/songs');
    return songs.map(formatSong);
  } catch {
    return [];
  }
};

export const getSongsByCategory = async (category) => {
  try {
    const songs = await get('/api/songs', { category });
    return songs.map(formatSong);
  } catch {
    return [];
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
      const songs = await get('/api/songs');
      callback(songs.map(formatSong));
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
    const videos = await get('/api/videos');
    return videos.map(formatVideo);
  } catch {
    return [];
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
      const videos = await get('/api/videos');
      callback(videos.map(formatVideo));
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
    const notices = await get('/api/notices');
    return notices.map(formatNotice);
  } catch {
    return [];
  }
};

export const subscribeToNotices = (callback) => {
  const fetchData = async () => {
    try {
      const notices = await get('/api/notices');
      callback(notices.map(formatNotice));
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
    const quizzes = await get('/api/quizResources');
    return quizzes.map(formatQuiz);
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
      const quizzes = await get('/api/quizResources');
      callback(quizzes.map(formatQuiz));
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
      const questions = await get('/api/quizHelpQuestions');
      callback(questions);
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
      const messages = await get('/api/contactMessages');
      callback(messages);
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
      apiClient.get('sermons', { limit: 5 }),
      apiClient.get('songs', { limit: 5 }),
      apiClient.get('videos', { limit: 5 }),
    ]);

    // FILTER: Only text sermons (client-side, safe)
    const textSermons = sermonsRes.data
      .filter((s) => !s.audioUrl)
      .slice(0, 5)
      .map(formatSermon);

    return {
      sermons: textSermons,
      songs: songsRes.data.map(formatSong),
      videos: videosRes.data.map(formatVideo), // ← Videos work exactly as before
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

// === FORMATTERS ===
const formatSermon = (s) => ({
  id: s.id,
  title: s.title,
  content: s.content || '',
  category: s.category || null,
  audioUrl: s.audioUrl || null,
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
  content:
    'Grace is a multilingual church app designed to bring the gospel to people of all languages and backgrounds...',
  contactEmail: 'info@higher.com.ng',
  churchMission:
    'To glorify God and make disciples of all nations through multilingual worship and biblical teaching.',
});
