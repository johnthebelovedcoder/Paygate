import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { formatCurrency, convertCurrency, getCurrencyName } from '../utils/currency.utils';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';
import subscriptionService, { type Subscription, type Plan } from '../services/subscriptionService';
import billingService, { type PaymentMethod, type Invoice } from '../services/billingService';
import { useAuth } from '../contexts/AuthContext';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

const SubscriptionPage: React.FC = () => {
  console.log('Rendering SubscriptionPage');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeBillingTab, setActiveBillingTab] = useState<
    'payment-methods' | 'invoices' | 'address'
  >('payment-methods');
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const [subscription, availablePlans, methods, invs] = await Promise.all([
          subscriptionService.getSubscription(),
          subscriptionService.getPlans(),
          billingService.getPaymentMethods(),
          billingService.getInvoices(),
        ]);
        setCurrentPlan(subscription);
        setPlans(availablePlans);
        setPaymentMethods(methods);
        setInvoices(invs);
      } catch (error: unknown) {
        console.error('Error fetching subscription data:', error);
        if (isAxiosError(error)) {
          setError(error.message || 'Failed to load data');
        } else {
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  // Format currency
  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  // Handle plan upgrade
  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true);
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // For free plans, we can upgrade directly
      if (plan.price === 0) {
        const updatedSubscription = await subscriptionService.updateSubscription(planId);
        setCurrentPlan(updatedSubscription);
        setShowUpgradeModal(false);
        setMessage('Plan updated successfully!');
        return;
      }

      // For paid plans, redirect to checkout
      navigate('/checkout', { state: { planName: plan.name } });
    } catch (error: unknown) {
      console.error('Error upgrading plan:', error);
      if (isAxiosError(error)) {
        if (error.message === 'Plan upgrade required') {
          // This shouldn't happen in our new flow, but just in case
          const plan = plans.find(p => p.id === planId);
          if (plan) {
            navigate('/checkout', { state: { planName: plan.name } });
          }
        } else {
          setError(error.message || 'Failed to upgrade plan. Please try again.');
        }
      } else {
        setError('Failed to upgrade plan. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    // Navigate to the customer paywall view page
    alert('Redirecting to customer paywall view...');
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('Link copied to clipboard!');
  };

  // Payment method functions
  const formatCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const match = cleanNumber.match(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (!match) return '';
    return (
      match[1] +
      (match[2] ? ' ' + match[2] : '') +
      (match[3] ? ' ' + match[3] : '') +
      (match[4] ? ' ' + match[4] : '')
    );
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      setError('Please fill in all fields');
      return;
    }

    // Validate card number (simple validation)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (
      cleanCardNumber.length < 13 ||
      cleanCardNumber.length > 19 ||
      !/^\d+$/.test(cleanCardNumber)
    ) {
      setError('Please enter a valid card number');
      return;
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (
      !month ||
      !year ||
      month < 1 ||
      month > 12 ||
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      setError('Please enter a valid expiry date');
      return;
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv)) {
      setError('Please enter a valid CVV');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newMethod = await billingService.addPaymentMethod({
        cardNumber: cleanCardNumber,
        expiryDate,
        cvv,
        cardHolderName,
      });

      setPaymentMethods([...paymentMethods, newMethod]);
      setMessage('Payment method added successfully');

      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardHolderName('');
      setIsAddingPaymentMethod(false);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to add payment method');
      } else {
        setError('Failed to add payment method');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setLoading(true);
      await billingService.deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
      setMessage('Payment method removed successfully');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to remove payment method');
      } else {
        setError('Failed to remove payment method');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      setLoading(true);
      await billingService.setDefaultPaymentMethod(id);
      setPaymentMethods(
        paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === id,
        }))
      );
      setMessage('Default payment method updated successfully');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to update default payment method');
      } else {
        setError('Failed to update default payment method');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentPlan || !plans.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const currentPlanDetails = plans.find(p => p.id === currentPlan.plan);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Subscription" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Current Plan */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Current Plan
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                          {currentPlanDetails?.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {currentPlanDetails && currentPlanDetails.price > 0
                            ? `${formatCurrency(currentPlanDetails.price, currentPlanDetails.currency)}/month`
                            : 'No monthly fee'}
                        </p>
                        <div className="mt-2">
                          {currentPlanDetails && (
                            <>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Transaction fee: {currentPlanDetails.transactionFeePercent}% +{' '}
                                {formatCurrency(
                                  currentPlanDetails.transactionFeeFixed,
                                  currentPlanDetails.currency
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Paywall limit:{' '}
                                {currentPlanDetails.paywallLimit === Infinity
                                  ? 'Unlimited'
                                  : currentPlanDetails.paywallLimit}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="mt-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentPlan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                          >
                            {currentPlan.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Next billing date
                        </p>
                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                          {currentPlan.endDate
                            ? new Date(currentPlan.endDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pay-Per-Use Benefits */}
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Pay-Per-Use Model
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          You're currently on our Free plan with no monthly subscription fee. You
                          only pay when you make a sale:
                        </p>
                        {currentPlanDetails && (
                          <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>
                              {currentPlanDetails.transactionFeePercent}% platform fee on gross
                              sales
                            </li>
                            <li>
                              Standard payment processor fees (
                              {formatCurrency(
                                currentPlanDetails.transactionFeeFixed,
                                currentPlanDetails.currency
                              )}{' '}
                              + {currentPlanDetails.transactionFeePercent - 1}% per transaction)
                            </li>
                          </ul>
                        )}
                        {currentPlanDetails && (
                          <p className="mt-2">
                            <strong>Example:</strong> For a{' '}
                            {formatCurrency(50, currentPlanDetails.currency)} sale, you pay{' '}
                            {formatCurrency(
                              (50 * currentPlanDetails.transactionFeePercent) / 100,
                              currentPlanDetails.currency
                            )}{' '}
                            ({currentPlanDetails.transactionFeePercent}% platform fee) +{' '}
                            {formatCurrency(
                              currentPlanDetails.transactionFeeFixed +
                                (50 * (currentPlanDetails.transactionFeePercent - 1)) / 100,
                              currentPlanDetails.currency
                            )}{' '}
                            payment fee ={' '}
                            {formatCurrency(
                              (50 * currentPlanDetails.transactionFeePercent) / 100 +
                                currentPlanDetails.transactionFeeFixed +
                                (50 * (currentPlanDetails.transactionFeePercent - 1)) / 100,
                              currentPlanDetails.currency
                            )}{' '}
                            total fees.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice History */}
                <div className="mt-8 bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Transaction History
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg dark:ring-gray-700">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-white"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                            >
                              Description
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                          {invoices.map(invoice => (
                            <tr key={invoice.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 max-w-xs dark:text-gray-400">
                                <div className="truncate">{invoice.description}</div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {formatCurrency(invoice.amount, invoice.currency)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Paid
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Plan Comparison
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-6">
                      {plans.map(plan => (
                        <div
                          key={plan.id}
                          className={`border rounded-lg p-4 ${plan.id === currentPlan.plan ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500' : 'border-gray-200 dark:border-gray-600'}`}
                        >
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">
                            {plan.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {plan.price > 0
                              ? `${formatCurrency(plan.price, plan.currency)}/month`
                              : 'No monthly fee'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {plan.transactionFeePercent}% +{' '}
                            {formatCurrency(plan.transactionFeeFixed, plan.currency)} per
                            transaction
                          </p>
                          <ul className="mt-2 space-y-1">
                            {plan.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                              >
                                <svg
                                  className="h-4 w-4 text-green-500 mr-1"
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
                                {feature}
                              </li>
                            ))}
                          </ul>
                          {plan.id !== currentPlan.plan && (
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  handleUpgrade(plan.id);
                                }}
                                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                              >
                                {currentPlanDetails && plan.price < currentPlanDetails.price
                                  ? 'Downgrade'
                                  : 'Upgrade'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upgrade Benefits */}
                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-lg p-6 dark:bg-indigo-900/20 dark:border-indigo-900">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                        Upgrade Benefits
                      </h3>
                      <div className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
                        <p>Upgrade to any paid plan to:</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Reduce transaction fees</li>
                          <li>Increase paywall limits</li>
                          <li>Unlock advanced features</li>
                          <li>Get priority support</li>
                        </ul>
                        {currentPlanDetails && plans[1] && (
                          <div className="mt-3 p-3 bg-white rounded-md dark:bg-gray-700">
                            <p className="font-medium text-gray-900 dark:text-white">
                              Savings Example:
                            </p>
                            <p className="mt-1">
                              On a {formatCurrency(50, currentPlanDetails.currency)} sale:
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div className="text-center p-2 bg-red-50 rounded dark:bg-red-900/20">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Free Plan
                                </p>
                                <p className="font-medium text-red-700 dark:text-red-400">
                                  {formatCurrency(
                                    (50 * currentPlanDetails.transactionFeePercent) / 100 +
                                      currentPlanDetails.transactionFeeFixed +
                                      (50 * (currentPlanDetails.transactionFeePercent - 1)) / 100,
                                    currentPlanDetails.currency
                                  )}
                                </p>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded dark:bg-green-900/20">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</p>
                                <p className="font-medium text-green-700 dark:text-green-400">
                                  {formatCurrency(
                                    (50 * plans[1].transactionFeePercent) / 100 +
                                      plans[1].transactionFeeFixed +
                                      (50 * (plans[1].transactionFeePercent - 1)) / 100,
                                    plans[1].currency
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="mt-2 text-sm">
                              <span className="font-medium text-green-600 dark:text-green-400">
                                Save{' '}
                                {formatCurrency(
                                  (50 * currentPlanDetails.transactionFeePercent) / 100 +
                                    currentPlanDetails.transactionFeeFixed +
                                    (50 * (currentPlanDetails.transactionFeePercent - 1)) / 100 -
                                    ((50 * plans[1].transactionFeePercent) / 100 +
                                      plans[1].transactionFeeFixed +
                                      (50 * (plans[1].transactionFeePercent - 1)) / 100),
                                  currentPlanDetails.currency
                                )}{' '}
                                per transaction!
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
              aria-hidden="true"
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-indigo-900/30">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Upgrade Your Plan
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose a plan that best fits your needs.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        plan.id === currentPlan?.plan
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                          {plan.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.price > 0
                            ? `${formatCurrency(plan.price, plan.currency)}/month`
                            : 'Free'}
                        </p>
                      </div>
                      {plan.id !== currentPlan?.plan && (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isProcessing}
                          className={`px-3 py-1 text-sm rounded-md ${
                            isProcessing
                              ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-600'
                              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                          } text-white`}
                        >
                          {isProcessing ? 'Processing...' : 'Select'}
                        </button>
                      )}
                      {plan.id === currentPlan?.plan && (
                        <span className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Current Plan
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-gray-700">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  type="button"
                  className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
