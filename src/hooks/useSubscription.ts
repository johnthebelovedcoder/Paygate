// hooks/useSubscription.ts - Custom hook for subscription management
import { useState, useEffect } from 'react';
import subscriptionService, {
  type Subscription,
  type Plan,
  type Invoice,
} from '../services/subscriptionService';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plans: Plan[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  updateSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshPlans: () => Promise<void>;
}

const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current subscription
  const fetchSubscription = async (): Promise<void> => {
    try {
      const data = await subscriptionService.getSubscription();
      setSubscription(data);
    } catch (err: unknown) {
      console.error('Error fetching subscription:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError((responseData as { message: string }).message || 'Failed to load subscription');
        } else {
          setError('Failed to load subscription');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to load subscription');
      } else {
        setError('Failed to load subscription');
      }
    }
  };

  // Fetch available plans
  const fetchPlans = async (): Promise<void> => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch (err: unknown) {
      console.error('Error fetching plans:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError((responseData as { message: string }).message || 'Failed to load plans');
        } else {
          setError('Failed to load plans');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to load plans');
      } else {
        setError('Failed to load plans');
      }
    }
  };

  // Fetch invoices
  const fetchInvoices = async (): Promise<void> => {
    try {
      const data = await subscriptionService.getInvoices();
      setInvoices(data);
    } catch (err: unknown) {
      console.error('Error fetching invoices:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError((responseData as { message: string }).message || 'Failed to load invoices');
        } else {
          setError('Failed to load invoices');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to load invoices');
      } else {
        setError('Failed to load invoices');
      }
    }
  };

  // Refresh all subscription data
  const refreshSubscription = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSubscription(), fetchPlans(), fetchInvoices()]);
    } catch (err: unknown) {
      console.error('Error refreshing subscription data:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError(
            (responseData as { message: string }).message || 'Failed to refresh subscription data'
          );
        } else {
          setError('Failed to refresh subscription data');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to refresh subscription data');
      } else {
        setError('Failed to refresh subscription data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update subscription plan
  const updateSubscription = async (plan: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updatedSubscription = await subscriptionService.updateSubscription(plan);
      setSubscription(updatedSubscription);
      // Refresh plans and invoices as well since they might have changed
      await Promise.all([fetchPlans(), fetchInvoices()]);
    } catch (err: unknown) {
      console.error('Error updating subscription:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError(
            (responseData as { message: string }).message || 'Failed to update subscription'
          );
        } else {
          setError('Failed to update subscription');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to update subscription');
      } else {
        setError('Failed to update subscription');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updatedSubscription = await subscriptionService.cancelSubscription();
      setSubscription(updatedSubscription);
      // Refresh plans and invoices as well since they might have changed
      await Promise.all([fetchPlans(), fetchInvoices()]);
    } catch (err: unknown) {
      console.error('Error cancelling subscription:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError(
            (responseData as { message: string }).message || 'Failed to cancel subscription'
          );
        } else {
          setError('Failed to cancel subscription');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to cancel subscription');
      } else {
        setError('Failed to cancel subscription');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh invoices
  const refreshInvoices = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await fetchInvoices();
    } catch (err: unknown) {
      console.error('Error refreshing invoices:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError((responseData as { message: string }).message || 'Failed to refresh invoices');
        } else {
          setError('Failed to refresh invoices');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to refresh invoices');
      } else {
        setError('Failed to refresh invoices');
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh plans
  const refreshPlans = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await fetchPlans();
    } catch (err: unknown) {
      console.error('Error refreshing plans:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError((responseData as { message: string }).message || 'Failed to refresh plans');
        } else {
          setError('Failed to refresh plans');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to refresh plans');
      } else {
        setError('Failed to refresh plans');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    refreshSubscription();
  }, []);

  return {
    subscription,
    plans,
    invoices,
    loading,
    error,
    refreshSubscription,
    updateSubscription,
    cancelSubscription,
    refreshInvoices,
    refreshPlans,
  };
};

export default useSubscription;
