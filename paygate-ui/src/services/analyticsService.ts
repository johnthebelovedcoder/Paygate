// analyticsService.ts - Analytics and reporting service
import { useRef, useEffect } from 'react';
import type { AxiosInstance } from 'axios';
import type { RevenueData, DailyRevenueData } from '../types/global';
import type { AnalyticsResponse } from './analyticsDataService';
import { useAuthApi } from '../hooks/useAuthApi';
import type {
  GeographicData,
  TrafficSource,
  DashboardStats,
  RevenueBreakdown,
  ConversionFunnel,
  TopPaywall,
  CustomerLifetimeValue,
  RevenueForecastData,
  RevenueForecast,
  CustomerGrowthData,
  CustomerData,
} from '../types/analytics.types';

// Define the API client interface
export interface IApiClient {
  get: <T>(url: string, config?: any) => Promise<T>;
  post: <T>(url: string, data?: any, config?: any) => Promise<T>;
  put: <T>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T>(url: string, config?: any) => Promise<T>;
}

class AnalyticsService {
  private api: IApiClient;

  constructor(apiClient: IApiClient) {
    this.api = apiClient;
  }
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get<AnalyticsResponse<DashboardStats>>('/analytics/dashboard');
      return (
        response.data || {
          totalRevenue: 0,
          totalSales: 0,
          totalVisitors: 0,
          conversionRate: 0,
          avgOrderValue: 0,
          activePaywalls: 0,
          recentPayments: 0,
          totalCustomers: 0,
        }
      );
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching dashboard stats:', err);
      // Return default stats as fallback
      return {
        totalRevenue: 0,
        totalSales: 0,
        totalVisitors: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        activePaywalls: 0,
        recentPayments: 0,
        totalCustomers: 0,
      };
    }
  }

  // Get revenue data with time range filtering
  async getRevenueData(
    timeRange?: 'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom',
    customStartDate?: string,
    customEndDate?: string
  ): Promise<RevenueData[] | DailyRevenueData[]> {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('time_range', timeRange);
      if (customStartDate) params.append('startDate', customStartDate);
      if (customEndDate) params.append('endDate', customEndDate);

      const queryString = params.toString();
      const url = `/analytics/revenue${queryString ? `?${queryString}` : ''}`;

      const response =
        await this.api.get<AnalyticsResponse<RevenueData[] | DailyRevenueData[]>>(url);
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching revenue data:', err);
      // Return empty array as fallback
      return [];
    }
  }

  // Get top paywalls
  async getTopPaywalls(limit: number = 5): Promise<TopPaywall[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      const queryString = params.toString();
      const url = `/analytics/top-paywalls${queryString ? `?${queryString}` : ''}`;
      
      const response =
        await this.api.get<AnalyticsResponse<TopPaywall[]>>(url);
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching top paywalls:', err);
      // Return empty array as fallback
      return [];
    }
  }

  // Get traffic sources
  async getTrafficSources(): Promise<TrafficSource[]> {
    try {
      const response = await this.api.get<AnalyticsResponse<TrafficSource[]>>('/analytics/traffic-sources');
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching traffic sources:', err);
      // Return empty array as fallback
      return [];
    }
  }

  // Get customer data
  async getCustomerData(): Promise<CustomerData> {
    try {
      const response =
        await this.api.get<AnalyticsResponse<CustomerData>>('/analytics/customers');
      return (
        response.data || {
          totalCustomers: 0,
          customerGrowth: [],
        }
      );
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching customer data:', err);
      // Return default customer data as fallback
      return {
        totalCustomers: 0,
        customerGrowth: [],
      };
    }
  }
  async getTrafficData(): Promise<{ name: string; value: number }[]> {
    try {
      const response = await this.api.get<AnalyticsResponse<{ name: string; value: number }[]>>('/analytics/traffic-data');
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching traffic data:', err);
      // Return empty array as fallback
      return [];
    }
  }

  async getPerformanceData(): Promise<
    { subject: string; A: number; B: number; fullMark: number }[]
  > {
    try {
      const response = await this.api.get<AnalyticsResponse<{ subject: string; A: number; B: number; fullMark: number }[]>>('/analytics/performance-data');
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching performance data:', err);
      // Return empty array as fallback
      return [];
    }
  }
  async getGeographicData(): Promise<GeographicData[]> {
    try {
      const response = await this.api.get<AnalyticsResponse<GeographicData[]>>('/analytics/geographic-data');
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching geographic data:', err);
      // Return empty array as fallback
      return [];
    }
  }
  async getRevenueBreakdown(): Promise<RevenueBreakdown> {
    try {
      const response = await this.api.get<AnalyticsResponse<RevenueBreakdown>>('/analytics/revenue-breakdown');
      return response.data || {
        revenueByTime: [],
        revenueByProduct: [],
        revenueBySegment: [],
      };
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching revenue breakdown:', err);
      // Return default breakdown as fallback
      return {
        revenueByTime: [],
        revenueByProduct: [],
        revenueBySegment: [],
      };
    }
  }

  async getConversionFunnel(): Promise<ConversionFunnel> {
    try {
      const response = await this.api.get<AnalyticsResponse<ConversionFunnel>>('/analytics/conversion-funnel');
      return response.data || {
        totalViews: 0,
        totalPurchases: 0,
        conversionRate: 0,
        dropOffPoints: [],
      };
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching conversion funnel:', err);
      // Return default funnel as fallback
      return {
        totalViews: 0,
        totalPurchases: 0,
        conversionRate: 0,
        dropOffPoints: [],
      };
    }
  }

  async getCustomerLifetimeValues(): Promise<CustomerLifetimeValue[]> {
    try {
      const response = await this.api.get<AnalyticsResponse<CustomerLifetimeValue[]>>('/analytics/customer-lifetime-values');
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching customer lifetime values:', err);
      // Return empty array as fallback
      return [];
    }
  }

  async getRevenueForecast(): Promise<RevenueForecast> {
    try {
      const response = 
        await this.api.get<AnalyticsResponse<RevenueForecast>>('/analytics/revenue-forecast');
      return response.data || {
        forecast: [],
        trend: 'stable',
        confidence: 0,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching revenue forecast:', err);
      // Return default forecast as fallback
      return {
        forecast: [],
        trend: 'stable',
        confidence: 0,
      };
    }
  }

  // Get content analytics data
  async getContentAnalytics(): Promise<any> {
    try {
      const response = 
        await this.api.get<AnalyticsResponse<any>>('/analytics/creator/content-analytics');
      return response.data || {};
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching content analytics:', err);
      // Return default analytics as fallback
      return {};
    }
  }

  // Get popular content
  async getPopularContent(): Promise<any[]> {
    try {
      const response = 
        await this.api.get<AnalyticsResponse<any[]>>('/analytics/creator/content-popular');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching popular content:', err);
      // Return empty array as fallback
      return [];
    }
  }

  // Get content protection settings
  async getContentProtectionSettings(): Promise<any> {
    try {
      const response = 
        await this.api.get<AnalyticsResponse<any>>('/analytics/creator/content-protection');
      return response.data || {};
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching content protection settings:', err);
      // Return default settings as fallback
      return {
        drm: {
          enableDrm: false,
          drmProvider: "widevine",
          licenseServer: "",
          encryptionKey: ""
        },
        watermark: {
          enableWatermark: false,
          watermarkType: "text",
          watermarkText: "Confidential",
          position: "bottom-right",
          opacity: 50
        },
        accessControls: {
          ipRestrictions: false,
          allowedIps: [],
          geographicBlocking: false,
          blockedCountries: [],
          deviceLimit: false,
          maxDevices: 3,
          sessionTimeout: false,
          timeoutMinutes: 60
        }
      };
    }
  }

  // Update content protection settings
  async updateContentProtectionSettings(settings: any): Promise<any> {
    try {
      const response = 
        await this.api.put<AnalyticsResponse<any>>('/analytics/creator/content-protection', settings);
      return response.data || {};
    } catch (error) {
      const err = error as Error;
      console.error('Error updating content protection settings:', err);
      // Return default settings as fallback
      return {};
    }
  }
}

// Create a default instance for backward compatibility
import { apiService } from './api';

// Create a default instance with the basic API client (for non-hook usage)
const defaultAnalyticsService = new AnalyticsService({
  get: apiService.get,
  post: apiService.post,
  put: apiService.put,
  delete: apiService.delete,
});

// Create a function to get an instance with the authenticated API client
export const createAnalyticsService = (authApi: any) => {
  return new AnalyticsService({
    get: authApi.get,
    post: authApi.post,
    put: authApi.put,
    delete: authApi.delete,
  });
};

// Create a hook to get an instance with the authenticated API client
export const useAnalyticsService = () => {
  const authApi = useAuthApi();
  const analyticsService = useRef<AnalyticsService | null>(null);
  
  // Create or update the service instance when authApi changes
  useEffect(() => {
    analyticsService.current = createAnalyticsService(authApi);
  }, [authApi]);
  
  return analyticsService.current;
};

export { AnalyticsService };
export default defaultAnalyticsService;
