import React, { useState, useEffect } from 'react';
import type { Paywall } from '../services/paywallService';
import AnalyticsChart from './AnalyticsChart';

interface PaywallPerformanceProps {
  paywall: Paywall;
}

interface PerformanceData {
  views: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  viewsData: { date: string; count: number }[];
  revenueData: { date: string; amount: number }[];
}

const PaywallPerformance: React.FC<PaywallPerformanceProps> = ({ paywall }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching performance data
    const fetchPerformanceData = async () => {
      setLoading(true);

      // In a real implementation, we would fetch this data from the backend
      // For now, we'll generate mock data
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate mock data based on time range
      const now = new Date();
      const viewsData = [];
      const revenueData = [];

      switch (timeRange) {
        case '7d':
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
            viewsData.push({
              date: dateString,
              count: Math.floor(Math.random() * 100) + 50,
            });
            revenueData.push({
              date: dateString,
              amount: Math.floor(Math.random() * 500) + 100,
            });
          }
          break;
        case '30d':
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            viewsData.push({
              date: dateString,
              count: Math.floor(Math.random() * 150) + 75,
            });
            revenueData.push({
              date: dateString,
              amount: Math.floor(Math.random() * 750) + 250,
            });
          }
          break;
        case '90d':
          for (let i = 0; i < 12; i++) {
            const date = new Date(now);
            date.setMonth(now.getMonth() - (11 - i));
            const dateString = date.toLocaleDateString('en-US', { month: 'short' });
            viewsData.push({
              date: dateString,
              count: Math.floor(Math.random() * 1000) + 500,
            });
            revenueData.push({
              date: dateString,
              amount: Math.floor(Math.random() * 5000) + 2000,
            });
          }
          break;
        case '1y':
          for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), i, 1);
            const dateString = date.toLocaleDateString('en-US', { month: 'short' });
            viewsData.push({
              date: dateString,
              count: Math.floor(Math.random() * 1500) + 750,
            });
            revenueData.push({
              date: dateString,
              amount: Math.floor(Math.random() * 7500) + 3000,
            });
          }
          break;
      }

      // Calculate overall metrics
      const totalViews = viewsData.reduce((sum, item) => sum + item.count, 0);
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
      const conversions = Math.floor(totalViews * (Math.random() * 0.1 + 0.05)); // 5-15% conversion rate
      const conversionRate = totalViews > 0 ? (conversions / totalViews) * 100 : 0;

      setPerformanceData({
        views: totalViews,
        conversions,
        conversionRate,
        revenue: totalRevenue,
        viewsData,
        revenueData,
      });

      setLoading(false);
    };

    fetchPerformanceData();
  }, [timeRange, paywall.id]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No performance data
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Performance data will be available after your paywall receives views.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Metrics</h3>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-50 overflow-hidden shadow rounded-lg dark:bg-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                  Views
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {performanceData.views.toLocaleString()}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 overflow-hidden shadow rounded-lg dark:bg-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                  Conversions
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {performanceData.conversions.toLocaleString()}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 overflow-hidden shadow rounded-lg dark:bg-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                  Conversion Rate
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {performanceData.conversionRate.toFixed(2)}%
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 overflow-hidden shadow rounded-lg dark:bg-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                  Revenue
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ${(performanceData.revenue / 100).toFixed(2)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Views Trend</h4>
          <AnalyticsChart
            data={performanceData.viewsData.map(item => ({ name: item.date, value: item.count }))}
            title="Views"
            type="line"
            color="indigo"
          />
        </div>
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h4>
          <AnalyticsChart
            data={performanceData.revenueData.map(item => ({
              name: item.date,
              value: item.amount,
            }))}
            title="Revenue"
            type="bar"
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

export default PaywallPerformance;
