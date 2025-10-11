import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import type { Plan } from '../services/subscriptionService';
import SecurityIndicators from './SecurityIndicators';
import { useAuth } from '../contexts/AuthContext';

interface MobileOptimizedCheckoutProps {
  planName: string;
}

const MobileOptimizedCheckout: React.FC<MobileOptimizedCheckoutProps> = ({ planName }) => {
  const [plan, setPlan] = useState<{ name: string; price: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Mock plan data for now - in a real app you'd fetch from an API
    const mockPlans = {
      Free: { name: 'Free', price: 0 },
      Pro: { name: 'Pro', price: 9.99 },
      Business: { name: 'Business', price: 29.99 },
      Enterprise: { name: 'Enterprise', price: 99.99 },
    };

    setPlan(mockPlans[planName as keyof typeof mockPlans] || null);
  }, [planName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert price to kobo (for Paystack) - multiply by 100
      const amountInKobo = Math.round(plan.price * 100);

      // Generate a unique reference for this transaction
      const reference = `paygate_${Date.now()}_${user.id}`;

      // Create payment request
      const paymentRequest = {
        paywallId: 'subscription', // Use a string identifier instead of null
        amount: amountInKobo, // Amount in kobo
        currency: 'NGN', // Default currency
        customer_email: user.email,
        customer_name: user.name,
        payment_method: 'card', // Default payment method
        channel: 'card', // Default payment channel
      };

      // Create payment with Paystack
      const response = await paymentService.createPayment(paymentRequest);

      if (response.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.authorization_url;
      } else {
        throw new Error(response.message || 'Failed to get payment URL');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!plan) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Purchase</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You are upgrading to the {plan.name} plan.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 dark:bg-gray-700">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{plan.name} Plan</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Billed monthly</p>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            ₦{(plan.price * 1500).toFixed(2)}
          </p>{' '}
          {/* Convert to naira */}
        </div>
        <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Total</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            ₦{(plan.price * 1500).toFixed(2)}
          </p>
        </div>
      </div>

      <SecurityIndicators />

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isProcessing ? (
            <span className="flex items-center">
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
            </span>
          ) : (
            `Pay ₦${(plan.price * 1500).toFixed(2)} with Paystack`
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileOptimizedCheckout;
