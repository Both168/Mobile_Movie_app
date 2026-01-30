import { Platform } from 'react-native';

export const getApiBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://127.0.0.1:8000/api';
};

export const getMediaBaseUrl = (): string => {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
};

export function resolveImageUrl(uri: string | null | undefined): string | null | undefined {
  if (!uri) return uri;
  try {
    const u = new URL(uri);
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') {
      return getMediaBaseUrl() + u.pathname + u.search;
    }
    return uri;
  } catch {
    return uri;
  }
}
