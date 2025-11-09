import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://grace-backend-tp3h.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Auto-attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token retrieval error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Response interceptor - Handle errors with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // Handle 502 Bad Gateway errors with retry
    if (error.response?.status === 502 && config.__retryCount < MAX_RETRIES) {
      config.__retryCount++;
      console.log(`Retry attempt ${config.__retryCount} for ${config.url}`);

      await sleep(RETRY_DELAY * config.__retryCount);
      return api.request(config);
    }

    console.error('API Error:', error.message, error.response?.status);

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Network connection failed. Please check your internet.');
    }

    if (error.response?.status === 502) {
      throw new Error('Server is starting up. Please try again in a moment.');
    }

    if (error.response?.status === 503) {
      throw new Error('Service temporarily unavailable. Please try again.');
    }

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt');
      throw new Error('Session expired. Please login again.');
    }

    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  // GET request with query parameters - returns full response with pagination
  get: (collection, params = {}) => api.get(`/api/${collection}`, { params }),

  // GET request with offset pagination (alternative to cursor-based)
  getWithOffset: (collection, params = {}) =>
    api.get(`/api/${collection}/offset`, { params }),

  // POST request
  post: (collection, data) => api.post(`/api/${collection}`, data),

  // PUT request (update)
  put: (collection, id, data) => api.put(`/api/${collection}/${id}`, data),

  // DELETE request
  delete: (collection, id) => api.delete(`/api/${collection}/${id}`),

  // File upload with FormData
  upload: (file, path) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'file',
      type: file.type || 'application/octet-stream',
    });
    formData.append('path', path);

    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000, // 3 minutes for large files
    });
  },

  // Text-to-Speech generation (on-demand fallback)
  generateTTS: (text, languageCode, voiceName) =>
    api.post(
      '/api/tts/synthesize',
      {
        text,
        languageCode,
        voiceName,
      },
      {
        timeout: 60000, // 60 seconds for TTS generation
      }
    ),

  // Pre-generate TTS audio for entire sermon
  generateSermonAudio: (sermonId, languageCode, voiceName) =>
    api.post(
      `/api/sermons/${sermonId}/generate-audio`,
      {
        languageCode,
        voiceName,
      },
      {
        timeout: 300000, // 5 minutes for full sermon generation
      }
    ),

  // Check TTS audio generation status
  getSermonAudioStatus: (sermonId) =>
    api.get(`/api/sermons/${sermonId}/audio-status`),

  // Authentication
  login: (email, password) => api.post('/login', { email, password }),

  register: (email, password) => api.post('/register', { email, password }),

  // Read notices tracking
  markNoticeAsRead: (userId, noticeId) =>
    api.post(`/api/users/${userId}/readNotices`, { noticeId }),

  getReadNotices: (userId) => api.get(`/api/users/${userId}/readNotices`),

  // Health check
  health: () =>
    api.get('/health').catch(() => {
      console.log('Health check failed - server may be starting');
    }),

  // === PAGINATION HELPERS ===

  // Get paginated data with cursor
  getPaginated: (
    collection,
    {
      limit = 10,
      after = null,
      category = null,
      sort = 'createdAt',
      order = 'desc',
    } = {}
  ) => {
    const params = { limit, sort, order };
    if (after) params.after = after;
    if (category) params.category = category;
    return api.get(`/api/${collection}`, { params });
  },

  // Get paginated data with offset (page numbers)
  getPaginatedOffset: (
    collection,
    {
      page = 1,
      limit = 10,
      category = null,
      sort = 'createdAt',
      order = 'desc',
    } = {}
  ) => {
    const params = { page, limit, sort, order };
    if (category) params.category = category;
    return api.get(`/api/${collection}/offset`, { params });
  },

  // Extract data and pagination from response
  extractData: (response, collection) => {
    const data = response.data;
    return {
      items: data[collection] || [],
      pagination: data.pagination || { hasMore: false },
    };
  },

  // Helper to get all items (for backward compatibility)
  getAll: async (collection, category = null) => {
    const params = category ? { category } : {};
    const response = await api.get(`/api/${collection}`, { params });
    return response.data[collection] || [];
  },
};

export default apiClient;
