// components/AdvancedAnalyticsDashboard.tsx - Advanced analytics dashboard with multiple chart types
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import AnalyticsChart from './AnalyticsChart';
import StatsCard from './StatsCard';
import useAnalytics from '../hooks/useAnalytics';
import { useAuth } from '../contexts/AuthContext';
import { toChartData } from '../utils/chart.utils';

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [revenueChartType, setRevenueChartType] = useState<
    'line' | 'bar' | 'area' | 'composed' | 'radar'
  >('line');
  const [salesChartType, setSalesChartType] = useState<'line' | 'bar' | 'area' | 'scatter'>('line');
  const [paywallsChartType, setPaywallsChartType] = useState<'pie' | 'radar' | 'radial'>('pie');
  const { stats, revenueData, topPaywalls, trafficData, performanceData, loading, error } =
    useAnalytics(timeRange, customStartDate, customEndDate);

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

  // Calculate conversion rate
  const calculateConversionRate = () => {
    if (!stats) return 0;
    // In a real app, this would be calculated from actual data
    // For now, we'll use a realistic calculation based on the data we have
    return Math.round((stats.recentPayments / (stats.recentPayments + 10)) * 1000) / 10;
  };

  const performanceChartData = performanceData.map(d => ({
    name: d.subject,
    value: d.A,
    B: d.B,
    fullMark: d.fullMark,
  }));

  // Prepare top paywalls data for charts
  const topPaywallsData = topPaywalls.map(paywall => ({
    name: paywall.title,
    value: paywall.revenue,
    sales: paywall.sales,
  }));

  const revenueChartData = toChartData(revenueData);

  const salesChartData = topPaywalls.map(paywall => ({
    name: paywall.title,
    value: paywall.sales,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Advanced Analytics" subtitle="Comprehensive performance insights" />
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
        <Header title="Advanced Analytics" subtitle="Comprehensive performance insights" />
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
        title="Advanced Analytics"
        subtitle="Comprehensive performance insights"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
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
                </div>
              )}
            </div>
            <Link
              to="/paywalls"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              View Paywalls
            </Link>
          </div>
        }
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

            {/* Revenue Analytics */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Revenue Analytics
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRevenueChartType('line')}
                    className={`px-2 py-1 text-xs rounded ${revenueChartType === 'line' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setRevenueChartType('area')}
                    className={`px-2 py-1 text-xs rounded ${revenueChartType === 'area' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setRevenueChartType('bar')}
                    className={`px-2 py-1 text-xs rounded ${revenueChartType === 'bar' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setRevenueChartType('composed')}
                    className={`px-2 py-1 text-xs rounded ${revenueChartType === 'composed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Composed
                  </button>
                  <button
                    onClick={() => setRevenueChartType('radar')}
                    className={`px-2 py-1 text-xs rounded ${revenueChartType === 'radar' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Radar
                  </button>
                </div>
              </div>
              <AnalyticsChart
                data={revenueChartData}
                title="Revenue Trend"
                type={revenueChartType}
                color="indigo"
                currency={user?.currency || 'USD'}
              />
            </div>

            {/* Sales Analytics */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sales Analytics
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSalesChartType('line')}
                    className={`px-2 py-1 text-xs rounded ${salesChartType === 'line' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setSalesChartType('bar')}
                    className={`px-2 py-1 text-xs rounded ${salesChartType === 'bar' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setSalesChartType('area')}
                    className={`px-2 py-1 text-xs rounded ${salesChartType === 'area' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setSalesChartType('scatter')}
                    className={`px-2 py-1 text-xs rounded ${salesChartType === 'scatter' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Scatter
                  </button>
                </div>
              </div>
              <AnalyticsChart
                data={salesChartData}
                title="Sales Trend"
                type={salesChartType}
                color="green"
                currency={user?.currency || 'USD'}
              />
            </div>

            {/* Paywalls and Traffic Analytics */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Top Paywalls
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setPaywallsChartType('pie')}
                      className={`px-2 py-1 text-xs rounded ${paywallsChartType === 'pie' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      Pie
                    </button>
                    <button
                      onClick={() => setPaywallsChartType('radar')}
                      className={`px-2 py-1 text-xs rounded ${paywallsChartType === 'radar' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      Radar
                    </button>
                    <button
                      onClick={() => setPaywallsChartType('radial')}
                      className={`px-2 py-1 text-xs rounded ${paywallsChartType === 'radial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      Radial
                    </button>
                  </div>
                </div>
                <AnalyticsChart
                  data={topPaywallsData}
                  title="Paywall Revenue Distribution"
                  type={paywallsChartType}
                  color="purple"
                  currency={user?.currency || 'USD'}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Traffic Sources
                  </h3>
                </div>
                <AnalyticsChart
                  data={trafficData}
                  title="Traffic Distribution"
                  type="pie"
                  color="blue"
                  currency={user?.currency || 'USD'}
                />
              </div>
            </div>

            {/* Performance Radar Chart */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Performance Metrics
                </h3>
              </div>
              <AnalyticsChart
                data={performanceChartData}
                title="Performance Radar"
                type="radar"
                color="yellow"
              />
            </div>

            {/* Key Insights */}
            <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Growth Trend</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Revenue has shown consistent growth over the selected period with peaks in{' '}
                    {revenueChartData && revenueChartData.length > 0
                      ? revenueChartData[revenueChartData.length - 1]?.name
                      : 'recent months'}
                    .
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/20">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Top Performer</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {topPaywalls && topPaywalls.length > 0 ? topPaywalls[0]?.title : 'N/A'} is your
                    highest revenue generator with{' '}
                    {formatCurrency(
                      topPaywalls && topPaywalls.length > 0 ? topPaywalls[0]?.revenue || 0 : 0
                    )}{' '}
                    in sales.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg dark:bg-purple-900/20">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Opportunity</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Consider promoting{' '}
                    {topPaywalls && topPaywalls.length > 1
                      ? topPaywalls[topPaywalls.length - 1]?.title
                      : 'your products'}{' '}
                    to increase overall revenue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
