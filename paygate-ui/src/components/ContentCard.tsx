import React from 'react';

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  type: string;
  isProtected: boolean;
  price?: number;
  currency?: string;
  createdAt: string;
  onToggleProtection: (id: string, isProtected: boolean) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  description,
  type,
  isProtected,
  price,
  currency,
  createdAt,
  onToggleProtection,
}) => {
  const handleToggleProtection = () => {
    onToggleProtection(id, !isProtected);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{description}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {type}
            </span>
            <span className="ml-2">{new Date(createdAt).toLocaleDateString()}</span>
            {price && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {currency || 'NGN'}
                {price}
              </span>
            )}
          </div>
        </div>
        <div className="ml-3 flex flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isProtected
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isProtected ? 'Protected' : 'Public'}
          </span>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleToggleProtection}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${
            isProtected
              ? 'text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
              : 'text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isProtected ? 'Unprotect' : 'Protect'}
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
