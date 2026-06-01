// Notification Service for creating and managing notifications
import firebaseApiService from './firebaseApi';

export interface CreateNotificationData {
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'message' | 'assignment' | 'course' | 'system' | 'announcement' | 'calendar' | 'event';
  title: string;
  content: string;
  metadata?: {
    courseId?: string;
    assignmentId?: string;
    eventId?: string;
    chatId?: string;
    messageId?: string;
  };
  priority?: 'low' | 'medium' | 'high';
}

export class NotificationService {
  // Create a notification for a single user
  static async createNotification(data: CreateNotificationData): Promise<boolean> {
    try {
      console.log('Creating notification:', data);
      
      // Create notification in Firebase
      const notificationData = {
        userId: data.recipientId,
        senderId: data.senderId,
        senderName: data.senderName,
        type: data.type,
        title: data.title,
        content: data.content,
        isRead: false,
        createdAt: new Date().toISOString(),
        metadata: data.metadata,
        priority: data.priority || 'medium'
      };

      // Use Firebase API service to create the notification
      const response = await firebaseApiService.notifications.create(notificationData);

      if (response.success) {
        console.log('Notification created successfully in Firebase:', response.data);
        return true;
      } else {
        console.error('Failed to create notification in Firebase:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  // Create notifications for multiple users (e.g., all students in a course)
  static async createBulkNotifications(
    recipientIds: string[],
    senderId: string,
    senderName: string,
    type: CreateNotificationData['type'],
    title: string,
    content: string,
    metadata?: CreateNotificationData['metadata'],
    priority?: 'low' | 'medium' | 'high'
  ): Promise<boolean> {
    try {
      const promises = recipientIds.map(recipientId => 
        this.createNotification({
          recipientId,
          senderId,
          senderName,
          type,
          title,
          content,
          metadata,
          priority
        })
      );

      await Promise.all(promises);
      console.log(`Created ${recipientIds.length} notifications`);
      return true;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return false;
    }
  }

  // Create notification for new assignment
  static async notifyNewAssignment(
    courseId: string,
    courseTitle: string,
    assignmentTitle: string,
    instructorId: string,
    instructorName: string,
    studentIds: string[]
  ): Promise<boolean> {
    return this.createBulkNotifications(
      studentIds,
      instructorId,
      instructorName,
      'assignment',
      'New Assignment',
      `A new assignment "${assignmentTitle}" has been posted for ${courseTitle} course.`,
      {
        courseId,
        assignmentId: `assignment_${Date.now()}`
      },
      'high'
    );
  }

  // Create notification for new calendar event
  static async notifyNewEvent(
    courseId: string,
    courseTitle: string,
    eventTitle: string,
    eventDate: string,
    instructorId: string,
    instructorName: string,
    studentIds: string[]
  ): Promise<boolean> {
    return this.createBulkNotifications(
      studentIds,
      instructorId,
      instructorName,
      'calendar',
      'New Event Scheduled',
      `${eventTitle} has been scheduled for ${new Date(eventDate).toLocaleDateString()} in ${courseTitle} course.`,
      {
        courseId,
        eventId: `event_${Date.now()}`
      },
      'medium'
    );
  }

  // Create notification for new message
  static async notifyNewMessage(
    recipientId: string,
    senderId: string,
    senderName: string,
    messageContent: string,
    courseTitle?: string,
    chatId?: string
  ): Promise<boolean> {
    return this.createNotification({
      recipientId,
      senderId,
      senderName,
      type: 'message',
      title: 'New Message',
      content: courseTitle 
        ? `You have received a new message from ${senderName} about ${courseTitle}.`
        : `You have received a new message from ${senderName}.`,
      metadata: {
        chatId,
        messageId: `msg_${Date.now()}`
      },
      priority: 'medium'
    });
  }

  // Create notification for course update
  static async notifyCourseUpdate(
    courseId: string,
    courseTitle: string,
    updateDescription: string,
    instructorId: string,
    instructorName: string,
    studentIds: string[]
  ): Promise<boolean> {
    return this.createBulkNotifications(
      studentIds,
      instructorId,
      instructorName,
      'course',
      'Course Update',
      `${updateDescription} in ${courseTitle} course.`,
      {
        courseId
      },
      'low'
    );
  }

  // Create notification for assignment deadline reminder
  static async notifyAssignmentDeadline(
    courseId: string,
    courseTitle: string,
    assignmentTitle: string,
    deadlineDate: string,
    studentIds: string[]
  ): Promise<boolean> {
    const timeUntilDeadline = new Date(deadlineDate).getTime() - Date.now();
    const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
    
    let priority: 'low' | 'medium' | 'high' = 'low';
    if (hoursUntilDeadline <= 2) priority = 'high';
    else if (hoursUntilDeadline <= 24) priority = 'medium';

    return this.createBulkNotifications(
      studentIds,
      'system',
      'System',
      'event',
      'Assignment Deadline Reminder',
      `Your "${assignmentTitle}" assignment is due ${hoursUntilDeadline <= 24 ? `in ${hoursUntilDeadline} hours` : `on ${new Date(deadlineDate).toLocaleDateString()}`}.`,
      {
        courseId,
        assignmentId: `assignment_${Date.now()}`
      },
      priority
    );
  }
}

export default NotificationService;
