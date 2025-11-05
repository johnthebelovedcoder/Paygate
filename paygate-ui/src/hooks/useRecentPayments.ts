import { useState, useEffect } from 'react';
import paymentService, { type Payment } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface UseRecentPaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refreshPayments: () => Promise<void>;
}

const useRecentPayments = (limit: number = 5): UseRecentPaymentsReturn => {
  const { isAuthenticated, authInitialized } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      // Wait for auth to be initialized before proceeding
      if (!authInitialized) {
        console.debug('Auth not initialized yet, skipping recent payments fetch');
        return;
      }
      
      // Only attempt to fetch data if we're authenticated
      if (!isAuthenticated) {
        console.warn('Skipping recent payments fetch: Not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const paymentsData = await paymentService.getRecentPayments(limit);
      setPayments(paymentsData);
    } catch (err: unknown) {
      console.error('Error fetching recent payments:', err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError(
            (responseData as { message: string }).message ||
              'Failed to fetch recent payments. Please try again.'
          );
        } else {
          setError('Failed to fetch recent payments. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to fetch recent payments. Please try again.');
      } else {
        setError('Failed to fetch recent payments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authInitialized) {
      fetchPayments();
    }
  }, [limit, authInitialized]);

  // Return loading state while auth is initializing
  const effectiveLoading = authInitialized ? loading : true;

  return {
    payments,
    loading: effectiveLoading,
    error,
    refreshPayments: fetchPayments,
  };
};

export default useRecentPayments;
