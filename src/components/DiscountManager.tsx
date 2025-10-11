import React, { useState, useEffect } from 'react';
import type { DiscountCode } from '../services/marketingService';

const DiscountManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockDiscounts: DiscountCode[] = [
      {
        id: '1',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        expiryDate: '2023-12-31',
        usageLimit: 100,
        usedCount: 25,
        isActive: true,
      },
      {
        id: '2',
        code: 'WELCOME50',
        discountType: 'fixed',
        discountValue: 50,
        expiryDate: '2023-11-15',
        usageLimit: 50,
        usedCount: 12,
        isActive: true,
      },
      {
        id: '3',
        code: 'FALL2023',
        discountType: 'percentage',
        discountValue: 15,
        expiryDate: '2023-10-31',
        usageLimit: 200,
        usedCount: 89,
        isActive: false,
      },
    ];

    setDiscounts(mockDiscounts);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDiscount: DiscountCode = {
      id: (discounts.length + 1).toString(),
      code,
      discountType,
      discountValue: parseFloat(discountValue),
      expiryDate,
      usageLimit: usageLimit ? parseInt(usageLimit) : 0,
      usedCount: 0,
      isActive: true,
    };

    setDiscounts([...discounts, newDiscount]);
    setCode('');
    setDiscountValue('');
    setExpiryDate('');
    setUsageLimit('');
    setShowForm(false);
  };

  const toggleDiscountStatus = (id: string) => {
    setDiscounts(
      discounts.map(discount =>
        discount.id === id ? { ...discount, isActive: !discount.isActive } : discount
      )
    );
  };

  const deleteDiscount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      setDiscounts(discounts.filter(discount => discount.id !== id));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Discount Codes</h3>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Discount
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
            Create New Discount Code
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Discount Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., SAVE10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="discountType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Discount Type
                </label>
                <select
                  id="discountType"
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Discount Value
                </label>
                <input
                  type="number"
                  id="discountValue"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50'}
                  min="0"
                  step={discountType === 'percentage' ? '0.01' : '1'}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="usageLimit"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Usage Limit (optional)
                </label>
                <input
                  type="number"
                  id="usageLimit"
                  value={usageLimit}
                  onChange={e => setUsageLimit(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Leave blank for unlimited"
                  min="0"
                />
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Discount
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
              >
                Code
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Value
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Usage
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Expiry
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {discounts.map(discount => (
              <tr key={discount.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  {discount.code}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {discount.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {discount.discountType === 'percentage'
                    ? `${discount.discountValue}%`
                    : `$${discount.discountValue}`}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {discount.usedCount} / {discount.usageLimit || '∞'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(discount.expiryDate).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      discount.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleDiscountStatus(discount.id)}
                      className={`text-sm font-medium ${
                        discount.isActive
                          ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                    >
                      {discount.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteDiscount(discount.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Discount Code Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Use percentage discounts for higher-value items</li>
                <li>Set usage limits to control costs</li>
                <li>Create seasonal discounts to boost sales</li>
                <li>Track discount performance in analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountManager;
