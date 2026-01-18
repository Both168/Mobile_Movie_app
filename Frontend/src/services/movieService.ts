import { getApiBaseUrl } from '../utils/apiConfig';
const API_BASE_URL = getApiBaseUrl();

export interface TrendingCard {
  id: number;
  image: string;
}

export interface TrendingResponse {
  success: boolean;
  message: string;
  data: TrendingCard[];
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  success: boolean;
  message: string;
  data: Genre[];
}

export interface SeriesResponse {
  success: boolean;
  message: string;
  data: TrendingCard[];
  pagination: Pagination;
}

export async function getTrendingCards(): Promise<TrendingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/listCardsTending`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch trending cards.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export async function getMayLike(): Promise<TrendingResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token found.',
        data: [],
      };
    }

    const response = await fetch(`${API_BASE_URL}/mayLike`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data || [],
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
        data: [],
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch recommendations.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export async function getMyListCards(): Promise<TrendingResponse> {
  try {
    const { getToken } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token found.',
        data: [],
      };
    }

    const response = await fetch(`${API_BASE_URL}/myListCards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    if (response.status === 401) {
      const { clearUserData } = await import('./storageService');
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
        data: [],
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch my list.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export async function getDramaListCards(): Promise<TrendingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramaListCard`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch drama cards.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export async function getSeriesCards(page: number = 1, genreId?: number): Promise<SeriesResponse> {
  try {
    let url = `${API_BASE_URL}/seriesCards?page=${page}`;
    if (genreId) {
      url += `&genre_id=${genreId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
        pagination: data.pagination,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch series cards.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  }
}

export async function getSeriesGenres(): Promise<GenreResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/seriesGenre`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch genres.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export async function getMoviesCards(page: number = 1, genreId?: number): Promise<SeriesResponse> {
  try {
    let url = `${API_BASE_URL}/moviesCards?page=${page}`;
    if (genreId) {
      url += `&genre_id=${genreId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
        pagination: data.pagination,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch movie cards.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  }
}

export async function getMoviesGenres(): Promise<GenreResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/moviesGenre`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch genres.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export async function searchAll(query: string, page: number = 1): Promise<SeriesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/searchAll?title=${encodeURIComponent(query)}&page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
        pagination: data.pagination,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to search.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  }
}

export async function searchSeries(query: string, page: number = 1): Promise<SeriesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/searchSeries?title=${encodeURIComponent(query)}&page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
        pagination: data.pagination,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to search series.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  }
}

export async function searchMovies(query: string, page: number = 1): Promise<SeriesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/searchMovies?title=${encodeURIComponent(query)}&page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
        pagination: data.pagination,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to search movies.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
      },
    };
  }
}

export interface MovieDetail {
  title: string;
  description: string;
  image: string;
  video: string;
  genre: string[];
  age_rating: number;
  lang: string;
  is_sub: number;
  is_dub: number;
}

export interface MovieDetailResponse {
  success: boolean;
  message: string;
  data: MovieDetail;
}

export interface IncrementViewResponse {
  success: boolean;
  message: string;
  data?: { view: number };
}

export async function incrementView(movieId: number): Promise<IncrementViewResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: movieId }),
    });
    const data = await response.json();
    if (response.ok && data.success) return { success: true, message: data.message, data: data.data };
    return { success: false, message: data.message || 'Failed to record view' };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function getMovieDetail(id: number): Promise<MovieDetailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/moviesDetail?id=${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch movie details.',
      data: {
        title: '',
        description: '',
        image: '',
        video: '',
        genre: [],
        age_rating: 0,
        lang: '',
        is_sub: 0,
        is_dub: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: {
        title: '',
        description: '',
        image: '',
        video: '',
        genre: [],
        age_rating: 0,
        lang: '',
        is_sub: 0,
        is_dub: 0,
      },
    };
  }
}

export interface MoviesSuggestResponse {
  success: boolean;
  message: string;
  data: TrendingCard[];
}

export async function getMoviesSuggest(movieId: number): Promise<MoviesSuggestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/moviesSuggest?id=${movieId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch suggested movies.',
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: [],
    };
  }
}

export interface Episode {
  id: number;
  title: string;
  description: string | null;
  image: string;
  video: string;
  duration: number;
}

export interface Season {
  id: number;
  title: string;
  description: string;
  number_of_season: number;
  episodes: Episode[];
}

export interface SeriesDetail {
  title: string;
  description: string;
  image: string;
  genre: string[];
  age_rating: number;
  lang: string;
  is_sub: number;
  is_dub: number;
  seasons: Season[];
}

export interface SeriesDetailResponse {
  success: boolean;
  message: string;
  data: SeriesDetail;
}

export async function getSeriesDetail(id: number): Promise<SeriesDetailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/seriesDetail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch series details.',
      data: {} as SeriesDetail,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: {} as SeriesDetail,
    };
  }
}

export interface MovieListResponse {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export async function addMovieToList(movieId: number): Promise<MovieListResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token. Please login again.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/addMovieList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message || 'Movie added to list successfully',
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: data.message || 'Movie already in your list',
      };
    }

    if (response.status === 422) {
      return {
        success: false,
        message: data.message || 'Validation failed',
        errors: data.errors,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to add movie to list. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function removeMovieFromList(movieId: number): Promise<MovieListResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token. Please login again.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/removeMovieList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message || 'Movie removed from list successfully',
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: data.message || 'Movie not found in your list',
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to remove movie from list. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function addMovieToFavorites(movieId: number): Promise<MovieListResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token. Please login again.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/addMovieFav`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message || 'Movie added to favorites successfully',
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: data.message || 'Movie already in your favorites',
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to add movie to favorites. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function removeMovieFromFavorites(movieId: number): Promise<MovieListResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token. Please login again.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/removeMovieFav`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message || 'Movie removed from favorites successfully',
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: data.message || 'Movie not found in your favorites',
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to remove movie from favorites. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export interface CheckListResponse {
  success: boolean;
  data?: number; // 1 if in list, 0 if not
  message?: string;
}

export interface CheckFavResponse {
  success: boolean;
  data?: number; // 1 if favorited, 0 if not
  message?: string;
}

export async function checkMovieInList(movieId: number): Promise<CheckListResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token. Please login again.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/checkList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        data: data.data, // 1 if in list, 0 if not
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
      };
    }

    if (response.status === 422) {
      return {
        success: false,
        message: data.message || 'Validation error',
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to check list status.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function checkMovieInFavorites(movieId: number): Promise<CheckFavResponse> {
  try {
    const { getToken, clearUserData } = await import('./storageService');
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: 'No authentication token. Please login again.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/checkFav`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        data: data.data, // 1 if favorited, 0 if not
      };
    }

    if (response.status === 401) {
      await clearUserData();
      return {
        success: false,
        message: 'Unauthorized. Please login again.',
      };
    }

    if (response.status === 422) {
      return {
        success: false,
        message: data.message || 'Validation error',
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to check favorite status.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}
