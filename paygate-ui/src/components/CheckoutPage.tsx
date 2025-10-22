import React from 'react';
import Header from './Header';
import MobileOptimizedCheckout from './MobileOptimizedCheckout';
import { useLocation } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const { planName } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Checkout" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center">
              <MobileOptimizedCheckout planName={planName} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
