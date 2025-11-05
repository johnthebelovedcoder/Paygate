// paywallService.ts - Paywall management service
import { apiService } from './api';
import exponentialBackoff from '../utils/throttle.utils';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

// Cache for paywalls data to prevent duplicate requests
let paywallsCache: Paywall[] | null = null;
let paywallsCacheTimestamp: number | null = null;
const CACHE_DURATION = 30000; // 30 seconds cache - increased for better performance

export interface CreatePaywallData {
  title: string;
  description?: string;
  price: number; // Required field for the backend
  currency?: string; // Optional, defaults to USD on backend
  type?: 'file' | 'url' | 'content' | 'content_package' | 'document' | 'video' | 'image' | 'paywall';
  content_ids?: number[]; // List of content IDs - defaults to [] on backend
  url?: string;
  status?: 'draft' | 'active' | 'archived'; // Optional, defaults to draft on backend
  success_redirect_url?: string; // Match backend field names
  cancel_redirect_url?: string;
  webhook_url?: string;
  duration?: number; // Duration in days
  // Note: owner_id is set by the backend based on current user, so don't send it
}

// Update Paywall interface to match backend response more closely
export interface Paywall {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  thumbnailUrl?: string;
  type: 'file' | 'url' | 'content' | 'content_package' | 'document' | 'video' | 'image' | 'paywall';
  contentId?: string;
  url?: string;
  status: 'draft' | 'published' | 'archived';
  sales: number;
  revenue: number;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  pricingModel?: 'one-time' | 'subscription' | 'pay-what-you-want'; // Added pricingModel field
  // Add fields that might be returned by backend
  content?: unknown; // Added content field that may be returned by backend
}

export interface UpdatePaywallData {
  title?: string;
  description?: string;
  price?: number;
  type?:
    | 'file'
    | 'url'
    | 'content'
    | 'content_package'
    | 'document'
    | 'video'
    | 'image'
    | 'paywall';
  contentId?: string;
  url?: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
}

export interface PaywallResponse {
  success: boolean;
  data: Paywall | Paywall[];
  count?: number;
  message?: string;
}

