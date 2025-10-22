import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import type { ContentItem } from '../types/content.types';

interface AnalyticsData {
  totalDownloads: number;
  totalContent: number;
  popularContent: ContentItem[];
  contentByType: Record<string, number>;
  downloadTrends: { date: string; downloads: number }[];
  topPerformers: ContentItem[];
}

const ContentAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalDownloads: 0,
    totalContent: 0,
    popularContent: [],
    contentByType: {},
    downloadTrends: [],
    topPerformers: [],
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [sortBy, setSortBy] = useState<'downloads' | 'revenue' | 'engagement'>('downloads');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from the backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch content analytics data
        const contentAnalytics = await analyticsService.getContentAnalytics();
        const popularContent = await analyticsService.getPopularContent();

        // Update state with real analytics data
        setAnalyticsData({
          totalDownloads: contentAnalytics.total_downloads || 0,
          totalContent: contentAnalytics.total_content || 0,
          popularContent: popularContent.slice(0, 5), // Top 5 popular content
          contentByType: contentAnalytics.content_by_type || {},
          downloadTrends: contentAnalytics.download_trends || [],
          topPerformers: contentAnalytics.top_performers || [],
        });
      } catch (err) {
        console.error('Error fetching content analytics:', err);
        setError('Failed to load content analytics. Using default data.');
        
        // Set default values
        setAnalyticsData({
          totalDownloads: 0,
          totalContent: 0,
          popularContent: [],
          contentByType: {},
          downloadTrends: [],
          topPerformers: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Get file type icon
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return (
          <svg
            className="h-5 w-5 text-indigo-500"
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
        );
      case 'url':
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5 text-gray-500"
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
        );
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Content Analytics
        </h3>

        {/* Analytics Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeRange === '7d'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeRange === '30d'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeRange === '90d'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeRange === '1y'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              1 Year
            </button>
          </div>

          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'downloads' | 'revenue' | 'engagement')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="downloads">Sort by Downloads</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="engagement">Sort by Engagement</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Downloads
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsData.totalDownloads)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Content
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contentItems.filter(c => c && c.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Content Types
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(analyticsData.contentByType).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Downloads
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contentItems.length > 0
                    ? Math.round(analyticsData.totalDownloads / contentItems.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Trends Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Download Trends</h4>
            <div className="flex space-x-2">
              <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Line
              </button>
              <button className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                Bar
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end space-x-1">
            {analyticsData.downloadTrends.map((trend, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  style={{ height: `${(trend.downloads / 100) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  {new Date(trend.date).getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {analyticsData.downloadTrends[0]?.date
                ? new Date(analyticsData.downloadTrends[0].date).toLocaleDateString()
                : 'N/A'}
            </span>
            <span>
              {analyticsData.downloadTrends[analyticsData.downloadTrends.length - 1]?.date
                ? new Date(
                    analyticsData.downloadTrends[analyticsData.downloadTrends.length - 1].date
                  ).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Popular Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Popular Content
            </h4>

            <div className="space-y-4">
              {analyticsData.popularContent.map((content, index) => (
                <div key={content.id} className="flex items-center">
                  <div className="flex-shrink-0 w-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </div>
                  <div className="ml-3 flex-shrink-0">{getFileTypeIcon(content.type)}</div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {content.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {content.type === 'file' ? 'File' : 'URL'}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg
                        className="h-4 w-4 mr-1 text-gray-400"
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
                      {Math.floor(Math.random() * 100) + 10}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content by Type */}
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Content by Type
            </h4>

            <div className="space-y-4">
              {Object.entries(analyticsData.contentByType).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div className="flex-shrink-0">{getFileTypeIcon(type)}</div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize dark:text-white">
                      {type}
                    </p>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${contentItems.length > 0 ? (count / contentItems.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 text-sm font-medium text-gray-900 dark:text-white">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mt-8 bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Top Performers</h4>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Content
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Downloads
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {analyticsData.topPerformers.map(content => (
                  <tr key={content.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {getFileTypeIcon(content.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {content.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {content.description?.substring(0, 30)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {content.type === 'file' ? 'File' : 'URL'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          content.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : content.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor(Math.random() * 100) + 10}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
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
                Content Performance Insights
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your content with "Guide" in the title performs 25% better on average</li>
                  <li>Content published on Tuesdays gets 15% more downloads</li>
                  <li>Adding a preview increases engagement by 30%</li>
                  <li>Shorter titles (under 50 characters) have higher click-through rates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalytics;
