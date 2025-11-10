// Authentication related types and interfaces

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;  // Changed from 'name' to 'full_name' to match backend schema
  email: string;
  password: string;
  username?: string;
  country?: string;
  currency?: string;
  user_type?: string;  // Changed to match backend schema
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

// Re-export all types
export * from './auth.types';
