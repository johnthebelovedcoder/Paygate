// Type declarations for auth service

declare module './api' {
  export const authApi: {
    login: (credentials: any) => Promise<any>;
    register: (data: any) => Promise<any>;
    logout: (refreshToken?: string) => Promise<any>;
    refreshToken: (refreshToken: string) => Promise<any>;
    getCurrentUser: () => Promise<any>;
    updateUser: (userData: any) => Promise<any>;
    // Add other API methods as needed
  };
}

declare module './types' {
  export interface LoginCredentials {
    email: string;
    password: string;
  }

  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    country?: string;
    currency?: string;
    userType?: 'creator' | 'business' | 'other';
    contentTypes?: string[];
  }

  export interface UserData {
    id: string;
    name: string;
    email: string;
    // Add other user properties as needed
  }

  export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: UserData;
    // Add other response properties as needed
  }

  // Add other types as needed
}

declare module './utils' {
  export * from './token.utils';
  export * from './error.utils';
}
