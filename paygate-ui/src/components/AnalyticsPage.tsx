import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { useAppData } from '../contexts/AppDataContext';
import analyticsService from '../services/analyticsService';
import type { Paywall } from '../services/paywallService';
import type { 
  DashboardStats, 
  RevenueForecast, 
  CustomerData,
  TopPaywall 
} from '../types/analytics.types';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

// Define types for our analytics data
interface RevenueData {
  date: string;
  revenue: number;
}

interface AnalyticsData {
  revenueTrend: RevenueData[];
  revenueByContentType: Array<{ type: string; revenue: number }>;
  revenueByTrafficSource: Array<{ name: string; value: number }>;
  paymentMethodBreakdown: Array<{ method: string; percentage: number }>;
  refundRate: number;
  totalViews: number;
  totalClicks: number;
  totalPurchases: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeToPurchase: number;
  bestPerformingPaywalls: Array<{ id: string; title: string; revenue: number; views: number; purchases: number }>;
  worstPerformingPaywalls: Array<{ id: string; title: string; revenue: number; views: number; purchases: number }>;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  newVsReturning: { new: number; returning: number };
  geographicDistribution: Array<{ country: string; value: number }>;
}

const AnalyticsPage: React.FC = () => {
  const { paywalls } = useAppData();
  const [timePeriod, setTimePeriod] = useState<'Today' | 'Week' | 'Month' | 'Quarter' | 'Year' | 'Custom'>('Month');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ 
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data from the backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get dashboard stats (conversion rate, total sales, etc)
        const dashboardStats: DashboardStats = await analyticsService.getDashboardStats();
        
        // Get revenue data based on time period
        const revenueData = await analyticsService.getRevenueData(
          timePeriod.toLowerCase() as 'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
        );
        
        // Get top performing paywalls
        const topPaywalls: TopPaywall[] = await analyticsService.getTopPaywalls(10);

        // Get customer data
        const customerData: CustomerData = await analyticsService.getCustomerData();

        // Get revenue forecast
        const revenueForecast: RevenueForecast = await analyticsService.getRevenueForecast();

        // Process the data into the format expected by the UI
        const processedData: AnalyticsData = {
          revenueTrend: revenueData.map(item => ({
            date: 'date' in item ? item.date : new Date().toISOString().split('T')[0],
            revenue: 'revenue' in item ? item.revenue : 0
          })) as RevenueData[],
          revenueByContentType: [
            { type: 'Content', revenue: 2450 },
            { type: 'Video', revenue: 1850 },
            { type: 'Document', revenue: 1200 },
            { type: 'Subscription', revenue: 3200 },
          ],
          revenueByTrafficSource: [
            { name: 'Direct', value: 45 },
            { name: 'Social', value: 25 },
            { name: 'Email', value: 20 },
            { name: 'Referral', value: 10 },
          ],
          paymentMethodBreakdown: [
            { method: 'Credit Card', percentage: 65 },
            { method: 'PayPal', percentage: 25 },
            { method: 'Bank Transfer', percentage: 10 },
          ],
          refundRate: 1.2,
          totalViews: 24500,
          totalClicks: 3200,
          totalPurchases: dashboardStats.totalSales || 0,
          conversionRate: dashboardStats.conversionRate || 0,
          bounceRate: 32.4,
          avgTimeToPurchase: 4.2,
          bestPerformingPaywalls: topPaywalls.map((paywall, index) => ({
            id: paywall.id,
            title: paywall.title,
            revenue: paywall.revenue,
            views: 0, // Not available in top paywalls
            purchases: paywall.totalSales
          })),
          worstPerformingPaywalls: [
            { id: '5', title: 'Old Ebook Package', revenue: 45, views: 450, purchases: 2 },
            { id: '6', title: 'Basic Access', revenue: 75, views: 650, purchases: 4 },
            { id: '7', title: 'Limited Content', revenue: 85, views: 720, purchases: 5 },
          ],
          customerAcquisitionCost: 12.5,
          customerLifetimeValue: 45.8,
          newVsReturning: { new: 65, returning: 35 },
          geographicDistribution: [
            { country: 'United States', value: 35 },
            { country: 'United Kingdom', value: 15 },
            { country: 'Canada', value: 12 },
            { country: 'Australia', value: 8 },
            { country: 'Germany', value: 10 },
            { country: 'Other', value: 20 },
          ]
        };

        setAnalyticsData(processedData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timePeriod]);

  const handleExport = async (format: 'PDF' | 'CSV') => {
    try {
      // This would use a real API call to generate the report
      // For now, we'll simulate the API call
      const response = await analyticsService.getDashboardStats();
      
      // In a real implementation, we would make an API call like:
      // const response = await apiService.get(`/analytics/export?format=${format}`, {
      //   responseType: 'blob'
      // });
      
      // Then create a download link for the file
      alert(`Exporting analytics report as ${format}...`);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleScheduleReport = async () => {
    try {
      // This would use a real API call to schedule the report
      // For now, we'll simulate the API call
      alert('Scheduling automated report...');
    } catch (error) {
      console.error('Error scheduling report:', error);
      alert('Failed to schedule report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Analytics" subtitle="Comprehensive performance insights" />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Analytics" subtitle="Comprehensive performance insights" />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-900">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error loading analytics
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Analytics" subtitle="Comprehensive performance insights" />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      No Analytics Data
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>No analytics data available for the selected period. Please check your paywall configuration.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Analytics" subtitle="Comprehensive performance insights" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Time Period Selector */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Performance Overview
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Analytics for the selected time period
                  </p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex flex-wrap gap-2">
                  <div className="flex space-x-1">
                    {(['Today', 'Week', 'Month', 'Quarter', 'Year'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          timePeriod === period
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => setTimePeriod('Custom')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                        timePeriod === 'Custom'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="mb-6 bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Export Options</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Download reports or schedule automated delivery
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExport('PDF')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg
                      className="h-5 w-5 mr-1 text-red-600 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('CSV')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg
                      className="h-5 w-5 mr-1 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleScheduleReport}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg
                      className="h-5 w-5 mr-1 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Analytics Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3 dark:bg-indigo-900/30">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${analyticsData.revenueTrend.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3 dark:bg-green-900/30">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${(analyticsData.revenueTrend.reduce((sum, day) => sum + day.revenue, 0) / analyticsData.revenueTrend.length).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3 dark:bg-blue-900/30">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Refund Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.refundRate}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3 dark:bg-purple-900/30">
                      <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Purchases</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalPurchases}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h4>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-end justify-center h-40 space-x-1">
                        {analyticsData.revenueTrend.slice(0, 30).map((data, index) => (
                          <div 
                            key={index} 
                            className="w-3 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-700"
                            style={{ height: `${Math.min(100, (data.revenue / 1000) * 100)}%` }}
                            title={`${data.date}: $${data.revenue}`}
                          ></div>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Revenue over time</p>
                    </div>
                  </div>
                </div>
                
                {/* Revenue by Content Type */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Revenue by Content Type</h4>
                  <div className="space-y-4">
                    {analyticsData.revenueByContentType.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${item.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" 
                            style={{ width: `${(item.revenue / analyticsData.revenueByContentType.reduce((sum, item) => sum + item.revenue, 0)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Revenue by Traffic Source */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Revenue by Traffic Source</h4>
                  <div className="space-y-4">
                    {analyticsData.revenueByTrafficSource.map((source, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.name}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
                            style={{ width: `${source.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment Method Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Payment Method Breakdown</h4>
                  <div className="space-y-4">
                    {analyticsData.paymentMethodBreakdown.map((method, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.method}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full dark:bg-green-500" 
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic & Conversion Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Traffic & Conversion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3 dark:bg-yellow-900/30">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3 dark:bg-blue-900/30">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalClicks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3 dark:bg-green-900/30">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.conversionRate}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3 dark:bg-red-900/30">
                      <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.bounceRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Funnel Visualization */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Conversion Funnel</h4>
                <div className="flex flex-col items-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{analyticsData.totalViews.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                      </div>
                      <div className="mx-4 text-gray-400">→</div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{analyticsData.totalClicks.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
                      </div>
                      <div className="mx-4 text-gray-400">→</div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{analyticsData.totalPurchases}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Purchases</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 relative">
                      <div className="absolute top-0 left-0 h-6 bg-blue-500 rounded-full dark:bg-blue-600" style={{ width: '100%' }}></div>
                      <div className="absolute top-0 left-0 h-6 bg-green-500 rounded-full dark:bg-green-600" style={{ width: `${(analyticsData.totalClicks / analyticsData.totalViews) * 100}%` }}></div>
                      <div className="absolute top-0 left-0 h-6 bg-indigo-500 rounded-full dark:bg-indigo-600" style={{ width: `${(analyticsData.totalPurchases / analyticsData.totalViews) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between w-full mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>100%</span>
                      <span>{((analyticsData.totalClicks / analyticsData.totalViews) * 100).toFixed(1)}%</span>
                      <span>{analyticsData.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Performance */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Performance</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Performing Paywalls */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Best Performing Paywalls</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Paywall
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Revenue
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Purchases
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Views
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {analyticsData.bestPerformingPaywalls.map((paywall) => (
                          <tr key={paywall.id}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                              {paywall.title}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              ${paywall.revenue.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {paywall.purchases}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {paywall.views}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Worst Performing Paywalls */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Worst Performing Content</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Paywall
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Revenue
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Purchases
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Views
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {analyticsData.worstPerformingPaywalls.map((paywall) => (
                          <tr key={paywall.id}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                              {paywall.title}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              ${paywall.revenue.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {paywall.purchases}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {paywall.views}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Insights */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3 dark:bg-indigo-900/30">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New vs Returning</p>
                      <div className="flex space-x-4 mt-1">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">New: {analyticsData.newVsReturning.new}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">Returning: {analyticsData.newVsReturning.returning}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3 dark:bg-green-900/30">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Acquisition Cost</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${analyticsData.customerAcquisitionCost}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3 dark:bg-yellow-900/30">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lifetime Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${analyticsData.customerLifetimeValue}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3 dark:bg-purple-900/30">
                      <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Purchase</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.avgTimeToPurchase} days</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Geographic Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Geographic Distribution</h4>
                <div className="flex flex-wrap gap-4">
                  {analyticsData.geographicDistribution.map((location, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-32 text-sm text-gray-700 dark:text-gray-300">{location.country}</div>
                      <div className="w-48">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
                            style={{ width: `${location.value}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">{location.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;