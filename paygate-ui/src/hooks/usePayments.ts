import { useState, useEffect, useCallback } from 'react';
import { PaymentService } from '../services/paymentService';
import { useAuthApi } from './useAuthApi';
import { useAuth } from '../contexts/AuthContext';
import type { 
  Payment, 
  PaymentResponse, 
  PaymentListResponse,
  CreatePaymentRequest 
} from '../types/payment.types';

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refreshPayments: () => Promise<void>;
  createPayment: (paymentData: CreatePaymentRequest) => Promise<Payment | null>;
  updatePayment: (id: string, paymentData: Partial<Payment>) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
}

const usePayments = (): UsePaymentsReturn => {
  const { isAuthenticated, authInitialized } = useAuth();
  const authApi = useAuthApi();
  const paymentService = new PaymentService(authApi);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      // Wait for auth to be initialized before proceeding
      if (!authInitialized) {
        console.debug('Auth not initialized yet, skipping payments fetch');
        return;
      }
      
      // Only attempt to fetch data if we're authenticated
      if (!isAuthenticated) {
        console.warn('Skipping payments fetch: Not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await paymentService.getPayments();
      setPayments(response.data || []);
    } catch (err) {
      const error = err as Error;
      // Don't show error if it's just an authentication issue
      if (error.message !== 'Authentication required') {
        console.error('Error fetching payments:', error);
        setError(error.message || 'Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  }, [authApi, paymentService, isAuthenticated, authInitialized]);

  const createPayment = useCallback(async (paymentData: CreatePaymentRequest) => {
    try {
      // Check auth state before proceeding
      if (!authInitialized || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      setLoading(true);
      setError(null);

      const response = await paymentService.createPayment(paymentData);
      await fetchPayments(); // Refresh the list
      return response.data || null;
    } catch (err) {
      const error = err as Error;
      console.error('Error creating payment:', error);
      setError(error.message || 'Failed to create payment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authApi, fetchPayments, paymentService, isAuthenticated, authInitialized]);

  const updatePayment = useCallback(async (id: string, paymentData: Partial<CreatePaymentRequest>) => {
    try {
      // Check auth state before proceeding
      if (!authInitialized || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      setLoading(true);
      setError(null);

      const response = await paymentService.updatePayment(id, paymentData);
      await fetchPayments(); // Refresh the list
      return response.data || null;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating payment:', error);
      setError(error.message || 'Failed to update payment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authApi, fetchPayments, paymentService, isAuthenticated, authInitialized]);

  const deletePayment = useCallback(async (id: string) => {
    try {
      // Check auth state before proceeding
      if (!authInitialized || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      setLoading(true);
      setError(null);

      await paymentService.deletePayment(id);
      await fetchPayments(); // Refresh the list
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting payment:', error);
      setError(error.message || 'Failed to delete payment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [authApi, fetchPayments, paymentService, isAuthenticated, authInitialized]);

  // Initial fetch
  useEffect(() => {
    if (authInitialized) {
      fetchPayments();
    }
  }, [fetchPayments, authInitialized]);

  // Return loading state while auth is initializing
  const effectiveLoading = authInitialized ? loading : true;

  return {
    payments,
    loading: effectiveLoading,
    error,
    refreshPayments: fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  };
};

export default usePayments;
