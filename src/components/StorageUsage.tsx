import React from 'react';
import { PLANS } from '../config/plans';

interface StorageUsageProps {
  storageUsage: {
    used: number;
    limit: number;
    percentage: number;
  };
  plan: (typeof PLANS)[keyof typeof PLANS];
}

const StorageUsage: React.FC<StorageUsageProps> = ({ storageUsage, plan }) => {
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Storage Usage</h3>

        {/* Storage Progress Bar */}
        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Storage Used
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {storageUsage.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className={`h-4 rounded-full ${getStorageColor(storageUsage.percentage)}`}
              style={{ width: `${storageUsage.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatBytes(storageUsage.used * 1024 * 1024)} used
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatBytes(storageUsage.limit * 1024 * 1024)} limit
            </span>
          </div>
        </div>

        {/* Plan Information */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
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
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Plan</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  You're currently on the <strong>{plan.name} Plan</strong> which includes{' '}
                  {plan.storage / 1000}GB of storage.
                </p>
                <p className="mt-1">
                  Need more space?{' '}
                  <a
                    href="#"
                    className="font-medium text-blue-900 underline hover:text-blue-800 dark:text-blue-100 dark:hover:text-blue-200"
                  >
                    Upgrade your plan
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Storage Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Documents</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBytes(storageUsage.used * 1024 * 1024 * 0.4)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">40% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Videos</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBytes(storageUsage.used * 1024 * 1024 * 0.35)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">35% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Other</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBytes(storageUsage.used * 1024 * 1024 * 0.25)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">25% of total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUsage;
