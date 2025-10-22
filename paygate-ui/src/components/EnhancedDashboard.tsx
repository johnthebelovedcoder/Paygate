import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import StatsCard from './StatsCard';
import { useAppData } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import useAnalytics from '../hooks/useAnalytics';
import type { Transaction } from '../types/global';

const EnhancedDashboard: React.FC = () => {
  const { recentPayments } = useAppData();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const { stats, revenueData, loading, error, refreshAnalytics } = useAnalytics(
    timeRange,
    customStartDate,
    customEndDate
  );
  const { payments: recentTransactions, loading: paymentsLoading } = recentPayments;
  const [filteredRevenueData, setFilteredRevenueData] = useState<{ name: string; value: number }[]>(
    []
  );

  // Format stats data for display
  const formatCurrency = (value: number): string => {
    const userCurrency = user?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      refreshAnalytics();
    }
  };

  // Convert data for charts when revenueData changes
  useEffect(() => {
    if (revenueData.length > 0) {
      // Check if we have daily data or monthly data
      if (revenueData && revenueData.length > 0 && revenueData[0] && 'date' in revenueData[0]) {
        // Daily data
        const dailyData = revenueData as { date: string; revenue: number }[];
        const revenueChartData = dailyData.map(item => ({
          name: item.date,
          value: item.revenue,
        }));
        setFilteredRevenueData(revenueChartData);
      } else {
        // Monthly data
        const monthlyData = revenueData as { month: string; revenue: number }[];
        const revenueChartData = monthlyData.map(item => ({
          name: item.month,
          value: item.revenue,
        }));
        setFilteredRevenueData(revenueChartData);
      }
    }
  }, [revenueData]);

  const headerActions = (
    <Link to="/create-paywall">
      <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Create New Paywall
      </button>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Dashboard"
          subtitle="Monitor your sales and performance"
          actions={headerActions}
        />
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
        <Header
          title="Dashboard"
          subtitle="Monitor your sales and performance"
          actions={headerActions}
        />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center text-red-600 dark:text-red-400">{error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Dashboard"
        subtitle="Monitor your sales and performance"
        actions={headerActions}
      />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Revenue"
                value={stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
                description="Across all paywalls"
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
                change="12.5%"
                changeType="positive"
              />

              <StatsCard
                title="Active Paywalls"
                value={stats ? stats.activePaywalls.toString() : '0'}
                description="Currently published"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                change="2"
                changeType="positive"
              />

              <StatsCard
                title="Customers"
                value={stats ? stats.totalCustomers?.toString() || '0' : '0'}
                description="Total customers"
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
                change="5"
                changeType="positive"
              />

              <StatsCard
                title="Recent Transactions"
                value={recentTransactions.length.toString()}
                description="In the last 30 days"
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
                change="3"
                changeType="positive"
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  to="/create-paywall"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Create Paywall
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Set up a new paywall</p>
                  </div>
                </Link>

                <Link
                  to="/content"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Upload Content
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add new files or content
                    </p>
                  </div>
                </Link>

                <Link
                  to="/paywalls"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Invite Customers
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share paywall links</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Charts Section with Filters */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Performance Analytics
                </h3>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={timeRange}
                    onChange={e =>
                      setTimeRange(
                        e.target.value as
                          | 'this_week'
                          | 'this_month'
                          | 'this_year'
                          | 'last_year'
                          | 'custom'
                      )
                    }
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="this_year">This Year</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {timeRange === 'custom' && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={applyCustomRange}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
                      Revenue Trend
                    </h4>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    {filteredRevenueData.length > 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <p>Revenue chart visualization would appear here</p>
                          <p className="text-sm mt-2">Data points: {filteredRevenueData.length}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        No revenue data available for the selected period
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <Link
                  to="/analytics"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                {paymentsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No recent transactions found
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentTransactions.slice(0, 5).map((transaction: any) => (
                      <li key={transaction.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-green-500">
                            <svg
                              className="h-5 w-5 text-white"
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
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate dark:text-indigo-400">
                                New Sale
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.customerEmail || 'Customer'} purchased{' '}
                                {transaction.paywallTitle || 'content'} for{' '}
                                {formatCurrency(transaction.amount / 100)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Notifications / Alerts */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Notifications & Alerts
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="relative rounded-lg border border-red-300 bg-red-50 px-6 py-5 shadow-sm flex items-center space-x-3 dark:bg-red-900/20 dark:border-red-900">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Payment Issues
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">2 unresolved payments</p>
                  </div>
                </div>

                <div className="relative rounded-lg border border-yellow-300 bg-yellow-50 px-6 py-5 shadow-sm flex items-center space-x-3 dark:bg-yellow-900/20 dark:border-yellow-900">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Expiring Subscriptions
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      3 subscriptions expiring soon
                    </p>
                  </div>
                </div>

                <div className="relative rounded-lg border border-blue-300 bg-blue-50 px-6 py-5 shadow-sm flex items-center space-x-3 dark:bg-blue-900/20 dark:border-blue-900">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-blue-400"
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      New Features
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Analytics dashboard updated
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Notice */}
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900">
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
                    Current Pricing Model
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      You're currently on our Free plan. You're paying a 10% platform fee plus
                      standard payment processor fees (2.9% + $0.30) on each transaction.
                    </p>
                    <p className="mt-2">
                      <strong>Example:</strong> On a $50 sale, you pay $5 (10% platform fee) + $1.45
                      (2.9% + $0.30 payment fee) = $6.45 total fees.
                    </p>
                    <div className="mt-3">
                      <Link
                        to="/subscription"
                        className="font-medium text-blue-800 underline hover:text-blue-700 dark:text-blue-200 dark:hover:text-blue-300"
                      >
                        Upgrade to a paid plan to reduce your fees
                      </Link>
                    </div>
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

export default EnhancedDashboard;
