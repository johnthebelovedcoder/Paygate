import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import type { Paywall } from '../services/paywallService';

const PaywallSuccess: React.FC = () => {
  const location = useLocation();
  const paywall = location.state?.paywall as Paywall | undefined;

  // Generate social sharing URLs
  const shareUrls = {
    twitter: paywall
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my new content: ${paywall.title}`)}&url=${encodeURIComponent(`${window.location.origin}/p/${paywall.id}`)}`
      : '',
    linkedin: paywall
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/p/${paywall.id}`)}`
      : '',
    facebook: paywall
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/p/${paywall.id}`)}`
      : '',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Paywall Created!" />
      <main>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="px-4 py-5 sm:px-6">
                <div className="text-center">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg
                        className="h-10 w-10 text-green-600 dark:text-green-400"
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
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Paywall Created Successfully!
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Your new paywall is now live and ready to start generating revenue.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  {paywall && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-700">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Your Paywall
                        </h4>
                        <div className="mt-4 flex items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 dark:bg-gray-600" />
                          </div>
                          <div className="ml-4">
                            <h5 className="text-base font-medium text-gray-900 dark:text-white">
                              {paywall.title}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {paywall.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: paywall.currency || 'USD',
                            }).format(paywall.price)}
                          </span>
                          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            {paywall.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Share Your Paywall
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Spread the word about your new paywall to start generating sales.
                        </p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Link
                            to={shareUrls.twitter}
                            target="_blank"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          >
                            <svg
                              className="h-5 w-5 text-blue-400 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                            Twitter
                          </Link>
                          <Link
                            to={shareUrls.linkedin}
                            target="_blank"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          >
                            <svg
                              className="h-5 w-5 text-blue-700 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            LinkedIn
                          </Link>
                          <Link
                            to={shareUrls.facebook}
                            target="_blank"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          >
                            <svg
                              className="h-5 w-5 text-blue-600 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                            </svg>
                            Facebook
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            Next Steps
                          </h4>
                          <ul className="mt-4 space-y-3">
                            <li className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                  <svg
                                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
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
                              </div>
                              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                <Link
                                  to={`/paywall/${paywall.id}`}
                                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  View your paywall
                                </Link>
                              </p>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                  <svg
                                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
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
                              </div>
                              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                <Link
                                  to="/create-paywall"
                                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  Create another paywall
                                </Link>
                              </p>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                  <svg
                                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
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
                              </div>
                              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                <Link
                                  to="/paywalls"
                                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  View all paywalls
                                </Link>
                              </p>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            Track Performance
                          </h4>
                          <div className="mt-4 bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Track your first sale
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Check your dashboard for analytics
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Link
                                to="/"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
                              >
                                View Dashboard
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!paywall && (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        Paywall information not available
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        We couldn't retrieve the details of your newly created paywall.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/paywalls"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                          View All Paywalls
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaywallSuccess;
