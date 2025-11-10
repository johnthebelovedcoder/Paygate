import { authApi } from './api/auth.api';
import * as tokenUtils from './utils/token.utils';
import { handleApiError } from './utils/error.utils';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserData,
  UpdateUserResponse,
  MFASetupResponse
} from './types/auth.types';

class AuthService {
  // Token Management
  getToken(): string | null {
    return tokenUtils.getStoredTokens().accessToken;
  }

  getRefreshToken(): string | null {
    return tokenUtils.getStoredTokens().refreshToken;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const expiresIn = this.getTokenExpiration(token);
    return !!expiresIn && expiresIn > Date.now();
  }

  // Core Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.login(credentials);
      const responseData = response.data;
      this.handleAuthResponse(responseData);
      return responseData;
    } catch (error) {
      throw handleApiError(error, 'Login failed');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse | { success: boolean; message: string }> {
    try {
      const response = await authApi.register(data);
      const responseData = response.data;
      
      // Check if the response contains tokens (user is logged in) or just a success message (email verification required)
      if ('access_token' in responseData && 'refresh_token' in responseData) {
        // User has been authenticated directly
        this.handleAuthResponse(responseData);
        return responseData;
      } else {
        // Email verification required
        return responseData;
      }
    } catch (error) {
      throw handleApiError(error, 'Registration failed');
    }
  }

  async logout(refreshToken?: string): Promise<void> {
    try {
      await authApi.logout(refreshToken);
    } finally {
      this.clearAuthState();
    }
  }

  // Token Management
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await authApi.refreshToken(refreshToken);
      const { access_token, refresh_token } = response.data;
      tokenUtils.storeTokens(access_token, refresh_token || '');
      return access_token;
    } catch (error) {
      this.clearAuthState();
      throw handleApiError(error, 'Failed to refresh token');
    }
  }

  // User Management
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await authApi.getCurrentUser();
      return response.data as UserData;
    } catch (error) {
      if (error.response?.status === 401) {
        this.clearAuthState();
      }
      throw handleApiError(error, 'Failed to fetch user data');
    }
  }

  async updateUser(userData: Partial<UserData>): Promise<UpdateUserResponse> {
    try {
      const response = await authApi.updateUser(userData);
      return response.data as UpdateUserResponse;
    } catch (error) {
      throw handleApiError(error, 'Failed to update user');
    }
  }

  // MFA
  async setupMFA(): Promise<MFASetupResponse> {
    try {
      const response = await authApi.setupMFA();
      return response.data as MFASetupResponse;
    } catch (error) {
      throw handleApiError(error, 'Failed to set up MFA');
    }
  }

  async verifyMFA(totpCode: string): Promise<boolean> {
    try {
      const response = await authApi.verifyMFA(totpCode);
      return (response.data as { success: boolean }).success;
    } catch (error) {
      throw handleApiError(error, 'MFA verification failed');
    }
  }

  // Password Reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await authApi.requestPasswordReset(email);
    } catch (error) {
      throw handleApiError(error, 'Failed to request password reset');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const { success } = await authApi.resetPassword(token, newPassword);
      return success;
    } catch (error) {
      throw handleApiError(error, 'Failed to reset password');
    }
  }

  // Helper Methods
  private handleAuthResponse(response: AuthResponse): void {
    if (response.access_token) {
      tokenUtils.storeTokens(
        response.access_token,
        response.refresh_token
      );
    }
  }

  private clearAuthState(): void {
    tokenUtils.clearTokens();
    localStorage.removeItem('user');
  }

  // Token Utilities
  getTokenExpiration(token: string | null): number | null {
    return tokenUtils.getTokenExpiration(token);
  }

  isTokenExpiringSoon(expiresIn?: number): boolean {
    return tokenUtils.isTokenExpiringSoon(expiresIn);
  }
}

export const authService = new AuthService();

export default authService;
