// notificationService.ts - Notification management service
import { apiService } from './api';
import type { NotificationData, NotificationType } from '../types/global';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  salesAlerts: boolean;
  weeklyReports: boolean;
  browserNotifications: boolean;
}

export interface NotificationResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  // Get all notifications for the current user
  async getNotifications(): Promise<NotificationData[]> {
    try {
      const response =
        await apiService.get<NotificationResponse<NotificationData[]>>('/notifications');
      const notifications = Array.isArray(response.data) ? response.data : [];
      this.notifications = notifications;
      this.notifyListeners();
      return notifications;
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch notifications' };
    }
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);

      // Update local state
      this.notifications = this.notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );

      this.notifyListeners();
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to mark notification as read' };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await apiService.put('/notifications/read-all');

      // Update local state
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        read: true,
      }));

      this.notifyListeners();
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to mark all notifications as read' };
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiService.delete(`/notifications/${notificationId}`);

      // Update local state
      this.notifications = this.notifications.filter(
        notification => notification.id !== notificationId
      );

      this.notifyListeners();
    } catch (error: unknown) {
      console.error('Error deleting notification:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to delete notification' };
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiService.get<NotificationResponse<NotificationPreferences>>(
        '/notifications/preferences'
      );
      return (
        response.data || {
          emailNotifications: true,
          salesAlerts: true,
          weeklyReports: false,
          browserNotifications: true,
        }
      );
    } catch (error: unknown) {
      console.error('Error fetching notification preferences:', error);
      // Fallback to localStorage or default preferences
      const storedPreferences = localStorage.getItem('notificationPreferences');
      if (storedPreferences) {
        return JSON.parse(storedPreferences);
      }
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch notification preferences' };
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await apiService.put('/notifications/preferences', preferences);

      // Save to localStorage as backup
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error: unknown) {
      console.error('Error updating notification preferences:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update notification preferences' };
    }
  }

  // Add a new notification (for demo purposes)
  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: NotificationData = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  // Get unread notification count
  getUnreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of notification updates
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}

const notificationService = new NotificationService();
export default notificationService;
