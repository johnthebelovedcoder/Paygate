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
    // TODO: Implement this in the backend
    return [
      {
        id: '1',
        name: 'Direct',
        visits: 1000,
        conversions: 100,
        revenue: 5000,
        conversionRate: 10,
      },
      {
        id: '2',
        name: 'Social Media',
        visits: 800,
        conversions: 80,
        revenue: 4000,
        conversionRate: 10,
      },
      { id: '3', name: 'Email', visits: 600, conversions: 120, revenue: 6000, conversionRate: 20 },
      {
        id: '4',
        name: 'Referral',
        visits: 400,
        conversions: 40,
        revenue: 2000,
        conversionRate: 10,
      },
    ];
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
    // TODO: Implement this in the backend
    return [
      { name: 'Direct', value: 42 },
      { name: 'Social Media', value: 28 },
      { name: 'Email', value: 18 },
      { name: 'Referral', value: 12 },
    ];
  }

  async getPerformanceData(): Promise<
    { subject: string; A: number; B: number; fullMark: number }[]
  > {
    // TODO: Implement this in the backend
    return [
      { subject: 'Revenue', A: 120, B: 110, fullMark: 150 },
      { subject: 'Sales', A: 98, B: 130, fullMark: 150 },
      { subject: 'Conversion', A: 86, B: 130, fullMark: 150 },
      { subject: 'Retention', A: 99, B: 100, fullMark: 150 },
      { subject: 'Satisfaction', A: 85, B: 90, fullMark: 150 },
      { subject: 'Growth', A: 65, B: 85, fullMark: 150 },
    ];
  }
  async getGeographicData(): Promise<GeographicData[]> {
    // TODO: Implement this in the backend
    return [
      {
        country: 'United States',
        countryCode: 'US',
        sales: 1000,
        revenue: 35000,
        currency: 'USD',
        percentage: 35,
      },
      {
        country: 'United Kingdom',
        countryCode: 'GB',
        sales: 500,
        revenue: 15000,
        currency: 'GBP',
        percentage: 15,
      },
      {
        country: 'Canada',
        countryCode: 'CA',
        sales: 400,
        revenue: 12000,
        currency: 'CAD',
        percentage: 12,
      },
      {
        country: 'Germany',
        countryCode: 'DE',
        sales: 300,
        revenue: 10000,
        currency: 'EUR',
        percentage: 10,
      },
      {
        country: 'Australia',
        countryCode: 'AU',
        sales: 200,
        revenue: 8000,
        currency: 'AUD',
        percentage: 8,
      },
      {
        country: 'Other',
        countryCode: 'XX',
        sales: 600,
        revenue: 20000,
        currency: 'USD',
        percentage: 20,
      },
    ];
  }
  async getRevenueBreakdown(): Promise<RevenueBreakdown> {
    // TODO: Implement this in the backend
    return {
      revenueByTime: [],
      revenueByProduct: [],
      revenueBySegment: [],
    };
  }

  async getConversionFunnel(): Promise<ConversionFunnel> {
    // TODO: Implement this in the backend
    return {
      totalViews: 15420,
      totalPurchases: 921,
      conversionRate: 6,
      dropOffPoints: [
        { step: 'Visitors', count: 15420, dropOff: 5190 },
        { step: 'Page Views', count: 10230, dropOff: 8388 },
        { step: 'Added to Cart', count: 1842, dropOff: 921 },
        { step: 'Purchased', count: 921, dropOff: 0 },
      ],
    };
  }

  async getCustomerLifetimeValues(): Promise<CustomerLifetimeValue[]> {
    // TODO: Implement this in the backend
    return [];
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
