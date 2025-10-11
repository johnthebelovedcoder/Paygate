import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import { formatCurrency } from '../utils/currency.utils';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface RevenueSummary {
  totalEarned: number;
  totalSales: number;
  pendingPayouts: number;
  avgOrderValue: number;
}

interface PaywallPerformance {
  id: string;
  title: string;
  totalRevenue: number;
  totalSales: number;
  conversionRate: number;
}

interface TopCustomer {
  id: string;
  email: string;
  name: string;
  purchaseCount: number;
  totalSpent: number;
}

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [paywallPerformance, setPaywallPerformance] = useState<PaywallPerformance[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all creator analytics data in parallel
        const [revenueRes, performanceRes, customersRes] = await Promise.all([
          apiService.get<RevenueSummary>('/analytics/creator/revenue-summary'),
          apiService.get<PaywallPerformance[]>('/analytics/creator/paywall-performance'),
          apiService.get<TopCustomer[]>('/analytics/creator/top-customers'),
        ]);

        setRevenueSummary(revenueRes);
        setPaywallPerformance(performanceRes || []);
        setTopCustomers(customersRes || []);
      } catch (err) {
        console.error('Error fetching creator analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const refreshData = () => {
    // Trigger a data refresh
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Creator Dashboard" subtitle="Monitor your earnings and performance" />
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
        <Header title="Creator Dashboard" subtitle="Monitor your earnings and performance" />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center text-red-600 dark:text-red-400">
                {error}
                <button
                  onClick={refreshData}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Creator Dashboard"
        subtitle="Monitor your earnings and performance"
        actions={
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={refreshData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        }
      />

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Earned"
                value={
                  revenueSummary ? formatCurrency(revenueSummary.totalEarned) : formatCurrency(0)
                }
                description="Across all content"
                icon={
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
                }
                change="+12.5%"
                changeType="positive"
              />

              <StatsCard
                title="Total Sales"
                value={revenueSummary ? revenueSummary.totalSales.toString() : '0'}
                description="Number of purchases"
                icon={
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                change="+8.2%"
                changeType="positive"
              />

              <StatsCard
                title="Pending Payouts"
                value={
                  revenueSummary ? formatCurrency(revenueSummary.pendingPayouts) : formatCurrency(0)
                }
                description="Awaiting transfer"
                icon={
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
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                }
                change="-2.1%"
                changeType="negative"
              />

              <StatsCard
                title="Avg. Order Value"
                value={
                  revenueSummary ? formatCurrency(revenueSummary.avgOrderValue) : formatCurrency(0)
                }
                description="Per transaction"
                icon={
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
                }
                change="+3.1%"
                changeType="positive"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Paywall Performance */}
              <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Top Performing Paywalls
                  </h3>
                  <Link
                    to="/analytics"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {paywallPerformance.slice(0, 5).map(paywall => (
                    <div key={paywall.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{paywall.title}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {paywall.totalSales} sales
                          </span>
                          <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {paywall.conversionRate}% conversion
                          </span>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(paywall.totalRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Top Customers
                  </h3>
                  <Link
                    to="/customers"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {topCustomers.slice(0, 5).map(customer => (
                    <div key={customer.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.name || customer.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.purchaseCount} purchases
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Earnings Trend
              </h3>
              <div className="h-80">
                <AnalyticsChart
                  data={paywallPerformance.map(pw => ({
                    name: pw.title,
                    value: pw.totalRevenue,
                  }))}
                  title="Paywall Revenue"
                  type="bar"
                  color="indigo"
                  currency={user?.currency || 'USD'}
                />
              </div>
            </div>

            {/* Tips section */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Creator Insights
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your content is performing well with a 12% conversion rate</li>
                      <li>Educational content is your top-performing category</li>
                      <li>Consider bundling popular items for higher order values</li>
                      <li>Your best customers tend to return with repeat purchases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;
