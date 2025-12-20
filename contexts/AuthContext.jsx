import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API = 'https://grace-backend-tp3h.onrender.com';

  axios.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('jwt');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('jwt');
        setUser(null);
      }
      return Promise.reject(error);
    }
  );

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/login`, { email, password });
      await AsyncStorage.setItem('jwt', data.token);
      const decoded = jwtDecode(data.token);
      setUser({ uid: decoded.email, email: decoded.email });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email, password) => {
    try {
      await axios.post(`${API}/register`, { email, password });
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // 1. Remove the Token
      await AsyncStorage.removeItem('jwt');

      // 2. Remove Onboarding Flag to force Onboarding on next launch
      await AsyncStorage.removeItem('hasSeenOnboarding');

      // 3. Reset State
      setUser(null);
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.email === 'raniem57@gmail.com';

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          await AsyncStorage.removeItem('jwt');
          setUser(null);
        } else {
          setUser({ uid: decoded.email, email: decoded.email });
        }
      } catch (error) {
        console.error('JWT decode error:', error);
        await AsyncStorage.removeItem('jwt');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
