import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Notification from '@/components/Notifications';
import type { NotificationData, NotificationType } from '@/types/global';

interface NotificationContextType {
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

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch notifications (simulated)
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          title: 'Welcome!',
          message: 'Welcome to your dashboard.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
        },
        {
          id: '2',
          title: 'New Feature',
          message: 'Check out our new analytics.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'success',
        },
        {
          id: '3',
          title: 'Payment Received',
          message: 'You received a payment of $25.',
          timestamp: new Date().toISOString(),
          read: true,
          type: 'success',
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  // Don't initialize notifications by default - they will be loaded after authentication
  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notificationToDelete = prev.find(n => n.id === id);
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  const showNotification = (msg: string, type: NotificationType) => {
    const newNotification: NotificationData = {
      id: Date.now().toString(),
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message: msg,
      type: type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        showNotification,
      }}
    >
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => deleteNotification(notification.id)}
          />
        ))}
      </div>
      {children}
    </NotificationContext.Provider>
  );
};
