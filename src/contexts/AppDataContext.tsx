import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import usePaywalls from '../hooks/usePaywalls';
import useContent from '../hooks/useContent';
import useAnalytics from '../hooks/useAnalytics';
import useRecentPayments from '../hooks/useRecentPayments';
import useCustomers from '../hooks/useCustomers';
import type { ContentItem } from '../types/content.types';

export interface AppDataContextType {
  content: ReturnType<typeof useContent>;
  paywalls: ReturnType<typeof usePaywalls>;
  fetchContent: () => Promise<void>;
  fetchPaywalls: () => Promise<void>;
  analytics: ReturnType<typeof useAnalytics>;
  recentPayments: ReturnType<typeof useRecentPayments>;
  customers: ReturnType<typeof useCustomers>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const paywalls = usePaywalls();
  const content = useContent();
  const analytics = useAnalytics();
  const recentPayments = useRecentPayments();
  const customers = useCustomers();

  // Use useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      content,
      paywalls,
      fetchContent: content.refreshContent,
      fetchPaywalls: paywalls.refreshPaywalls,
      analytics,
      recentPayments,
      customers,
    }),
    [content, paywalls, analytics, recentPayments, customers]
  );

  return <AppDataContext.Provider value={contextValue}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
