import React, { useState } from 'react';
import Header from './Header';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year' | 'pay-per-use';
  description: string;
  features: string[];
  featured?: boolean;
  transactionFee: string;
  platformFee?: string;
}

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'pay-per-use',
      description: 'Try PayGate with no monthly commitment',
      transactionFee: '2.9% + $0.30',
      platformFee: '10%',
      features: [
        'Up to 3 paywalls',
        'Basic analytics',
        'Email support',
        'SSL security',
        'Standard checkout',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      price: billingPeriod === 'annual' ? 50 : 5,
      period: billingPeriod === 'annual' ? 'year' : 'month',
      description: 'Perfect for individuals starting out',
      transactionFee: '2.9% + $0.30',
      features: [
        'Up to 10 paywalls',
        'Basic analytics',
        'Email support',
        'SSL security',
        'Standard checkout',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingPeriod === 'annual' ? 150 : 15,
      period: billingPeriod === 'annual' ? 'year' : 'month',
      description: 'For growing creators and businesses',
      featured: true,
      transactionFee: '2.5% + $0.30',
      features: [
        'Unlimited paywalls',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
        'API access',
        'Fraud protection',
        'Affiliate program',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      price: billingPeriod === 'annual' ? 200 : 20,
      period: billingPeriod === 'annual' ? 'year' : 'month',
      description: 'For teams and larger organizations',
      transactionFee: '2.2% + $0.30',
      features: [
        'Everything in Pro',
        'Multiple team members',
        'Dedicated account manager',
        'Custom contracts',
        'Advanced security',
        'SLA guarantee',
        'White-label options',
      ],
    },
  ];

  const handleSubscribe = (planId: string) => {
    // In a real app, this would redirect to a checkout page
    alert(`Subscribing to ${planId} plan`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Pricing" subtitle="Choose the plan that works best for you" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Choose the plan that works best for you. All plans include core features.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="relative bg-gray-100 rounded-lg p-1 inline-flex dark:bg-gray-800">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`relative rounded-md py-2 px-6 text-sm font-medium ${
                    billingPeriod === 'monthly'
                      ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`relative rounded-md py-2 px-6 text-sm font-medium ${
                    billingPeriod === 'annual'
                      ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Annual{' '}
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full ml-1 dark:bg-indigo-900/30 dark:text-indigo-200">
                    Save 15%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`rounded-lg shadow-lg overflow-hidden ${
                    plan.featured
                      ? 'ring-2 ring-indigo-500'
                      : 'ring-1 ring-gray-200 dark:ring-gray-700'
                  } dark:bg-gray-800`}
                >
                  {plan.featured && (
                    <div className="bg-indigo-500 text-white text-center py-2">
                      <p className="text-sm font-medium">Most Popular</p>
                    </div>
                  )}
                  <div className="bg-white p-6 dark:bg-gray-800">
                    <h3
                      className={`text-lg font-medium ${
                        plan.featured
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {plan.description}
                    </p>
                    <div className="mt-4">
                      {plan.price === 0 ? (
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                          Free
                        </p>
                      ) : (
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                          ${plan.price}
                          <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                            /{plan.period}
                          </span>
                        </p>
                      )}
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          + {plan.transactionFee} per transaction
                        </p>
                        {plan.platformFee && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            + {plan.platformFee} platform fee
                          </p>
                        )}
                      </div>
                    </div>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-6 w-6 flex-shrink-0 text-green-500"
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
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          plan.featured
                            ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                            : plan.price === 0
                              ? 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'
                              : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        {plan.price === 0 ? 'Get Started' : 'Get started'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pay-Per-Use Explanation */}
            <div className="mt-16 bg-white rounded-lg shadow p-8 dark:bg-gray-800">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pay-Per-Use Option
                </h2>
                <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto dark:text-gray-400">
                  Don't want to commit to a monthly subscription? Start with our Free plan and only
                  pay per transaction. Perfect for occasional sellers or those testing the waters.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="pt-6">
                    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 dark:bg-gray-700">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                            <svg
                              className="h-6 w-6 text-white"
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
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white">
                          No Monthly Fee
                        </h3>
                        <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                          Pay only when you make a sale. No subscription required.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 dark:bg-gray-700">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                            <svg
                              className="h-6 w-6 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white">
                          Simple Pricing
                        </h3>
                        <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                          10% platform fee + standard payment processor fees per transaction.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 dark:bg-gray-700">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                            <svg
                              className="h-6 w-6 text-white"
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
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white">
                          Easy Upgrade
                        </h3>
                        <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                          Upgrade to any paid plan anytime to reduce fees and unlock more features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      What payment methods do you support?
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      We support all major credit cards through Paystack, as well as bank transfers
                      for customer payments. For subscriptions, we support credit cards and bank
                      transfers.
                    </p>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Can I switch between plans?
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Yes, you can upgrade or downgrade your plan at any time. When upgrading,
                      you'll be charged a prorated amount for the remainder of your billing cycle.
                      Downgrades take effect at the start of your next billing cycle.
                    </p>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Is there a free trial?
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      We offer a 14-day free trial for all paid plans. No credit card required to
                      start your trial. During your trial, you have access to all features of the
                      Pro plan.
                    </p>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      What happens if I exceed my plan limits?
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      If you exceed your plan limits (such as number of paywalls on the Starter
                      plan), you'll be notified but won't be blocked from creating new paywalls.
                      We'll simply encourage you to upgrade to a higher-tier plan.
                    </p>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      What is the 10% platform fee for free users?
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      The 10% platform fee applies only to free-tier users and covers the cost of
                      using our platform without a subscription. This fee is in addition to standard
                      payment processor fees (2.9% + $0.30). Paid plan subscribers only pay the
                      reduced payment processor fees.
                    </p>
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

export default PricingPage;
