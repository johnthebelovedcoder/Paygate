// api.ts - Central API configuration and service
import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse, 
  type InternalAxiosRequestConfig,
  type AxiosError
} from 'axios';
import { apiThrottler } from '../utils/throttle.utils';
import { isTokenExpired } from '../utils/auth.utils';
import errorHandler from '../utils/error.utils';
import config, { isPublicEndpoint } from '../config/env.config';

declare module 'axios' {
  interface AxiosRequestConfig {
    _skipAuth?: boolean;
  }
}

// Create axios instance with default configuration
// Create axios instance with configuration
const api: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: config.api.withCredentials,
  xsrfCookieName: config.api.xsrfCookieName,
  xsrfHeaderName: config.api.xsrfHeaderName,
});

// Type for the refresh token queue
type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

// Helper function to determine if a URL requires authentication
const requiresAuth = (url: string): boolean => {
  if (!url) return false;
  return !isPublicEndpoint(url);
};

// Track if we're already refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    } else {
      reject(new Error('No token provided'));
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for public endpoints or explicitly skipped requests
    if (config._skipAuth || !requiresAuth(config.url || '')) {
      return config;
    }

    // Get access token from localStorage
    const token = localStorage.getItem('access_token');
    
    // If no token and the endpoint requires auth, prevent the request
    if (!token) {
      console.warn(`Blocking request to protected endpoint (no token): ${config.url}`);
      throw new Error('No authentication token available');
    }

    // Add authorization header if not already set
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If token is not expired, proceed with the request
    if (!isTokenExpired(token)) {
      return config;
    }

    // Token is expired, handle refresh
    // If we're already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
      .then(token => {
        if (token) {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      })
      .catch(err => {
        return Promise.reject(err);
      });
    }

    // Set flag to prevent multiple refresh attempts
    isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Make refresh request
      const response = await axios.post<{ 
        access_token: string;
        refresh_token?: string;
      }>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/refresh-token`,
        { refresh_token: refreshToken },
        { 
          _skipAuth: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (response.data.access_token) {
        // Update tokens
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        // Update the token for the original request
        config.headers.Authorization = `Bearer ${response.data.access_token}`;
        
        // Process any queued requests with the new token
        processQueue(null, response.data.access_token);
        
        return config;
      }
      
      throw new Error('Invalid refresh token response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Process any queued requests with the error
      processQueue(error);
      
      // Clear auth state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      throw new Error('Session expired. Please log in again.');
    } finally {
      isRefreshing = false;
    }
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
    const originalRequest = error.config;
    
    // Add request retry logic for failed requests
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Add a small delay before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retry the request
      return api(originalRequest);
    }
    
    // For all other errors, return a user-friendly message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (!error.message) {
      error.message = 'An unexpected error occurred. Please try again later.';
    }

    errorHandler.log(error, 'API Response');

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.warn(`Resource not found: ${error.config.url}`);
      // Return empty data structure instead of failing
      if (error.config.url?.includes('/communications')) {
        return Promise.resolve({ data: [], count: 0 });
      } else if (error.config.url?.includes('/support/statistics')) {
        return Promise.resolve({
          openTickets: 0,
          closedTickets: 0,
          inProgressTickets: 0,
          averageResponseTime: 0
        });
      }
      return Promise.reject(new Error(`Resource not found: ${error.config.url}`));
    }

    // Handle network errors (includes service worker fetch failure)
    if (!error.response && error.request) {
      console.warn('Network error or service worker fetch failed:', error.message);
      // Don't redirect on network errors, let the UI handle it
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // If this is a refresh token request that failed, clear everything and redirect to login
      if (error.config.url?.includes('/auth/refresh')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      // For other 401 errors, try to refresh the token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post<{ 
            access_token: string;
            refresh_token?: string;
          }>(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/refresh`,
            { refreshToken },
            { _skipAuth: true }
          );

          if (refreshResponse.data?.access_token) {
            // Update tokens in local storage
            localStorage.setItem('access_token', refreshResponse.data.access_token);
            if (refreshResponse.data.refresh_token) {
              localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
            }

            // Retry the original request with the new token
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.warn('Token refresh failed. Redirecting to login.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      } else {
        console.warn('No refresh token available. Redirecting to login.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded.');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.statusText);
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
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

// Add getAxiosInstance to the apiService
const apiServiceWithInstance = {
  ...apiService,
  getAxiosInstance: () => api,
};

// Export the axios instance for direct use (e.g., for file uploads)
export { api };

export default apiServiceWithInstance;
