import { getApiBaseUrl } from '../utils/apiConfig';
const API_BASE_URL = getApiBaseUrl();

export interface UserData {
  id: number;
  name: string;
  username: string;
  is_member: number;
  is_admin: number;
  is_ban: number;
  is_restric: number | null;
  avarta: string;
  created_at: string;
  updated_at: string;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: UserData;
  token?: string;
  errors?: {
    [key: string]: string[];
  };
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  try {
    const requestBody = JSON.stringify({
      username,
      password,
    });

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: requestBody,
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      return {
        success: false,
        message: text || 'Failed to parse server response.',
      };
    }

    if (response.status === 200 && data.success) {
      const { setToken, setUserId, setUsername } = await import('./storageService');
      
      await setToken(data.data.token);
      await setUserId(data.data.id.toString());
      await setUsername(data.data.username);

      const profileData = await getProfile(data.data.token);

      if (profileData.success && profileData.data) {
        return {
          success: true,
          message: data.message,
          data: profileData.data,
          token: data.data.token,
        };
      } else {
        return {
          success: false,
          message: profileData.message || 'Failed to fetch user profile.',
        };
      }
    }

    if (response.status === 404) {
      return {
        success: false,
        message: data.message || 'Username not found.',
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: data.message || 'Invalid password.',
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        message: data.message || 'Your account has been banned.',
      };
    }

    if (response.status === 422) {
      const errorMessage =
        data.message || data.errors?.username?.[0] || 'Validation error.';
      return {
        success: false,
        message: errorMessage,
        errors: data.errors,
      };
    }

    if (response.status === 502) {
      return {
        success: false,
        message: data.message || 'Server error. The API endpoint is temporarily unavailable. Please try again later.',
      };
    }

    return {
      success: false,
      message: data.message || 'Login failed. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function getProfile(token: string | null = null): Promise<{ success: boolean; data?: UserData; message?: string }> {
  const { getToken, clearUserData } = await import('./storageService');
  const authToken = token || await getToken();

  if (!authToken) {
    return { success: false, message: 'No token found' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      const { saveUserData } = await import('./storageService');
      await saveUserData(data.data);
      return { success: true, data: data.data };
    } else {
      if (response.status === 401) {
        await clearUserData();
      }
      return { success: false, message: data.message || 'Failed to fetch profile' };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
}

export async function logout(): Promise<void> {
  const { getToken, clearUserData } = await import('./storageService');
  const token = await getToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }

  await clearUserData();
}

export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const { getToken, clearUserData } = await import('./storageService');
  const token = await getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await clearUserData();
    throw new Error('Unauthorized - Please login again');
  }

  return response.json();
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: UserData;
  errors?: {
    [key: string]: string[];
  };
}

export async function updateProfile(
  name?: string,
  username?: string,
  avatar?: { uri: string; type: string; name: string }
): Promise<UpdateProfileResponse> {
  const { getToken, clearUserData, saveUserData } = await import('./storageService');
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: 'No authentication token. Please login again.',
    };
  }

  try {
    let response: Response;

    if (avatar) {
      // Use FormData for multipart/form-data when avatar is included
      const formData = new FormData();
      if (name) {
        formData.append('name', name);
      }
      if (username) {
        formData.append('username', username);
      }
      formData.append('avarta', {
        uri: avatar.uri,
        type: avatar.type,
        name: avatar.name,
      } as any);

      response = await fetch(`${API_BASE_URL}/updateProfile`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      // Use JSON when no avatar
      const body: { name?: string; username?: string } = {};
      if (name) {
        body.name = name;
      }
      if (username) {
        body.username = username;
      }

      response = await fetch(`${API_BASE_URL}/updateProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    }

    const data = await response.json();

    if (response.status === 200 && data.success) {
      if (data.data) {
        await saveUserData(data.data);
      }
      return {
        success: true,
        message: data.message || 'Profile updated successfully',
        data: data.data,
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
        message: data.message || 'Validation failed',
        errors: data.errors,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to update profile. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  const { getToken, clearUserData } = await import('./storageService');
  const token = await getToken();

  if (!token) {
    return {
      success: false,
      message: 'No authentication token. Please login again.',
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/userPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      return {
        success: true,
        message: data.message || 'Password updated successfully',
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: data.message || 'Old password is incorrect',
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
        message: data.message || 'Validation failed',
        errors: data.errors,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to change password. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: UserData;
  token?: string;
  errors?: {
    [key: string]: string[];
  };
}

export async function register(
  username: string,
  password: string,
  name?: string,
  avatar?: { uri: string; type: string; name: string }
): Promise<RegisterResponse> {
  try {
    let response: Response;

    if (avatar) {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      if (name) {
        formData.append('name', name);
      }
      formData.append('avarta', {
        uri: avatar.uri,
        type: avatar.type,
        name: avatar.name,
      } as any);

      response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
    } else {
      const requestBody = JSON.stringify({
        username,
        password,
        ...(name && { name }),
      });

      response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBody,
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      return {
        success: false,
        message: text || 'Failed to parse server response.',
      };
    }

    if (response.status === 201 && data.success) {
      const { setToken, setUserId, setUsername } = await import('./storageService');
      
      await setToken(data.data.token);
      await setUserId(data.data.id.toString());
      await setUsername(data.data.username);

      const profileData = await getProfile(data.data.token);

      if (profileData.success && profileData.data) {
        return {
          success: true,
          message: data.message,
          data: profileData.data,
          token: data.data.token,
        };
      } else {
        return {
          success: false,
          message: profileData.message || 'Failed to fetch user profile.',
        };
      }
    }

    if (response.status === 422) {
      const errorMessage =
        data.message || data.errors?.username?.[0] || 'Validation error.';
      return {
        success: false,
        message: errorMessage,
        errors: data.errors,
      };
    }

    return {
      success: false,
      message: data.message || 'Registration failed. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}
