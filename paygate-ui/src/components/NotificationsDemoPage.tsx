// NotificationsDemoPage.tsx - Demo page for the notification system
import React from 'react';
import Header from './Header';
import NotificationDemo from './NotificationDemo';
import { useToast } from '../contexts';

const NotificationsDemoPage: React.FC = () => {
  const { showToast } = useToast();

  const showInfoToast = () => {
    showToast({
      title: 'Information',
      message: 'This is an informational message.',
      type: 'info',
    });
  };

  const showSuccessToast = () => {
    showToast({
      title: 'Success!',
      message: 'Your action was completed successfully.',
      type: 'success',
    });
  };

  const showWarningToast = () => {
    showToast({
      title: 'Warning',
      message: 'Please review your settings before proceeding.',
      type: 'warning',
    });
  };

  const showErrorToast = () => {
    showToast({
      title: 'Error',
      message: 'An error occurred. Please try again.',
      type: 'error',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Notifications Demo" subtitle="Demonstration of the notification system" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  Toast Notifications
                </h3>
                <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                  Click the buttons below to show different types of toast notifications.
                </p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <button
                    onClick={showInfoToast}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2"
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
                    Info Toast
                  </button>
                  <button
                    onClick={showSuccessToast}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg
                      className="h-5 w-5 text-white mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Success Toast
                  </button>
                  <button
                    onClick={showWarningToast}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg
                      className="h-5 w-5 text-white mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Warning Toast
                  </button>
                  <button
                    onClick={showErrorToast}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg
                      className="h-5 w-5 text-white mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Error Toast
                  </button>
                </div>
              </div>

              <NotificationDemo />

              <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  How to Use Notifications
                </h3>
                <div className="prose prose-indigo max-w-none dark:prose-invert">
                  <h4>Toast Notifications</h4>
                  <p>
                    To show a toast notification, use the <code>useToast</code> hook:
                  </p>
                  <pre className="bg-gray-100 p-4 rounded dark:bg-gray-700">
                    <code>{`import { useToast } from '../contexts';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleClick = () => {
    showToast({
      title: 'Success!',
      message: 'Your action was completed successfully.',
      type: 'success'
    });
  };
  
  return (
    <button onClick={handleClick}>Show Toast</button>
  );
};`}</code>
                  </pre>

                  <h4>Dropdown Notifications</h4>
                  <p>
                    Dropdown notifications are automatically managed by the{' '}
                    <code>NotificationProvider</code>. The notification count badge will
                    automatically update when new notifications arrive.
                  </p>

                  <h4>Adding New Notifications</h4>
                  <p>
                    To add a new notification programmatically, you can use the notification
                    service:
                  </p>
                  <pre className="bg-gray-100 p-4 rounded dark:bg-gray-700">
                    <code>{`import notificationService from '../services/notificationService';

// Add a new notification
notificationService.addNotification({
  title: 'New Sale!',
  message: 'Someone purchased your "React Fundamentals" ebook.',
  type: 'success'
});`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsDemoPage;
