// services/userPreferencesService.ts - User preferences service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface UserPreferences {
  userId: string;
  currency?: string;
  country?: string;
  userType?: 'creator' | 'business' | 'other';
  contentTypes?: string[];
  avatarUrl?: string;
  updatedAt: string;
}

export interface UserPreferencesResponse {
  success: boolean;
  data?: UserPreferences;
  message?: string;
}

export interface ValidationResponse {
  success: boolean;
  data?: {
    isValid: boolean;
    error?: string;
  };
  message?: string;
}

class UserPreferencesService {
  // Get user preferences
  async getPreferences(): Promise<UserPreferencesResponse> {
    try {
      const response = await apiService.get<UserPreferencesResponse>('/user/preferences');
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch user preferences' };
    }
  }

  // Update user preferences
  async updatePreferences(
    preferences: Partial<Omit<UserPreferences, 'userId' | 'updatedAt'>>
  ): Promise<UserPreferencesResponse> {
    try {
      const response = await apiService.put<UserPreferencesResponse>(
        '/user/preferences',
        preferences
      );
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update user preferences' };
    }
  }

  // Validate content types
  async validateContentTypes(contentTypes: string[]): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>(
        '/user/preferences/validate-content-types',
        { contentTypes }
      );
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to validate content types' };
    }
  }

  // Validate user type
  async validateUserType(userType: string): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>(
        '/user/preferences/validate-user-type',
        { userType }
      );
      return response;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to validate user type' };
    }
  }
}

const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
