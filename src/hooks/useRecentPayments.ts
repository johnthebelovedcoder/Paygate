import { useState, useEffect } from 'react';
import paymentService, { type Payment } from '../services/paymentService';
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
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
    fetchPayments();
  }, [limit]);

  return {
    payments,
    loading,
    error,
    refreshPayments: fetchPayments,
  };
};

export default useRecentPayments;
