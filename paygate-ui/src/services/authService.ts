// authService.ts - Enhanced Authentication Service
import { apiService } from './api';
import { isTokenExpired, getTokenExpiryTime } from '../utils/auth.utils';
import type { AxiosError } from 'axios';

// Constants
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before token expiry

// Type guard for Axios errors
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

// Error formatter
function formatError(error: unknown): { message: string; status?: number; code?: string } {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      message: (axiosError.response?.data as any)?.message || axiosError.message || 'An error occurred',
      status: axiosError.response?.status,
      code: axiosError.code,
    };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'An unknown error occurred' };
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
  success: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserData;
  expires_in?: number;
  message?: string;
  mfa_required?: boolean;
  error?: string;
  error_description?: string;
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
      const response = await apiService.post<AuthResponse>('/api/auth/login', credentials);
      
      if (!response.access_token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Store user data without sensitive information
      const { password, ...userData } = response.user as any;
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        ...response,
        success: true,
        user: userData
      };
      
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Login failed:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        error: formattedError.message,
        status: (error as any)?.response?.status,
        mfa_required: (error as any)?.response?.data?.mfa_required || false
      };
    }
  }

  async loginWithMFA(credentials: LoginCredentials & { totp_code: string }): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
        totp_code: credentials.totp_code,
      });
      
      if (!response.access_token) {
        throw new Error('No access token in response');
      }
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return {
        ...response,
        success: true
      };
      
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('MFA login failed:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        status: (error as any)?.response?.status
      };
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    additionalData: {
      country?: string;
      currency?: string;
      userType?: 'creator' | 'business' | 'other';
      contentTypes?: string[];
    } = {}
  ): Promise<AuthResponse> {
    try {
      const data: RegisterData = { 
        name, 
        email, 
        password, 
        ...additionalData 
      };
      
      const response = await apiService.post<AuthResponse>('/api/auth/register', data);
      
      if (!response.access_token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Store user data without sensitive information
      const { password: _, ...userData } = response.user as any;
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        ...response,
        success: true,
        user: userData
      };
      
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Registration failed:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        error: formattedError.message,
        status: (error as any)?.response?.status
      };
    }
  }

  async logout(refreshToken?: string | null): Promise<{ success: boolean }> {
    const token = refreshToken || localStorage.getItem('refresh_token');
    
    try {
      if (token) {
        await apiService.post('/api/auth/logout', { refreshToken: token });
      }
      return { success: true };
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Still return success as we'll clear local state anyway
      return { success: true };
    } finally {
      // Always clear local state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    const token = refreshToken || localStorage.getItem('refresh_token');
    
    if (!token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh', {
        refresh_token: token, // Changed to match backend expected field name
      });

      if (!response.access_token) {
        throw new Error('No access token in response');
      }

      // Update stored tokens
      localStorage.setItem('access_token', response.access_token);
      
      // Update refresh token if a new one was provided
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token || token, // Fallback to old refresh token if not provided
        token_type: response.token_type || 'Bearer'
      };
      
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Token refresh failed:', formattedError);
      
      // Clear auth state on refresh failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      throw {
        ...formattedError,
        status: (error as any)?.response?.status,
        code: (error as any)?.code
      };
    }
  }

  async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await apiService.get<UserData>('/api/users/me');
      if (response) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response));
        return response;
      }
      throw new Error('No user data received');
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Failed to fetch current user:', formattedError);
      // If unauthorized, clear the auth state
      if ((error as any)?.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
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

    // Check if token is expired
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
      const response = await apiService.put<UpdateUserResponse>('/api/users/me', userData);
      
      // Update stored user data if the update was successful
      if (response && response.user) {
        const currentUser = this.getUser();
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Failed to update user details:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        status: (error as any)?.response?.status
      };
    }
  }

  async setupMFA(): Promise<MFASetupResponse> {
    try {
      const response = await apiService.post<MFASetupResponse>('/api/auth/mfa/setup', {});
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Failed to set up MFA:', formattedError);
      throw {
        ...formattedError,
        success: false,
        status: (error as any)?.response?.status
      };
    }
  }

  async verifyMFA(totpCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>(
        '/api/auth/mfa/verify', 
        { totp_code: totpCode } // Match backend expected field name
      );
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Failed to verify MFA code:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        status: (error as any)?.response?.status
      };
    }
  }

  async verifyEmailToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.get<{ success: boolean; message: string }>(
        `/api/auth/verify-email/${token}`
      );
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Email verification failed:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        status: (error as any)?.response?.status
      };
    }
  }

  async deleteUser(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.delete<{ success: boolean; message: string }>('/api/users/me');
      
      // Clear auth state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Failed to delete user:', formattedError);
      throw {
        success: false,
        message: formattedError.message,
        status: (error as any)?.response?.status
      };
    }
  }

  // Get token expiration time
  getTokenExpiration(token: string | null): number | null {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }

  // Clear all authentication tokens and stored data
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Password reset functionality
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>(
        '/api/auth/request-password-reset', 
        { email }
      );
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Password reset request failed:', formattedError);
      throw {
        success: false,
        message: formattedError.message || 'Failed to request password reset',
        status: (error as any)?.response?.status
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>(
        '/api/auth/reset-password',
        {
          token,
          new_password: newPassword // Match backend expected field name
        }
      );
      return response;
    } catch (error: unknown) {
      const formattedError = formatError(error);
      console.error('Password reset failed:', formattedError);
      throw {
        success: false,
        message: formattedError.message || 'Failed to reset password',
        status: (error as any)?.response?.status
      };
    }
  }
}

// Create and export the auth service instance
export default new AuthService();
