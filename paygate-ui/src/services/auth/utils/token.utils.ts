// Token related utilities

export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before token expiry

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  const expiresIn = getTokenExpiration(token);
  return !expiresIn || expiresIn <= Date.now();
};

export const getTokenExpiration = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    console.error('Error parsing token:', e);
    return null;
  }
};

export const isTokenExpiringSoon = (
  expiresIn?: number, 
  threshold: number = TOKEN_REFRESH_THRESHOLD
): boolean => {
  if (!expiresIn) return false;
  return expiresIn - Date.now() <= threshold;
};

export const storeTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getStoredTokens = () => ({
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
});

// Re-export all token utilities
export * from './token.utils';
