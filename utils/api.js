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

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.message);

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Network connection failed. Please check your internet.');
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
  // GET request with query parameters
  get: (collection, params = {}) => api.get(`/api/${collection}`, { params }),

  // POST request
  post: (collection, data) => api.post(`/api/${collection}`, data),

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

  // Authentication
  login: (email, password) => api.post('/login', { email, password }),

  register: (email, password) => api.post('/register', { email, password }),

  // Health check
  health: () =>
    api.get('/health').catch(() => {
      console.log('Health check failed - server may be starting');
    }),
};

export default apiClient;
