import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import subscriptionService from '../services/subscriptionService';
import Header from './Header';

const SubscriptionSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const query = new URLSearchParams(location.search);
      const reference = query.get('reference');
      const planName = query.get('plan');

      if (reference) {
        try {
          await paymentService.verifyPayment(reference);

          // If we have a plan name, complete the subscription upgrade
          if (planName) {
            // Map plan name to plan ID
            const planMap: Record<string, string> = {
              Free: 'free',
              Pro: 'pro',
              Business: 'business',
              Enterprise: 'enterprise',
            };

            const planId = planMap[planName] || 'free';
            try {
              await subscriptionService.completeSubscriptionUpgrade(planId);
            } catch (error) {
              console.error('Error completing subscription upgrade:', error);
              setError('Subscription upgrade failed. Please contact support.');
              setLoading(false);
              return;
            }
          }

          setLoading(false);
        } catch (err) {
          setError('Payment verification failed. Please contact support.');
          setLoading(false);
        }
      } else {
        setError('No payment reference found.');
        setLoading(false);
      }
    };

    verify();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Subscription" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  {loading && (
                    <>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Verifying Payment...
                      </h3>
                    </>
                  )}
                  {error && (
                    <>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg
                          className="h-6 w-6 text-red-600 dark:text-red-400"
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
                      </div>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Payment Failed
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    </>
                  )}
                  {!loading && !error && (
                    <>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg
                          className="h-6 w-6 text-green-600 dark:text-green-400"
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
                      <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Subscription Activated!
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your new plan is now active.
                      </p>
                    </>
                  )}
                  <div className="mt-6">
                    <Link
                      to="/subscription"
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Back to Subscription Page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionSuccess;
