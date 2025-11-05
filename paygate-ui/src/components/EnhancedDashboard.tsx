import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import StatsCard from './StatsCard';
import AnalyticsChart from './AnalyticsChart';
import { useAppData, useToast } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import useAnalytics from '../hooks/useAnalytics';
import notificationService from '../services/notificationService';

interface RevenueGoal {
  current: number;
  target: number;
  period: string;
  daysRemaining: number;
  requiredDaily: number;
}

const EnhancedDashboard: React.FC = () => {
  const { paywalls, customers } = useAppData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const { 
    stats, 
    revenueData, 
    topPaywalls, 
    customerData, 
    loading, 
    error, 
    refreshAnalytics,
    setTimeRange: hookSetTimeRange 
  } = useAnalytics();
  
  // Mock data for initial state and error fallbacks
  const mockStats = {
    totalRevenue: 12450,
    totalSales: 127,
    totalVisitors: 2450,
    conversionRate: 5.2,
    avgOrderValue: 98.03,
    activePaywalls: 5,
    recentPayments: 12,
    totalCustomers: 892,
  };
  
  const mockRevenueData = Array.from({ length: 30 }, (_, i) => ({
    name: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.floor(Math.random() * 1000) + 200
  }));
  
  const mockTopPaywalls = [
    {
      id: '1',
      name: 'Premium Content Package',
      revenue: 4500,
      sales: 45,
      conversionRate: 8.5
    },
    {
      id: '2',
      name: 'Basic Subscription',
      revenue: 3200,
      sales: 64,
      conversionRate: 6.2
    },
    {
      id: '3',
      name: 'One-time Purchase',
      revenue: 2800,
      sales: 28,
      conversionRate: 5.1
    },
    {
      id: '4',
      name: 'Service Package',
      revenue: 1200,
      sales: 18,
      conversionRate: 4.7
    },
    {
      id: '5',
      name: 'Digital Download',
      revenue: 750,
      sales: 12,
      conversionRate: 3.9
    }
  ];
  
  const mockRecentTransactions = Array.from({ length: 10 }, (_, i) => ({
    customerName: `Customer ${i + 1}`,
    customerEmail: `customer${i + 1}@example.com`,
    contentTitle: 'Premium Content',
    amount: 49.99 + (i * 5),
    date: new Date(Date.now() - (i * 86400000)).toISOString(),
    status: 'Completed'
  }));
  const [filteredRevenueData, setFilteredRevenueData] = useState<{ name: string; value: number }[]>(
    []
  );
  const [revenueGoal, setRevenueGoal] = useState<RevenueGoal | null>(null);
  const [timeoutError, setTimeoutError] = useState<string | null>(null);

  // Calculate revenue goal data
  useEffect(() => {
    const dataToUse = revenueData && revenueData.length > 0 ? revenueData : mockRevenueData;
    if (stats || (!stats && dataToUse)) {
      // For demo purposes, let's set a monthly goal of $5000
      const monthlyTarget = 5000;
      const currentMonthRevenue = dataToUse.reduce((sum, item) => sum + (item.value || 0), 0);
      const daysInMonth = new Date().getDate();
      const daysRemaining = new Date().getDate() - daysInMonth; // Actually days passed in month
      const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - daysInMonth;
      const requiredDaily = daysLeft > 0 ? (monthlyTarget - currentMonthRevenue) / daysLeft : 0;

      setRevenueGoal({
        current: currentMonthRevenue,
        target: monthlyTarget,
        period: 'This Month',
        daysRemaining: daysLeft,
        requiredDaily
      });
    }
  }, [stats, revenueData]);

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
  const formatPercentage = (value?: number): string => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      hookSetTimeRange('custom', customStartDate, customEndDate);
    } else {
      refreshAnalytics();
    }
  };

  // Convert data for charts when revenueData changes
  useEffect(() => {
    // Use actual data if available, otherwise use mock data
    const dataToUse = revenueData && revenueData.length > 0 ? revenueData : mockRevenueData;
    
    if (dataToUse.length > 0) {
      // Check if we have daily data or monthly data
      if (dataToUse && dataToUse.length > 0 && dataToUse[0] && 'date' in dataToUse[0]) {
        // Daily data
        const dailyData = dataToUse as any[]; // Simplified for this example
        const revenueChartData = dailyData.map(item => ({
          name: item.date || item.month,
          value: item.revenue,
        }));
        setFilteredRevenueData(revenueChartData);
      } else {
        // Monthly data or using mock data
        const monthlyData = dataToUse as { month: string; revenue: number }[] | { name: string; value: number }[];
        const revenueChartData = monthlyData.map(item => ({
          name: 'name' in item ? item.name : item.month,
          value: 'value' in item ? item.value : item.revenue,
        }));
        setFilteredRevenueData(revenueChartData);
      }
    }
  }, [revenueData]);

  // Calculate conversion rate
  const calculateConversionRate = () => {
    if (!stats) return mockStats.conversionRate;
    // In a real app, this would be calculated from actual data
    // For now, we'll use a realistic calculation based on the data we have
    return stats.totalVisitors && stats.totalVisitors > 0 && stats.totalSales !== undefined ? (stats.totalSales / stats.totalVisitors) * 100 : mockStats.conversionRate;
  };

  const headerActions = (
    <div className="flex space-x-3">
      <Link to="/create-paywall">
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Create New Paywall
        </button>
      </Link>
      <Link to="/upload">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
          Upload Content
        </button>
      </Link>
    </div>
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

            {/* Quick Actions Panel */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/create-paywall" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-lg dark:bg-indigo-900/30">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Paywall</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Set up a new paywall for your content</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/upload" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg dark:bg-green-900/30">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Content</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add new content to your library</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/analytics" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg dark:bg-blue-900/30">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">View All Analytics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">See detailed performance reports</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Revenue"
                value={stats && stats.totalRevenue !== undefined ? formatCurrency(stats.totalRevenue) : formatCurrency(mockStats.totalRevenue)}
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
                change={(stats && stats.totalRevenue > 0) || mockStats.totalRevenue > 0 ? "12.5%" : "0%"}
                changeType="positive"
              />

              <StatsCard
                title="Total Sales"
                value={stats && stats.totalSales ? stats.totalSales.toString() : mockStats.totalSales.toString()}
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
                change={(stats && stats.totalSales > 0) || mockStats.totalSales > 0 ? "8.2%" : "0%"}
                changeType="positive"
              />

              <StatsCard
                title="Conversion Rate"
                value={formatPercentage(calculateConversionRate() || 0)}
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
                change={((calculateConversionRate() || 0) > 0) || mockStats.conversionRate > 0 ? "3.1%" : "0%"}
                changeType="positive"
              />

              <StatsCard
                title="Active Paywalls"
                value={stats && stats.activePaywalls ? stats.activePaywalls.toString() : mockStats.activePaywalls.toString()}
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
                change={(stats && stats.activePaywalls > 0) || mockStats.activePaywalls > 0 ? "2" : "0"}
                changeType="positive"
              />
            </div>

            {/* Revenue Goals Tracker */}
            <div className="mb-8 bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Goals</h3>
                {revenueGoal && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {revenueGoal.daysRemaining} days remaining
                  </span>
                )}
              </div>
              
              {revenueGoal ? (
                <>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatCurrency(revenueGoal.current)} of {formatCurrency(revenueGoal.target)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {Math.round((revenueGoal.current / revenueGoal.target) * 100)}% Complete
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4 dark:bg-gray-700">
                    <div 
                      className="bg-indigo-600 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, (revenueGoal.current / revenueGoal.target) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    You need to earn {formatCurrency(revenueGoal.requiredDaily)} per day to reach your goal
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Loading goal information...
                </div>
              )}
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
                    onChange={e => {
                      const newTimeRange = e.target.value as 'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom';
                      setTimeRange(newTimeRange);
                      hookSetTimeRange(newTimeRange, customStartDate, customEndDate);
                    }}
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

            {/* Recent Transactions */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
                <Link
                  to="/payments"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                {loading.any ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-600 dark:text-red-400">
                    Error loading transactions: {error}
                  </div>
                ) : (!stats || stats.recentPayments === 0) ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No recent transactions found
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
                            Customer
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Content
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                          >
                            Date
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
                        {Array.from({ length: Math.min(10, stats?.recentPayments || mockStats.recentPayments) }).map((_, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Customer {index + 1}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                customer{index + 1}@example.com
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                Premium Content
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(49.99 + (index * 5))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(Date.now() - (index * 86400000)).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Completed
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
                  {Array.from({ length: Math.min(5, stats?.recentPayments || mockStats.recentPayments) }).map((_, index) => (
                    <div
                      key={index}
                      className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Customer {index + 1}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Premium Content
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(49.99 + (index * 5))}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(Date.now() - (index * 86400000)).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Content */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Performing Content</h3>
                <Link
                  to="/content"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                {(!topPaywalls || !Array.isArray(topPaywalls) || topPaywalls.length === 0) ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No top performing content found
                  </div>
                ) : loading ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Loading top performing content...
                  </div>
                ) : (
                  <div>
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
                              CTR
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                          {(topPaywalls && Array.isArray(topPaywalls) && topPaywalls.length > 0 ? topPaywalls : mockTopPaywalls).map((paywall, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {paywall.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Paywall
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {paywall.sales}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(paywall.revenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {paywall.conversionRate.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile view */}
                    <div className="md:hidden">
                      {(topPaywalls && Array.isArray(topPaywalls) && topPaywalls.length > 0 ? topPaywalls : mockTopPaywalls).map((paywall, index) => (
                        <div
                          key={index}
                          className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {paywall.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Paywall
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
                            <span className="text-gray-500 dark:text-gray-400">
                              CTR: {paywall.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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