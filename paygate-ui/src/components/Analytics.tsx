import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import useAnalytics from '../hooks/useAnalytics';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import { formatCurrency } from '../utils/currency.utils';
import { toChartData } from '../utils/chart.utils';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'revenue' | 'conversion' | 'geographic' | 'traffic'
  >('overview');
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const { stats, revenueData, topPaywalls, trafficData, geographicData, loading, error } =
    useAnalytics(timeRange, customStartDate, customEndDate);

  // Helper function to calculate conversion rate
  const calculateConversionRate = (): number => {
    if (!stats || stats.totalVisitors === 0) return 0;
    return (stats.totalSales / stats.totalVisitors) * 100;
  };

  // Helper function to format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Sample data for charts - needs to be replaced with actual data
  const revenueChartData = toChartData(revenueData);
  const topPaywallsData = topPaywalls?.map(pw => ({ name: pw.title, value: pw.revenue })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Analytics" subtitle="Track your performance and revenue metrics" />
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
        <Header title="Analytics" subtitle="Track your performance and revenue metrics" />
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
        title="Analytics"
        subtitle="Track your performance and revenue metrics"
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
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'revenue'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Revenue Analytics
                </button>
                <button
                  onClick={() => setActiveTab('conversion')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'conversion'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Conversion Funnels
                </button>
                <button
                  onClick={() => setActiveTab('geographic')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'geographic'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Geographic Data
                </button>
                <button
                  onClick={() => setActiveTab('traffic')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'traffic'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Traffic Sources
                </button>
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Revenue Trend
                    </h3>
                    <AnalyticsChart
                      data={revenueChartData}
                      title="Revenue"
                      type="line"
                      color="indigo"
                      currency={user?.currency || 'USD'}
                    />
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Top Paywalls
                    </h3>
                    <div className="space-y-4">
                      {topPaywalls.slice(0, 3).map(paywall => (
                        <div key={paywall.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {paywall.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {paywall.sales} sales
                            </p>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(paywall.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
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
                        Analytics Insights
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Your conversion rate is above average for digital content platforms
                          </li>
                          <li>E-books are your top-performing content category</li>
                          <li>Consider creating more video content based on recent trends</li>
                          <li>Your average order value has increased 2.3% this month</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Analytics Tab */}
            {activeTab === 'revenue' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                    Revenue Trends
                  </h3>
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <AnalyticsChart
                      data={revenueChartData}
                      title="Revenue Trend"
                      type="line"
                      color="indigo"
                      currency={user?.currency || 'USD'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Revenue by Product
                    </h3>
                    <AnalyticsChart
                      data={topPaywallsData.map(item => ({ name: item.name, value: item.value }))}
                      title="Product Revenue"
                      type="pie"
                      color="green"
                      currency={user?.currency || 'USD'}
                    />
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Revenue by Customer Segment
                    </h3>
                    <AnalyticsChart
                      data={[
                        { name: 'High Value', value: 42 },
                        { name: 'Medium Value', value: 35 },
                        { name: 'Low Value', value: 23 },
                      ]}
                      title="Revenue by Segment"
                      type="bar"
                      color="purple"
                      currency={user?.currency || 'USD'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Order Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats
                        ? formatCurrency(stats.totalRevenue / stats.totalSales)
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</p>
                    <p className="text-2xl font-bold text-green-600">+12.5%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Funnels Tab */}
            {activeTab === 'conversion' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Conversion Funnel
                    </h3>
                    <div className="space-y-4">
                      {[
                        { step: 'Visitors', count: 15420, percentage: 100 },
                        { step: 'Page Views', count: 10230, percentage: 66.3 },
                        { step: 'Added to Cart', count: 1842, percentage: 12 },
                        { step: 'Purchased', count: 921, percentage: 6 },
                      ].map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {step.step}
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                {step.count.toLocaleString()}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {step.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${step.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Conversion Rate by Source
                    </h3>
                    <AnalyticsChart
                      data={[
                        { name: 'Direct', value: 8.2 },
                        { name: 'Social Media', value: 6.4 },
                        { name: 'Email', value: 10.8 },
                        { name: 'Referral', value: 4.3 },
                      ]}
                      title="Conversion by Source"
                      type="bar"
                      color="blue"
                      currency={user?.currency || 'USD'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPercentage(calculateConversionRate())}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cart Abandonment</p>
                    <p className="text-2xl font-bold text-red-600">82%</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Top Drop-off</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Cart</p>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                    Drop-off Analysis
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The highest drop-off occurs at the cart stage, where 82% of visitors abandon
                    their purchase. Consider simplifying the checkout process or offering guest
                    checkout options to improve conversion.
                  </p>
                </div>
              </div>
            )}

            {/* Geographic Data Tab */}
            {activeTab === 'geographic' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                    Sales by Geography
                  </h3>
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <AnalyticsChart
                      data={geographicData.map(item => ({
                        name: item.country,
                        value: item.revenue,
                      }))}
                      title="Sales by Country"
                      type="pie"
                      color="indigo"
                      currency={user?.currency || 'USD'}
                    />{' '}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Revenue by Region
                    </h3>
                    <AnalyticsChart
                      data={[
                        { name: 'North America', value: 65000 },
                        { name: 'Europe', value: 42000 },
                        { name: 'Asia', value: 28000 },
                        { name: 'Australia', value: 15000 },
                        { name: 'Other', value: 22000 },
                      ]}
                      title="Revenue by Region"
                      type="bar"
                      color="green"
                      currency={user?.currency || 'USD'}
                    />
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Conversion by Country
                    </h3>
                    <AnalyticsChart
                      data={[
                        { name: 'US', value: 12.4 },
                        { name: 'GB', value: 9.8 },
                        { name: 'CA', value: 11.2 },
                        { name: 'DE', value: 8.7 },
                        { name: 'AU', value: 7.9 },
                      ]}
                      title="Conversion by Country (%)"
                      type="bar"
                      color="purple"
                      currency={user?.currency || 'USD'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Top Country</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      United States
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Market Share</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">35%</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">12.4%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Traffic Sources Tab */}
            {activeTab === 'traffic' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                    Traffic Sources
                  </h3>
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <AnalyticsChart
                      data={trafficData}
                      title="Traffic Distribution"
                      type="pie"
                      color="indigo"
                      currency={user?.currency || 'USD'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Traffic by Source Over Time
                    </h3>
                    <AnalyticsChart
                      data={[
                        {
                          name: 'Jan',
                          Direct: 4200,
                          Social: 1200,
                          Email: 850,
                          value: 4200 + 1200 + 850,
                        },
                        {
                          name: 'Feb',
                          Direct: 3800,
                          Social: 1450,
                          Email: 920,
                          value: 3800 + 1450 + 920,
                        },
                        {
                          name: 'Mar',
                          Direct: 4500,
                          Social: 1600,
                          Email: 980,
                          value: 4500 + 1600 + 980,
                        },
                        {
                          name: 'Apr',
                          Direct: 4100,
                          Social: 1750,
                          Email: 1050,
                          value: 4100 + 1750 + 1050,
                        },
                        {
                          name: 'May',
                          Direct: 4800,
                          Social: 1900,
                          Email: 1120,
                          value: 4800 + 1900 + 1120,
                        },
                        {
                          name: 'Jun',
                          Direct: 5200,
                          Social: 2100,
                          Email: 1200,
                          value: 5200 + 2100 + 1200,
                        },
                      ]}
                      title="Traffic Trends"
                      type="area"
                      color="green"
                      currency={user?.currency || 'USD'}
                    />
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                      Conversions by Traffic Source
                    </h3>
                    <AnalyticsChart
                      data={[
                        { name: 'Direct', value: 6.2 },
                        { name: 'Social', value: 4.8 },
                        { name: 'Email', value: 10.5 },
                        { name: 'Referral', value: 3.9 },
                      ]}
                      title="Conversion Rate by Source (%)"
                      type="bar"
                      color="purple"
                      currency={user?.currency || 'USD'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Top Source</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Direct</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Traffic Share</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">42%</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Best Performer</p>
                    <p className="text-2xl font-bold text-green-600">Email</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
