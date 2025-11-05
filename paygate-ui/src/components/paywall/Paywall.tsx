import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import paymentService from '../../services/paymentService';

interface PaywallProps {
  contentId: string;
  previewContent: React.ReactNode;
  fullContent: React.ReactNode;
  price: number;
  currency?: string;
  title?: string;
  description?: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
}

const Paywall: React.FC<PaywallProps> = ({
  contentId,
  previewContent,
  fullContent,
  price = 4.99,
  currency = 'USD',
  title = 'Premium Content',
  description = 'Unlock this premium content with a one-time payment.',
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('one-time');
  const navigate = useNavigate();

  // Check if user has access to this content
  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated) return;
      
      try {
        // TODO: Replace with actual API call to check access
        // const hasAccess = await contentService.checkContentAccess(contentId);
        // setHasAccess(hasAccess);
        
        // For demo purposes, we'll just check if user is authenticated
        setHasAccess(false);
      } catch (error) {
        console.error('Error checking content access:', error);
      }
    };

    checkAccess();
  }, [contentId, isAuthenticated]);

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'one-time',
      name: 'One-Time Purchase',
      price,
      currency,
      features: [
        `Full access to "${title}"`,
        'Downloadable content',
        '24/7 customer support',
      ],
      isPopular: true,
    },
    {
      id: 'subscription',
      name: 'Monthly Subscription',
      price: 9.99,
      currency,
      features: [
        'Unlimited access to all content',
        'New content weekly',
        'Downloadable content',
        'Priority support',
      ],
    },
  ];

  const handlePurchase = async (plan: PaymentPlan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsLoading(true);

    try {
      // For one-time purchases
      if (plan.id === 'one-time') {
        // In a real app, you would call your API to process the payment
        // const response = await paymentService.createPayment({
        //   contentId,
        //   amount: plan.price,
        //   currency: plan.currency,
        // });
        
        // For demo, we'll simulate a successful payment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Grant access after successful payment
        setHasAccess(true);
        toast.success('Payment successful! Enjoy your content.');
      } else {
        // Handle subscription flow
        // This would redirect to a subscription page or handle the subscription logic
        navigate('/subscribe', { 
          state: { 
            plan: 'monthly',
            price: plan.price,
            currency: plan.currency
          } 
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user has access, show the full content
  if (hasAccess) {
    return <div className="paywall-content">{fullContent}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Preview Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preview</h3>
            <div className="relative">
              <div className="relative overflow-hidden max-h-96">
                {previewContent}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg font-medium">This is a preview. Unlock the full content to continue reading.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="px-6 py-8 bg-gray-50">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-8">Choose Your Plan</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {paymentPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-lg border ${
                  plan.isPopular 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 bg-white'
                } p-6 shadow-sm`}
              >
                {plan.isPopular && (
                  <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-4 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                
                <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: plan.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(plan.price)}
                  </span>
                  {plan.id === 'subscription' && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </div>
                
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  type="button"
                  onClick={() => handlePurchase(plan)}
                  disabled={isLoading}
                  className={`mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    plan.isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    plan.isPopular ? 'focus:ring-indigo-500' : 'focus:ring-gray-500'
                  } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Secure payment. Cancel anytime.</p>
            <div className="mt-2 flex items-center justify-center space-x-4">
              <span>We accept:</span>
              <div className="flex space-x-2">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">Visa</span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">Mastercard</span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
