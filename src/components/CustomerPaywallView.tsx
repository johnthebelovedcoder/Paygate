import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import paymentService from '../services/paymentService';
import paywallService from '../services/paywallService';
import type { Paywall } from '../services/paywallService';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

import { useToast } from '../contexts';

// Content type icons
const CONTENT_TYPE_ICONS: Record<string, string> = {
  file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  url: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
};

const CustomerPaywallView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paywall, setPaywall] = useState<Paywall | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess] = useState(false);
  const [isContentLocked] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchPaywall = async () => {
      if (!id) {
        setLoading(false);
        showToast({
          title: 'Error',
          message: 'Paywall ID is required to load this page.',
          type: 'error',
        });
        return;
      }

      try {
        console.log(`Fetching paywall with ID: ${id}`);
        // Try to fetch with authentication for draft paywalls
        const token = localStorage.getItem('token');
        const isPreview = window.location.search.includes('preview=true');

        const data = await paywallService.getCustomerPaywall(id, isPreview && !!token);
        setPaywall(data);
      } catch (error) {
        const err = error as Error;
        console.error('Error fetching paywall:', err);

        // More specific error messages based on error type
        let errorMessage = 'Failed to load paywall. Please try again later.';
        if (err.message.includes('not found')) {
          errorMessage = 'Paywall not found or may have been removed.';
        } else if (err.message.includes('restricted')) {
          errorMessage = 'This paywall is not currently available.';
        } else if (err.message.includes('Authentication')) {
          errorMessage = 'Please log in to access this paywall preview.';
        }

        showToast({
          title: 'Error',
          message: errorMessage,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaywall();
  }, [id, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !name) {
      showToast({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({
        title: 'Validation Error',
        message: 'Please enter a valid email address.',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (!id) {
        throw new Error('Paywall ID is required for payment');
      }

      if (!paywall) {
        throw new Error('Paywall data is not available');
      }

      // Create payment with Paystack (convert amount to kobo)
      const amountInKobo = Math.round(paywall.price * 100); // Convert to kobo
      const reference = `paygate_${Date.now()}_${id}`;

      const paymentRequest = {
        paywallId: id,
        amount: amountInKobo, // Amount in kobo
        currency: paywall.currency || 'NGN',
        customer_email: email,
        customer_name: name,
        payment_method: 'card',
        channel: 'card',
      };

      const response = await paymentService.createPayment(paymentRequest);

      if (response.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.authorization_url;
      } else {
        throw new Error(response.message || 'Failed to get payment authorization URL');
      }
    } catch (error) {
      const err = error as Error;
      console.error('Payment error:', err);
      setIsProcessing(false);

      let errorMessage = 'An error occurred during payment processing. Please try again.';
      if (err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }

      showToast({
        title: 'Payment Error',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white shadow rounded-lg p-8 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-12 w-12 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Payment Successful!
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Thank you for your purchase. Your download will begin shortly.
              </p>
              <div className="mt-8">
                <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {paywall?.title || 'Untitled Paywall'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You now have lifetime access to this content
                  </p>
                  <div className="mt-4">
                    <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                      Download Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white shadow rounded-lg p-8 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="text-center">
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-12 w-12 text-indigo-600"
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
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Loading Paywall...
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {id ? `Retrieving content details for ID: ${id}` : 'Preparing content for you'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate subtotal and VAT (7.5% standard VAT rate)
  // This should come from backend but for now using frontend calculation
  const subtotal = paywall?.price || 29.99;
  const vatRate = 0.075; // 7.5% VAT rate
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-indigo-600 text-white font-bold text-xl px-3 py-2 rounded">PG</div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PayGate</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Secured by</span>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">SSL</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          {/* Product Info */}
          <div className="bg-white shadow sm:rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Content Preview */}
                <div>
                  <div className="bg-gray-100 rounded-lg p-4 h-96 dark:bg-gray-700 relative overflow-hidden sm:p-6">
                    {/* Preview header */}
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                        <svg
                          className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={CONTENT_TYPE_ICONS[paywall?.type || 'file']}
                          />
                        </svg>
                      </div>
                      <div className="ml-3 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {paywall?.title || 'Untitled Paywall'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Preview</p>
                      </div>
                    </div>

                    {/* Preview content */}
                    <div className="bg-white rounded-lg shadow h-64 overflow-hidden relative dark:bg-gray-600">
                      {paywall?.type === 'file' ? (
                        // Document preview
                        <div className="p-4 h-full">
                          <div className="border-b border-gray-200 pb-2 mb-2 dark:border-gray-500">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-500"></div>
                            <div className="h-3 bg-gray-100 rounded w-full mb-1 dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-5/6 dark:bg-gray-400"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-full dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-11/12 dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-4/5 dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-5/6 dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-2/3 dark:bg-gray-400"></div>
                          </div>
                          <div className="absolute bottom-4 right-4 flex space-x-2">
                            <div className="h-8 w-8 bg-gray-200 rounded dark:bg-gray-500"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded dark:bg-gray-500"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded dark:bg-gray-500"></div>
                          </div>
                        </div>
                      ) : (
                        // URL preview
                        <div className="p-4 h-full">
                          <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center dark:bg-gray-500 flex-shrink-0">
                              <svg
                                className="h-6 w-6 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="h-4 bg-gray-200 rounded w-32 mb-1 dark:bg-gray-500"></div>
                              <div className="h-3 bg-gray-100 rounded w-48 dark:bg-gray-400"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-full dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-11/12 dark:bg-gray-400"></div>
                            <div className="h-3 bg-gray-100 rounded w-4/5 dark:bg-gray-400"></div>
                          </div>
                        </div>
                      )}

                      {/* Locked overlay */}
                      {isContentLocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4">
                          <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600">
                              <svg
                                className="h-8 w-8 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-white">Content Locked</h3>
                            <p className="mt-2 text-gray-300">Purchase to unlock full access</p>
                            <button
                              onClick={() =>
                                document
                                  .getElementById('purchase-section')
                                  ?.scrollIntoView({ behavior: 'smooth' })
                              }
                              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Unlock Content
                              <svg
                                className="ml-2 -mr-1 h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preview footer */}
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      {isContentLocked ? (
                        <p>Showing preview. Purchase to unlock full content.</p>
                      ) : (
                        <p>Full content unlocked. Enjoy!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purchase Form */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {paywall?.title || 'E-book: Mastering React Hooks'}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {paywall?.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xl font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                          {CURRENCY_SYMBOLS[paywall?.currency || '']}
                          {(paywall?.price || 29.99).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        What you'll get
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {paywall?.type === 'file' && (
                          <>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Full access to downloadable content
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Instant download after purchase
                              </span>
                            </li>
                          </>
                        )}
                        {paywall?.type === 'url' && (
                          <li className="flex items-start">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Access to online resources
                            </span>
                          </li>
                        )}
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Lifetime access
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Free updates
                          </span>
                        </li>
                        {paywall?.tags && paywall.tags.length > 0 && (
                          <li className="flex items-start">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {paywall.tags
                                .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1))
                                .join(', ')}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Publisher Info */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Publisher
                      </h3>
                      <div className="mt-2 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                          <span className="text-indigo-800 font-medium dark:text-indigo-200">
                            {paywall?.userId?.substring(0, 2).toUpperCase() || 'PG'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            PayGate Creator
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Verified Publisher
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Reviews */}
                    <div className="mt-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          What customers say
                        </h3>
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm text-gray-900 dark:text-white">4.8</span>
                          <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                            (128 reviews)
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4 dark:bg-gray-700">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-600">
                              <span className="text-gray-700 text-sm font-medium dark:text-gray-300">
                                JD
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                John Doe
                              </p>
                              <div className="flex items-center">
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            "This content exceeded my expectations. The quality is outstanding and
                            worth every penny!"
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4 dark:bg-gray-700">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-600">
                              <span className="text-gray-700 text-sm font-medium dark:text-gray-300">
                                SJ
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Sarah Johnson
                              </p>
                              <div className="flex items-center">
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg
                                  className="h-4 w-4 text-gray-300"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            "Excellent value for money. The content is well-structured and easy to
                            follow."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Form */}
                    <div
                      className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600"
                      id="purchase-section"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Get Instant Access
                      </h3>
                      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4 dark:bg-gray-700">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {CURRENCY_SYMBOLS[paywall?.currency || '']}
                              {subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600 dark:text-gray-400">VAT (7.5%)</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {CURRENCY_SYMBOLS[paywall?.currency || '']}
                              {vatAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span>Total</span>
                            <span>
                              {CURRENCY_SYMBOLS[paywall?.currency || '']}
                              {total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            isProcessing
                              ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
                              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                          }`}
                        >
                          {isProcessing ? (
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
                              Processing...
                            </>
                          ) : (
                            'Proceed to Payment'
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Guarantee */}
                    <div className="mt-8 bg-green-50 border border-green-100 rounded-lg p-6 dark:bg-green-900/20 dark:border-green-900">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                            Satisfaction Guaranteed
                          </h3>
                          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                            <p>
                              We stand behind our content with a 30-day money-back guarantee. If
                              you're not satisfied with your purchase, simply contact us for a full
                              refund.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-600 text-white font-bold text-lg px-2 py-1 rounded">PG</div>
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">PayGate</span>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Terms
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Privacy
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Contact
              </button>
            </div>
          </div>
          <div className="mt-4 text-center md:text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2023 PayGate. All rights reserved. This is a demo site for educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPaywallView;
