import React, { useState } from 'react';
import type { Paywall } from '../services/paywallService';
import paywallService from '../services/paywallService';
import { useAppData } from '../contexts/AppDataContext';

interface AccessSettingsProps {
  paywall: Paywall;
  onClose: () => void;
}

const AccessSettings: React.FC<AccessSettingsProps> = ({ paywall, onClose }) => {
  const { paywalls } = useAppData();
  const [settings, setSettings] = useState({
    downloadLimit: paywall.sales || 0, // Using sales as a placeholder
    expirationDays: 30,
    customerRestrictions: [] as string[],
  });
  const [newRestriction, setNewRestriction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, we would save these settings to the backend
      // For now, we'll just simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the paywall with new settings
      await paywallService.updatePaywall(paywall.id, {
        ...paywall,
      });

      paywalls.refreshPaywalls();
      onClose();
    } catch (err) {
      const error = err as Error;
      console.error('Error saving access settings:', error);
      setError(error.message || 'Failed to save access settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestriction = () => {
    if (newRestriction.trim() && !settings.customerRestrictions.includes(newRestriction.trim())) {
      setSettings(prev => ({
        ...prev,
        customerRestrictions: [...prev.customerRestrictions, newRestriction.trim()],
      }));
      setNewRestriction('');
    }
  };

  const handleRemoveRestriction = (restriction: string) => {
    setSettings(prev => ({
      ...prev,
      customerRestrictions: prev.customerRestrictions.filter(r => r !== restriction),
    }));
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl dark:bg-gray-800">
              <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Access Settings
                  </h2>
                  <button
                    type="button"
                    className="ml-3 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Download Limits
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Set limits on how many times customers can download your content.
                      </p>
                      <div className="mt-4">
                        <label
                          htmlFor="downloadLimit"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Maximum downloads per customer
                        </label>
                        <input
                          type="number"
                          id="downloadLimit"
                          min="0"
                          value={settings.downloadLimit}
                          onChange={e =>
                            setSettings({
                              ...settings,
                              downloadLimit: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Expiration
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Set how long customers have access to your content.
                      </p>
                      <div className="mt-4">
                        <label
                          htmlFor="expirationDays"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Access expires after (days)
                        </label>
                        <input
                          type="number"
                          id="expirationDays"
                          min="1"
                          value={settings.expirationDays}
                          onChange={e =>
                            setSettings({
                              ...settings,
                              expirationDays: parseInt(e.target.value) || 30,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Customer Restrictions
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Restrict access to specific customers or email domains.
                      </p>
                      <div className="mt-4">
                        <div className="flex">
                          <input
                            type="text"
                            value={newRestriction}
                            onChange={e => setNewRestriction(e.target.value)}
                            placeholder="Email or domain (e.g., user@example.com or @company.com)"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddRestriction}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-500"
                          >
                            Add
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {settings.customerRestrictions.map(restriction => (
                            <span
                              key={restriction}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
                            >
                              {restriction}
                              <button
                                type="button"
                                onClick={() => handleRemoveRestriction(restriction)}
                                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white dark:text-indigo-300 dark:hover:bg-indigo-800 dark:hover:text-indigo-200"
                              >
                                <span className="sr-only">Remove</span>
                                <svg
                                  className="h-2 w-2"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 8 8"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeWidth="1.5"
                                    d="M1 1l6 6m0-6L1 7"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 py-4 px-4 sm:px-6 dark:border-gray-700">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-900">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      loading
                        ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-600'
                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessSettings;
