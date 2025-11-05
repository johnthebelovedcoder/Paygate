import React from 'react';
import { useTranslation } from 'react-i18next';

const Help: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('help.title', 'Help & Support')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('help.description', 'Find answers to common questions and get support for PayGate.')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('help.faq', 'Frequently Asked Questions')}
        </h2>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('help.q1.title', 'How do I create my first paywall?')}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t('help.q1.answer', 'Navigate to the "Create Paywall" section and follow our step-by-step guide to set up your first paywall.')}
            </p>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('help.q2.title', 'How do I track analytics?')}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t('help.q2.answer', 'Visit the Analytics section to view detailed metrics about your paywall performance.')}
            </p>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('help.q3.title', 'How do I manage customers?')}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t('help.q3.answer', 'Use the Customers section to view, manage, and communicate with your customers.')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('help.support', 'Get Support')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('help.documentation', 'Documentation')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {t('help.documentationDesc', 'Comprehensive guides and API documentation.')}
            </p>
            <a 
              href="#"
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              {t('help.viewDocs', 'View Documentation')}
            </a>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('help.contact', 'Contact Support')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {t('help.contactDesc', 'Get help from our support team.')}
            </p>
            <a 
              href="mailto:support@paygate.com"
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              {t('help.emailSupport', 'Email Support')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;