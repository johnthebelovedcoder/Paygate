// notification.utils.ts - Utility functions for triggering notifications
import notificationService from '../services/notificationService';
import { useToast } from '../contexts';

// Trigger a notification when a sale is made
export const notifySale = (productName: string, amount: number) => {
  notificationService.addNotification({
    title: 'New Sale!',
    message: `Someone purchased your "${productName}" for $${amount.toFixed(2)}.`,
    type: 'success',
  });
};

// Trigger a notification when a payment is processed
export const notifyPaymentProcessed = (amount: number) => {
  notificationService.addNotification({
    title: 'Payment Processed',
    message: `Your payment of $${amount.toFixed(2)} has been successfully processed.`,
    type: 'info',
  });
};

// Trigger a notification for low balance warning
export const notifyLowBalance = (balance: number) => {
  notificationService.addNotification({
    title: 'Low Balance Warning',
    message: `Your account balance is $${balance.toFixed(2)}. Please add funds to avoid service interruption.`,
    type: 'warning',
  });
};

// Trigger a notification for payment failure
export const notifyPaymentFailure = () => {
  notificationService.addNotification({
    title: 'Payment Failed',
    message: 'We were unable to process your payment. Please update your payment method.',
    type: 'error',
  });
};

// Trigger a notification for new subscriber
export const notifyNewSubscriber = (subscriberName: string) => {
  notificationService.addNotification({
    title: 'New Subscriber!',
    message: `${subscriberName} has subscribed to your content.`,
    type: 'success',
  });
};

// Trigger a notification for content download
export const notifyContentDownload = (contentName: string) => {
  notificationService.addNotification({
    title: 'Content Downloaded',
    message: `Your "${contentName}" has been downloaded by a customer.`,
    type: 'info',
  });
};

// Show a toast notification
export const showToastNotification = (
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error'
) => {
  // This would typically be called from a component that has access to the toast context
  console.log(`Toast notification: ${title} - ${message} (${type})`);
  // In a real implementation, you would call useToast() in the component and then showToast()
};

// Example usage in a component:
/*
import { useToast } from '../contexts';
import { notifySale } from '../utils/notification.utils';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleSale = () => {
    // Add to notification center
    notifySale('React Fundamentals Ebook', 49.99);
    
    // Also show a toast notification
    showToast({
      title: 'New Sale!',
      message: 'Someone purchased your "React Fundamentals" ebook.',
      type: 'success'
    });
  };
  
  return (
    <button onClick={handleSale}>Simulate Sale</button>
  );
};
*/
