import React from 'react';
import { Link } from 'react-router-dom';
import type { Paywall } from '../services/paywallService';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

interface PaywallListProps {
  paywalls: Paywall[];
}

const PaywallList: React.FC<PaywallListProps> = ({ paywalls }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800 dark:shadow-gray-900/50">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {paywalls.map(paywall => (
          <li key={paywall.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Link
                  to={`/paywall/${paywall.id}`}
                  className="text-sm font-medium text-indigo-600 truncate hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {paywall.title}
                </Link>
                <div className="ml-2 flex-shrink-0 flex">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500 truncate dark:text-gray-400">
                    {paywall.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                  <span className="mr-4">
                    {CURRENCY_SYMBOLS[paywall.currency || '']}
                    {paywall.price.toFixed(2)}
                  </span>
                  <span>{paywall.sales} sales</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(paywall.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Revenue:{' '}
                  <span className="font-medium">
                    {CURRENCY_SYMBOLS[paywall.currency || '']}
                    {paywall.revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaywallList;
