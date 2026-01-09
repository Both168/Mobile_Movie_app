import { Platform } from 'react-native';

/**
 * Get the correct API base URL based on the platform
 * Android emulator uses 10.0.2.2 to access host machine's localhost
 * iOS simulator and physical devices can use 127.0.0.1 or the computer's IP
 */
export const getApiBaseUrl = (): string => {
  // For Android emulator, use 10.0.2.2 instead of 127.0.0.1
  if (Platform.OS === 'android') {
    // Check if running in emulator (you can also use __DEV__ or other checks)
    return 'http://10.0.2.2:8000/api';
  }
  
  // For iOS simulator and web, use localhost
  return 'http://127.0.0.1:8000/api';
};
