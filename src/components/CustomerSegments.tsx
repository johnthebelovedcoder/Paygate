import React, { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import type { CustomerSegment as ServiceCustomerSegment } from '../services/customerService';

interface PurchaseItem {
  productId: string;
  date: string;
  amount: number;
}

interface Customer {
  id: string;
  name?: string;
  email: string;
  totalSpent: number;
  purchaseHistory: PurchaseItem[];
  lastPurchaseDate?: string;
}

interface CustomerSegment extends ServiceCustomerSegment {
  customers: Customer[];
}

const CustomerSegments: React.FC = () => {
  const [segments, setSegments] = useState<ServiceCustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [loadingSegmentCustomers, setLoadingSegmentCustomers] = useState(false);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomerSegments();
        setSegments(data);
        setError(null);
      } catch (err) {
        setError('Failed to load customer segments');
        console.error('Error fetching customer segments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <h3 className="text-lg font-medium text-gray-900 mb-6 dark:text-white">Customer Segments</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map(segment => (
          <div
            key={segment.name}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md cursor-pointer transition-shadow dark:border-gray-700"
            onClick={async () => {
              try {
                setLoadingSegmentCustomers(true);
                // Here we would fetch the customers for this segment from the backend
                // For now, we'll create a mock implementation
                const mockCustomers: Customer[] = [
                  {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    totalSpent: 125.5,
                    purchaseHistory: [],
                    lastPurchaseDate: '2023-05-15',
                  },
                  {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    totalSpent: 89.99,
                    purchaseHistory: [],
                    lastPurchaseDate: '2023-06-20',
                  },
                  {
                    id: '3',
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    totalSpent: 210.75,
                    purchaseHistory: [],
                    lastPurchaseDate: '2023-07-10',
                  },
                ];
                setSelectedSegment({ ...segment, customers: mockCustomers });
              } catch (err) {
                setError('Failed to load customers for this segment');
                console.error('Error fetching segment customers:', err);
              } finally {
                setLoadingSegmentCustomers(false);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {segment.name}
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {segment.description}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                {segment.customerCount}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedSegment.name} ({selectedSegment.customerCount})
                </h3>
                <button
                  onClick={() => setSelectedSegment(null)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedSegment.description}
              </p>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Total Spent
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Purchases
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Last Purchase
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {loadingSegmentCustomers ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Loading customers...
                      </td>
                    </tr>
                  ) : selectedSegment &&
                    'customers' in selectedSegment &&
                    selectedSegment.customers ? (
                    selectedSegment.customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center dark:bg-gray-600">
                                <span className="text-gray-700 font-medium dark:text-gray-300">
                                  {customer.name?.charAt(0) || customer.email.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customer.name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${customer.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.purchaseHistory.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.lastPurchaseDate
                            ? new Date(customer.lastPurchaseDate).toLocaleDateString()
                            : 'Never'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No customers available for this segment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedSegment(null)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSegments;
