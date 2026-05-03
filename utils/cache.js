import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryCache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const cache = {
  async get(key) {
    // Layer 1: memory cache (~0ms)
    const mem = memoryCache.get(key);
    if (mem && Date.now() < mem.expiresAt) return mem.data;

    // Layer 2: AsyncStorage (~5-20ms, survives restarts)
    try {
      const raw = await AsyncStorage.getItem(`cache:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() < parsed.expiresAt) {
          // Warm the memory cache for subsequent calls
          memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {}
    return null;
  },

  async set(key, data, ttl = DEFAULT_TTL) {
    const entry = { data, expiresAt: Date.now() + ttl };
    memoryCache.set(key, entry);
    try {
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(entry));
    } catch {}
  },

  invalidate(key) {
    memoryCache.delete(key);
    AsyncStorage.removeItem(`cache:${key}`).catch(() => {});
  },
};
