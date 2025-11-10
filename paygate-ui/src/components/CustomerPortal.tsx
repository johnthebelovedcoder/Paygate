import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface PurchaseHistoryItem {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: 'completed' | 'refunded' | 'expired';
  accessExpiry?: string;
}

interface SubscriptionItem {
  id: string;
  name: string;
  nextBilling: string;
  amount: number;
  status: 'active' | 'cancelled' | 'past_due';
}

const CustomerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'subscriptions' | 'account'>('purchases');
  const [email, setEmail] = useState('customer@example.com');
  const [name, setName] = useState(user?.full_name || user?.name || '');

  // Mock purchase history data
  const purchaseHistory: PurchaseHistoryItem[] = [
    {
      id: '1',
      title: 'Premium Content Access',
      date: 'October 15, 2025',
      amount: 19.99,
      status: 'completed',
      accessExpiry: 'October 15, 2026'
    },
    {
      id: '2',
      title: 'Advanced Techniques Guide',
      date: 'September 22, 2025',
      amount: 29.99,
      status: 'completed'
    },
    {
      id: '3',
      title: 'Resource Bundle',
      date: 'August 10, 2025',
      amount: 14.99,
      status: 'expired'
    }
  ];

  // Mock subscription data
  const subscriptions: SubscriptionItem[] = [
    {
      id: 'sub-1',
      name: 'Monthly Premium',
      nextBilling: 'November 15, 2025',
      amount: 9.99,
      status: 'active'
    },
    {
      id: 'sub-2',
      name: 'Annual Plan',
      nextBilling: 'December 1, 2025',
      amount: 99.99,
      status: 'active'
    }
  ];

  const handleSaveAccount = () => {
    // Handle account update logic here
    console.log('Account updated:', { name, email });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* Portal Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Portal</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your purchases, subscriptions, and account settings
            </p>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Navigation Sidebar */}
            <div className="w-full md:w-64 border-r border-gray-200 dark:border-gray-700">
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('purchases')}
                      className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'purchases'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Purchase History
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('subscriptions')}
                      className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'subscriptions'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Subscriptions
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('account')}
                      className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'account'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account Settings
                      </div>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6">
              {/* Purchase History Tab */}
              {activeTab === 'purchases' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Purchase History</h2>
                  </div>

                  <div className="bg-white dark:bg-gray-700 shadow overflow-hidden rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {purchaseHistory.map((purchase) => (
                        <li key={purchase.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                {purchase.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {purchase.date} • {purchase.id}
                              </p>
                              {purchase.accessExpiry && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Access expires: {purchase.accessExpiry}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                purchase.status === 'completed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
                                  : purchase.status === 'refunded' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                              }`}>
                                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                              </span>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${purchase.amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                              Download
                            </button>
                            <button className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                              Receipt
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Subscriptions Tab */}
              {activeTab === 'subscriptions' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
                  </div>

                  <div className="bg-white dark:bg-gray-700 shadow overflow-hidden rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {subscriptions.map((sub) => (
                        <li key={sub.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                {sub.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Next billing: {sub.nextBilling}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sub.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
                                  : sub.status === 'cancelled' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                              }`}>
                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                              </span>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${sub.amount.toFixed(2)}/mo
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500">
                              Manage
                            </button>
                            {sub.status === 'active' && (
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Cancel
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Access Renewal Options */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Access Renewal Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Monthly</h4>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$9.99<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
                        <button className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Renew
                        </button>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Quarterly</h4>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$26.97<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/3mo</span></p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Save 10%</p>
                        <button className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Renew
                        </button>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300">
                            Most Popular
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mt-2">Annual</h4>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$99.99<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/yr</span></p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Save 17%</p>
                        <button className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Renew
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="bg-white dark:bg-gray-700 shadow rounded-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              id="password"
                              placeholder="••••••••"
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Leave blank to keep current password
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            onClick={handleSaveAccount}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-white dark:bg-gray-700 shadow rounded-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Payment Method</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Current Payment Method
                            </label>
                            <div className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                              <div className="flex-shrink-0">
                                <div className="h-6 w-10 bg-gray-800 rounded-md flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">CC</span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">•••• •••• •••• 1234</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Expires 05/2028</p>
                              </div>
                            </div>
                          </div>
                          
                          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500">
                            Update Payment Method
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 shadow rounded-md p-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Actions</h3>
                        
                        <div className="space-y-3">
                          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500">
                            Download Account Data
                          </button>
                          
                          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;