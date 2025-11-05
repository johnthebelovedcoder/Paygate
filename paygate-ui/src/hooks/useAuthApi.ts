import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService, { api } from '../services/api';

export function useAuthApi() {
  const { isAuthenticated, authInitialized, getAccessToken } = useAuth();

  // Helper to get the current token
  const getAuthHeader = useCallback(async () => {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getAccessToken]);

  // Wrapper around apiService methods to ensure authentication
  const authApi = useCallback(async <T>(
    method: 'get' | 'post' | 'put' | 'delete', 
    ...args: any[]
  ): Promise<T> => {
    if (!authInitialized) {
      console.warn('API call attempted before auth initialization completed');
      throw new Error('Authentication not yet initialized');
    }
    
    if (!isAuthenticated) {
      console.warn('API call blocked: User is not authenticated');
      throw new Error('Authentication required');
    }
    
    // Ensure we have the latest token for this request
    const authHeader = await getAuthHeader();
    const [url, data, config = {}] = args;
    
    // Merge headers
    const headers = {
      ...(config.headers || {}),
      ...authHeader
    };
    
    return (apiService[method] as any)(url, data, { ...config, headers });
  }, [isAuthenticated, authInitialized, getAuthHeader]);

  // Direct access to the underlying axios instance for advanced use cases
  const getAxiosInstance = useCallback(() => {
    if (!authInitialized) {
      console.warn('API instance access attempted before auth initialization completed');
      throw new Error('Authentication not yet initialized');
    }
    
    if (!isAuthenticated) {
      console.warn('API instance access blocked: User is not authenticated');
      throw new Error('Authentication required');
    }
    
    return api;
  }, [isAuthenticated, authInitialized]);

  return {
    get: useCallback(<T>(url: string, config?: any) => authApi<T>('get', url, config), [authApi]),
    post: useCallback(<T>(url: string, data?: any, config?: any) => authApi<T>('post', url, data, config), [authApi]),
    put: useCallback(<T>(url: string, data?: any, config?: any) => authApi<T>('put', url, data, config), [authApi]),
    delete: useCallback(<T>(url: string, config?: any) => authApi<T>('delete', url, config), [authApi]),
    getAxiosInstance,
  };
}
