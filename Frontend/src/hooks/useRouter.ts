import { useRouter as useExpoRouter } from 'expo-router';
import { ROUTES, Route } from '../utils/routes';

export function useRouter() {
  const router = useExpoRouter();

  return {
    push: (route: Route) => {
      router.push(route as any);
    },
    replace: (route: Route) => {
      router.replace(route as any);
    },
    back: () => {
      router.back();
    },
    canGoBack: () => {
      return router.canGoBack();
    },
    ROUTES,
  };
}
