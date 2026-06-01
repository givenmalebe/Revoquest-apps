import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'class' | 'assignment' | 'exam' | 'deadline' | 'event';
  courseId?: string;
  courseTitle?: string;
  creatorId: string;
  creatorName: string;
  creatorRole: 'admin' | 'instructor' | 'learner';
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  invitedUserIds: string[]; // Array of user IDs invited to this event
  invitedUsers: InvitedUser[]; // Full user details for display
  attendees: string[]; // User IDs who confirmed attendance
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvitedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'learner';
  avatar?: string;
  status?: 'invited' | 'accepted' | 'declined';
}

export class CalendarService {
  /**
   * Create a new calendar event
   */
  static async createEvent(
    eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'attendees'>
  ): Promise<CalendarEvent> {
    try {
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const newEvent: CalendarEvent = {
        ...eventData,
        id: eventId,
        attendees: [],
        createdAt: now,
        updatedAt: now
      };

      // Remove undefined fields before saving to Firestore
      const cleanedEvent = Object.fromEntries(
        Object.entries(newEvent).filter(([_, value]) => value !== undefined)
      ) as CalendarEvent;

      await setDoc(doc(db, 'calendarEvents', eventId), cleanedEvent);

      console.log('✅ Calendar event created:', eventId);
      return newEvent;
    } catch (error) {
      console.error('❌ Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an existing calendar event
   */
  static async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      const eventRef = doc(db, 'calendarEvents', eventId);
      
      // Remove undefined fields before saving to Firestore
      const cleanedUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: new Date().toISOString()
        }).filter(([_, value]) => value !== undefined)
      );

      await updateDoc(eventRef, cleanedUpdates);

      console.log('✅ Calendar event updated:', eventId);
    } catch (error) {
      console.error('❌ Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete a calendar event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'calendarEvents', eventId));
      console.log('✅ Calendar event deleted:', eventId);
    } catch (error) {
      console.error('❌ Error deleting calendar event:', error);
      throw error;
    }
  }

  /**
   * Get a single event by ID
   */
  static async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const eventDoc = await getDoc(doc(db, 'calendarEvents', eventId));
      if (eventDoc.exists()) {
        return eventDoc.data() as CalendarEvent;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting calendar event:', error);
      throw error;
    }
  }

  /**
   * Get all events for a user (either created by them or they're invited to)
   */
  static async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      
      // Get events created by user
      const creatorQuery = query(
        eventsRef,
        where('creatorId', '==', userId),
        orderBy('startTime', 'desc')
      );
      const creatorSnapshot = await getDocs(creatorQuery);
      
      // Get events user is invited to
      const invitedQuery = query(
        eventsRef,
        where('invitedUserIds', 'array-contains', userId),
        orderBy('startTime', 'desc')
      );
      const invitedSnapshot = await getDocs(invitedQuery);

      // Combine and deduplicate
      const eventsMap = new Map<string, CalendarEvent>();
      
      creatorSnapshot.forEach(doc => {
        eventsMap.set(doc.id, doc.data() as CalendarEvent);
      });
      
      invitedSnapshot.forEach(doc => {
        eventsMap.set(doc.id, doc.data() as CalendarEvent);
      });

      const events = Array.from(eventsMap.values());
      console.log(`✅ Retrieved ${events.length} events for user ${userId}`);
      return events;
    } catch (error) {
      console.error('❌ Error getting user events:', error);
      throw error;
    }
  }

  /**
   * Get all events for a course
   */
  static async getCourseEvents(courseId: string): Promise<CalendarEvent[]> {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      const q = query(
        eventsRef,
        where('courseId', '==', courseId),
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(q);

      const events = snapshot.docs.map(doc => doc.data() as CalendarEvent);
      console.log(`✅ Retrieved ${events.length} events for course ${courseId}`);
      return events;
    } catch (error) {
      console.error('❌ Error getting course events:', error);
      throw error;
    }
  }

  /**
   * Get all events (for admins)
   */
  static async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      const q = query(eventsRef, orderBy('startTime', 'desc'));
      const snapshot = await getDocs(q);

      const events = snapshot.docs.map(doc => doc.data() as CalendarEvent);
      console.log(`✅ Retrieved ${events.length} total events`);
      return events;
    } catch (error) {
      console.error('❌ Error getting all events:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user events in real-time
   */
  static subscribeToUserEvents(
    userId: string,
    callback: (events: CalendarEvent[]) => void
  ): () => void {
    try {
      if (!userId) {
        console.warn('⚠️ subscribeToUserEvents called without a valid userId. Skipping listener setup.');
        return () => {};
      }

      const eventsRef = collection(db, 'calendarEvents');
      
      // Subscribe to events created by user
      const creatorQuery = query(
        eventsRef,
        where('creatorId', '==', userId)
      );
      
      const unsubscribeCreator = onSnapshot(creatorQuery, async (creatorSnapshot) => {
        // Also get events user is invited to
        const invitedQuery = query(
          eventsRef,
          where('invitedUserIds', 'array-contains', userId)
        );
        
        const invitedSnapshot = await getDocs(invitedQuery);
        
        // Combine and deduplicate
        const eventsMap = new Map<string, CalendarEvent>();
        
        creatorSnapshot.forEach(doc => {
          eventsMap.set(doc.id, doc.data() as CalendarEvent);
        });
        
        invitedSnapshot.forEach(doc => {
          eventsMap.set(doc.id, doc.data() as CalendarEvent);
        });

        const events = Array.from(eventsMap.values());
        callback(events);
      });

      return unsubscribeCreator;
    } catch (error) {
      console.error('❌ Error subscribing to user events:', error);
      throw error;
    }
  }

  /**
   * Mark user as attending an event
   */
  static async acceptEventInvitation(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const attendees = event.attendees || [];
      if (!attendees.includes(userId)) {
        attendees.push(userId);
        await this.updateEvent(eventId, { attendees });
      }

      console.log('✅ User accepted event invitation:', eventId, userId);
    } catch (error) {
      console.error('❌ Error accepting event invitation:', error);
      throw error;
    }
  }

  /**
   * Remove user from event attendees
   */
  static async declineEventInvitation(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const attendees = (event.attendees || []).filter(id => id !== userId);
      await this.updateEvent(eventId, { attendees });

      console.log('✅ User declined event invitation:', eventId, userId);
    } catch (error) {
      console.error('❌ Error declining event invitation:', error);
      throw error;
    }
  }
}

