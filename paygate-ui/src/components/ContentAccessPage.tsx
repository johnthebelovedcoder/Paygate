import React from 'react';
import { useParams } from 'react-router-dom';

interface PurchaseData {
  id: string;
  title: string;
  purchaseDate: string;
  accessExpiry?: string;
  downloadLinks: {
    name: string;
    url: string;
    size: string;
  }[];
  instructions: string[];
  relatedContent: {
    id: string;
    title: string;
    price: number;
  }[];
}

const ContentAccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock purchase data - in a real implementation, this would come from an API
  const purchaseData: PurchaseData = {
    id,
    title: 'Premium Content Access',
    purchaseDate: 'October 28, 2025',
    accessExpiry: 'October 28, 2026', // Optional: null if content doesn't expire
    downloadLinks: [
      {
        name: 'Complete Content Package.zip',
        url: '#',
        size: '1.5 GB'
      },
      {
        name: 'Video Tutorials.mp4',
        url: '#',
        size: '850 MB'
      },
      {
        name: 'Resource Guide.pdf',
        url: '#',
        size: '15 MB'
      }
    ],
    instructions: [
      'Download the content to your device',
      'Access anytime with the included license key',
      'Contact support if you encounter any issues',
      'Check for updates in your account portal'
    ],
    relatedContent: [
      {
        id: '1',
        title: 'Advanced Techniques Guide',
        price: 29.99
      },
      {
        id: '2',
        title: 'Exclusive Video Series',
        price: 39.99
      },
      {
        id: '3',
        title: 'Resource Bundle',
        price: 19.99
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Confirmation Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Purchase Successful!
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your purchase. Your access to '{purchaseData.title}' is now active.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your purchase was completed on {purchaseData.purchaseDate}. {purchaseData.accessExpiry 
                      ? `Access expires on ${purchaseData.accessExpiry}.` 
                      : 'Access is permanent.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download/Access Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Access Your Content</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {purchaseData.downloadLinks.map((link, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{link.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{link.size}</p>
                    </div>
                    <div className="ml-4">
                      <a 
                        href={link.url} 
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Access Instructions</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {purchaseData.instructions.map((instruction, index) => (
                  <li key={index} className="ml-4">{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Purchase Receipt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Purchase Receipt</h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Order ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">#{purchaseData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{purchaseData.purchaseDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Amount</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">$19.99</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a 
                href="#" 
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium inline-flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </a>
            </div>
          </div>
        </div>

        {/* Related Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {purchaseData.relatedContent.map((content) => (
                <div key={content.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{content.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Recommended for you based on your purchase</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${content.price.toFixed(2)}</span>
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Support */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Contact Support</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Having trouble accessing your content? Contact our support team.
                </p>
                <div className="mt-2">
                  <a 
                    href="mailto:support@paygate.com" 
                    className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    support@paygate.com
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAccessPage;