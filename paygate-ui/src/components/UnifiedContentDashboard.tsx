import React, { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import ContentLibrary from './ContentLibrary';
import UploadInterface from './UploadInterface';
import ContentAnalytics from './ContentAnalytics';
import type { ContentItem } from '../types/content.types';

const UnifiedContentDashboard: React.FC = () => {
  const { content: contentContext } = useAppData();
  const [activeTab, setActiveTab] = useState('library');
  const [protectedContent, setProtectedContent] = useState<ContentItem[]>([]);

  // Filter protected content (paywalls)
  useEffect(() => {
    if (contentContext.content) {
      const protectedContentItems = contentContext.content.filter(item => item.isProtected);
      setProtectedContent(protectedContentItems);
    }
  }, [contentContext.content]);

  const headerActions = (
    <div className="flex space-x-3">
      <button
        onClick={() => setActiveTab('upload')}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Upload Content
      </button>
      <button
        onClick={() => setActiveTab('create-paywall')}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Create Paywall
      </button>
    </div>
  );

  const Header = ({
    title,
    subtitle,
    actions,
  }: {
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
  }) => (
    <div className="bg-white shadow dark:bg-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate dark:text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
          {actions && <div className="mt-4 flex md:mt-0 md:ml-4">{actions}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Unified Content Management"
        subtitle="Manage all your content and paywalls in one place"
        actions={headerActions}
      />

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('library')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'library'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Content Library ({contentContext.content?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('protected')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'protected'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Protected Content ({protectedContent.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'upload'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Upload Content
                  </button>
                  <button
                    onClick={() => setActiveTab('create-paywall')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'create-paywall'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Create Paywall
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analytics'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Analytics
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              {activeTab === 'library' && <ContentLibrary />}
              {activeTab === 'protected' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Protected Content (Paywalls)
                  </h3>
                  <ContentLibrary filterType="protected" />
                </div>
              )}
              {activeTab === 'upload' && <UploadInterface />}
              {activeTab === 'create-paywall' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Create New Paywall
                  </h3>
                  <CreatePaywallInterface />
                </div>
              )}
              {activeTab === 'analytics' && (
                <ContentAnalytics contentItems={contentContext.content} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// CreatePaywallInterface component - allows users to create paywalls from existing content
const CreatePaywallInterface: React.FC = () => {
  const { content } = useAppData();
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('NGN');
  const [paywallTitle, setPaywallTitle] = useState<string>('');
  const [paywallDescription, setPaywallDescription] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const availableContent = content.content?.filter(item => !item.isProtected) || [];

  const handleCreatePaywall = async () => {
    if (!selectedContentId) {
      alert('Please select content to protect');
      return;
    }

    setIsCreating(true);

    try {
      // Update the selected content to be protected
      await content.updateContent(selectedContentId, {
        isProtected: true,
        price,
        currency,
        paywallTitle: paywallTitle || 'Protected Content',
        paywallDescription: paywallDescription || 'This content is protected by a paywall',
      });

      // Refresh the content list
      if (content.refreshContent) {
        await content.refreshContent();
      }

      alert('Paywall created successfully!');
      setSelectedContentId(null);
      setPrice(0);
      setPaywallTitle('');
      setPaywallDescription('');
    } catch (error) {
      console.error('Error creating paywall:', error);
      alert('Error creating paywall. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select Content to Protect
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="content-select"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
            >
              Select Content
            </label>
            <select
              id="content-select"
              value={selectedContentId || ''}
              onChange={e => setSelectedContentId(e.target.value || null)}
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Choose content...</option>
              {availableContent.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
          >
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="NGN">NGN (Nigerian Naira)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="GBP">GBP (British Pound)</option>
          </select>
        </div>

        <div className="mt-4">
          <label
            htmlFor="paywall-title"
            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
          >
            Paywall Title (Optional)
          </label>
          <input
            type="text"
            id="paywall-title"
            value={paywallTitle}
            onChange={e => setPaywallTitle(e.target.value)}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter paywall title"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="paywall-description"
            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
          >
            Paywall Description (Optional)
          </label>
          <textarea
            id="paywall-description"
            value={paywallDescription}
            onChange={e => setPaywallDescription(e.target.value)}
            rows={3}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter paywall description"
          />
        </div>

        <div className="mt-6">
          <button
            onClick={handleCreatePaywall}
            disabled={isCreating || !selectedContentId}
            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCreating || !selectedContentId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Paywall...
              </>
            ) : (
              'Create Paywall'
            )}
          </button>
        </div>
      </div>

      {selectedContentId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
          <h4 className="text-md font-medium text-blue-800 mb-2 dark:text-blue-200">
            Selected Content
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You are about to protect:{' '}
            {availableContent.find(c => c.id === selectedContentId)?.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default UnifiedContentDashboard;
