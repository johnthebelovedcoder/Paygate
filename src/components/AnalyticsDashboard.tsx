import React, { useState, useEffect } from 'react';
import Header from './Header';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Define TypeScript interfaces
interface RevenueData {
  date: string;
  revenue: number;
}

interface TrafficData {
  date: string;
  visitors: number;
  pageviews: number;
}

interface ConversionData {
  date: string;
  conversions: number;
  visitors: number;
}

interface PaywallData {
  name: string;
  earnings: number;
  sales: number;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  paywallId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<
    'this_week' | 'this_month' | 'this_year' | 'last_year' | 'custom'
  >('this_month');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Header actions
  const headerActions = (
    <div className="flex space-x-3">
      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
        Export Report
      </button>
    </div>
  );

  // Simulate data loading
  useEffect(() => {
    // Simulate API loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock data - in a real app, this would come from the useAppData hook
  const revenueData: RevenueData[] = [
    { date: 'Jan', revenue: 4000 },
    { date: 'Feb', revenue: 3000 },
    { date: 'Mar', revenue: 2000 },
    { date: 'Apr', revenue: 2780 },
    { date: 'May', revenue: 1890 },
    { date: 'Jun', revenue: 2390 },
  ];

  const trafficData: TrafficData[] = [
    { date: 'Mon', visitors: 2400, pageviews: 4300 },
    { date: 'Tue', visitors: 1398, pageviews: 3210 },
    { date: 'Wed', visitors: 9800, pageviews: 5672 },
    { date: 'Thu', visitors: 3908, pageviews: 7231 },
    { date: 'Fri', visitors: 4800, pageviews: 6231 },
    { date: 'Sat', visitors: 3800, pageviews: 5231 },
    { date: 'Sun', visitors: 4300, pageviews: 6931 },
  ];

  const conversionData: ConversionData[] = [
    { date: 'Mon', conversions: 5, visitors: 240 },
    { date: 'Tue', conversions: 3, visitors: 140 },
    { date: 'Wed', conversions: 8, visitors: 980 },
    { date: 'Thu', conversions: 4, visitors: 390 },
    { date: 'Fri', conversions: 6, visitors: 480 },
    { date: 'Sat', conversions: 3, visitors: 380 },
    { date: 'Sun', conversions: 5, visitors: 430 },
  ];

  const paywallData: PaywallData[] = [
    { name: 'Ebook', earnings: 4400, sales: 24 },
    { name: 'Course', earnings: 2600, sales: 13 },
    { name: 'Video', earnings: 1200, sales: 8 },
    { name: 'Template', earnings: 1890, sales: 12 },
    { name: 'Tool', earnings: 1500, sales: 7 },
  ];

  const recentPaymentsData: Payment[] = [
    {
      id: '1',
      amount: 29.99,
      currency: 'USD',
      status: 'completed',
      createdAt: '2023-01-15',
      paywallId: '1',
    },
    {
      id: '2',
      amount: 49.99,
      currency: 'USD',
      status: 'completed',
      createdAt: '2023-01-14',
      paywallId: '2',
    },
    {
      id: '3',
      amount: 19.99,
      currency: 'USD',
      status: 'pending',
      createdAt: '2023-01-14',
      paywallId: '3',
    },
    {
      id: '4',
      amount: 99.99,
      currency: 'USD',
      status: 'completed',
      createdAt: '2023-01-13',
      paywallId: '1',
    },
    {
      id: '5',
      amount: 14.99,
      currency: 'USD',
      status: 'failed',
      createdAt: '2023-01-12',
      paywallId: '4',
    },
  ];

  // Calculate summary statistics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalVisitors = trafficData.reduce((sum, item) => sum + item.visitors, 0);
  const totalConversions = conversionData.reduce((sum, item) => sum + item.conversions, 0);
  const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
  const totalSales = paywallData.reduce((sum, item) => sum + item.sales, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Analytics Dashboard"
          subtitle="Comprehensive analytics and insights"
          actions={headerActions}
        />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Analytics Dashboard"
        subtitle="Comprehensive analytics and insights"
        actions={headerActions}
      />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3 dark:bg-indigo-600">
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
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Revenue
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            ${totalRevenue.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3 dark:bg-green-600">
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
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Visitors
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {totalVisitors.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3 dark:bg-blue-600">
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
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Conversion Rate
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {conversionRate.toFixed(2)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3 dark:bg-purple-600">
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Sales
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {totalSales}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div>
                <label
                  htmlFor="time-range"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                >
                  Time Range
                </label>
                <select
                  id="time-range"
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
              </div>
              {timeRange === 'custom' && (
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      value={customDateRange?.start || ''}
                      onChange={e =>
                        setCustomDateRange(prev =>
                          prev
                            ? { ...prev, start: e.target.value }
                            : { start: e.target.value, end: '' }
                        )
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      value={customDateRange?.end || ''}
                      onChange={e =>
                        setCustomDateRange(prev =>
                          prev
                            ? { ...prev, end: e.target.value }
                            : { start: '', end: e.target.value }
                        )
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white p-6 shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  Revenue Over Time
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Traffic Chart */}
              <div className="bg-white p-6 shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  Traffic Overview
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#8884d8" name="Visitors" />
                      <Bar dataKey="pageviews" fill="#82ca9d" name="Page Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Conversion Rate Chart */}
              <div className="bg-white p-6 shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  Conversion Rate
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={value => [`${value} conversions`, 'Conversions']} />
                      <Line
                        type="monotone"
                        dataKey="conversions"
                        stroke="#00C49F"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performers Chart */}
              <div className="bg-white p-6 shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  Top Performing Paywalls
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paywallData.map(item => ({ name: item.name, value: item.earnings }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : '0'}%`
                        }
                      >
                        {paywallData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={value => [`$${value}`, 'Earnings']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Recent Payments
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Latest transactions on your paywalls
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          ID
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
                          Status
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
                          Paywall
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {recentPaymentsData.map(payment => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {payment.currency}
                            {payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {payment.paywallId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
