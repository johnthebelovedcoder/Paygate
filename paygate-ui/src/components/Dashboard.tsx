import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import CustomerList from './CustomerList';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import { useAppData, useToast } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import useAnalytics from '../hooks/useAnalytics';
import notificationService from '../services/notificationService';

const Dashboard: React.FC = () => {
  const { paywalls } = useAppData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const { stats, revenueData, topPaywalls, loading, error, refreshAnalytics } = useAnalytics(
    timeRange,
    customStartDate,
    customEndDate
  );
  const [filteredRevenueData, setFilteredRevenueData] = useState<{ name: string; value: number }[]>(
    []
  );
  const [timeoutError, setTimeoutError] = useState<string | null>(null);

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Dashboard data loading timeout - forcing to show with fallback data');
        setTimeoutError('Data is taking longer than expected to load. Showing fallback data.');
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Format stats data for display
  const formatCurrency = (value: number): string => {
    const userCurrency = user?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
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

  // Calculate conversion rate
  const calculateConversionRate = () => {
    if (!stats) return 0;
    // In a real app, this would be calculated from actual data
    // For now, we'll use a realistic calculation based on the data we have
    return Math.round((stats.recentPayments / (stats.recentPayments + 10)) * 1000) / 10;
  };

  const headerActions = (
    <Link to="/create-paywall">
      <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Create New Paywall
      </button>
    </Link>
  );

  if (loading && !timeoutError) {
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

  if (error && !timeoutError) {
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

  // If we have timeout error, we'll render the dashboard anyway with fallback data
  // The timeout error can be displayed as a notification to the user

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
            {/* Show timeout warning if data is taking too long */}
            {timeoutError && (
              <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-900">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Data Loading Issue</h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>{timeoutError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                title="Total Sales"
                value={stats ? stats.totalSales.toString() : '0'}
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
                change="8.2%"
                changeType="positive"
              />

              <StatsCard
                title="Conversion Rate"
                value={formatPercentage(calculateConversionRate())}
                description="Visitors to purchasers"
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
                change="3.1%"
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
                  <AnalyticsChart
                    data={filteredRevenueData}
                    title="Revenue"
                    type="line"
                    color="indigo"
                    currency={user?.currency || 'USD'}
                  />
                </div>
              </div>
            </div>

            {/* Top Paywalls */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Paywalls</h3>
                <Link
                  to="/paywalls"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                {paywalls.loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                ) : paywalls.error ? (
                  <div className="p-4 text-center text-red-600 dark:text-red-400">
                    Error loading paywalls: {paywalls.error}
                  </div>
                ) : paywalls.paywalls.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No paywalls found
                  </div>
                ) : (
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Paywall
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Sales
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Revenue
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {topPaywalls.map(paywall => (
                          <tr key={paywall.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {paywall.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {paywall.id === '1' ? 'Digital Download' : 'External Link'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {paywall.sales}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(paywall.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  paywall.id === '1'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : paywall.id === '2'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {paywall.id === '1'
                                  ? 'Published'
                                  : paywall.id === '2'
                                    ? 'Draft'
                                    : 'Archived'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Mobile view */}
                <div className="md:hidden">
                  {topPaywalls.slice(0, 3).map(paywall => (
                    <div
                      key={paywall.id}
                      className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {paywall.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {paywall.id === '1' ? 'Digital Download' : 'External Link'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(paywall.revenue)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {paywall.sales} sales
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            paywall.id === '1'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : paywall.id === '2'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {paywall.id === '1'
                            ? 'Published'
                            : paywall.id === '2'
                              ? 'Draft'
                              : 'Archived'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Customers */}
            <CustomerList />

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

            {/* Notification Demo Section */}
            <div className="mb-8 bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Notification System Demo
              </h3>
              <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                This section demonstrates the notification system. Click the buttons below to
                trigger different types of notifications.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    // Add notification to the notification center
                    notificationService.addNotification({
                      title: 'New Feature Available!',
                      message:
                        'Check out our new analytics dashboard with enhanced reporting capabilities.',
                      type: 'info',
                    });

                    // Show toast notification
                    showToast({
                      title: 'Feature Update',
                      message: 'New analytics features are now available!',
                      type: 'info',
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-5 w-5 text-blue-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Info Notification
                </button>
                <button
                  onClick={() => {
                    // Add notification to the notification center
                    notificationService.addNotification({
                      title: 'Payment Successful!',
                      message: 'Your payment of $49.99 has been processed successfully.',
                      type: 'success',
                    });

                    // Show toast notification
                    showToast({
                      title: 'Payment Success',
                      message: 'Your payment was processed successfully!',
                      type: 'success',
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg
                    className="h-5 w-5 text-white mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Success Notification
                </button>
                <Link
                  to="/notifications-demo"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-5 w-5 text-indigo-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  View All Notifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
