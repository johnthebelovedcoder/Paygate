import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import communicationService from '../services/communicationService';
import type { BulkCommunicationData } from '../services/communicationService';
import type { Customer } from '../services/customerService';
import { useAppData } from '../contexts';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
}

const EmailCampaignManager: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = useAppData();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'create'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Load campaigns
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Welcome Series',
        subject: 'Welcome to our platform!',
        content: 'Welcome content',
        status: 'completed',
        sentCount: 245,
        openCount: 187,
        clickCount: 76,
        createdAt: '2023-05-15',
      },
      {
        id: '2',
        name: 'Product Update',
        subject: 'New features available',
        content: 'Product update content',
        status: 'sending',
        sentCount: 120,
        openCount: 89,
        clickCount: 34,
        createdAt: '2023-06-22',
      },
      {
        id: '3',
        name: 'Promotional Offer',
        subject: 'Special discount for you',
        content: 'Promotional content',
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        createdAt: '2023-07-10',
      },
    ];

    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to our platform!',
        content: 'Welcome content template',
        createdAt: '2023-05-10',
      },
      {
        id: '2',
        name: 'Promotional Offer',
        subject: 'Special discount just for you',
        content: 'Promotional offer template',
        createdAt: '2023-06-15',
      },
      {
        id: '3',
        name: 'Newsletter',
        subject: 'Monthly updates and insights',
        content: 'Newsletter template',
        createdAt: '2023-07-01',
      },
    ];

    setCampaigns(mockCampaigns);
    setTemplates(mockTemplates);
  }, []);

  const handleSendCampaign = async () => {
    if (!campaignName || !emailSubject || !emailContent || selectedCustomerIds.length === 0) {
      alert('Please fill in all required fields and select at least one customer');
      return;
    }

    setIsSending(true);

    try {
      // Create bulk communication
      const bulkData: BulkCommunicationData = {
        customerIds: selectedCustomerIds,
        communicationData: {
          type: 'email',
          subject: emailSubject,
          content: emailContent,
        },
      };

      await communicationService.sendBulkCommunications(bulkData);

      // Reset form
      setCampaignName('');
      setEmailSubject('');
      setEmailContent('');
      setSelectedCustomerIds([]);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reload campaigns after sending
      // In a real implementation, this would update the campaign status
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const toggleAllCustomers = () => {
    if (selectedCustomerIds.length === customers.customers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(customers.customers.map((customer: Customer) => customer.id));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Campaigns</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'campaigns'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'templates'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Templates
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
        </div>
      </div>

      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-900 dark:text-green-300">
          Campaign sent successfully!
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div>
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
              Recent Campaigns
            </h4>
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
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Sent
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Open Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Click Rate
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {campaigns.map(campaign => (
                    <tr key={campaign.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {campaign.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : campaign.status === 'sending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : campaign.status === 'draft'
                                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.sentCount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.sentCount > 0
                          ? Math.round((campaign.openCount / campaign.sentCount) * 100)
                          : 0}
                        %
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.sentCount > 0
                          ? Math.round((campaign.clickCount / campaign.sentCount) * 100)
                          : 0}
                        %
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => navigate(`/campaign/${campaign.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View
                        </button>
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
                  Email Campaign Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Personalize your emails with merge tags</li>
                    <li>Test different subject lines with A/B testing</li>
                    <li>Send emails at optimal times for your audience</li>
                    <li>Follow up with non-openers using drip campaigns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Email Templates</h4>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create Template
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow dark:border-gray-700"
                >
                  <h5 className="text-md font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {template.subject}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                      Use Template
                    </button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
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
                Campaign Name
              </label>
              <input
                type="text"
                id="campaign-name"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label
                htmlFor="email-subject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Subject
              </label>
              <input
                type="text"
                id="email-subject"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label
                htmlFor="email-content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Content
              </label>
              <textarea
                id="email-content"
                rows={6}
                value={emailContent}
                onChange={e => setEmailContent(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter your email content here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipients
              </label>
              <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto dark:border-gray-600">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCustomerIds.length === customers.customers.length}
                          onChange={toggleAllCustomers}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </th>
                      <th
                        scope="col"
                        className="py-2 pl-3 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="py-2 px-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {customers.customers.map((customer: Customer) => (
                      <tr
                        key={customer.id}
                        className={
                          selectedCustomerIds.includes(customer.id)
                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                            : ''
                        }
                      >
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 sm:pl-6">
                          <input
                            type="checkbox"
                            checked={selectedCustomerIds.includes(customer.id)}
                            onChange={() => toggleCustomerSelection(customer.id)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="whitespace-nowrap py-2 pl-3 pr-3 text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name || customer.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {selectedCustomerIds.length} of {customers.customers.length} customers selected
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSending}
                onClick={handleSendCampaign}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignManager;
