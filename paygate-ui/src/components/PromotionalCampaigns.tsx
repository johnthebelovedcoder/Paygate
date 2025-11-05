import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  type: 'discount' | 'bundle' | 'limited' | 'flash';
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed' | 'bundle';
  discountValue: number;
  usageCount: number;
  maxUses: number | null;
  revenueGenerated: number;
  conversions: number;
  conversionRate: number;
}

const PromotionalCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'create' | 'history'>('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Sale 2023',
      description: '20% off all premium content',
      status: 'active',
      type: 'discount',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      discountType: 'percentage',
      discountValue: 20,
      usageCount: 142,
      maxUses: null,
      revenueGenerated: 2840.50,
      conversions: 142,
      conversionRate: 8.7,
    },
    {
      id: '2',
      name: 'Back to School Bundle',
      description: '3 courses for the price of 2',
      status: 'scheduled',
      type: 'bundle',
      startDate: '2023-08-15',
      endDate: '2023-09-15',
      discountType: 'bundle',
      discountValue: 33,
      usageCount: 0,
      maxUses: 100,
      revenueGenerated: 0,
      conversions: 0,
      conversionRate: 0,
    },
    {
      id: '3',
      name: 'Flash Friday',
      description: '50% off for 24 hours only',
      status: 'completed',
      type: 'flash',
      startDate: '2023-07-07',
      endDate: '2023-07-08',
      discountType: 'percentage',
      discountValue: 50,
      usageCount: 89,
      maxUses: null,
      revenueGenerated: 1335.75,
      conversions: 89,
      conversionRate: 15.2,
    },
  ]);

  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignType, setCampaignType] = useState<'discount' | 'bundle' | 'limited' | 'flash'>('discount');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'bundle'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');

  const handleCreateCampaign = () => {
    if (!campaignName || !startDate || !endDate || !discountValue) {
      alert('Please fill in all required fields');
      return;
    }

    const newCampaign: Campaign = {
      id: (campaigns.length + 1).toString(),
      name: campaignName,
      description: campaignDescription,
      status: startDate > new Date().toISOString().split('T')[0] ? 'scheduled' : 'active',
      type: campaignType,
      startDate,
      endDate,
      discountType,
      discountValue: parseFloat(discountValue),
      usageCount: 0,
      maxUses: maxUses ? parseInt(maxUses) : null,
      revenueGenerated: 0,
      conversions: 0,
      conversionRate: 0,
    };

    setCampaigns([newCampaign, ...campaigns]);
    setCampaignName('');
    setCampaignDescription('');
    setStartDate('');
    setEndDate('');
    setDiscountValue('');
    setMaxUses('');
    setActiveTab('active');
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        return { ...campaign, status: newStatus };
      }
      return campaign;
    }));
  };

  const deleteCampaign = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Active
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Scheduled
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Draft
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Discount';
      case 'bundle':
        return 'Bundle';
      case 'limited':
        return 'Limited';
      case 'flash':
        return 'Flash Sale';
      default:
        return 'Campaign';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Promotional Campaigns</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'active'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Active Campaigns
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'create'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Create Campaign
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'history'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'active' && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Current Campaigns
              </h4>
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Campaign
              </button>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Campaign
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
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
                      Dates
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
                      Revenue
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Conv. Rate
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {campaigns.filter(c => c.status !== 'completed').map(campaign => (
                    <tr key={campaign.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        <div>{campaign.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          {campaign.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getTypeBadge(campaign.type)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-400 text-xs">
                          to {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>{campaign.usageCount} used</div>
                        <div className="text-gray-400 text-xs">
                          {campaign.maxUses ? `of ${campaign.maxUses} max` : 'Unlimited'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        ${(campaign.revenueGenerated || 0).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.conversionRate.toFixed(1)}%
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleCampaignStatus(campaign.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            {campaign.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => deleteCampaign(campaign.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900">
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
                  Campaign Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Segment your audience for targeted campaigns</li>
                    <li>Test different discount percentages to find the sweet spot</li>
                    <li>Bundle complementary products to increase average order value</li>
                    <li>Use urgency (limited time offers) to drive immediate action</li>
                    <li>Track campaign performance to optimize future promotions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
            Create New Campaign
          </h4>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="campaign-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Campaign Name *
              </label>
              <input
                type="text"
                id="campaign-name"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Summer Sale, Back to School"
                required
              />
            </div>

            <div>
              <label
                htmlFor="campaign-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="campaign-description"
                rows={3}
                value={campaignDescription}
                onChange={e => setCampaignDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Brief description of the campaign"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="campaign-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Campaign Type
                </label>
                <select
                  id="campaign-type"
                  value={campaignType}
                  onChange={e => setCampaignType(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="discount">Standard Discount</option>
                  <option value="bundle">Product Bundle</option>
                  <option value="limited">Limited Quantity</option>
                  <option value="flash">Flash Sale</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discount-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Discount Type
                </label>
                <select
                  id="discount-type"
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="bundle">Bundle Discount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="discount-value"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Discount Value *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {discountType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    id="discount-value"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    className="block w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10'}
                    min="0"
                    step={discountType === 'percentage' ? '0.1' : '0.01'}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="max-uses"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Max Uses (Optional)
                </label>
                <input
                  type="number"
                  id="max-uses"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Leave blank for unlimited"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="end-date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  End Date *
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCampaign}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
            Campaign History
          </h4>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                  >
                    Campaign
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Dates
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
                    Revenue
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Conv. Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {campaigns.filter(c => c.status === 'completed').map(campaign => (
                  <tr key={campaign.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                      <div>{campaign.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {campaign.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-400 text-xs">
                        to {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>{campaign.usageCount} used</div>
                      <div className="text-gray-400 text-xs">
                        {campaign.maxUses ? `of ${campaign.maxUses} max` : 'Unlimited'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      ${(campaign.revenueGenerated || 0).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {campaign.conversionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {campaigns.filter(c => c.status === 'completed').length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No campaign history
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Completed campaigns will appear here.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionalCampaigns;