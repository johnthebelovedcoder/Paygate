// AuthContext.tsx - Authentication context for managing user state
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import type { UserData } from '../services/authService';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  ) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user session when the app loads
    const initializeAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const register = async (
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
      const response = await authService.register(name, email, password, additionalData);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      await authService.refreshToken();
      // The token refresh is handled internally by the API service
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout the user
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
