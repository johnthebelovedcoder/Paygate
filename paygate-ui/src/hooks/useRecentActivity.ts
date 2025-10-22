import { useState, useEffect } from 'react';
import customerService, { type Customer } from '../services/customerService';
import paymentService, { type Payment } from '../services/paymentService';
import { useAppData } from '../contexts';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface ActivityItem {
  id: string;
  type: 'sale' | 'signup' | 'upload' | 'payment_issue' | 'subscription_expiring' | 'feature_update';
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
}

interface UseRecentActivityReturn {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
}

const useRecentActivity = (): UseRecentActivityReturn => {
  const { paywalls } = useAppData();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent payments (sales)
        const recentPayments = await paymentService.getRecentPayments(3);

        // Fetch recent customers
        const recentCustomers = await customerService.getCustomers();

        // Generate mock file uploads
        const fileUploads = [
          {
            id: '1',
            title: 'New content uploaded',
            description: 'Course materials.zip',
            time: '2 hours ago',
          },
          {
            id: '2',
            title: 'Content added',
            description: 'Advanced React Patterns.pdf',
            time: '1 day ago',
          },
        ];

        // Generate mock alerts
        const alerts = [
          {
            id: '1',
            title: 'Payment issue',
            description: 'Failed payment for customer@example.com',
            time: '30 minutes ago',
          },
          {
            id: '2',
            title: 'Subscription expiring',
            description: 'Customer subscription expires in 3 days',
            time: '1 hour ago',
          },
          {
            id: '3',
            title: 'New feature available',
            description: 'Check out our new analytics dashboard',
            time: '1 day ago',
          },
        ];

        // Combine all activities
        const activityList: ActivityItem[] = [
          // Recent sales
          ...recentPayments.map(payment => ({
            id: payment.id,
            type: 'sale' as const,
            title: 'New Sale',
            description: `${payment.customerEmail || 'Customer'} purchased ${payment.paywallTitle || 'content'} for ${new Intl.NumberFormat(
              'en-US',
              {
                style: 'currency',
                currency: payment.currency || 'USD',
              }
            ).format(payment.amount / 100)}`,
            time: new Date(payment.createdAt).toLocaleString(),
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconColor: 'bg-green-500',
          })),

          // Recent signups
          ...recentCustomers.slice(0, 2).map(customer => ({
            id: customer.id,
            type: 'signup' as const,
            title: 'New Customer',
            description: `${customer.name} (${customer.email}) joined`,
            time: customer.joinDate,
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            iconColor: 'bg-blue-500',
          })),

          // File uploads
          ...fileUploads.map(upload => ({
            id: upload.id,
            type: 'upload' as const,
            title: upload.title,
            description: upload.description,
            time: upload.time,
            icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
            iconColor: 'bg-purple-500',
          })),

          // Alerts
          ...alerts.map(alert => ({
            id: alert.id,
            type: alert.title.toLowerCase().includes('payment')
              ? ('payment_issue' as const)
              : alert.title.toLowerCase().includes('subscription')
                ? ('subscription_expiring' as const)
                : ('feature_update' as const),
            title: alert.title,
            description: alert.description,
            time: alert.time,
            icon: alert.title.toLowerCase().includes('payment')
              ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              : alert.title.toLowerCase().includes('subscription')
                ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconColor: alert.title.toLowerCase().includes('payment')
              ? 'bg-red-500'
              : alert.title.toLowerCase().includes('subscription')
                ? 'bg-yellow-500'
                : 'bg-indigo-500',
          })),
        ];

        // Sort by time (newest first)
        activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        setActivities(activityList.slice(0, 8)); // Limit to 8 most recent activities
      } catch (err: unknown) {
        console.error('Error fetching recent activity:', err);
        if (isAxiosError(err) && err.response?.data) {
          const responseData = err.response.data;
          if (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData
          ) {
            setError(
              (responseData as { message: string }).message ||
                'Failed to fetch recent activity. Please try again.'
            );
          } else {
            setError('Failed to fetch recent activity. Please try again.');
          }
        } else if (err instanceof Error) {
          setError(err.message || 'Failed to fetch recent activity. Please try again.');
        } else {
          setError('Failed to fetch recent activity. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [paywalls]);

  return {
    activities,
    loading,
    error,
  };
};

export default useRecentActivity;
