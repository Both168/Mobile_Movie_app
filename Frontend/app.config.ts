import { ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext) => ({
  ...config,
  expo: {
    name: 'movie_mobile_app',
    slug: 'movie_mobile_app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icon.png',
      backgroundColor: '#1C1C1E',
      resizeMode: 'contain',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription: 'This app needs access to your photo library to upload an avatar.',
        NSCameraUsageDescription: 'This app needs access to your camera to take a photo for your avatar.',
      },
    },
    android: {
      package: 'com.hwdb123.movie_mobile_app',
      hardwareAccelerated: true,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'CAMERA',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    scheme: 'movie-mobile-app',
    plugins: [
      'expo-router',
      'expo-font',
    ],
    extra: {
      eas: {
        projectId: 'f18e7583-923f-4cc1-968f-72c39ce8350c',
      },
    },
  },
});
