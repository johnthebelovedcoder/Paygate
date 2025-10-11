// analyticsDataService.ts - Analytics data service
import { apiService } from './api';

export interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface TopPaywall {
  id: string;
  title: string;
  sales: number;
  revenue: number;
}

export interface TrafficSource {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class AnalyticsDataService {
  // Get analytics data for the current user
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const response = await apiService.get<AnalyticsResponse<AnalyticsData>>('/analytics/data');
      // The /analytics/data endpoint returns multiple fields, so we return the whole object
      // with default fallback values
      return {
        totalRevenue: response.data?.totalRevenue || 0,
        totalSales: response.data?.totalSales || 0,
        conversionRate: response.data?.conversionRate || 0,
        avgOrderValue: response.data?.avgOrderValue || 0,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching analytics data:', err);
      // Return default data as fallback
      return {
        totalRevenue: 0,
        totalSales: 0,
        conversionRate: 0,
        avgOrderValue: 0,
      };
    }
  }

  // Get top paywalls
  async getTopPaywalls(): Promise<TopPaywall[]> {
    try {
      const response =
        await apiService.get<AnalyticsResponse<TopPaywall[]>>('/analytics/top-paywalls');
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
      const response = await apiService.get<AnalyticsResponse<TrafficSource[]>>(
        '/analytics/traffic-sources'
      );
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching traffic sources:', err);
      // Return empty array as fallback
      return [];
    }
  }
}

const analyticsDataService = new AnalyticsDataService();
export default analyticsDataService;
