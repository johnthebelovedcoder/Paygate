import { useState, useEffect, useCallback, useRef } from 'react';
import paywallService, { type Paywall } from '../services/paywallService';
import { useAuth } from '../contexts/AuthContext';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface UsePaywallsReturn {
  paywalls: Paywall[];
  loading: boolean;
  error: string | null;
  refreshPaywalls: () => Promise<void>;
}

const usePaywalls = (): UsePaywallsReturn => {
  const [paywalls, setPaywalls] = useState<Paywall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, authInitialized } = useAuth();
  // Use ref instead of state for debounce timer to avoid stale closures
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPaywalls = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await paywallService.getPaywalls(forceRefresh);
      setPaywalls(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching paywalls:', err);
      let errorMessage = 'Failed to fetch paywalls. Please try again.';

      if (isAxiosError(err)) {
        // Check if it's an authentication-related error
        if (err.message.includes('Authentication')) {
          errorMessage = 'Authentication required. Please log in.';
          // Redirect to login page for authentication errors
          window.location.href = '/login';
        } else if (
          err.message.includes('Network Error') ||
          err.message.includes('Failed to fetch')
        ) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'Too many requests. Please wait before trying again.';
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

  // Optimized refresh function with better debounce handling
  const debouncedRefreshPaywalls = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchPaywalls(true);
    }, 500); // Increased debounce time to 500ms for better UX

    // Clean up timer on component unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      fetchPaywalls();
    }

    // Cleanup function to clear timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isAuthenticated, authInitialized]);

  // Also return an immediate refresh function without debounce for critical updates
  const immediateRefreshPaywalls = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await fetchPaywalls(true);
  }, []);

  // Return loading state while auth is initializing
  const effectiveLoading = authInitialized ? loading : true;

  return {
    paywalls,
    loading: effectiveLoading,
    error,
    refreshPaywalls: immediateRefreshPaywalls, // Use immediate refresh as default
  };
};

export default usePaywalls;
