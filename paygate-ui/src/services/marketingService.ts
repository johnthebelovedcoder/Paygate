// marketingService.ts - Marketing management service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliateCode: string;
  commissionRate: number;
  totalEarnings: number;
  totalReferrals: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

export interface MarketingResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class MarketingService {
  // Get all discount codes for the current user
  async getDiscountCodes(): Promise<DiscountCode[]> {
    try {
      const response = await apiService.get<MarketingResponse<DiscountCode[]>>('/promo-codes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching discount codes:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch discount codes' };
    }
  }

  // Create a new discount code
  async createDiscountCode(
    discount: Omit<DiscountCode, 'id' | 'usedCount' | 'isActive'>
  ): Promise<DiscountCode> {
    try {
      const response = await apiService.post<MarketingResponse<DiscountCode>>('/promo-codes', {
        ...discount,
        startDate: new Date().toISOString(),
        isActive: true,
      });
      return response.data as DiscountCode;
    } catch (error: unknown) {
      console.error('Error creating discount code:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create discount code' };
    }
  }

  // Update discount code status
  async updateDiscountStatus(id: string, isActive: boolean): Promise<DiscountCode> {
    try {
      const response = await apiService.put<MarketingResponse<DiscountCode>>(`/promo-codes/${id}`, {
        isActive,
      });
      return response.data as DiscountCode;
    } catch (error: unknown) {
      console.error('Error updating discount status:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update discount status' };
    }
  }

  // Delete a discount code
  async deleteDiscountCode(id: string): Promise<void> {
    try {
      await apiService.delete(`/promo-codes/${id}`);
    } catch (error: unknown) {
      console.error('Error deleting discount code:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to delete discount code' };
    }
  }

  // Get all affiliates for the current user
  async getAffiliates(): Promise<Affiliate[]> {
    try {
      const response =
        await apiService.get<MarketingResponse<{ affiliates: Affiliate[] }>>(
          '/marketing/affiliates'
        );
      return response.data?.affiliates || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching affiliates:', err);
      // Return empty array as fallback
      return [];
    }
  }

  // Create a new affiliate
  async createAffiliate(
    affiliate: Omit<
      Affiliate,
      'id' | 'affiliateCode' | 'totalEarnings' | 'totalReferrals' | 'joinedDate' | 'status'
    >
  ): Promise<Affiliate> {
    try {
      const response = await apiService.post<MarketingResponse<Affiliate>>(
        '/marketing/affiliates',
        {
          ...affiliate,
          status: 'active',
        }
      );
      return response.data as Affiliate;
    } catch (error: unknown) {
      console.error('Error creating affiliate:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create affiliate' };
    }
  }

  // Update affiliate status
  async updateAffiliateStatus(id: string, status: 'active' | 'inactive'): Promise<Affiliate> {
    try {
      const response = await apiService.put<MarketingResponse<Affiliate>>(
        `/marketing/affiliates/${id}`,
        { status }
      );
      return response.data as Affiliate;
    } catch (error: unknown) {
      console.error('Error updating affiliate status:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update affiliate status' };
    }
  }

  // Delete an affiliate
  async deleteAffiliate(id: string): Promise<void> {
    try {
      await apiService.delete(`/marketing/affiliates/${id}`);
    } catch (error: unknown) {
      console.error('Error deleting affiliate:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to delete affiliate' };
    }
  }

  // Get affiliate data for the current user
  async getMyAffiliate(): Promise<Affiliate | null> {
    try {
      const response = await apiService.get<MarketingResponse<Affiliate>>('/marketing/my-affiliate');
      return response.data || null;
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching my affiliate data:', err);
      // Return null as fallback
      return null;
    }
  }

  // Create affiliate data for the current user
  async createMyAffiliate(
    affiliate: Omit<
      Affiliate,
      'id' | 'affiliateCode' | 'totalEarnings' | 'totalReferrals' | 'joinedDate' | 'status'
    >
  ): Promise<Affiliate> {
    try {
      const response = await apiService.post<MarketingResponse<Affiliate>>(
        '/marketing/my-affiliate',
        {
          ...affiliate,
          status: 'active',
        }
      );
      return response.data as Affiliate;
    } catch (error: unknown) {
      console.error('Error creating my affiliate:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create affiliate' };
    }
  }

  // Validate a discount code
  async validateDiscountCode(code: string): Promise<DiscountCode | null> {
    try {
      const response = await apiService.get<MarketingResponse<DiscountCode>>(
        `/promo-codes/validate/${code}`
      );
      return response.data || null;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null; // Code not found or invalid
      }
      console.error('Error validating discount code:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to validate discount code' };
    }
  }
}

const marketingService = new MarketingService();
export default marketingService;
