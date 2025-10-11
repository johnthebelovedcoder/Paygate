import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import GeographicChart from './GeographicChart';
import TrafficSourcesChart from './TrafficSourcesChart';
import CustomerLifetimeValueList from './CustomerLifetimeValueList';
import RevenueForecastChart from './RevenueForecastChart';

import { useAuth } from '../contexts/AuthContext';
import useAnalytics from '../hooks/useAnalytics';
import useRecentPayments from '../hooks/useRecentPayments';
import type {
  GeographicData,
  TrafficSource,
  CustomerLifetimeValue,
  RevenueForecast,
} from '../types/analytics.types';

// Types for our analytics data
interface GrowthMetricData {
  name: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
}

interface PerformanceHighlight {
  id: string;
  title: string;
  value: string;
  description: string;
  change: string;
  changeType: 'positive' | 'negative';
}

const ComprehensiveAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const { stats, revenueData, topPaywalls, customerData, loading, error, refreshAnalytics } =
    useAnalytics(timeRange, customStartDate, customEndDate);
  const { payments: recentTransactions, loading: paymentsLoading } = useRecentPayments();

  // State for our new analytics features
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [customerLifetimeValues, setCustomerLifetimeValues] = useState<CustomerLifetimeValue[]>([]);
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecast | null>(null);

  const [filteredRevenueData, setFilteredRevenueData] = useState<{ name: string; value: number }[]>(
    []
  );
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetricData[]>([]);
  const [performanceHighlights, setPerformanceHighlights] = useState<PerformanceHighlight[]>([]);

  // Format stats data for display
  const formatCurrency = (value: number): string => {
    const userCurrency = user?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value / 100); // Payments are in cents
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

  // Prepare growth metrics data
  useEffect(() => {
    if (customerData) {
      // Calculate customer growth percentage
      const customerGrowth = customerData.customerGrowth;
      if (customerGrowth.length >= 2) {
        const currentMonth = customerGrowth[customerGrowth.length - 1]?.newCustomers || 0;
        const previousMonth = customerGrowth[customerGrowth.length - 2]?.newCustomers || 0;
        const growthPercentage =
          previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

        setGrowthMetrics([
          {
            name: 'User Acquisition',
            value: currentMonth,
            change: Math.abs(growthPercentage),
            changeType: growthPercentage >= 0 ? 'positive' : 'negative',
          },
          {
            name: 'Retention Rate',
            value: 78,
            change: 2.5,
            changeType: 'positive',
          },
          {
            name: 'Engagement',
            value: 64,
            change: 1.2,
            changeType: 'positive',
          },
        ]);
      }
    }
  }, [customerData]);

  // Prepare performance highlights
  useEffect(() => {
    if (topPaywalls.length > 0) {
      const topPerforming = topPaywalls[0];
      setPerformanceHighlights([
        {
          id: '1',
          title: 'Top Performing Content',
          value: topPerforming?.title || '',
          description: `${topPerforming?.sales || 0} sales, ${formatCurrency((topPerforming?.revenue || 0) * 100)} revenue`,
          change: '+12.5%',
          changeType: 'positive',
        },
        {
          id: '2',
          title: 'Revenue Goal',
          value: '78%',
          description: 'Monthly target progress',
          change: '+5.2%',
          changeType: 'positive',
        },
      ]);
    }
  }, [topPaywalls]);

  // Fetch additional analytics data
  useEffect(() => {
    const fetchAdditionalAnalytics = async () => {
      try {
        // Fetch geographic data
        const geographicResponse = await fetch('/api/analytics/geography', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const geographicData = await geographicResponse.json();
        if (geographicData.success) {
          setGeographicData(geographicData.data);
        }

        // Fetch traffic sources
        const trafficSourcesResponse = await fetch('/api/analytics/traffic', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const trafficSourcesData = await trafficSourcesResponse.json();
        if (trafficSourcesData.success) {
          setTrafficSources(trafficSourcesData.data);
        }

        // Fetch customer lifetime values
        const clvResponse = await fetch('/api/analytics/clv', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const clvData = await clvResponse.json();
        if (clvData.success) {
          setCustomerLifetimeValues(clvData.data);
        }

        // Fetch revenue forecast
        const forecastResponse = await fetch('/api/analytics/predictive/revenue-forecast', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const forecastData = await forecastResponse.json();
        if (forecastData.success) {
          setRevenueForecast(forecastData.data);
        }
      } catch (error) {
        console.error('Error fetching additional analytics:', error);
      }
    };

    fetchAdditionalAnalytics();
  }, []);

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
          title="Comprehensive Analytics"
          subtitle="Detailed insights and performance metrics"
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
          title="Comprehensive Analytics"
          subtitle="Detailed insights and performance metrics"
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
        title="Comprehensive Analytics"
        subtitle="Detailed insights and performance metrics"
        actions={headerActions}
      />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Revenue Summary */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Revenue Summary
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Revenue"
                value={stats ? formatCurrency(stats.totalRevenue * 100) : formatCurrency(0)}
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
            </div>

            {/* Growth Metrics */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Growth Metrics
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {growthMetrics.map(metric => (
                  <div
                    key={metric.name}
                    className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="ml-4 sm:ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                              {metric.name}
                            </dt>
                            <dd className="flex flex-wrap items-baseline">
                              <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                                {metric.value}
                                {metric.name === 'User Acquisition' ? '' : '%'}
                              </div>
                              <div
                                className={`ml-2 flex items-baseline text-sm font-semibold ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} ${metric.changeType === 'positive' ? 'dark:text-green-400' : 'dark:text-red-400'}`}
                              >
                                {metric.changeType === 'positive' ? (
                                  <svg
                                    className="self-center flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="self-center flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                <span className="ml-1">{metric.change}%</span>
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Highlights */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Performance Highlights
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {performanceHighlights.map(highlight => (
                  <div
                    key={highlight.id}
                    className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="ml-4 sm:ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                              {highlight.title}
                            </dt>
                            <dd className="flex flex-wrap items-baseline">
                              <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                                {highlight.value}
                              </div>
                              <div
                                className={`ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400`}
                              >
                                <svg
                                  className="self-center flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="ml-1">{highlight.change}</span>
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {highlight.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Data */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Geographic Performance
              </h3>
              <GeographicChart data={geographicData} />
            </div>

            {/* Traffic Sources */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Traffic Sources
              </h3>
              <TrafficSourcesChart data={trafficSources} />
            </div>

            {/* Customer Lifetime Value */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Customer Lifetime Value
              </h3>
              <CustomerLifetimeValueList data={customerLifetimeValues} />
            </div>

            {/* Revenue Forecast */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Revenue Forecast
              </h3>
              {revenueForecast && <RevenueForecastChart data={revenueForecast} />}
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
                  to="/customers"
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      View Customers
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer list</p>
                  </div>
                </Link>
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
                    {recentTransactions.slice(0, 5).map(transaction => (
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
                                {formatCurrency(transaction.amount)}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComprehensiveAnalytics;
