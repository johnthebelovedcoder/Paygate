// NotificationDemo.tsx - Demo component to show how to trigger notifications
import React from 'react';
import notificationService from '../services/notificationService';

const NotificationDemo: React.FC = () => {
  const addNotification = () => {
    notificationService.addNotification({
      title: 'New Feature Available!',
      message: 'Check out our new analytics dashboard with enhanced reporting capabilities.',
      type: 'info',
    });
  };

  const addSuccessNotification = () => {
    notificationService.addNotification({
      title: 'Payment Successful!',
      message: 'Your payment of $49.99 has been processed successfully.',
      type: 'success',
    });
  };

  const addWarningNotification = () => {
    notificationService.addNotification({
      title: 'Account Balance Low',
      message:
        'Your account balance is running low. Please add funds to avoid service interruption.',
      type: 'warning',
    });
  };

  const addErrorNotification = () => {
    notificationService.addNotification({
      title: 'Payment Failed',
      message: 'We were unable to process your payment. Please update your payment method.',
      type: 'error',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Notification Demo</h3>
      <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
        Click the buttons below to trigger different types of notifications.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={addNotification}
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
          Info Notification
        </button>
        <button
          onClick={addSuccessNotification}
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
          Success Notification
        </button>
        <button
          onClick={addWarningNotification}
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
          Warning Notification
        </button>
        <button
          onClick={addErrorNotification}
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
          Error Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationDemo;
