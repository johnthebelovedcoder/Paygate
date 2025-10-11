import React from 'react';

interface Purchase {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: 'completed' | 'refunded' | 'pending';
}

const PurchaseHistory: React.FC = () => {
  const purchases: Purchase[] = [
    {
      id: '1',
      title: 'E-book: React Fundamentals',
      date: '2023-07-15',
      amount: 29.99,
      status: 'completed',
    },
    {
      id: '2',
      title: 'Video Course: Advanced TypeScript',
      date: '2023-07-10',
      amount: 99.99,
      status: 'completed',
    },
    {
      id: '3',
      title: 'Template Pack: Landing Pages',
      date: '2023-07-05',
      amount: 49.99,
      status: 'completed',
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Purchase History</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800 dark:shadow-gray-900/50">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {purchases.map(purchase => (
            <li key={purchase.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600 truncate dark:text-indigo-400">
                    {purchase.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${purchase.amount.toFixed(2)}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Purchased: {purchase.date}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : purchase.status === 'refunded'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex space-x-4">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Download Again
                  </button>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Request Refund
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PurchaseHistory;
