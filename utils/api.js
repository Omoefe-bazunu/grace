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
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt');
      throw new Error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  },
);

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
  put: (pathOrCollection, idOrData, data) => {
    const p = clean(pathOrCollection);
    if (typeof idOrData === 'object' && data === undefined) {
      return api.put(`/${p}`, idOrData);
    }
    return api.put(`/${p}/${idOrData}`, data);
  },
  delete: (pathOrCollection, id) => {
    const p = clean(pathOrCollection);
    const url = id ? `/${p}/${id}` : `/${p}`;
    return api.delete(url);
  },

  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (email, password) =>
    api.post('/api/auth/register', { email, password }),

  // FIXED: Added parameters for Firebase Storage requirements
  getUploadConfig: (folder, fileName, contentType) =>
    api.get(
      `/api/upload/config?folder=${folder}&fileName=${fileName}&contentType=${contentType}`,
    ),

  generateSermonAudio: (sermonId, languageCode, voiceName) =>
    api.post(`/api/sermons/${sermonId}/generate-audio`, {
      languageCode,
      voiceName,
    }),
};

export default apiClient;
