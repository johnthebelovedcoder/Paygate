import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import ContentLibrary from './ContentLibrary';
import DragDropContentManager from './DragDropContentManager';
import ContentToPaywallWorkflow from './ContentToPaywallWorkflow';
import StorageUsage from './StorageUsage';
import ContentProtection from './ContentProtection';
import UploadInterface from './UploadInterface';
import LinkManagement from './LinkManagement';
import ContentAnalytics from './ContentAnalytics';
import { useAppData } from '../contexts/AppDataContext';
import ErrorBoundary from './ErrorBoundary';

import { PLANS } from '../config/plans';

const ContentManagementDashboard: React.FC = () => {
  const { content } = useAppData();
  const [activeTab, setActiveTab] = useState('library');
  const plan = PLANS.professional; // Assuming the user is on the professional plan
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    limit: plan.storage,
    percentage: 0,
  });

  // Calculate storage usage
  React.useEffect(() => {
    if (content.content && Array.isArray(content.content) && content.content.length > 0) {
      const totalUsed = content.content.reduce((total, item) => {
        if (item && item.size) {
          // Add null check for item
          // Parse size string like "2.5 MB" to get numeric value
          const sizeMatch = item.size.match(/([\d.]+)\s*(MB|GB|KB)/i);
          if (sizeMatch) {
            const value = parseFloat(sizeMatch?.[1] || '0');
            const unit = sizeMatch?.[2]?.toUpperCase() || '';

            switch (unit) {
              case 'KB':
                return total + value / 1024;
              case 'GB':
                return total + value * 1024;
              default: // MB
                return total + value;
            }
          }
        }
        return total;
      }, 0);

      const percentage = Math.min((totalUsed / storageUsage.limit) * 100, 100);

      setStorageUsage({
        used: totalUsed,
        limit: storageUsage.limit,
        percentage,
      });
    }
  }, [content.content]);

  const headerActions = (
    <div className="flex space-x-3">
      <Link to="/create-paywall">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
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
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Content Management"
        subtitle="Organize and protect your digital assets"
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
                    Content Library
                  </button>
                  <button
                    onClick={() => setActiveTab('dragdrop')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'dragdrop'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Content Manager (Drag & Drop)
                  </button>
                  <button
                    onClick={() => setActiveTab('paywall-workflow')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'paywall-workflow'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Content to Paywall
                  </button>
                  <button
                    onClick={() => setActiveTab('storage')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'storage'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Storage Usage
                  </button>
                  <button
                    onClick={() => setActiveTab('protection')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'protection'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Content Protection
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
                    onClick={() => setActiveTab('links')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'links'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Link Management
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analytics'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Content Analytics
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
              {activeTab === 'library' && (
                <ErrorBoundary>
                  <ContentLibrary />
                </ErrorBoundary>
              )}
              {activeTab === 'dragdrop' && <DragDropContentManager />}
              {activeTab === 'paywall-workflow' && <ContentToPaywallWorkflow />}
              {activeTab === 'storage' && <StorageUsage storageUsage={storageUsage} plan={plan} />}
              {activeTab === 'protection' && <ContentProtection />}
              {activeTab === 'upload' && <UploadInterface />}
              {activeTab === 'links' && <LinkManagement />}
              {activeTab === 'analytics' && (
                <ErrorBoundary>
                  <ContentAnalytics contentItems={content.content} />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentManagementDashboard;
