// accessService.ts - Service for handling access to protected content
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface AccessRequest {
  contentId: string;
  customerId?: string;
  customerEmail: string;
  customerName?: string;
}

export interface AccessResponse {
  success: boolean;
  accessUrl?: string;
  message?: string;
  expiresIn?: number; // Time in seconds until URL expires
}

export interface ContentAccessCheck {
  hasAccess: boolean;
  message?: string;
  accessType?: 'purchase' | 'subscription' | 'trial' | 'none';
  expirationDate?: string;
}

class AccessService {
  /**
   * Request access to protected content
   * @param data Access request data
   * @returns Signed URL for accessing the content
   */
  async requestContentAccess(data: AccessRequest): Promise<AccessResponse> {
    try {
      const response = await apiService.post<AccessResponse>('/access/request', data);
      return response;
    } catch (error: unknown) {
      console.error('Error requesting content access:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to request content access' };
    }
  }

  /**
   * Check if a user has access to specific content
   * @param contentId The ID of the content to check access for
   * @param customerId Optional customer ID
   * @returns Access check result
   */
  async checkContentAccess(contentId: string, customerId?: string): Promise<ContentAccessCheck> {
    try {
      const params = customerId ? { customerId } : {};
      const response = await apiService.get<ContentAccessCheck>(`/access/check/${contentId}`, {
        params,
      });
      return response;
    } catch (error: unknown) {
      console.error('Error checking content access:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to check content access' };
    }
  }

  /**
   * Get a signed URL for accessing protected content
   * @param contentId The ID of the content to access
   * @returns Signed URL for accessing the content
   */
  async getSignedContentUrl(contentId: string): Promise<AccessResponse> {
    try {
      const response = await apiService.get<AccessResponse>(`/access/signed-url/${contentId}`);
      return response;
    } catch (error: unknown) {
      console.error('Error getting signed content URL:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to get signed content URL' };
    }
  }

  /**
   * Track content access (for analytics)
   * @param contentId The ID of the content being accessed
   * @param accessType Type of access (view, download, etc.)
   */
  async trackContentAccess(contentId: string, accessType: string = 'view'): Promise<void> {
    try {
      await apiService.post('/access/track', { contentId, accessType });
    } catch (error: unknown) {
      console.error('Error tracking content access:', error);
      // Don't throw error for tracking - it shouldn't break the user experience
    }
  }

  /**
   * Revoke access to content (admin function)
   * @param contentId The ID of the content to revoke access for
   * @param customerId Optional customer ID to revoke access for specific user
   */
  async revokeContentAccess(contentId: string, customerId?: string): Promise<void> {
    try {
      const data = customerId ? { customerId } : {};
      await apiService.post(`/access/revoke/${contentId}`, data);
    } catch (error: unknown) {
      console.error('Error revoking content access:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to revoke content access' };
    }
  }
}

const accessService = new AccessService();
export default accessService;
