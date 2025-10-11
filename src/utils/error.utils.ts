/**
 * Error handling utilities
 */

import type { AxiosError } from 'axios';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export const errorHandler = {
  parse: (error: unknown): AppError => {
    // Axios error
    if (isAxiosError(error)) {
      return {
        message: (error.response?.data as any)?.message || error.message || 'An error occurred',
        code: error.code,
        status: error.response?.status,
        details: error.response?.data,
      };
    }

    // Standard Error
    if (error instanceof Error) {
      return {
        message: error.message,
        details: error,
      };
    }

    // Unknown error
    return {
      message: 'An unknown error occurred',
      details: error,
    };
  },

  getUserMessage: (error: unknown): string => {
    const parsed = errorHandler.parse(error);

    // Map common error codes to user-friendly messages
    const errorMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'You need to log in to access this resource.',
      403: "You don't have permission to access this resource.",
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data.',
      422: 'The data provided is invalid.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.',
    };

    if (parsed.status && errorMessages[parsed.status]) {
      return errorMessages[parsed.status] ?? parsed.message;
    }

    return parsed.message;
  },

  log: (error: unknown, context?: string): void => {
    const parsed = errorHandler.parse(error);
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, parsed);

    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      // window.Sentry?.captureException(error);
    }
  },

  isNetworkError: (error: unknown): boolean => {
    if (isAxiosError(error)) {
      return !error.response && error.message.toLowerCase().includes('network');
    }
    return false;
  },

  isAuthError: (error: unknown): boolean => {
    const parsed = errorHandler.parse(error);
    return parsed.status === 401 || parsed.status === 403;
  },

  isValidationError: (error: unknown): boolean => {
    const parsed = errorHandler.parse(error);
    return parsed.status === 422 || parsed.status === 400;
  },
};

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export default errorHandler;
