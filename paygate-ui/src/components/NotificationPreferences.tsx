import React, { useState } from 'react';

export interface NotificationSettings {
  emailAlerts: {
    sales: boolean;
    customerIssues: boolean;
    systemUpdates: boolean;
    marketingTips: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  inAppAlerts: {
    sales: boolean;
    customerIssues: boolean;
    systemUpdates: boolean;
    marketingTips: boolean;
  };
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface NotificationPreferencesProps {
  onSave: (preferences: NotificationSettings) => void;
  initialPreferences?: NotificationSettings;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onSave,
  initialPreferences,
}) => {
  const [emailAlerts, setEmailAlerts] = useState({
    sales: initialPreferences?.emailAlerts?.sales ?? true,
    customerIssues: initialPreferences?.emailAlerts?.customerIssues ?? true,
    systemUpdates: initialPreferences?.emailAlerts?.systemUpdates ?? true,
    marketingTips: initialPreferences?.emailAlerts?.marketingTips ?? true,
    weeklyReports: initialPreferences?.emailAlerts?.weeklyReports ?? true,
    monthlyReports: initialPreferences?.emailAlerts?.monthlyReports ?? true,
  });

  const [inAppAlerts, setInAppAlerts] = useState({
    sales: initialPreferences?.inAppAlerts?.sales ?? true,
    customerIssues: initialPreferences?.inAppAlerts?.customerIssues ?? true,
    systemUpdates: initialPreferences?.inAppAlerts?.systemUpdates ?? true,
    marketingTips: initialPreferences?.inAppAlerts?.marketingTips ?? true,
  });

  const [notificationFrequency, setNotificationFrequency] = useState(
    initialPreferences?.notificationFrequency || 'immediate'
  );
  const [quietHours, setQuietHours] = useState({
    enabled: initialPreferences?.quietHours?.enabled ?? false,
    startTime: initialPreferences?.quietHours?.startTime || '22:00',
    endTime: initialPreferences?.quietHours?.endTime || '08:00',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const preferences = {
      emailAlerts,
      inAppAlerts,
      notificationFrequency,
      quietHours,
    };
    onSave(preferences);
  };

  const toggleEmailAlert = (alertType: keyof typeof emailAlerts) => {
    setEmailAlerts(prev => ({
      ...prev,
      [alertType]: !prev[alertType],
    }));
  };

  const toggleInAppAlert = (alertType: keyof typeof inAppAlerts) => {
    setInAppAlerts(prev => ({
      ...prev,
      [alertType]: !prev[alertType],
    }));
  };

  const handleQuietHoursChange = (field: 'startTime' | 'endTime', value: string) => {
    setQuietHours(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how and when you want to be notified about important events.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {/* Email Notifications */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Email Notifications
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Sales Alerts
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when someone makes a purchase
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmailAlert('sales')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    emailAlerts.sales ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailAlerts.sales}
                >
                  <span className="sr-only">Enable sales alerts</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailAlerts.sales ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Customer Issues
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about customer support tickets and issues
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmailAlert('customerIssues')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    emailAlerts.customerIssues ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailAlerts.customerIssues}
                >
                  <span className="sr-only">Enable customer issues alerts</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailAlerts.customerIssues ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    System Updates
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Important announcements and platform updates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmailAlert('systemUpdates')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    emailAlerts.systemUpdates ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailAlerts.systemUpdates}
                >
                  <span className="sr-only">Enable system updates</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailAlerts.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Marketing Tips
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Helpful tips to grow your sales and audience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmailAlert('marketingTips')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    emailAlerts.marketingTips ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailAlerts.marketingTips}
                >
                  <span className="sr-only">Enable marketing tips</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailAlerts.marketingTips ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Weekly Reports
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Weekly summary of your sales and performance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmailAlert('weeklyReports')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    emailAlerts.weeklyReports ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailAlerts.weeklyReports}
                >
                  <span className="sr-only">Enable weekly reports</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailAlerts.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Monthly Reports
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detailed monthly performance analysis
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmailAlert('monthlyReports')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    emailAlerts.monthlyReports ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={emailAlerts.monthlyReports}
                >
                  <span className="sr-only">Enable monthly reports</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailAlerts.monthlyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* In-App Notifications */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              In-App Notifications
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Sales Alerts
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show notifications in the dashboard when sales happen
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleInAppAlert('sales')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    inAppAlerts.sales ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={inAppAlerts.sales}
                >
                  <span className="sr-only">Enable in-app sales alerts</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      inAppAlerts.sales ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Customer Issues
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show notifications for customer support tickets
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleInAppAlert('customerIssues')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    inAppAlerts.customerIssues ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={inAppAlerts.customerIssues}
                >
                  <span className="sr-only">Enable in-app customer issues</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      inAppAlerts.customerIssues ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    System Updates
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show notifications for important platform updates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleInAppAlert('systemUpdates')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    inAppAlerts.systemUpdates ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={inAppAlerts.systemUpdates}
                >
                  <span className="sr-only">Enable in-app system updates</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      inAppAlerts.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Marketing Tips
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show notifications with marketing insights and tips
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleInAppAlert('marketingTips')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    inAppAlerts.marketingTips ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={inAppAlerts.marketingTips}
                >
                  <span className="sr-only">Enable in-app marketing tips</span>
                  <span
                    className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      inAppAlerts.marketingTips ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Frequency */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Notification Frequency
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="immediate"
                    checked={notificationFrequency === 'immediate'}
                    onChange={() => setNotificationFrequency('immediate')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Immediate
                  </span>
                </label>
                <p className="ml-7 text-sm text-gray-500 dark:text-gray-400">
                  Send notifications as they happen
                </p>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="hourly"
                    checked={notificationFrequency === 'hourly'}
                    onChange={() => setNotificationFrequency('hourly')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hourly Digest
                  </span>
                </label>
                <p className="ml-7 text-sm text-gray-500 dark:text-gray-400">
                  Bundle notifications hourly
                </p>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="daily"
                    checked={notificationFrequency === 'daily'}
                    onChange={() => setNotificationFrequency('daily')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Daily Digest
                  </span>
                </label>
                <p className="ml-7 text-sm text-gray-500 dark:text-gray-400">
                  Bundle notifications daily
                </p>
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Quiet Hours</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pause notifications during specified hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuietHours(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  quietHours.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={quietHours.enabled}
              >
                <span className="sr-only">Enable quiet hours</span>
                <span
                  className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    quietHours.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {quietHours.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={quietHours.startTime}
                    onChange={e => handleQuietHoursChange('startTime', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={quietHours.endTime}
                    onChange={e => handleQuietHoursChange('endTime', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    During quiet hours, non-critical notifications will be delayed until the end of
                    this period.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Notification Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationPreferences;
