// Environment configuration with defaults

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  withCredentials: boolean;
  xsrfCookieName: string;
  xsrfHeaderName: string;
}

interface AuthConfig {
  tokenRefreshThreshold: number;
  tokenKey: string;
  refreshTokenKey: string;
}

interface EnvConfig {
  api: ApiConfig;
  auth: AuthConfig;
  publicEndpoints: string[];
}

// Default configuration - these values will be overridden by environment variables
const defaultConfig: EnvConfig = {
  api: {
    baseUrl: '/api',
    timeout: 30000, // 30 seconds
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
  },
  auth: {
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
  },
  publicEndpoints: [
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
  ],
};

// Safely get environment variables with type safety
const getEnv = {
  string: (key: string, defaultValue: string): string => {
    const value = import.meta.env[key];
    return typeof value === 'string' ? value : defaultValue;
  },
  number: (key: string, defaultValue: number): number => {
    const value = import.meta.env[key];
    return typeof value === 'string' && !isNaN(Number(value)) 
      ? parseInt(value, 10) 
      : defaultValue;
  },
  array: (key: string, defaultValue: string[]): string[] => {
    const value = import.meta.env[key];
    return typeof value === 'string' 
      ? value.split(',').map(s => s.trim()).filter(Boolean)
      : defaultValue;
  },
};

// Export the configuration
export const config: EnvConfig = {
  api: {
    ...defaultConfig.api,
    baseUrl: getEnv.string('VITE_API_URL', defaultConfig.api.baseUrl),
    timeout: getEnv.number('VITE_API_TIMEOUT', defaultConfig.api.timeout),
  },
  auth: {
    ...defaultConfig.auth,
    tokenRefreshThreshold: getEnv.number(
      'VITE_TOKEN_REFRESH_THRESHOLD', 
      defaultConfig.auth.tokenRefreshThreshold
    ),
  },
  publicEndpoints: [
    ...defaultConfig.publicEndpoints,
    ...getEnv.array('VITE_PUBLIC_ENDPOINTS', []),
  ],
};

// Helper functions
export const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].trim();
  return config.publicEndpoints.some(endpoint => 
    cleanUrl === endpoint || cleanUrl.startsWith(`${endpoint}/`)
  );
};

export default config;
