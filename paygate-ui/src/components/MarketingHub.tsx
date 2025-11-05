import React, { useState } from 'react';
import Header from './Header';
import DiscountManager from './DiscountManager';
import AffiliateManager from './AffiliateManager';
import SocialShare from './SocialShare';
import EmailCampaignManager from './EmailCampaignManager';
import LandingPageManager from './LandingPageManager';
import ABTestManager from './ABTestManager';
import UTMLinkBuilder from './UTMLinkBuilder';
import PromotionalCampaigns from './PromotionalCampaigns';

const MarketingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discounts');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Marketing Hub" subtitle="Promote your content and grow your audience" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('discounts')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'discounts'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Discounts
                </button>
                <button
                  onClick={() => setActiveTab('affiliates')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'affiliates'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Affiliates
                </button>
                <button
                  onClick={() => setActiveTab('social')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'social'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Social Sharing
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'email'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Email Campaigns
                </button>
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'landing'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Landing Pages
                </button>
                <button
                  onClick={() => setActiveTab('abtest')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'abtest'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  A/B Testing
                </button>
                <button
                  onClick={() => setActiveTab('utm')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'utm'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  UTM Links
                </button>
                <button
                  onClick={() => setActiveTab('promotions')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'promotions'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  Promotions
                </button>
              </nav>
            </div>

            {activeTab === 'discounts' && <DiscountManager />}
            {activeTab === 'affiliates' && <AffiliateManager />}
            {activeTab === 'social' && (
              <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-6 dark:text-white">
                  Social Sharing Tools
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
                      Share Your Profile
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                      Share your creator profile to attract more followers and customers.
                    </p>
                    <SocialShare
                      url="https://paygate.example.com/creator/johndoe"
                      title="Check out my content on PayGate"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
                      Share a Specific Paywall
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                      Share individual paywalls to promote specific content.
                    </p>
                    <div className="space-y-4">
                      <select className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Select a paywall to share</option>
                        <option>E-book: React Fundamentals</option>
                        <option>Video Course: Advanced TypeScript</option>
                        <option>Template Pack: Landing Pages</option>
                      </select>
                      <SocialShare
                        url="https://paygate.example.com/p/1"
                        title="E-book: React Fundamentals"
                      />
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
                        Social Media Tips
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Share content when your audience is most active</li>
                          <li>Include high-quality visuals with your posts</li>
                          <li>Engage with comments to build relationships</li>
                          <li>Use relevant hashtags to increase discoverability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'email' && <EmailCampaignManager />}
            {activeTab === 'landing' && <LandingPageManager />}
            {activeTab === 'abtest' && <ABTestManager />}
            {activeTab === 'utm' && <UTMLinkBuilder />}
            {activeTab === 'promotions' && <PromotionalCampaigns />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketingHub;
