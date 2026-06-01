import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import firebaseApiService from '../services/firebaseApi';

interface Notification {
  id: string;
  recipient: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  type: 'message' | 'assignment' | 'course' | 'system' | 'announcement' | 'calendar' | 'event';
  title: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: any;
  chatId?: string;
  messageId?: string;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
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
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user || !user.id || !isAuthenticated) {
      console.log('No valid user ID or not authenticated, skipping notification load');
      return;
    }

    console.log('Loading notifications for user:', user.id);
    try {
      setIsLoading(true);
      const response = await firebaseApiService.notifications.getAll(user?.id || '');
      console.log('Notifications response:', response);
      if (response.success) {
        console.log('Notifications data:', response.data);
        const apiNotifications = (response.data || []).map((notif: any) => ({
          id: notif.id || notif._id,
          recipient: notif.userId || notif.recipient?._id || notif.recipient,
          sender: notif.sender ? {
            id: notif.sender._id || notif.sender.id,
            firstName: notif.sender.firstName,
            lastName: notif.sender.lastName,
            email: notif.sender.email,
            role: notif.sender.role,
            name: `${notif.sender.firstName || ''} ${notif.sender.lastName || ''}`.trim() || notif.senderName
          } : undefined,
          type: notif.type,
          title: notif.title,
          content: notif.message || notif.content,
          isRead: notif.isRead || false,
          readAt: notif.readAt ? new Date(notif.readAt) : undefined,
          metadata: notif.metadata,
          chatId: notif.metadata?.chatId || notif.chatId,
          messageId: notif.metadata?.messageId || notif.messageId,
          createdAt: new Date(notif.createdAt)
        }));

        // Use only real Firebase notifications
        console.log('Setting notifications:', apiNotifications);
        setNotifications(apiNotifications);
        const unread = apiNotifications.filter(n => !n.isRead).length;
        console.log('Unread count:', unread);
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      
      // No fallback - use empty array if API fails
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await firebaseApiService.notifications.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await firebaseApiService.notifications.markAllAsRead(user?.id || '');
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Note: Firebase API doesn't have delete notification method yet
      // await firebaseApiService.notifications.delete(notificationId);
      
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      loadNotifications();
    }
  }, [user?.id, isAuthenticated]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, isAuthenticated]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
