import React, { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  logo: string;
  setupUrl?: string;
}

export interface IntegrationSettings {
  connectedIntegrations: string[];
  webhookUrl: string;
  [key: string]: unknown;
}

interface IntegrationsProps {
  onSave: (settings: IntegrationSettings) => Promise<void>;
  initialSettings?: IntegrationSettings;
}

const Integrations: React.FC<IntegrationsProps> = ({ onSave, initialSettings }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Sync customers and send newsletters',
      category: 'Email Marketing',
      connected: initialSettings?.connectedIntegrations?.includes('mailchimp') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/mailchimp.svg',
    },
    {
      id: 'convertkit',
      name: 'ConvertKit',
      description: 'Email marketing for creators',
      category: 'Email Marketing',
      connected: initialSettings?.connectedIntegrations?.includes('convertkit') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/convertkit.svg',
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track visitor behavior and conversions',
      category: 'Analytics',
      connected: initialSettings?.connectedIntegrations?.includes('google-analytics') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/google-analytics.svg',
    },
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      description: 'Track Facebook ad conversions',
      category: 'Advertising',
      connected: initialSettings?.connectedIntegrations?.includes('facebook-pixel') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/facebook.svg',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 2000+ apps',
      category: 'Automation',
      connected: initialSettings?.connectedIntegrations?.includes('zapier') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/zapier.svg',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in Slack',
      category: 'Communication',
      connected: initialSettings?.connectedIntegrations?.includes('slack') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/slack.svg',
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Send data to your own systems',
      category: 'Developer Tools',
      connected: initialSettings?.connectedIntegrations?.includes('webhook') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/webhook.svg',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing',
      category: 'Payments',
      connected: initialSettings?.connectedIntegrations?.includes('stripe') || false,
      logo: 'https://cdn.worldvectorlogo.com/logos/stripe.svg',
    },
  ]);

  const [webhookUrl, setWebhookUrl] = useState(initialSettings?.webhookUrl || '');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const connectedIntegrations = integrations
      .filter(integration => integration.connected)
      .map(integration => integration.id);

    const settings = {
      connectedIntegrations,
      webhookUrl,
    };
    onSave(settings);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map(integration =>
        integration.id === id ? { ...integration, connected: !integration.connected } : integration
      )
    );
  };

  const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))];

  const filteredIntegrations =
    selectedCategory === 'All'
      ? integrations
      : integrations.filter(i => i.category === selectedCategory);

  const connectIntegration = (id: string) => {
    // In a real app, this would open a modal or redirect to OAuth
    // For now, we'll just toggle the connection status
    toggleIntegration(id);
  };

  const disconnectIntegration = (id: string) => {
    if (window.confirm('Are you sure you want to disconnect this integration?')) {
      toggleIntegration(id);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Integrations
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect third-party tools to enhance your workflow.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {/* Category Filter */}
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Integrations Grid */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Available Integrations
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map(integration => (
                <div
                  key={integration.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col h-full dark:border-gray-700"
                >
                  <div className="flex items-start">
                    <img
                      className="h-10 w-10 rounded-md object-contain"
                      src={integration.logo}
                      alt={`${integration.name} logo`}
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://cdn.worldvectorlogo.com/logos/integration.svg';
                      }}
                    />
                    <div className="ml-3 flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {integration.category}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {integration.connected ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Disconnected
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex-1">
                    {integration.description}
                  </p>
                  <div className="mt-4">
                    {integration.connected ? (
                      <button
                        type="button"
                        onClick={() => disconnectIntegration(integration.id)}
                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => connectIntegration(integration.id)}
                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Integration */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Webhook Integration
            </h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="webhookUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Webhook URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="url"
                    id="webhookUrl"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://your-webhook-url.com/paygate"
                    className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Receive real-time notifications about sales, customer actions, and system events
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                  Webhook Events
                </h5>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sale completed</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Customer registered
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Content accessed
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Subscription renewed
                    </span>
                  </li>
                </ul>
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View webhook documentation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Integrations Summary */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Connected Integrations
            </h4>
            {integrations.filter(i => i.connected).length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {integrations
                  .filter(i => i.connected)
                  .map(integration => (
                    <div
                      key={integration.id}
                      className="border border-gray-200 rounded-lg p-4 dark:border-gray-700"
                    >
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-md object-contain"
                          src={integration.logo}
                          alt={`${integration.name} logo`}
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://cdn.worldvectorlogo.com/logos/integration.svg';
                          }}
                        />
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {integration.name}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {integration.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => disconnectIntegration(integration.id)}
                          className="ml-auto text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No integrations connected
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Connect integrations to enhance your workflow
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Integration Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Integrations;
