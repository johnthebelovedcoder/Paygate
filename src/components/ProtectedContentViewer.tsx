import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import accessService from '../services/accessService';
import contentService from '../services/contentService';
import { useAuth } from '../contexts/AuthContext';
import type { ContentItem } from '../types/content.types';

interface ProtectedContentViewerProps {
  contentId: string;
}

const ProtectedContentViewer: React.FC<ProtectedContentViewerProps> = ({ contentId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [accessStatus, setAccessStatus] = useState<
    'checking' | 'granted' | 'denied' | 'loading' | 'error'
  >('checking');
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadLimitReached, setDownloadLimitReached] = useState<boolean>(false);

  useEffect(() => {
    const loadContentAndCheckAccess = async () => {
      if (!contentId || !user) return;

      try {
        // Load content details
        const contentResponse = await contentService.getContentById(contentId);
        if (contentResponse.success && contentResponse.data) {
          setContent(contentResponse.data);
        }

        // Check if user has access to this content
        setAccessStatus('checking');
        const accessCheck = await accessService.checkContentAccess(contentId, user.id);

        if (accessCheck.hasAccess) {
          // User has access, get signed URL
          setAccessStatus('loading');
          try {
            const accessResponse = await accessService.getSignedContentUrl(contentId);
            if (accessResponse.success && accessResponse.accessUrl) {
              setAccessUrl(accessResponse.accessUrl);
              setAccessStatus('granted');

              // Track the access for analytics
              accessService.trackContentAccess(contentId, 'view');
            } else {
              throw new Error(accessResponse.message || 'Failed to get access URL');
            }
          } catch (accessError: any) {
            console.error('Error getting access URL:', accessError);
            if (accessError.message && accessError.message.includes('download limit')) {
              setDownloadLimitReached(true);
              setAccessStatus('denied');
            } else {
              setError(accessError.message || 'Failed to get access to content');
              setAccessStatus('error');
            }
          }
        } else {
          // User doesn't have access
          setAccessStatus('denied');
          setError(accessCheck.message || 'You do not have access to this content');
        }
      } catch (error: any) {
        console.error('Error loading content or checking access:', error);
        setError(error.message || 'Failed to load content');
        setAccessStatus('error');
      }
    };

    loadContentAndCheckAccess();
  }, [contentId, user]);

  const handleDownload = async () => {
    if (!accessUrl || !contentId) return;

    try {
      // Track the download for analytics
      await accessService.trackContentAccess(contentId, 'download');

      // Trigger download
      const link = document.createElement('a');
      link.href = accessUrl;
      link.download = content?.title || content?.filename || 'protected-content';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Error downloading content:', error);
      setError(error.message || 'Failed to download content');
    }
  };

  const handleViewOnline = () => {
    if (!accessUrl) return;

    // Open in new tab
    window.open(accessUrl, '_blank');
  };

  if (accessStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your access...</p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your content...</p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'granted' && accessUrl) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {content?.title || 'Protected Content'}
            </h2>

            {content?.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-6">{content.description}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleDownload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download Content
              </button>

              <button
                onClick={handleViewOnline}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg border border-gray-300 transition duration-200 flex items-center justify-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
                View Online
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your access to this content is secured and time-limited for your protection. The
                  download link will expire in 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (accessStatus === 'denied' || accessStatus === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-10 w-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              {downloadLimitReached ? 'Download Limit Reached' : 'Access Denied'}
            </h3>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {error ||
                (downloadLimitReached
                  ? 'You have reached your download limit for this content.'
                  : 'You do not have permission to access this content.')}
            </p>

            {!downloadLimitReached && (
              <div className="mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Back to Dashboard
                </button>
              </div>
            )}

            {downloadLimitReached && (
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Refresh Access
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProtectedContentViewer;
