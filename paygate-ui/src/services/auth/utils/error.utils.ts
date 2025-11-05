import type { AxiosError } from 'axios';

export const isAxiosError = (error: unknown): error is AxiosError => 
  (error as AxiosError).isAxiosError !== undefined;

export const formatError = (error: unknown): { message: string; status?: number; code?: string } => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      message: (axiosError.response?.data as any)?.message || axiosError.message || 'An error occurred',
      status: axiosError.response?.status,
      code: axiosError.code,
    };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'An unknown error occurred' };
};

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred') => {
  const formattedError = formatError(error);
  console.error(defaultMessage, formattedError);
  return {
    success: false,
    message: formattedError.message || defaultMessage,
    status: formattedError.status,
    code: formattedError.code
  };
};
