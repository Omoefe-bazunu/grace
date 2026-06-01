import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'gks_anon_user_id';

export async function getAnonymousUserId() {
  try {
    let id = await AsyncStorage.getItem(KEY);
    if (!id) {
      id = Crypto.randomUUID();
      await AsyncStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return Crypto.randomUUID();
  }
}
