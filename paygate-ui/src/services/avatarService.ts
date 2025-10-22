// avatarService.ts - Avatar upload service
import { apiService } from './api';
import contentService from './contentService';
import axios, { AxiosError, isAxiosError } from 'axios';

export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl?: string;
  message?: string;
}

class AvatarService {
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          message: 'Please select a valid image file (JPEG, PNG, GIF, etc.)',
        };
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: 'File size must be less than 5MB',
        };
      }

      // Upload file to get URL
      const uploadResult: import('./contentService').FileUploadResponse =
        await contentService.uploadFile(file);

      if (uploadResult.success && uploadResult.data && uploadResult.data.url) {
        return {
          success: true,
          avatarUrl: uploadResult.data.url,
        };
      } else {
        return {
          success: false,
          message: uploadResult.message || 'Avatar upload failed - no URL returned',
        };
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        message: (error as Error)?.message || 'Failed to upload avatar. Please try again.',
      };
    }
  }

  async updateAvatarUrl(
    userId: string,
    avatarUrl: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Update user preferences with new avatar URL
      const response = await apiService.put<{ success: boolean; message?: string }>(
        `/user/preferences`,
        { avatarUrl }
      );
      return {
        success: response.success,
        message: response.success ? 'Avatar updated successfully' : 'Failed to update avatar',
      };
    } catch (error) {
      console.error('Error updating avatar URL in preferences:', error);
      let errorMessage = 'Failed to update avatar. Please try again.';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

const avatarService = new AvatarService();
export default avatarService;
