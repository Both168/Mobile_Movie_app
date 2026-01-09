import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreenNative from 'expo-splash-screen';
import { isUserLoggedIn } from '../services/storageService';
import { getProfile } from '../services/authService';
import SplashScreen from '../components/SplashScreen';
import { ROUTES } from '../utils/routes';

SplashScreenNative.preventAutoHideAsync();

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await SplashScreenNative.hideAsync();
      } catch (error) {
        console.error('Error hiding splash:', error);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isUserLoggedIn();
        
        if (loggedIn) {
          const profile = await getProfile();
          if (profile.success) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <Redirect href={ROUTES.HOME} /> : <Redirect href={ROUTES.AUTH} />;
}
