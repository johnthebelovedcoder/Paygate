import React, { useState } from 'react';

interface UTMCampaign {
  id: string;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  createdAt: string;
  clicks: number;
  conversions: number;
}

const UTMLinkBuilder: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [utmCampaigns, setUtmCampaigns] = useState<UTMCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'tracking'>('builder');

  const handleGenerateUrl = () => {
    if (!originalUrl) {
      alert('Please enter a URL');
      return;
    }

    try {
      // Validate URL format
      new URL(originalUrl);
    } catch (e) {
      alert('Please enter a valid URL (include http:// or https://)');
      return;
    }

    if (!source) {
      alert('Please enter a source');
      return;
    }

    if (!medium) {
      alert('Please enter a medium');
      return;
    }

    if (!campaignName) {
      alert('Please enter a campaign name');
      return;
    }

    // Build UTM parameters
    const params = new URLSearchParams();

    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaignName) params.set('utm_campaign', campaignName);
    if (term) params.set('utm_term', term);
    if (content) params.set('utm_content', content);

    // Construct final URL
    const separator = originalUrl.includes('?') ? '&' : '?';
    const finalUrl = `${originalUrl}${separator}${params.toString()}`;

    setGeneratedUrl(finalUrl);

    // Add to tracking list
    const newCampaign: UTMCampaign = {
      id: Date.now().toString(),
      name: campaignName,
      source,
      medium,
      campaign: campaignName,
      term,
      content,
      createdAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
    };

    setUtmCampaigns([newCampaign, ...utmCampaigns]);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      alert('URL copied to clipboard!');
    }
  };

  const downloadReport = () => {
    const csvContent = [
      ['Campaign Name', 'Source', 'Medium', 'Clicks', 'Conversions', 'Conversion Rate'],
      ...utmCampaigns.map(campaign => [
        campaign.name,
        campaign.source,
        campaign.medium,
        campaign.clicks.toString(),
        campaign.conversions.toString(),
        campaign.clicks > 0 
          ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2) + '%' 
          : '0%'
      ])
    ];
    
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utm-tracking-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">UTM Link Builder</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'builder'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Link Builder
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'tracking'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Tracking
          </button>
        </div>
      </div>

      {activeTab === 'builder' && (
        <div>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="original-url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Original URL *
              </label>
              <input
                type="url"
                id="original-url"
                value={originalUrl}
                onChange={e => setOriginalUrl(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/product"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Source *
                </label>
                <input
                  type="text"
                  id="source"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="google, newsletter, facebook"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Where is the traffic coming from?
                </p>
              </div>

              <div>
                <label
                  htmlFor="medium"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Medium *
                </label>
                <select
                  id="medium"
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select a medium</option>
                  <option value="cpc">CPC (Paid Search)</option>
                  <option value="email">Email</option>
                  <option value="social">Social Media</option>
                  <option value="organic">Organic Search</option>
                  <option value="referral">Referral</option>
                  <option value="banner">Banner Ad</option>
                  <option value="affiliate">Affiliate</option>
                  <option value="other">Other</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  What marketing medium?</p>
              </div>
            </div>

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
                placeholder="summer_sale, ebook_launch"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Product, promo code, or slogan
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="term"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Term (Optional)
                </label>
                <input
                  type="text"
                  id="term"
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="running shoes, ebook"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Paid keywords or ad group
                </p>
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Content (Optional)
                </label>
                <input
                  type="text"
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="text_link, banner_ad"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Differentiator for ads or links
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateUrl}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate UTM Link
              </button>
            </div>

            {generatedUrl && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generated UTM Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 flex space-x-3">
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
                  >
                    Test Link
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            )}
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
                  UTM Parameter Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use lowercase letters and underscores for consistency</li>
                    <li>Be specific with campaign names (avoid generic terms)</li>
                    <li>Track different ad formats with the content parameter</li>
                    <li>Use term parameter for paid keywords</li>
                    <li>Test your links before publishing to ensure they work correctly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Tracked Campaigns
            </h4>
            {utmCampaigns.length > 0 && (
              <button
                onClick={downloadReport}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </button>
            )}
          </div>

          {utmCampaigns.length === 0 ? (
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No tracked campaigns
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Generate UTM links to start tracking campaign performance.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('builder')}
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
                  Create UTM Link
                </button>
              </div>
            </div>
          ) : (
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
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Medium
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Clicks
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Conversions
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
                  {utmCampaigns.map(campaign => (
                    <tr key={campaign.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {campaign.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.source}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.medium}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.clicks}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.conversions}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaign.clicks > 0 
                          ? ((campaign.conversions / campaign.clicks) * 100).toFixed(1) + '%' 
                          : '0%'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setOriginalUrl(window.location.origin);
                            setSource(campaign.source);
                            setMedium(campaign.medium);
                            setCampaignName(campaign.campaign);
                            setTerm(campaign.term);
                            setContent(campaign.content);
                            setActiveTab('builder');
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Clone
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UTMLinkBuilder;