import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://grace-backend-tp3h.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Token error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(
      'API Error:',
      error.message,
      error.response?.status,
      'URL:',
      error.config?.url
    );

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt');
      throw new Error('Session expired. Please login again.');
    }
    if (error.response?.status === 502 || error.response?.status === 503) {
      throw new Error('Server is waking up. Please try again in a moment.');
    }
    return Promise.reject(error);
  }
);

// Helper to clean paths (prevents 'api/api/' issues)
const clean = (path) => {
  let p = path.startsWith('/') ? path.substring(1) : path;
  if (
    !p.startsWith('api/') &&
    !p.startsWith('login') &&
    !p.startsWith('register')
  ) {
    p = `api/${p}`;
  }
  return p;
};

export const apiClient = {
  get: (path, params = {}) => api.get(`/${clean(path)}`, { params }),

  post: (path, data) => api.post(`/${clean(path)}`, data),

  requestPasswordReset: (email) => api.post('/api/forgot-password', { email }),

  confirmPasswordReset: (email, otp, newPassword) =>
    api.post('/api/reset-password', { email, otp, newPassword }),

  // ✅ SMART PUT: Handles both (collection, id, data) AND (path, data)
  put: (pathOrCollection, idOrData, data) => {
    const p = clean(pathOrCollection);

    // Case 1: Called as put('ministers/123', { name: ... })
    if (typeof idOrData === 'object' && data === undefined) {
      return api.put(`/${p}`, idOrData);
    }

    // Case 2: Called as put('ministers', '123', { name: ... })
    return api.put(`/${p}/${idOrData}`, data);
  },

  // ✅ SMART DELETE: Handles both (collection, id) AND (path)
  delete: (pathOrCollection, id) => {
    const p = clean(pathOrCollection);
    const url = id ? `/${p}/${id}` : `/${p}`;
    return api.delete(url);
  },

  getSignature: (folder) => api.get(`/api/sign-upload?folder=${folder}`),

  // Auth & Specialized
  login: (email, password) => api.post('/login', { email, password }),
  register: (email, password) => api.post('/register', { email, password }),

  generateSermonAudio: (sermonId, languageCode, voiceName) =>
    api.post(
      `/api/sermons/${sermonId}/generate-audio`,
      { languageCode, voiceName },
      { timeout: 300000 }
    ),

  getSermonAudioStatus: (sermonId) =>
    api.get(`/api/sermons/${sermonId}/audio-status`),

  markNoticeAsRead: (userId, noticeId) =>
    api.post(`/api/users/${userId}/readNotices`, { noticeId }),

  getReadNotices: (userId) => api.get(`/api/users/${userId}/readNotices`),

  generateTTS: (text, languageCode, voiceName) =>
    api.post('/api/tts/synthesize', { text, languageCode, voiceName }),
};

export default apiClient;
