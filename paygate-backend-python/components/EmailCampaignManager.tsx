import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import communicationService from '../services/communicationService';
import type { BulkCommunicationData } from '../services/communicationService';
import type { Customer } from '../services/customerService';
import { useAppData } from '../contexts/AppDataContext';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns and templates from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, we'll load communications as campaigns
        // In a real implementation, you'd have specific campaign APIs
        const communications = await communicationService.getCommunications();
        
        // Transform communications to campaigns for display
        const loadedCampaigns: Campaign[] = communications.map(comm => ({
          id: comm.id,
          name: comm.subject || 'Untitled Campaign',
          subject: comm.subject || '',
          content: comm.content,
          status: comm.status as 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused',
          sentCount: comm.sentAt ? 1 : 0,
          openCount: 0, // Would need tracking
          clickCount: 0, // Would need tracking
          createdAt: comm.createdAt,
        }));
        
        setCampaigns(loadedCampaigns);
        
        // Load templates (would need a real template API)
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
        
        setTemplates(mockTemplates);
        setError(null);
      } catch (err) {
        setError('Failed to load email campaigns');
        console.error('Error loading campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

      // Add to campaigns list
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: campaignName,
        subject: emailSubject,
        content: emailContent,
        status: 'sending',
        sentCount: selectedCustomerIds.length,
        openCount: 0,
        clickCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      setCampaigns([newCampaign, ...campaigns]);

      // Reset form
      setCampaignName('');
      setEmailSubject('');
      setEmailContent('');
      setSelectedCustomerIds([]);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      alert('Campaign sent successfully!');
    } catch (error: unknown) {
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
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Create Campaign
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Campaign sent successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400 p-4">{error}</div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-white">
                      Campaign
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Sent
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Opens
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Clicks
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    campaigns.map(campaign => (
                      <tr key={campaign.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                          {campaign.name}
                          <div className="text-gray-500 dark:text-gray-400">{campaign.subject}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : campaign.status === 'sending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : campaign.status === 'draft'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {campaign.sentCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {campaign.openCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {campaign.clickCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow dark:border-gray-700 dark:hover:shadow-gray-900/50"
              >
                <h4 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                  {template.subject}
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {template.content.substring(0, 100)}...
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="mt-6">
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