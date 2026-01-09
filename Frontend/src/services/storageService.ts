import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from './authService';

const USER_KEY = '@user_data';
const TOKEN_KEY = '@auth_token';
const USER_ID_KEY = '@user_id';
const USERNAME_KEY = '@username';

export async function saveUserData(userData: UserData): Promise<void> {
  try {
    const { token, ...userDataWithoutToken } = userData;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userDataWithoutToken));
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (userData) {
      const parsed = JSON.parse(userData);
      return token ? { ...parsed, token } : parsed;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

export async function setUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error('Error saving user ID:', error);
    throw error;
  }
}

export async function setUsername(username: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
  } catch (error) {
    console.error('Error saving username:', error);
    throw error;
  }
}

export async function clearUserData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, USER_ID_KEY, USERNAME_KEY]);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}

export async function isUserLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}