class PaywallService {
  async createPaywall(data: CreatePaywallData): Promise<Paywall> {
    try {
      // Clear cache when creating a new paywall
      paywallsCache = null;
      paywallsCacheTimestamp = null;

      const response = await apiService.post<PaywallResponse>('/paywalls', data);

      if (!response.data || !response.data.data) {
        throw new Error('No data returned from server');
      }

      return response.data.data as Paywall;
    } catch (error: unknown) {
      console.error('Error creating paywall:', error);

      if (isAxiosError(error) && error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
      } else if (isAxiosError(error) && error.response?.status === 400) {
        const errorMessage =
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message?: string }).message || 'Invalid data provided'
            : 'Invalid data provided';
        throw new Error(`Validation error: ${errorMessage}`);
      } else if (isAxiosError(error) && error.response?.status === 401) {
        // Token might be invalid/expired, remove it from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Authentication required. Please log in.');
      } else if (isAxiosError(error) && error.response?.status === 403) {
        throw new Error('Forbidden. You do not have permission to create paywalls.');
      } else if (isAxiosError(error) && error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      let errorMessage = 'Failed to create paywall';
      
      if (isAxiosError(error) && error.response?.data) {
        // Try to get detailed validation error information
        const errorData = error.response.data;
        
        if (typeof errorData === 'object') {
          // Check if it has validation error details (422 errors often return 'detail')
          if ('detail' in errorData && Array.isArray(errorData.detail)) {
            // FastAPI validation errors typically return as 'detail' array
            const validationErrors = errorData.detail as Array<{loc: string[], msg: string, type: string}>;
            const errorMessages = validationErrors.map(err => {
              const field = err.loc[err.loc.length - 1]; // Get the field name (last element)
              return `${field}: ${err.msg}`;
            });
            errorMessage = `Validation errors: ${errorMessages.join(', ')}`;
          } else if ('message' in errorData) {
            errorMessage = (errorData as { message?: string }).message || errorMessage;
          } else {
            // For other cases, just show the raw error data
            errorMessage = JSON.stringify(errorData);
          }
        } else {
          errorMessage = String(errorData);
        }
      }
      
      console.error('Detailed error response:', error.response?.data);
      throw new Error(errorMessage);
    }
  }

  async getPaywalls(forceRefresh = false): Promise<Paywall[]> {
    // Check if we have valid cached data
    const now = Date.now();
    if (
      !forceRefresh &&
      paywallsCache &&
      paywallsCacheTimestamp &&
      now - paywallsCacheTimestamp < CACHE_DURATION
    ) {
      return paywallsCache;
    }

    return await exponentialBackoff(async () => {
      try {
        const response = await apiService.get<PaywallResponse>('/paywalls');

        if (!response.data || !response.data.data) {
          throw new Error('No data returned from server');
        }

        const paywalls = Array.isArray(response.data.data) ? response.data.data as Paywall[] : [response.data.data as Paywall];

        // Update cache
        paywallsCache = paywalls;
        paywallsCacheTimestamp = now;

        return paywalls;
      } catch (error: unknown) {
        console.error('Error fetching paywalls:', error);

        if (isAxiosError(error) && error.response?.status === 401) {
          // Token might be invalid/expired, remove it from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Authentication required. Please log in.');
        } else if (isAxiosError(error) && error.response?.status === 403) {
          throw new Error('Forbidden. You do not have permission to view paywalls.');
        } else if (isAxiosError(error) && error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
        } else if (isAxiosError(error) && error.response?.status === 500) {
          throw new Error('Server error. Please try again later.');
        }

        const errorMessage =
          isAxiosError(error) &&
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message?: string }).message || 'Failed to fetch paywalls'
            : 'Failed to fetch paywalls';
        throw new Error(errorMessage);
      }
    });
  }

  async getPaywall(id: string): Promise<Paywall> {
    return await exponentialBackoff(async () => {
      try {
        const response = await apiService.get<PaywallResponse>(`/paywalls/${id}`);

        if (!response.data || !response.data.data) {
          throw new Error(`Paywall with ID ${id} not found`);
        }

        return response.data.data as Paywall;
      } catch (error: unknown) {
        console.error(`Error fetching paywall ${id}:`, error);

        if (isAxiosError(error) && error.response?.status === 401) {
          // Token might be invalid/expired, remove it from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Authentication required. Please log in.');
        } else if (isAxiosError(error) && error.response?.status === 403) {
          throw new Error('Forbidden. You do not have permission to access this paywall.');
        } else if (isAxiosError(error) && error.response?.status === 404) {
          throw new Error(`Paywall with ID ${id} not found.`);
        } else if (isAxiosError(error) && error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
        } else if (isAxiosError(error) && error.response?.status === 500) {
          throw new Error('Server error. Please try again later.');
        }

        const errorMessage =
          isAxiosError(error) &&
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message?: string }).message || 'Failed to fetch paywall'
            : 'Failed to fetch paywall';
        throw new Error(errorMessage);
      }
    });
  }

  async updatePaywall(id: string, data: UpdatePaywallData): Promise<Paywall> {
    // Clear cache when updating a paywall
    paywallsCache = null;
    paywallsCacheTimestamp = null;

    try {
      const response = await apiService.put<PaywallResponse>(`/paywalls/${id}`, data);

      if (!response.data || !response.data.data) {
        throw new Error('No data returned from server');
      }

      return response.data.data as Paywall;
    } catch (error: unknown) {
      console.error(`Error updating paywall ${id}:`, error);

      if (isAxiosError(error) && error.response?.status === 400) {
        const errorMessage =
          isAxiosError(error) &&
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message?: string }).message || 'Invalid data provided'
            : 'Invalid data provided';
        throw new Error(`Validation error: ${errorMessage}`);
      } else if (isAxiosError(error) && error.response?.status === 401) {
        // Token might be invalid/expired, remove it from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Authentication required. Please log in.');
      } else if (isAxiosError(error) && error.response?.status === 403) {
        throw new Error('Forbidden. You do not have permission to update this paywall.');
      } else if (isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Paywall with ID ${id} not found.`);
      } else if (isAxiosError(error) && error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
      } else if (isAxiosError(error) && error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      const errorMessage =
        isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? (error.response.data as { message?: string }).message || 'Failed to update paywall'
          : 'Failed to update paywall';
      throw new Error(errorMessage);
    }
  }

  async deletePaywall(id: string): Promise<void> {
    // Clear cache when deleting a paywall
    paywallsCache = null;
    paywallsCacheTimestamp = null;

    try {
      await apiService.delete(`/paywalls/${id}`);
    } catch (error: unknown) {
      console.error(`Error deleting paywall ${id}:`, error);

      if (isAxiosError(error) && error.response?.status === 401) {
        // Token might be invalid/expired, remove it from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Authentication required. Please log in.');
      } else if (isAxiosError(error) && error.response?.status === 403) {
        throw new Error('Forbidden. You do not have permission to delete this paywall.');
      } else if (isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Paywall with ID ${id} not found.`);
      } else if (isAxiosError(error) && error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
      } else if (isAxiosError(error) && error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      const errorMessage =
        isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? (error.response.data as { message?: string }).message || 'Failed to delete paywall'
          : 'Failed to delete paywall';
      throw new Error(errorMessage);
    }
  }

  async getCustomerPaywall(id: string, includeDraft: boolean = false): Promise<Paywall> {
    console.log('Fetching customer paywall with ID:', id, 'includeDraft:', includeDraft);
    return await exponentialBackoff(async () => {
      try {
        // Use different endpoint based on whether we want to include draft paywalls
        const endpoint = includeDraft
          ? `/paywalls/customer/${id}?preview=true` // This would require backend support
          : `/paywalls/customer/${id}`;

        const response = await apiService.get<PaywallResponse>(endpoint);
        console.log('Customer paywall response:', response);
        return response.data.data as Paywall;
      } catch (error: unknown) {
        console.error('Error fetching customer paywall:', error);
        if (isAxiosError(error) && error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
        } else if (isAxiosError(error) && error.response?.status === 404) {
          throw new Error('Paywall not found.');
        } else if (isAxiosError(error) && error.response?.status === 403) {
          throw new Error('Access to this paywall is restricted.');
        } else if (isAxiosError(error) && error.response?.status === 401) {
          // Token might be invalid/expired, remove it from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Authentication required. Please log in.');
        } else if (isAxiosError(error) && error.response?.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(
          isAxiosError(error) &&
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message?: string }).message || 'Failed to fetch paywall'
            : 'Failed to fetch paywall'
        );
      }
    });
  }

  // Method to clear cache manually
  clearCache(): void {
    paywallsCache = null;
    paywallsCacheTimestamp = null;
  }
}

const paywallService = new PaywallService();
export default paywallService;
