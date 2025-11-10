import React, { useState, useEffect } from 'react';
import marketingService, { type Affiliate } from '../services/marketingService';

const AffiliateManager: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commissionRate, setCommissionRate] = useState('10');

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        // Try to get the user's own affiliate data
        const affiliate = await marketingService.getMyAffiliate();
        if (affiliate) {
          setAffiliates([affiliate]);
        }
      } catch (error) {
        console.error('Error fetching affiliate data:', error);
        // Fallback to empty array if there's an error
        setAffiliates([]);
      }
    };

    fetchAffiliates();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAffiliate: Affiliate = {
      id: (affiliates.length + 1).toString(),
      name,
      email,
      affiliateCode: `AFF-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      commissionRate: parseInt(commissionRate),
      totalEarnings: 0,
      totalReferrals: 0,
      joinedDate: new Date().toISOString().substring(0, 10),
      status: 'active',
    };

    setAffiliates([...affiliates, newAffiliate]);
    setName('');
    setEmail('');
    setCommissionRate('10');
    setShowForm(false);
  };

  const toggleAffiliateStatus = (id: string) => {
    setAffiliates(
      affiliates.map(affiliate =>
        affiliate.id === id
          ? { ...affiliate, status: affiliate.status === 'active' ? 'inactive' : 'active' }
          : affiliate
      )
    );
  };

  const deleteAffiliate = (id: string) => {
    if (window.confirm('Are you sure you want to remove this affiliate?')) {
      setAffiliates(affiliates.filter(affiliate => affiliate.id !== id));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Affiliate Program</h3>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Affiliate
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
            Add New Affiliate
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Affiliate's name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Affiliate's email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="commissionRate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  id="commissionRate"
                  value={commissionRate}
                  onChange={e => setCommissionRate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Commission percentage"
                  min="0"
                  max="100"
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
                Add Affiliate
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
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Code
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Commission
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Referrals
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Earnings
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
            {affiliates.map(affiliate => (
              <tr key={affiliate.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  {affiliate.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {affiliate.email}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {affiliate.affiliateCode}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {affiliate.commissionRate}%
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {affiliate.totalReferrals}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  ${affiliate.totalEarnings.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      affiliate.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleAffiliateStatus(affiliate.id)}
                      className={`text-sm font-medium ${
                        affiliate.status === 'active'
                          ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                    >
                      {affiliate.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteAffiliate(affiliate.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Remove
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
              Affiliate Program Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Set competitive commission rates to attract quality affiliates</li>
                <li>Provide marketing materials to help affiliates promote your content</li>
                <li>Track affiliate performance and reward top performers</li>
                <li>Regularly communicate with affiliates about new products</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateManager;
