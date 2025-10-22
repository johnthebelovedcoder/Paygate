import React from 'react';
import Header from './Header';
import CustomerManagement from './CustomerManagement';

const CustomersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Customer Management"
        subtitle="Manage your customers and track their purchases"
      />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <CustomerManagement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomersPage;
