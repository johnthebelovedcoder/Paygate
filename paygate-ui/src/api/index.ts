import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Try to get token with multiple possible key names
    let token = localStorage.getItem('access_token');
    if (!token) {
      token = localStorage.getItem('authToken');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error status is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to get refresh token with multiple possible key names
        let refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          refreshToken = localStorage.getItem('refreshToken');
        }
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken: refreshToken },
          { withCredentials: true }
        );
        
        const { access_token, refresh_token } = response.data;
        
        // Update tokens - handle both possible key names
        const newAccessToken = access_token || response.data.accessToken;
        const newRefreshToken = refresh_token || response.data.refreshToken;
        
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('authToken', newAccessToken); // Keep both for consistency
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
          localStorage.setItem('refreshToken', newRefreshToken); // Keep both for consistency
        }
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (error) {
        // If refresh token fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error('A server error occurred. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.get<T>(url, config),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.post<T>(url, data, config),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.put<T>(url, data, config),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.patch<T>(url, data, config),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.delete<T>(url, config),
};

export default apiService;
