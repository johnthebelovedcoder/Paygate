import axios, { 
  AxiosError, 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders
} from 'axios';
import { cache } from './cache';
import { requestQueue } from './requestQueue';
import { performanceMonitor } from './performance';

type RequestConfig = AxiosRequestConfig & {
  cacheKey?: string;
  cacheTTL?: number;
  retry?: number;
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
};

// Implementation class (not exported directly)
class ApiClientImpl {
  private client: AxiosInstance;
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string, defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 30000, // 30 seconds
      retry: 2,
      priority: 'normal',
      ...defaultConfig,
    };

    this.client = axios.create({
      baseURL,
      timeout: this.defaultConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...defaultConfig.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available - try multiple possible keys
        let token = localStorage.getItem('authToken');
        if (!token) {
          token = localStorage.getItem('access_token');
        }
        if (token) {
          if (!config.headers) {
            config.headers = {} as AxiosHeaders;
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        // Handle token refresh (401) and retry
        if (error.response?.status === 401) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              // Try to refresh the token
              const { data } = await axios.post(
                `${this.baseURL}/auth/refresh-token`,
                { refresh_token: refreshToken } // Backend expects 'refresh_token' not 'refreshToken'
              );
              
              // Update tokens
              localStorage.setItem('authToken', data.access_token || data.accessToken);
              if (data.refresh_token || data.refreshToken) {
                localStorage.setItem('refreshToken', data.refresh_token || data.refreshToken);
              }

              // Retry the original request
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${data.access_token || data.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear auth and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getCacheKey(config: RequestConfig): string | null {
    if (config.cacheKey) return config.cacheKey;
    
    const { url, method, params, data } = config;
    if (!url) return null;

    const paramsStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}?${paramsStr}&${dataStr}`;
  }

  private async request<T>(config: RequestConfig): Promise<AxiosResponse<T>> {
    const {
      cacheKey: customCacheKey,
      cacheTTL = 0, // Default to no caching
      retry = this.defaultConfig.retry || 0,
      priority = this.defaultConfig.priority || 'normal',
      timeout, // Extract timeout from config
      ...requestConfig
    } = config;

    const cacheKey = customCacheKey || this.getCacheKey(requestConfig);
    
    // Return cached response if available and not explicitly disabled
    if (cacheKey && cacheTTL > 0) {
      const cachedResponse = cache.get<AxiosResponse<T>>(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    const requestFn = async (): Promise<AxiosResponse<T>> => {
      try {
        // Apply timeout from config if provided, otherwise use the extracted timeout
        const finalRequestConfig = {
          ...requestConfig,
          timeout: timeout || requestConfig.timeout || this.defaultConfig.timeout
        };
        
        const response = await this.client.request<T>(finalRequestConfig);
        
        // Cache the response if caching is enabled
        if (cacheKey && cacheTTL > 0) {
          cache.set(cacheKey, response, cacheTTL);
        }
        
        return response;
      } catch (error) {
        // Clear cache on error if needed
        if (cacheKey) {
          cache.invalidate(cacheKey);
        }
        throw error;
      }
    };

    // Use the request queue with priority and retry
    return requestQueue.enqueue<AxiosResponse<T>>(
      () => this.withRetry(requestFn, retry || 0),
      priority
    ).promise;
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    attempt = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt > retries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.withRetry(fn, retries, attempt + 1);
    }
  }

  // HTTP Methods
  async get<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return performanceMonitor.measure(
      `GET ${url}`,
      async () => {
        const response = await this.request<T>({ ...config, method: 'GET', url });
        return response.data;
      },
      { url, method: 'GET', ...config }
    );
  }

  async post<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return performanceMonitor.measure(
      `POST ${url}`,
      async () => {
        const response = await this.request<T>({
          ...config,
          method: 'POST',
          url,
          data,
        });
        return response.data;
      },
      { url, method: 'POST', ...config }
    );
  }

  async put<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return performanceMonitor.measure(
      `PUT ${url}`,
      async () => {
        const response = await this.request<T>({
          ...config,
          method: 'PUT',
          url,
          data,
        });
        return response.data;
      },
      { url, method: 'PUT', ...config }
    );
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return performanceMonitor.measure(
      `DELETE ${url}`,
      async () => {
        const response = await this.request<T>({
          ...config,
          method: 'DELETE',
          url,
        });
        return response.data;
      },
      { url, method: 'DELETE', ...config }
    );
  }

  async patch<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return performanceMonitor.measure(
      `PATCH ${url}`,
      async () => {
        const response = await this.request<T>({
          ...config,
          method: 'PATCH',
          url,
          data,
        });
        return response.data;
      },
      { url, method: 'PATCH', ...config }
    );
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    requestQueue.clear();
  }
}

// Export the class as both a type and a value
export type ApiClient = ApiClientImpl;
export const ApiClient = ApiClientImpl;

// Default API client instance
const baseURL = 
  (import.meta.env?.VITE_API_URL || 
   process.env.REACT_APP_API_URL || 
   'http://localhost:8000').replace(/\/+$/, ''); // Remove trailing slashes

const apiClient = new ApiClient(baseURL);

export { apiClient };
