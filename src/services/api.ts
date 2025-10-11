// api.ts - Central API configuration and service
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { apiThrottler } from '../utils/throttle.utils';
import { isTokenExpired } from '../utils/auth.utils';
import errorHandler from '../utils/error.utils';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Add this to ensure credentials are handled properly
  withCredentials: true,
});

// Helper function to determine if a URL requires authentication
const requiresAuth = (url: string): boolean => {
  // List of endpoints that don't require authentication
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/forgotpassword',
    '/auth/resetpassword',
    '/auth/refresh',
    '/auth/logout',
    '/auth/mfa/setup',
    '/auth/mfa/verify',
    '/auth/verify-email/',
    '/health',
    '/status',
    '/analytics/dashboard',
    '/analytics/revenue',
    '/analytics/top-paywalls',
    '/analytics/customers',
    '/analytics/creator/revenue-summary',
    '/analytics/creator/paywall-performance',
    '/analytics/creator/top-customers',
    '/analytics/creator/conversion-rates',
    '/payments',
    '/customers',
    '/content',
    '/paywalls',
    '/promo-codes',
    '/user/preferences',
  ];

  // Normalize URL by removing query parameters and ensuring it starts with slash
  const normalizedUrl = url ? url.split('?')[0] : '';

  return !publicEndpoints.some(endpoint => normalizedUrl?.startsWith(endpoint));
};

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    // Get access token from localStorage
    const token = localStorage.getItem('access_token');

    // Only add auth header if the endpoint requires authentication
    if (token && requiresAuth(config.url || '')) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn('Token expired, attempting refresh...');
        // Token refresh will be handled by response interceptor
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (!token && requiresAuth(config.url || '')) {
      console.warn(`No auth token found for protected endpoint: ${config.url}`);
    }

    return config;
  },
  error => {
    errorHandler.log(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async error => {
    errorHandler.log(error, 'API Response');

    if (error.response?.status === 401) {
      // Remove invalid tokens from local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Check if the request URL is not the refresh endpoint to avoid infinite loops
      if (error.config.url && !error.config.url.includes('/auth/refresh')) {
        // Try to refresh the token if refresh endpoint exists
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResponse = await api.post(
              '/auth/refresh',
              { refreshToken: refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            if (refreshResponse.data.access_token && refreshResponse.data.refresh_token) {
              // Update tokens in local storage
              localStorage.setItem('access_token', refreshResponse.data.access_token);
              localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);

              // Retry the original request with the new token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
              return api(originalRequest);
            }
          } else {
            console.warn('No refresh token available. Redirecting to login.');
            window.location.href = '/login';
          }
        } catch (refreshError) {
          console.warn('Token refresh failed. Redirecting to login.');

          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded.');
    }

    return Promise.reject(error);
  }
);

// Generic API methods with throttling
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiThrottler.add(() => api.get(url, { ...config, withCredentials: true })),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiThrottler.add(() => api.post(url, data, { ...config, withCredentials: true })),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiThrottler.add(() => api.put(url, data, { ...config, withCredentials: true })),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiThrottler.add(() => api.delete(url, { ...config, withCredentials: true })),
};

// Export the axios instance for direct use (e.g., for file uploads)
export { api };

export default apiService;
