// authService.ts - Authentication service
import { apiService } from './api';
import { isTokenExpired } from '../utils/auth.utils';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  country?: string;
  currency?: string;
  userType?: 'creator' | 'business' | 'other';
  contentTypes?: string[];
}

export interface UserData {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  email: string;
  role: string;
  currency?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
}

export interface AuthResponse {
  success?: boolean;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user?: UserData;
  message?: string;
  mfa_required?: boolean;
}

export interface MFASetupResponse {
  secret: string;
  otp_uri: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  user: UserData;
  message?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Login failed' };
    }
  }

  async loginWithMFA(credentials: LoginCredentials & { totp_code: string }): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login/mfa', {
        email: credentials.email,
        password: credentials.password,
        totp_code: credentials.totp_code,
      });
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Login failed' };
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    additionalData?: {
      country?: string;
      currency?: string;
      userType?: 'creator' | 'business' | 'other';
      contentTypes?: string[];
    }
  ): Promise<AuthResponse> {
    try {
      const data: RegisterData = { name, email, password, ...additionalData };
      const response = await apiService.post<AuthResponse>('/auth/register', data);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Registration failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.access_token && response.refresh_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      return response;
    } catch (error: unknown) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to refresh token' };
    }
  }

  async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await apiService.get<UserData>('/auth/me');
      if (response) {
        localStorage.setItem('user', JSON.stringify(response));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // For now, just check if token exists, in real app you might want to check expiration
    return !isTokenExpired(token);
  }

  getUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  async updateDetails(userData: Partial<UserData>): Promise<UpdateUserResponse> {
    try {
      const response = await apiService.put<UpdateUserResponse>('/auth/me', userData);
      if (response.success && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update details' };
    }
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.put<{ success: boolean; message?: string }>(
        '/auth/updatepassword',
        {
          currentPassword,
          newPassword,
        }
      );
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update password' };
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiService.post<ForgotPasswordResponse>('/auth/forgotpassword', {
        email,
      });
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to send reset email' };
    }
  }

  async resetPassword(resetToken: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/resetpassword', {
        resetToken,
        newPassword: password,
      });
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to reset password' };
    }
  }

  async setupMFA(): Promise<MFASetupResponse> {
    try {
      const response = await apiService.post<MFASetupResponse>('/auth/mfa/setup');
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to setup MFA' };
    }
  }

  async verifyMFA(totpCode: string): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>('/auth/mfa/verify', {
        totp_code: totpCode,
      });
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to verify MFA' };
    }
  }

  async verifyEmailToken(token: string): Promise<{ message: string }> {
    try {
      const response = await apiService.get<{ message: string }>(`/auth/verify-email/${token}`);
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to verify email' };
    }
  }

  async deleteUser(): Promise<{ message: string }> {
    try {
      const response = await apiService.delete<{ message: string }>('/users/me');
      // Clear local storage after successful deletion
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to delete account' };
    }
  }
}

const authService = new AuthService();
export default authService;
