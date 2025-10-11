// utils/currency.utils.ts - Currency conversion utilities
import { CURRENCY_SYMBOLS } from './constants.utils';

// Exchange rates relative to USD (updated regularly)
const EXCHANGE_RATES: Record<string, number> = {
  NGN: 1500, // Nigerian Naira
  USD: 1, // US Dollar (base currency)
  EUR: 0.92, // Euro
  GBP: 0.79, // British Pound
  GHS: 12.5, // Ghanaian Cedi
  ZAR: 18.5, // South African Rand
};

// Convert amount from USD to target currency
export const convertCurrency = (amount: number, targetCurrency: string): number => {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return amount * rate;
};

// Format amount with currency symbol
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const convertedAmount = convertCurrency(amount, currency);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  // Format number with proper decimal places and thousands separators
  return `${currencySymbol}${convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Get currency name
export const getCurrencyName = (currencyCode: string): string => {
  const currencyNames: Record<string, string> = {
    NGN: 'Nigerian Naira',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    GHS: 'Ghanaian Cedi',
    ZAR: 'South African Rand',
  };

  return currencyNames[currencyCode] || currencyCode;
};

export default {
  convertCurrency,
  formatCurrency,
  getCurrencyName,
};
