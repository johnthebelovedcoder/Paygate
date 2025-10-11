// analyticsService.ts - Analytics and reporting service
import { apiService } from './api';
import type { RevenueData, DailyRevenueData } from '../types/global';
import type { AnalyticsResponse } from './analyticsDataService';
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

class AnalyticsService {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response =
        await apiService.get<AnalyticsResponse<DashboardStats>>('/analytics/dashboard');
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
      if (timeRange) params.append('range', timeRange);
      if (customStartDate) params.append('startDate', customStartDate);
      if (customEndDate) params.append('endDate', customEndDate);

      const queryString = params.toString();
      const url = `/analytics/revenue${queryString ? `?${queryString}` : ''}`;

      const response =
        await apiService.get<AnalyticsResponse<RevenueData[] | DailyRevenueData[]>>(url);
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching revenue data:', err);
      // Return empty array as fallback
      return [];
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
        await apiService.get<AnalyticsResponse<CustomerData>>('/analytics/customers');
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
    // TODO: Implement this in the backend
    return {
      forecast: [],
      trend: 'positive',
      confidence: 0.85,
    };
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
