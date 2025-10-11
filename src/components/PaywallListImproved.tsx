import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Paywall } from '../services/paywallService';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

interface PaywallListProps {
  paywalls: Paywall[];
}

const PaywallList: React.FC<PaywallListProps> = ({ paywalls }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'sales' | 'revenue'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedPaywalls = paywalls
    .filter(
      paywall =>
        paywall.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paywall.description &&
          paywall.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'sales':
          comparison = a.sales - b.sales;
          break;
        case 'revenue':
          comparison = a.revenue - b.revenue;
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (filteredAndSortedPaywalls.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center dark:bg-gray-800 dark:shadow-gray-900/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          No paywalls found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new paywall.
        </p>
        <div className="mt-6">
          <Link
            to="/create-paywall"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
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
            Create Paywall
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      {/* Header with controls */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Your Paywalls
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all your content paywalls
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-4 flex space-x-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Search paywalls..."
              />
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {viewMode === 'grid' ? (
                <>
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  List
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Grid
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredAndSortedPaywalls.map(paywall => (
            <div
              key={paywall.id}
              className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <Link
                    to={`/paywall/${paywall.id}`}
                    className="text-lg font-medium text-indigo-600 hover:text-indigo-900 truncate dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {paywall.title}
                  </Link>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                    {paywall.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {CURRENCY_SYMBOLS[paywall.currency || '']}
                      {paywall.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{paywall.sales}</span> sales
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Revenue</span>
                    <span className="font-medium">
                      {CURRENCY_SYMBOLS[paywall.currency || '']}
                      {paywall.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Created</span>
                    <span>{new Date(paywall.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/paywall/${paywall.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAndSortedPaywalls.map(paywall => (
            <li key={paywall.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/paywall/${paywall.id}`}
                    className="text-sm font-medium text-indigo-600 truncate hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {paywall.title}
                  </Link>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 truncate dark:text-gray-400">
                      {paywall.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                    <span className="mr-4 font-bold text-lg text-gray-900 dark:text-white">
                      {CURRENCY_SYMBOLS[paywall.currency || '']}
                      {paywall.price.toFixed(2)}
                    </span>
                    <span>{paywall.sales} sales</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(paywall.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Revenue:{' '}
                    <span className="font-medium">
                      {CURRENCY_SYMBOLS[paywall.currency || '']}
                      {paywall.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaywallList;
