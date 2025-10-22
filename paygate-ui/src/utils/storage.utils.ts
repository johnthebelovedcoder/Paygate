/**
 * Secure storage utility for handling sensitive data
 * Provides encryption and secure storage mechanisms
 */

const STORAGE_PREFIX = 'paygate_';
const TOKEN_KEY = `${STORAGE_PREFIX}token`;
const REFRESH_TOKEN_KEY = `${STORAGE_PREFIX}refresh_token`;
const USER_KEY = `${STORAGE_PREFIX}user`;

// Simple encryption/decryption (in production, use a proper encryption library)
const encode = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
};

const decode = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

export const secureStorage = {
  // Token management
  setToken: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, encode(token));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  getToken: (): string | null => {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      return token ? decode(token) : null;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  removeToken: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  // Refresh token management
  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, encode(token));
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  },

  getRefreshToken: (): string | null => {
    try {
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      return token ? decode(token) : null;
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  },

  removeRefreshToken: (): void => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  },

  // User data management
  setUser: (user: unknown): void => {
    try {
      sessionStorage.setItem(USER_KEY, encode(JSON.stringify(user)));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  },

  getUser: <T>(): T | null => {
    try {
      const user = sessionStorage.getItem(USER_KEY);
      return user ? (JSON.parse(decode(user)) as T) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  },

  removeUser: (): void => {
    try {
      sessionStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  },

  // Clear all stored data
  clearAll: (): void => {
    secureStorage.removeToken();
    secureStorage.removeRefreshToken();
    secureStorage.removeUser();
  },

  // Check if token is expired (basic check)
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      const exp = payload.exp as number;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  },
};

export default secureStorage;
