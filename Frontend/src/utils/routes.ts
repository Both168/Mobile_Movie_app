export const ROUTES = {
  HOME: '/home',
  MOVIE: '/movie',
  SERIES: '/series',
  PROFILE: '/profile',
  MY_LIST: '/profile/my-list',
  SETTINGS: '/profile/settings',
  EDIT_PROFILE: '/profile/edit-profile',
  CHANGE_PASSWORD: '/profile/change-password',
  AUTH: '/auth',
  REGISTER: '/auth/register',
  MOVIE_DETAIL: '/movie/[id]',
  SERIES_DETAIL: '/series/[id]',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
