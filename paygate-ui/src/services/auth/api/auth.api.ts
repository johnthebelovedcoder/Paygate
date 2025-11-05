import { apiService } from '../../../api';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  MFASetupResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordResponse,
  UpdateUserResponse,
  UserData
} from '../types';

const AUTH_BASE_URL = '/auth';

export const authApi = {
  // Authentication
  login: (credentials: LoginCredentials) => 
    apiService.post<AuthResponse>(`${AUTH_BASE_URL}/login`, credentials),
    
  register: (data: RegisterData) => 
    apiService.post<AuthResponse>(`${AUTH_BASE_URL}/register`, data),
    
  logout: (refreshToken?: string) => 
    apiService.post<{ success: boolean }>(`${AUTH_BASE_URL}/logout`, { refreshToken }),
    
  refreshToken: (refreshToken: string) => 
    apiService.post<RefreshTokenResponse>(
      `${AUTH_BASE_URL}/refresh`,
      { refreshToken: refreshToken } as RefreshTokenRequest
    ),
    
  // User
  getCurrentUser: () => 
    apiService.get<UserData>(`${AUTH_BASE_URL}/me`),
    
  updateUser: (userData: Partial<UserData>) => 
    apiService.patch<UpdateUserResponse>(`${AUTH_BASE_URL}/me`, userData),
    
  deleteUser: () => 
    apiService.delete<{ success: boolean; message: string }>(`${AUTH_BASE_URL}/me`),
    
  // MFA
  setupMFA: () => 
    apiService.post<MFASetupResponse>(`${AUTH_BASE_URL}/mfa/setup`),
    
  verifyMFA: (totpCode: string) => 
    apiService.post<{ success: boolean; message: string }>(
      `${AUTH_BASE_URL}/mfa/verify`,
      { totp_code: totpCode }
    ),
    
  // Password Reset
  requestPasswordReset: (email: string) => 
    apiService.post<ForgotPasswordResponse>(
      `${AUTH_BASE_URL}/forgot-password`,
      { email }
    ),
    
  resetPassword: (token: string, newPassword: string) =>
    apiService.post<{ success: boolean; message: string }>(
      `${AUTH_BASE_URL}/reset-password`,
      { token, password: newPassword }
    ),
    
  // Email Verification
  verifyEmail: (token: string) =>
    apiService.post<{ success: boolean; message: string }>(
      `${AUTH_BASE_URL}/verify-email`,
      { token }
    ),
    
  resendVerificationEmail: (email: string) =>
    apiService.post<{ success: boolean; message: string }>(
      `${AUTH_BASE_URL}/verify-email/resend`,
      { email }
    )
};
