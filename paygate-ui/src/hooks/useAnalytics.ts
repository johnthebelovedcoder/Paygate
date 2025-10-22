import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';
import type { RevenueData, DailyRevenueData } from '@/types/global';
import type { AxiosError } from 'axios';
import type {
  GeographicData,
  TrafficSource,
  DashboardStats,
  TopPaywall,
  CustomerData,
  RevenueForecastData,
  RevenueBreakdown,
  ConversionFunnel,
  CustomerLifetimeValue,
  RevenueForecast,
} from '../types/analytics.types';

interface UseAnalyticsReturn {
  stats: DashboardStats | null;
  revenueData: RevenueData[] | DailyRevenueData[];
  topPaywalls: TopPaywall[];
  customerData: CustomerData | null;
  trafficData: { name: string; value: number }[];
  performanceData: { subject: string; A: number; B: number; fullMark: number }[];
  geographicData: GeographicData[];
  revenueBreakdown: RevenueBreakdown | null;
  conversionFunnel: ConversionFunnel | null;
  trafficSources: TrafficSource[] | null;
  customerLifetimeValues: CustomerLifetimeValue[] | null;
  revenueForecast: RevenueForecast | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

const useAnalytics = (
  timeRange?: 'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom',
  customStartDate?: string,
  customEndDate?: string
): UseAnalyticsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[] | DailyRevenueData[]>([]);
  const [topPaywalls, setTopPaywalls] = useState<TopPaywall[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [trafficData, setTrafficData] = useState<{ name: string; value: number }[]>([]);
  const [performanceData, setPerformanceData] = useState<
    { subject: string; A: number; B: number; fullMark: number }[]
  >([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [customerLifetimeValues, setCustomerLifetimeValues] = useState<
    CustomerLifetimeValue[] | null
  >(null);
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [
        statsData,
        revenueDataRaw,
        topPaywallsDataRaw,
        customerData,
        trafficData,
        performanceData,
        geographicData,
        revenueBreakdown,
        conversionFunnel,
        trafficSources,
        customerLifetimeValues,
        revenueForecast,
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getRevenueData(timeRange, customStartDate, customEndDate),
        analyticsService.getTopPaywalls(),
        analyticsService.getCustomerData(),
        analyticsService.getTrafficData(),
        analyticsService.getPerformanceData(),
        analyticsService.getGeographicData(),
        analyticsService.getRevenueBreakdown(),
        analyticsService.getConversionFunnel(),
        analyticsService.getTrafficSources(),
        analyticsService.getCustomerLifetimeValues(),
        analyticsService.getRevenueForecast(),
      ]);

      // Ensure arrays are not undefined
      const revenueData = revenueDataRaw || [];
      const topPaywallsData = topPaywallsDataRaw || [];

      setStats(statsData);
      setRevenueData(revenueData);
      setTopPaywalls(topPaywallsData);
      setCustomerData(customerData);
      setTrafficData(trafficData || []);
      setPerformanceData(performanceData || []);
      setGeographicData(geographicData || []);
      setRevenueBreakdown(revenueBreakdown);
      setConversionFunnel(conversionFunnel);
      setTrafficSources(trafficSources);
      setCustomerLifetimeValues(customerLifetimeValues);
      setRevenueForecast(revenueForecast);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching analytics:', error);
      if ((error as AxiosError).response?.status === 429) {
        setError('Rate limit exceeded. Please wait a few minutes before trying again.');
      } else {
        setError(error.message || 'Failed to fetch analytics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    revenueData,
    topPaywalls,
    customerData,
    trafficData,
    performanceData,
    geographicData,
    revenueBreakdown,
    conversionFunnel,
    trafficSources,
    customerLifetimeValues,
    revenueForecast,
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
};

export default useAnalytics;
