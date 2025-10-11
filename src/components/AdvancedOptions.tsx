import React, { useState } from 'react';

interface AdvancedOptionsProps {
  onAnalyticsChange: (analytics: { googleAnalytics?: string; facebookPixel?: string }) => void;
  onCustomerExperienceChange: (experience: {
    thankYouPage?: string;
    emailTemplate?: string;
  }) => void;
  onSecurityChange: (security: {
    watermark?: boolean;
    ipRestrictions?: boolean;
    geographicBlocking?: boolean;
  }) => void;
  onAutomationChange: (automation: { autoPublish?: boolean; scheduleDate?: string }) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  onAnalyticsChange,
  onCustomerExperienceChange,
  onSecurityChange,
  onAutomationChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analytics: false,
    customerExperience: false,
    security: false,
    automation: false,
  });

  const [analytics, setAnalytics] = useState({
    googleAnalytics: '',
    facebookPixel: '',
  });

  const [customerExperience, setCustomerExperience] = useState({
    thankYouPage: '',
    emailTemplate: '',
  });

  const [security, setSecurity] = useState({
    watermark: false,
    ipRestrictions: false,
    geographicBlocking: false,
  });

  const [automation, setAutomation] = useState({
    autoPublish: false,
    scheduleDate: '',
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAnalyticsChange = (field: keyof typeof analytics, value: string) => {
    const newAnalytics = { ...analytics, [field]: value };
    setAnalytics(newAnalytics);
    onAnalyticsChange(newAnalytics);
  };

  const handleCustomerExperienceChange = (
    field: keyof typeof customerExperience,
    value: string
  ) => {
    const newExperience = { ...customerExperience, [field]: value };
    setCustomerExperience(newExperience);
    onCustomerExperienceChange(newExperience);
  };

  const handleSecurityChange = (field: keyof typeof security, value: boolean) => {
    const newSecurity = { ...security, [field]: value };
    setSecurity(newSecurity);
    onSecurityChange(newSecurity);
  };

  const handleAutomationChange = (field: keyof typeof automation, value: string | boolean) => {
    const newAutomation = { ...automation, [field]: value };
    setAutomation(newAutomation);
    onAutomationChange(newAutomation);
  };

  return (
    <div className="space-y-4">
      {/* Analytics & Tracking */}
      <div className="border border-gray-200 rounded-lg dark:border-gray-700">
        <button
          type="button"
          className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={() => toggleSection('analytics')}
          aria-expanded={expandedSections.analytics}
        >
          <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
            <svg
              className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analytics & Tracking
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform dark:text-gray-400 ${
              expandedSections.analytics ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expandedSections.analytics && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="google-analytics"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Google Analytics Tracking ID
                </label>
                <input
                  type="text"
                  id="google-analytics"
                  value={analytics.googleAnalytics}
                  onChange={e => handleAnalyticsChange('googleAnalytics', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="UA-XXXXXXXX-X or G-XXXXXXXXXX"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter your Google Analytics tracking ID to monitor paywall performance
                </p>
              </div>

              <div>
                <label
                  htmlFor="facebook-pixel"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  id="facebook-pixel"
                  value={analytics.facebookPixel}
                  onChange={e => handleAnalyticsChange('facebookPixel', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="XXXXXXXXXXXXXXX"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter your Facebook Pixel ID to track conversions and retarget visitors
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Experience */}
      <div className="border border-gray-200 rounded-lg dark:border-gray-700">
        <button
          type="button"
          className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={() => toggleSection('customerExperience')}
          aria-expanded={expandedSections.customerExperience}
        >
          <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
            <svg
              className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Customer Experience
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform dark:text-gray-400 ${
              expandedSections.customerExperience ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expandedSections.customerExperience && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="thank-you-page"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Custom Thank You Page URL
                </label>
                <input
                  type="url"
                  id="thank-you-page"
                  value={customerExperience.thankYouPage}
                  onChange={e => handleCustomerExperienceChange('thankYouPage', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="https://yoursite.com/thank-you"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Redirect customers to a custom thank you page after purchase
                </p>
              </div>

              <div>
                <label
                  htmlFor="email-template"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Custom Email Template
                </label>
                <textarea
                  id="email-template"
                  rows={4}
                  value={customerExperience.emailTemplate}
                  onChange={e => handleCustomerExperienceChange('emailTemplate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Dear {{customer_name}},&#10;&#10;Thank you for purchasing {{product_name}}!&#10;&#10;Your download link: {{download_link}}&#10;&#10;Best regards,&#10;{{business_name}}"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Customize the email receipt sent to customers after purchase
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security & Protection */}
      <div className="border border-gray-200 rounded-lg dark:border-gray-700">
        <button
          type="button"
          className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={() => toggleSection('security')}
          aria-expanded={expandedSections.security}
        >
          <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
            <svg
              className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Security & Protection
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform dark:text-gray-400 ${
              expandedSections.security ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expandedSections.security && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="watermark"
                    type="checkbox"
                    checked={security.watermark}
                    onChange={e => handleSecurityChange('watermark', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="watermark"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    PDF Watermarking
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Add a discreet watermark to PDF files to discourage unauthorized sharing
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="ip-restrictions"
                    type="checkbox"
                    checked={security.ipRestrictions}
                    onChange={e => handleSecurityChange('ipRestrictions', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="ip-restrictions"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    IP Address Restrictions
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Limit access to specific IP address ranges to prevent account sharing
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="geographic-blocking"
                    type="checkbox"
                    checked={security.geographicBlocking}
                    onChange={e => handleSecurityChange('geographicBlocking', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="geographic-blocking"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Geographic Blocking
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Restrict access based on customer location to comply with regional regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Automation */}
      <div className="border border-gray-200 rounded-lg dark:border-gray-700">
        <button
          type="button"
          className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={() => toggleSection('automation')}
          aria-expanded={expandedSections.automation}
        >
          <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
            <svg
              className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Automation
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform dark:text-gray-400 ${
              expandedSections.automation ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expandedSections.automation && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="auto-publish"
                    type="checkbox"
                    checked={automation.autoPublish}
                    onChange={e => handleAutomationChange('autoPublish', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="auto-publish"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Auto-publish
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Automatically publish this paywall when all content is uploaded
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="schedule-date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Schedule Publication
                </label>
                <input
                  type="datetime-local"
                  id="schedule-date"
                  value={automation.scheduleDate}
                  onChange={e => handleAutomationChange('scheduleDate', e.target.value)}
                  disabled={!automation.autoPublish}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Schedule this paywall to be published at a specific date and time
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedOptions;
