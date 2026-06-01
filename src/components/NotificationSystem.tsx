import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  MessageCircle, 
  Calendar, 
  FileText, 
  CheckCircle, 
  X,
  Clock,
  User,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';
import { useChat } from '@/contexts/ChatContext';

export interface Notification {
  id: string;
  type: 'message' | 'assignment' | 'calendar' | 'course' | 'general';
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  courseId?: string;
  courseTitle?: string;
  assignmentId?: string;
  eventId?: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationSystemProps {
  userId: string;
  userRole: 'admin' | 'instructor' | 'learner';
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (notificationId: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  userId,
  userRole,
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDeleteNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { setActiveChat } = useChat();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'assignment':
        return <FileText className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    
    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'assignment':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'calendar':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'course':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    onMarkAsRead?.(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    onMarkAllAsRead?.();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
    onDeleteNotification?.(notificationId);
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    
    // Navigate to messages if it's a message notification
    if (notification.type === 'message' && notification.chatId) {
      setActiveChat(notification.chatId);
      setIsOpen(false);
    }
    
    // For other notification types, you can add navigation logic here
    if (notification.type === 'assignment' && notification.metadata?.assignmentId) {
      // Navigate to assignment
      console.log('Navigate to assignment:', notification.metadata.assignmentId);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
          )}
        </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                >
                  Mark all read
                </Button>
                  )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
              </div>
            ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                <div
                  key={notification.id}
                        className={`
                          p-4 border-b cursor-pointer transition-colors hover:bg-muted/50
                          ${!notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''}
                        `}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            p-2 rounded-full border
                            ${getNotificationColor(notification.type, notification.priority)}
                          `}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                              {notification.priority === 'high' && (
                                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                                {notification.sender?.name && (
                                  <>
                                    <span>•</span>
                                    <User className="w-3 h-3" />
                                    <span>{notification.sender.name}</span>
                                  </>
                                )}
                              </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                            </Button>
                            </div>
                            {notification.courseTitle && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.courseTitle}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;