import React, { createContext, useContext, ReactNode } from 'react';

type BillingContextType = Record<string, never>;

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = {};

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
};

export const useBilling = (): BillingContextType => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
