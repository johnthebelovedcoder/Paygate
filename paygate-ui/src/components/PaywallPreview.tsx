import React from 'react';

import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

interface PaywallPreviewProps {
  title: string;
  description: string;
  price: number;
  currency?: string;
  fileCount?: number;
  urlCount?: number;
  thumbnailPreview?: string | null;
}

const PaywallPreview: React.FC<PaywallPreviewProps> = ({
  title,
  description,
  price,
  currency = '',
  fileCount = 0,
  urlCount = 0,
  thumbnailPreview = null,
}) => {
  console.log('PaywallPreview props:', {
    title,
    description,
    price,
    currency,
    fileCount,
    urlCount,
    thumbnailPreview,
  });

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const itemCount = fileCount + urlCount;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">Paywall Preview</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 dark:border-gray-600">
          {thumbnailPreview && (
            <div className="mb-4 flex justify-center">
              <img
                src={thumbnailPreview}
                alt="Paywall thumbnail"
                className="h-32 w-32 object-cover rounded-md shadow"
              />
            </div>
          )}
          <div className="text-center">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {title || 'Your Paywall Title'}
            </h4>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {description || 'Your paywall description will appear here'}
            </p>

            {itemCount > 0 && (
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {fileCount > 0 && (
                  <span>
                    {fileCount} file{fileCount !== 1 ? 's' : ''}
                  </span>
                )}
                {fileCount > 0 && urlCount > 0 && <span> and </span>}
                {urlCount > 0 && (
                  <span>
                    {urlCount} URL{urlCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                {currencySymbol}
                {price.toFixed(2)}
              </span>
            </div>
            <div className="mt-6">
              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                Purchase Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallPreview;
