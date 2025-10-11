// utils/auth.utils.ts - Authentication utilities

/**
 * Decodes a JWT token to extract its payload
 * @param token The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = (base64Url || '').replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 * @param token The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true; // If there's no expiration, consider it expired
    }

    // Check if the token has expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If there's an error, assume the token is invalid/expired
  }
};

/**
 * Gets the remaining time before the token expires in seconds
 * @param token The JWT token to check
 * @returns Number of seconds until expiration or negative if expired
 */
export const getTokenExpiryTime = (token: string): number => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0; // Token doesn't have expiration
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const exp = decoded.exp;
    return typeof exp === 'number' ? exp - currentTime : 0;
  } catch (error) {
    console.error('Error getting token expiry time:', error);
    return 0;
  }
};

/**
 * Checks if the token is about to expire (within 5 minutes by default)
 * @param token The JWT token to check
 * @param bufferSeconds Time in seconds before expiration to consider "about to expire" (default: 300 seconds = 5 minutes)
 * @returns True if token is about to expire, false otherwise
 */
export const isTokenAboutToExpire = (token: string, bufferSeconds: number = 300): boolean => {
  return getTokenExpiryTime(token) <= bufferSeconds;
};
