import { useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';

// Define a default auth context for when the hook is used outside a provider
const defaultAuthContext: Partial<AuthContextType> = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  authInitialized: false,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: async () => {},
  register: async () => ({ success: false, error: 'Auth not initialized' }),
  checkAuth: async () => false,
  refreshAccessToken: async () => false,
  getAuthStatus: () => ({
    isAuthenticated: false,
    isTokenExpired: true,
    expiresIn: 0
  })
};

// Create a safe version of the auth context
const useSafeAuth = (): AuthContextType => {
  try {
    const context = useContext(AuthContext);
    return context || defaultAuthContext as AuthContextType;
  } catch (error) {
    return defaultAuthContext as AuthContextType;
  }
};

/**
 * Hook to silence development logs when user is not authenticated
 */
const useDevLogger = () => {
  // Use the safe auth hook that won't throw if AuthContext is not available
  const { isAuthenticated } = useSafeAuth();

  useEffect(() => {
    // Only run in development
    if (!import.meta.env.DEV) return;

    // Store original console methods
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    // Override console methods to filter out specific messages
    if (!isAuthenticated) {
      console.log = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('Skipping analytics refresh') && 
            !message.includes('Skipping recent payments fetch')) {
          originalConsoleLog.apply(console, args);
        }
      };

      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('SW registration')) {
          originalConsoleWarn.apply(console, args);
        }
      };

      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (!message.includes('ServiceWorker') && 
            !message.includes('SW registration')) {
          originalConsoleError.apply(console, args);
        }
      };
    }

    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [isAuthenticated]);
};

export default useDevLogger;
