import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { isTokenExpired, getTokenExpiration } from '../services/auth/utils/token.utils';
import type { UserData } from '../services/auth/types/auth.types';
import type { AxiosError } from 'axios';

// Constants
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before token expiry

// Type guard for Axios errors
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: (options?: { redirectTo?: string; silent?: boolean }) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    additionalData?: {
      country?: string;
      currency?: string;
      userType?: 'creator' | 'business' | 'other';
      contentTypes?: string[];
    }
  ) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  getAuthStatus: () => { isAuthenticated: boolean; isTokenExpired: boolean; expiresIn: number };
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  
  // Derive isAuthenticated from token state
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Calculate isAuthenticated based on token state
  const isAuthenticated = useMemo(() => {
    const token = authService.getToken();
    return !!token && !isTokenExpired(token);
  }, [user]); // Recalculate when user changes

  const navigate = useNavigate();

  // Create a ref to store the logout function
  const logoutRef = useRef<AuthContextType['logout']>();

  const getAuthStatus = useCallback(() => {
    const token = authService.getToken();
    const expiresIn = token ? getTokenExpiration(token) : null;
    const isExpired = !expiresIn || expiresIn <= Date.now();

    return {
      isAuthenticated: !isExpired,
      isTokenExpired: isExpired,
      expiresIn: expiresIn ? expiresIn - Date.now() : 0,
    };
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const token = authService.getToken();
      if (!token || isTokenExpired(token)) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken && !isTokenExpired(refreshToken)) {
          return await refreshAccessToken();
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }, []);

  // Define logout function
  const logout = useCallback(async (options: { redirectTo?: string; silent?: boolean } = {}) => {
    const { redirectTo = '/login', silent = false } = options;
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        setTokenRefreshTimer(null);
      }
      if (!silent) {
        navigate(redirectTo);
      }
    }
  }, [navigate, tokenRefreshTimer]);

  // Update the ref when logout changes
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const accessToken = await authService.refreshToken(refreshToken);
      if (accessToken) {
        // Token was refreshed successfully
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Use the ref instead of directly calling logout
      if (logoutRef.current) {
        await logoutRef.current({ silent: true });
      }
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success(`Welcome back, ${response.user.name || 'User'}!`);
        return { success: true };
      }
      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error: unknown) {
      const errorMessage = isAxiosError(error)
        ? (error.response?.data as any)?.message || 'Login failed. Please try again.'
        : 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    additionalData?: {
      country?: string;
      currency?: string;
      userType?: 'creator' | 'business' | 'other';
      contentTypes?: string[];
    }
  ) => {
    try {
      setIsLoading(true);
      const response = await authService.register({
        name,
        email,
        password,
        ...(additionalData || {})
      });
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Registration successful! Welcome to Paygate.');
      const redirectPath = additionalData?.userType === 'creator' ? '/onboarding' : '/dashboard';
      navigate(redirectPath);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = isAxiosError(error)
        ? (error.response?.data as any)?.message || 'Registration failed. Please try again.'
        : 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = authService.getToken();
      if (!token) return null;
      
      // If token is not expired, return it
      if (!isTokenExpired(token)) {
        return token;
      }
      
      // Token is expired, try to refresh
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken || isTokenExpired(refreshToken)) {
        // No valid refresh token, clear auth state
        if (user) {
          setUser(null);
          localStorage.removeItem('user');
        }
        return null;
      }
      
      // Try to refresh the token
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        return null;
      }
      
      // Return the new token
      return authService.getToken();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }, [refreshAccessToken, user]);

  const contextValue = useMemo((): AuthContextType => ({
    user,
    isAuthenticated,
    isLoading,
    authInitialized,
    login,
    logout,
    register,
    checkAuth,
    refreshAccessToken,
    getAuthStatus,
    getAccessToken,
  }), [user, isAuthenticated, isLoading, authInitialized, login, logout, register, checkAuth, refreshAccessToken, getAuthStatus, getAccessToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const token = authService.getToken();
        
        if (token && !isTokenExpired(token)) {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // If we can't get user data, clear auth state
            setUser(null);
            localStorage.removeItem('user');
            authService.clearTokens();
          }
        } else if (token && isTokenExpired(token)) {
          // Token is expired, try to refresh
          const refreshToken = authService.getRefreshToken();
          if (refreshToken && !isTokenExpired(refreshToken)) {
            await refreshAccessToken();
          } else {
            // No valid refresh token, clear auth state
            setUser(null);
            localStorage.removeItem('user');
            authService.clearTokens();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setAuthInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // No dependencies to avoid re-running unnecessarily

  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    const expiresIn = getTokenExpiration(token);
    if (!expiresIn) return;

    const timeUntilExpiry = expiresIn - Date.now() - TOKEN_REFRESH_THRESHOLD;

    let timer: NodeJS.Timeout;

    const refreshIfNeeded = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    };

    if (timeUntilExpiry <= 0) {
      // Token is expired or about to expire, refresh immediately
      refreshIfNeeded();
    } else {
      // Schedule refresh
      timer = setTimeout(refreshIfNeeded, timeUntilExpiry);
    }

    // Cleanup on unmount or when token changes
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [refreshAccessToken]);

  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
