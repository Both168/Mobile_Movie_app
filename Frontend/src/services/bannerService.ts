import { getApiBaseUrl } from '../utils/apiConfig';
const API_BASE_URL = getApiBaseUrl();

export interface BannerMovie {
  id: number;
  title: string;
  type: number;
}

export interface Banner {
  id: number;
  position: number;
  image: string;
  movie: BannerMovie | null;
  created_at: string;
  updated_at: string;
}

export interface BannerResponse {
  success: boolean;
  message: string;
  data: Banner[];
}

export async function getBanners(position?: number): Promise<BannerResponse> {
  try {
    const url = position
      ? `${API_BASE_URL}/banner?position=${position}`
      : `${API_BASE_URL}/banner`;

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
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to fetch banners.',
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
