// contexts/UserPreferencesContext.tsx - User preferences context for managing user preferences
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userPreferencesService, { type UserPreferences } from '../services/userPreferencesService';
import { useAuth } from './AuthContext';

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<Omit<UserPreferences, 'userId' | 'updatedAt'>>
  ) => Promise<void>;
  validateContentTypes: (contentTypes: string[]) => Promise<{ isValid: boolean; error?: string }>;
  validateUserType: (userType: string) => Promise<{ isValid: boolean; error?: string }>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    } else {
      setPreferences(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesService.getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to fetch user preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<Omit<UserPreferences, 'userId' | 'updatedAt'>>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesService.updatePreferences(newPreferences);
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update user preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateContentTypes = async (contentTypes: string[]) => {
    try {
      const response = await userPreferencesService.validateContentTypes(contentTypes);
      if (response.success && response.data) {
        return response.data;
      }
      return { isValid: false, error: 'Validation failed' };
    } catch (err) {
      const error = err as Error;
      return { isValid: false, error: error.message || 'Validation failed' };
    }
  };

  const validateUserType = async (userType: string) => {
    try {
      const response = await userPreferencesService.validateUserType(userType);
      if (response.success && response.data) {
        return response.data;
      }
      return { isValid: false, error: 'Validation failed' };
    } catch (err) {
      const error = err as Error;
      return { isValid: false, error: error.message || 'Validation failed' };
    }
  };

  const value = {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    validateContentTypes,
    validateUserType,
  };

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
