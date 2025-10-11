import type { Paywall } from '../services/paywallService';

// src/types/global.d.ts
export interface ChartData {
  name: string;
  value: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface DailyRevenueData {
  date: string;
  revenue: number;
}

export interface TrafficSourceData {
  name: 'Direct' | 'Social' | 'Email' | 'Referral' | string;
  value: number;
}

export type LinkStatus = 'active' | 'expired' | 'paused';

export interface ProtectedLink {
  id?: string;
  url: string;
  title: string;
  clicks: number;
  lastClicked: string;
  status: LinkStatus;
  expirationDate?: string;
  password?: string;
  maxClicks?: number;
  currentClicks: number;
}

export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
  showNotification: (msg: string, type: NotificationType) => void; // ✅ add this
}

export interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  customerEmail?: string;
  paywallTitle?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface UseContentReturn {
  content: any[];
  loading: boolean;
  error: string | null;
  refreshContent: () => void;
}

export interface UsePaywallsReturn {
  paywalls: any[];
  loading: boolean;
  error: string | null;
  refreshPaywalls: () => void;
}

export interface AppDataContextType {
  content: any[];
  loading: boolean;
  error: string | null;
  refreshContent: () => void;
}
