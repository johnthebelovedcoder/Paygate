import { useLanguage } from '../contexts/LanguageContext';

// Format date based on locale
export const formatDate = (
  date: Date | string,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const selectedLocale = locale || navigator.language;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options if none provided
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(selectedLocale, defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to simple format
    return dateObj.toLocaleDateString();
  }
};

// Format time based on locale
export const formatTime = (
  date: Date | string,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const selectedLocale = locale || navigator.language;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options if none provided
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(selectedLocale, defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to simple format
    return dateObj.toLocaleTimeString();
  }
};

// Format datetime based on locale
export const formatDateTime = (
  date: Date | string,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const selectedLocale = locale || navigator.language;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options if none provided
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(selectedLocale, defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to simple format
    return dateObj.toLocaleString();
  }
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (
  date: Date | string,
  locale?: string
): string => {
  const selectedLocale = locale || navigator.language;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Define time units in seconds
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit, seconds: number }> = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];
  
  // Find the appropriate unit
  for (const { unit, seconds } of units) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      try {
        // Use RelativeTimeFormat for locale-specific formatting
        const rtf = new Intl.RelativeTimeFormat(selectedLocale, { numeric: 'auto' });
        return rtf.format(-interval, unit);
      } catch (error) {
        // Fallback format
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
  }
  
  return 'just now';
};

// Custom hook to format dates in a component
export const useDateFormatter = () => {
  const { currentLanguage } = useLanguage();
  
  const format = (date: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
    return formatDate(date, currentLanguage, options);
  };
  
  const formatTimeOnly = (date: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
    return formatTime(date, currentLanguage, options);
  };
  
  const formatDateTimeBoth = (date: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
    return formatDateTime(date, currentLanguage, options);
  };
  
  const formatRelative = (date: Date | string) => {
    return formatRelativeTime(date, currentLanguage);
  };
  
  return {
    format,
    formatTime: formatTimeOnly,
    formatDateTime: formatDateTimeBoth,
    formatRelative
  };
};