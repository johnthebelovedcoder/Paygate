import { useLanguage } from '../contexts/LanguageContext';

// Currency codes and their symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
};

// Currency names by locale
const CURRENCY_NAMES: Record<string, Record<string, string>> = {
  USD: { en: 'US Dollar', es: 'Dólar Estadounidense' },
  EUR: { en: 'Euro', es: 'Euro' },
  GBP: { en: 'British Pound', es: 'Libra Esterlina' },
  JPY: { en: 'Japanese Yen', es: 'Yen Japonés' },
  CAD: { en: 'Canadian Dollar', es: 'Dólar Canadiense' },
  AUD: { en: 'Australian Dollar', es: 'Dólar Australiano' },
  CHF: { en: 'Swiss Franc', es: 'Franco Suizo' },
  CNY: { en: 'Chinese Yuan', es: 'Yuan Chino' },
  SEK: { en: 'Swedish Krona', es: 'Corona Sueca' },
  NZD: { en: 'New Zealand Dollar', es: 'Dólar Neozelandés' },
};

// Format currency based on locale and currency
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale?: string
): string => {
  // Use browser's locale if not specified
  const selectedLocale = locale || navigator.language;
  
  try {
    // Use Intl.NumberFormat for proper currency formatting
    return new Intl.NumberFormat(selectedLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback: manually format using currency symbol
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Get currency symbol by currency code
export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

// Get currency name by currency code and current locale
export const getCurrencyName = (currency: string, currentLocale: string): string => {
  const locale = currentLocale.split('-')[0]; // Get language part (e.g., 'en' from 'en-US')
  return CURRENCY_NAMES[currency]?.[locale] || currency;
};

// Custom hook to format currency in a component
export const useCurrencyFormatter = () => {
  const { currentLanguage } = useLanguage();
  
  const format = (amount: number, currency: string = 'USD'): string => {
    return formatCurrency(amount, currency, currentLanguage);
  };
  
  return {
    format,
    getSymbol: getCurrencySymbol,
    getName: (currency: string) => getCurrencyName(currency, currentLanguage)
  };
};