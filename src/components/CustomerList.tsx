import React, { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import type { Customer } from '../services/customerService';

interface CustomerListProps {
  customers?: Customer[]; // Make customers prop optional
}

const CustomerList: React.FC<CustomerListProps> = ({ customers }) => {
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // If customers prop is provided, use it. Otherwise, fetch data from service
  useEffect(() => {
    if (customers && customers.length > 0) {
      setLocalCustomers(customers);
      setLoading(false);
    } else {
      // Fetch data from customer service
      const fetchCustomers = async () => {
        try {
          const data = await customerService.getCustomers();
          // Show only the first 3 customers in the list view
          setLocalCustomers(data.slice(0, 3));
        } catch (err) {
          console.error('Error fetching customers:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchCustomers();
    }
  }, [customers]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Recent Customers</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (localCustomers.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Recent Customers</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No recent customers found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Recent Customers</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800 dark:shadow-gray-900/50">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {localCustomers.map(customer => (
            <li key={customer.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600 truncate dark:text-indigo-400">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${customer.totalSpent.toFixed(2)}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 truncate dark:text-gray-400">
                      {customer.email}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                    <span className="hidden sm:inline">Last purchase: </span>
                    {customer.lastPurchase}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomerList;
