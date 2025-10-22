import { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import type { Customer } from '../services/customerService';
import { useAuth } from '../contexts';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
}

const useCustomers = (): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCustomers = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching customers:', err);
      let errorMessage = 'Failed to fetch customers. Please try again.';

      if (isAxiosError(err)) {
        if (err.message.includes('Authentication')) {
          errorMessage = 'Authentication required. Please log in.';
          window.location.href = '/login';
        } else if (err.message.includes('Access forbidden')) {
          errorMessage = 'You do not have permission to access customers.';
        } else if (
          err.message.includes('Network Error') ||
          err.message.includes('Failed to fetch')
        ) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers();
    }
  }, [isAuthenticated]);

  return {
    customers,
    loading,
    error,
    refreshCustomers: () => fetchCustomers(true),
  };
};

export default useCustomers;
