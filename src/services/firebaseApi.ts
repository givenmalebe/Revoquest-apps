// Firebase API Service - Complete replacement for api.ts
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DatabaseService, Course, Student, Assignment, Enrollment, Notification } from '../firebase/database';

// Extended interfaces for API compatibility
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  // Student specific
  enrolledCourses?: string[];
  completedCourses?: string[];
  currentGrade?: string;
  progress?: number;
  // Instructor specific
  specialization?: string[];
  courses?: string[];
  learners?: number;
  rating?: number;
  qualifications?: string[];
  setaRegistration?: string;
  qctoRegistration?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  chatId?: string;
  type?: 'direct' | 'group';
  senderName?: string;
  senderRole?: string;
  recipientName?: string;
  recipientRole?: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: string;
  lastMessageTime?: string;
  type: 'direct' | 'group';
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  salary?: string;
  experience?: string;
  description: string;
  requirements: string[];
  closingDate: string;
  status: 'active' | 'inactive' | 'closed';
  postedBy: string; // User ID who posted the job
  postedAt: string;
  updatedAt: string;
  applications?: string[]; // Array of application IDs
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  closingDate: string;
  cvFileUrl?: string;
  cvFileName?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

class FirebaseApiService {
  // Helper method to create API response
  private createResponse<T>(data: T, success = true, message?: string): ApiResponse<T> {
    return { success, data, message };
  }

  // Helper method to handle errors
  private handleError(error: any, operation: string): never {
    console.error(`Firebase API Error in ${operation}:`, error);
    
    // Handle specific Firebase connection errors
    if (error.code === 'unavailable' || error.message?.includes('QUIC_PROTOCOL_ERROR') || error.message?.includes('Failed to fetch')) {
      console.warn('🔄 Firebase connection issue detected. This might be a temporary network problem.');
      throw new Error('Connection error. Please check your internet connection and try again.');
    }
    
    // Handle permission errors
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied. Please check Firebase security rules.');
      throw new Error('Permission denied. Please contact your administrator.');
    }
    
    throw new Error(error.message || `${operation} failed`);
  }

  // Authentication API
  auth = {
    register: async (userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: 'admin' | 'instructor' | 'student';
    }): Promise<ApiResponse> => {
      try {
        // This will be handled by AuthContext, but we can create user profile
        const userProfile: Omit<User, 'id'> = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          // Initialize role-specific fields
          ...(userData.role === 'student' && {
            enrolledCourses: [],
            completedCourses: [],
            currentGrade: 'N/A',
            progress: 0
          }),
          ...(userData.role === 'instructor' && {
            specialization: [],
            courses: [],
            learners: 0,
            rating: 0,
            qualifications: [],
            setaRegistration: '',
            qctoRegistration: ''
          })
        };

        const uid = (userData as { uid?: string }).uid;
        if (!uid) {
          throw new Error('Cannot create a user profile without an Auth uid');
        }
        await setDoc(doc(db, 'users', uid), { ...userProfile, uid, id: uid });
        return this.createResponse({ id: uid, ...userProfile });
      } catch (error) {
        this.handleError(error, 'user registration');
      }
    },

    login: async (credentials: { email: string; password: string }): Promise<ApiResponse> => {
      // This is handled by Firebase Auth in AuthContext
      return this.createResponse({ message: 'Login handled by Firebase Auth' });
    },

    logout: async (): Promise<ApiResponse> => {
      // This is handled by Firebase Auth in AuthContext
      return this.createResponse({ message: 'Logout handled by Firebase Auth' });
    },

    getMe: async (userId: string): Promise<ApiResponse<User>> => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          return this.createResponse(userData);
        }
        throw new Error('User not found');
      } catch (error) {
        this.handleError(error, 'get user profile');
      }
    },

    updateProfile: async (userId: string, profileData: Partial<User>): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'users', userId), {
          ...profileData,
          updatedAt: serverTimestamp()
        });
        return this.createResponse({ message: 'Profile updated successfully' });
      } catch (error) {
        this.handleError(error, 'update profile');
      }
    }
  };

  // Courses API
  courses = {
    getAll: async (params: Record<string, any> = {}): Promise<ApiResponse<Course[]>> => {
      try {
        const courses = await DatabaseService.getCourses({
          instructorId: params.instructorId,
          isPublished: params.isPublished,
          category: params.category,
          limit: params.limit
        });
        return this.createResponse(courses);
      } catch (error) {
        this.handleError(error, 'get courses');
      }
    },

    getById: async (id: string): Promise<ApiResponse<Course>> => {
      try {
        const course = await DatabaseService.getCourse(id);
        if (!course) {
          throw new Error('Course not found');
        }
        return this.createResponse(course);
      } catch (error) {
        this.handleError(error, 'get course by id');
      }
    },

    create: async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ id: string }>> => {
      try {
        const courseId = await DatabaseService.createCourse(courseData);
        return this.createResponse({ id: courseId });
      } catch (error) {
        this.handleError(error, 'create course');
      }
    },

    update: async (id: string, courseData: Partial<Course>): Promise<ApiResponse> => {
      try {
        await DatabaseService.updateCourse(id, courseData);
        return this.createResponse({ message: 'Course updated successfully' });
      } catch (error) {
        this.handleError(error, 'update course');
      }
    },

    delete: async (id: string): Promise<ApiResponse> => {
      try {
        await DatabaseService.deleteCourse(id);
        return this.createResponse({ message: 'Course deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete course');
      }
    },

    publish: async (id: string): Promise<ApiResponse> => {
      try {
        await DatabaseService.updateCourse(id, { isPublished: true });
        return this.createResponse({ message: 'Course published successfully' });
      } catch (error) {
        this.handleError(error, 'publish course');
      }
    },

    getByInstructor: async (instructorId: string): Promise<ApiResponse<Course[]>> => {
      try {
        const courses = await DatabaseService.getCourses({ instructorId });
        return this.createResponse(courses);
      } catch (error) {
        this.handleError(error, 'get instructor courses');
      }
    }
  };

  // Users API
  users = {
    getAll: async (params: Record<string, any> = {}): Promise<ApiResponse<User[]>> => {
      try {
        let q = query(collection(db, 'users'));
        
        if (params.role) {
          q = query(q, where('role', '==', params.role));
        }
        if (params.limit) {
          q = query(q, limit(params.limit));
        }

        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as User))
          .filter((user) => Boolean(user.role || user.firstName || user.lastName));
        return this.createResponse(users);
      } catch (error) {
        this.handleError(error, 'get users');
      }
    },

    getById: async (id: string): Promise<ApiResponse<User>> => {
      try {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          return this.createResponse(userData);
        }
        throw new Error('User not found');
      } catch (error) {
        this.handleError(error, 'get user by id');
      }
    },

    create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { uid?: string }): Promise<ApiResponse<{ id: string }>> => {
      try {
        const uid = userData.uid || (userData as { id?: string }).id;
        if (!uid) {
          throw new Error('Cannot create a user profile without an Auth uid');
        }
        await setDoc(doc(db, 'users', uid), {
          ...userData,
          uid,
          id: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return this.createResponse({ id: uid });
      } catch (error) {
        this.handleError(error, 'create user');
      }
    },

    update: async (id: string, userData: Partial<User>): Promise<ApiResponse> => {
      try {
        console.log('🔥 Firebase API: Updating user', { id, userData });
        
        // Prepare update data with proper field handling
        const updateData = {
          ...userData,
          updatedAt: serverTimestamp()
        };

        // Remove undefined values to avoid Firebase errors
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        console.log('🔥 Firebase API: Final update data', JSON.stringify(updateData, null, 2));
        
        // Use setDoc with merge to handle field deletions properly
        await updateDoc(doc(db, 'users', id), updateData);
        
        console.log('✅ Firebase API: User updated successfully');
        return this.createResponse({ message: 'User updated successfully' });
      } catch (error) {
        console.error('❌ Firebase API: Update user error', error);
        this.handleError(error, 'update user');
      }
    },

    delete: async (id: string): Promise<ApiResponse> => {
      try {
        await deleteDoc(doc(db, 'users', id));
        return this.createResponse({ message: 'User deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete user');
      }
    },

    getCourses: async (id: string): Promise<ApiResponse<Course[]>> => {
      try {
        const courses = await DatabaseService.getCourses({ instructorId: id });
        return this.createResponse(courses);
      } catch (error) {
        this.handleError(error, 'get user courses');
      }
    },

    getInstructors: async (): Promise<ApiResponse<User[]>> => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
        const querySnapshot = await getDocs(q);
        const instructors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return this.createResponse(instructors);
      } catch (error) {
        this.handleError(error, 'get instructors');
      }
    },

    getLearners: async (): Promise<ApiResponse<User[]>> => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'learner'));
        const querySnapshot = await getDocs(q);
        const learners = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return this.createResponse(learners);
      } catch (error) {
        this.handleError(error, 'get learners');
      }
    }
  };

  // Enrollments API
  enrollments = {
    enroll: async (courseId: string, studentId: string): Promise<ApiResponse<{ id: string }>> => {
      try {
        const enrollmentId = await DatabaseService.enrollStudent(studentId, courseId);
        return this.createResponse({ id: enrollmentId });
      } catch (error) {
        this.handleError(error, 'enroll student');
      }
    },

    getMyCourses: async (studentId: string): Promise<ApiResponse<Course[]>> => {
      try {
        const enrollments = await DatabaseService.getEnrollments({ studentId });
        const courseIds = enrollments.map(e => e.courseId);
        
        const courses: Course[] = [];
        for (const courseId of courseIds) {
          const course = await DatabaseService.getCourse(courseId);
          if (course) courses.push(course);
        }
        
        return this.createResponse(courses);
      } catch (error) {
        this.handleError(error, 'get student courses');
      }
    },

    getByCourse: async (courseId: string): Promise<ApiResponse<Enrollment[]>> => {
      try {
        const enrollments = await DatabaseService.getEnrollments({ courseId });
        return this.createResponse(enrollments);
      } catch (error) {
        this.handleError(error, 'get course enrollments');
      }
    },

    updateProgress: async (enrollmentId: string, lessonId: string, completed: boolean, score: number): Promise<ApiResponse> => {
      try {
        // Update enrollment progress
        const enrollmentDoc = await getDoc(doc(db, 'enrollments', enrollmentId));
        if (enrollmentDoc.exists()) {
          const enrollment = enrollmentDoc.data() as Enrollment;
          const newProgress = completed ? Math.min(100, enrollment.progress + 10) : enrollment.progress;
          
          await updateDoc(doc(db, 'enrollments', enrollmentId), {
            progress: newProgress,
            lastAccessed: new Date().toISOString(),
            ...(completed && newProgress === 100 && { 
              status: 'Completed',
              completionDate: new Date().toISOString()
            })
          });
        }
        
        return this.createResponse({ message: 'Progress updated successfully' });
      } catch (error) {
        this.handleError(error, 'update enrollment progress');
      }
    },

    unenroll: async (enrollmentId: string): Promise<ApiResponse> => {
      try {
        // Get enrollment details first
        const enrollmentDoc = await getDoc(doc(db, 'enrollments', enrollmentId));
        if (enrollmentDoc.exists()) {
          const enrollment = enrollmentDoc.data() as Enrollment;
          await DatabaseService.unenrollStudent(enrollment.studentId, enrollment.courseId);
        }
        
        return this.createResponse({ message: 'Unenrolled successfully' });
      } catch (error) {
        this.handleError(error, 'unenroll student');
      }
    }
  };

  // Assignments API
  assignments = {
    getAll: async (): Promise<ApiResponse<Assignment[]>> => {
      try {
        const assignments = await DatabaseService.getAssignments();
        return this.createResponse(assignments);
      } catch (error) {
        this.handleError(error, 'get assignments');
      }
    },

    getByStudent: async (studentId: string): Promise<ApiResponse<Assignment[]>> => {
      try {
        // Get student's enrolled courses
        const enrollments = await DatabaseService.getEnrollments({ studentId });
        const courseIds = enrollments.map(e => e.courseId);
        
        // Get assignments for those courses
        const assignments: Assignment[] = [];
        for (const courseId of courseIds) {
          const courseAssignments = await DatabaseService.getAssignments({ courseId });
          assignments.push(...courseAssignments);
        }
        
        return this.createResponse(assignments);
      } catch (error) {
        this.handleError(error, 'get student assignments');
      }
    },

    submit: async (assignmentData: {
      assignmentId: string;
      studentId: string;
      submission: string;
      courseId: string;
    }): Promise<ApiResponse> => {
      try {
        const studentAssignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> = {
          title: 'Student Submission',
          description: assignmentData.submission,
          courseId: assignmentData.courseId,
          dueDate: new Date().toISOString(),
          points: 100,
          type: 'Project',
          status: 'Submitted',
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'studentAssignments'), {
          ...studentAssignment,
          assignmentId: assignmentData.assignmentId,
          studentId: assignmentData.studentId
        });

        return this.createResponse({ id: docRef.id });
      } catch (error) {
        this.handleError(error, 'submit assignment');
      }
    },

    update: async (id: string, assignmentData: Partial<Assignment>): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'assignments', id), {
          ...assignmentData,
          updatedAt: serverTimestamp()
        });
        return this.createResponse({ message: 'Assignment updated successfully' });
      } catch (error) {
        this.handleError(error, 'update assignment');
      }
    },

    delete: async (id: string): Promise<ApiResponse> => {
      try {
        await deleteDoc(doc(db, 'assignments', id));
        return this.createResponse({ message: 'Assignment deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete assignment');
      }
    }
  };

  // Messages API
  messages = {
    getChats: async (userId: string): Promise<ApiResponse<Chat[]>> => {
      try {
        const q = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', userId)
        );
        const querySnapshot = await getDocs(q);
        const chats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
        
        // Enhance chats with participant details
        const enhancedChats = await Promise.all(chats.map(async (chat) => {
          const participantDetails = await Promise.all(
            chat.participants.map(async (participantId: string) => {
              try {
                const userDoc = await getDoc(doc(db, 'users', participantId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    id: participantId,
                    name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                    role: userData.role || 'learner',
                    isOnline: false
                  };
                }
                return {
                  id: participantId,
                  name: 'Unknown User',
                  role: 'learner',
                  isOnline: false
                };
              } catch (error) {
                console.error('Error fetching participant details:', error);
                return {
                  id: participantId,
                  name: 'Unknown User',
                  role: 'learner',
                  isOnline: false
                };
              }
            })
          );
          
          return {
            ...chat,
            participants: participantDetails
          };
        }));
        
        return this.createResponse(enhancedChats);
      } catch (error) {
        this.handleError(error, 'get chats');
      }
    },

    getChatMessages: async (chatId: string, page = 1, limitCount = 50): Promise<ApiResponse<Message[]>> => {
      try {
        // Try the optimized query first (with orderBy)
        try {
          const q = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('timestamp', 'asc'),
            limit(limitCount)
          );
          const querySnapshot = await getDocs(q);
          const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              content: data.content || '',
              senderId: data.senderId || '',
              senderName: data.senderName || 'Unknown',
              senderRole: data.senderRole || 'learner',
              recipientId: data.recipientId || '',
              recipientRole: data.recipientRole || 'learner',
              timestamp: data.timestamp || new Date().toISOString(),
              isRead: data.isRead || false,
              chatId: data.chatId || chatId,
              type: data.type || 'text'
            } as Message;
          });
          return this.createResponse(messages);
        } catch (indexError) {
          // If index is still building, fall back to client-side sorting
          console.warn('Index still building, using client-side sorting for messages');
          const q = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            limit(limitCount)
          );
          const querySnapshot = await getDocs(q);
          const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              content: data.content || '',
              senderId: data.senderId || '',
              senderName: data.senderName || 'Unknown',
              senderRole: data.senderRole || 'learner',
              recipientId: data.recipientId || '',
              recipientRole: data.recipientRole || 'learner',
              timestamp: data.timestamp || new Date().toISOString(),
              isRead: data.isRead || false,
              chatId: data.chatId || chatId,
              type: data.type || 'text'
            } as Message;
          });
          
          // Sort messages by timestamp in JavaScript (ascending order for chat display)
          messages.sort((a, b) => {
            const timestampA = new Date(a.timestamp).getTime();
            const timestampB = new Date(b.timestamp).getTime();
            return timestampA - timestampB; // Ascending order (oldest first)
          });
          
          return this.createResponse(messages);
        }
      } catch (error) {
        this.handleError(error, 'get chat messages');
      }
    },

    sendMessage: async (recipientId: string, content: string, senderId: string, chatType = 'direct'): Promise<ApiResponse<{ id: string }>> => {
      try {
        // Create or get chat
        let chatId: string;
        const existingChatQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', senderId)
        );
        const existingChats = await getDocs(existingChatQuery);
        
        let chat = existingChats.docs.find(doc => {
          const chatData = doc.data() as Chat;
          return chatData.participants.includes(recipientId) && chatData.type === chatType;
        });

        if (chat) {
          chatId = chat.id;
        } else {
          const newChat: Omit<Chat, 'id'> = {
            participants: [senderId, recipientId],
            type: chatType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const chatDocRef = await addDoc(collection(db, 'chats'), newChat);
          chatId = chatDocRef.id;
        }

        // Get sender and recipient names
        const senderDoc = await getDoc(doc(db, 'users', senderId));
        const recipientDoc = await getDoc(doc(db, 'users', recipientId));
        
        const senderData = senderDoc.exists() ? senderDoc.data() : null;
        const recipientData = recipientDoc.exists() ? recipientDoc.data() : null;
        
        const senderName = senderData ? `${senderData.firstName || ''} ${senderData.lastName || ''}`.trim() : 'Unknown';
        const recipientName = recipientData ? `${recipientData.firstName || ''} ${recipientData.lastName || ''}`.trim() : 'Unknown';
        const senderRole = senderData?.role || 'learner';
        const recipientRole = recipientData?.role || 'learner';

        // Create message
        const message: Omit<Message, 'id'> = {
          senderId,
          recipientId,
          content,
          timestamp: new Date().toISOString(),
          isRead: false,
          chatId,
          type: chatType,
          senderName,
          senderRole,
          recipientName,
          recipientRole
        };

        const messageDocRef = await addDoc(collection(db, 'messages'), message);

        // Update chat last message
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: content,
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Create notification for the recipient
        try {
          const notificationData = {
            userId: recipientId,
            senderId,
            senderName,
            type: 'message',
            title: `New message from ${senderName}`,
            content: content.length > 100 ? content.substring(0, 100) + '...' : content,
            isRead: false,
            createdAt: new Date().toISOString(),
            metadata: {
              chatId,
              messageId: messageDocRef.id,
              priority: 'medium'
            }
          };
          
          await addDoc(collection(db, 'notifications'), notificationData);
        } catch (notificationError) {
          console.error('Error creating message notification:', notificationError);
          // Don't fail the message send if notification creation fails
        }

        return this.createResponse({ id: messageDocRef.id });
      } catch (error) {
        this.handleError(error, 'send message');
      }
    },

    markAsRead: async (chatId: string, userId: string): Promise<ApiResponse> => {
      try {
        const messagesQuery = query(
          collection(db, 'messages'),
          where('chatId', '==', chatId),
          where('recipientId', '==', userId),
          where('isRead', '==', false)
        );
        const querySnapshot = await getDocs(messagesQuery);
        
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();

        return this.createResponse({ message: 'Messages marked as read' });
      } catch (error) {
        this.handleError(error, 'mark messages as read');
      }
    },

    getUnreadCount: async (userId: string): Promise<ApiResponse<{ count: number }>> => {
      try {
        const q = query(
          collection(db, 'messages'),
          where('recipientId', '==', userId),
          where('isRead', '==', false)
        );
        const querySnapshot = await getDocs(q);
        return this.createResponse({ count: querySnapshot.size });
      } catch (error) {
        this.handleError(error, 'get unread count');
      }
    },

    createChat: async (recipientId: string, senderId: string, chatType = 'direct'): Promise<ApiResponse<{ id: string }>> => {
      try {
        const chat: Omit<Chat, 'id'> = {
          participants: [senderId, recipientId],
          type: chatType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'chats'), chat);
        return this.createResponse({ id: docRef.id });
      } catch (error) {
        this.handleError(error, 'create chat');
      }
    },

    deleteMessage: async (messageId: string): Promise<ApiResponse> => {
      try {
        await deleteDoc(doc(db, 'messages', messageId));
        return this.createResponse({ message: 'Message deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete message');
      }
    },

    deleteChat: async (chatId: string): Promise<ApiResponse> => {
      try {
        // First, delete all messages in the chat
        const messagesQuery = query(
          collection(db, 'messages'),
          where('chatId', '==', chatId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        const batch = writeBatch(db);
        messagesSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Then delete the chat itself
        batch.delete(doc(db, 'chats', chatId));
        
        await batch.commit();
        return this.createResponse({ message: 'Chat and all messages deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete chat');
      }
    },

    updateGroupMembers: async (chatId: string, participants: ChatParticipant[]): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'chats', chatId), {
          participants: participants,
          updatedAt: new Date().toISOString()
        });
        return this.createResponse({ message: 'Group members updated successfully' });
      } catch (error) {
        this.handleError(error, 'update group members');
      }
    },

    addGroupMember: async (chatId: string, participant: ChatParticipant): Promise<ApiResponse> => {
      try {
        // Get current chat data
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (!chatDoc.exists()) {
          throw new Error('Chat not found');
        }
        
        const chatData = chatDoc.data();
        const currentParticipants = chatData.participants || [];
        
        // Check if participant already exists
        const exists = currentParticipants.some((p: any) => p.id === participant.id);
        if (exists) {
          return this.createResponse({ message: 'Member already in group' });
        }
        
        // Add new participant
        const updatedParticipants = [...currentParticipants, participant];
        
        await updateDoc(doc(db, 'chats', chatId), {
          participants: updatedParticipants,
          updatedAt: new Date().toISOString()
        });
        
        return this.createResponse({ message: 'Member added to group successfully' });
      } catch (error) {
        this.handleError(error, 'add group member');
      }
    },

    removeGroupMember: async (chatId: string, participantId: string): Promise<ApiResponse> => {
      try {
        // Get current chat data
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (!chatDoc.exists()) {
          throw new Error('Chat not found');
        }
        
        const chatData = chatDoc.data();
        const currentParticipants = chatData.participants || [];
        
        // Remove participant
        const updatedParticipants = currentParticipants.filter((p: any) => p.id !== participantId);
        
        await updateDoc(doc(db, 'chats', chatId), {
          participants: updatedParticipants,
          updatedAt: new Date().toISOString()
        });
        
        return this.createResponse({ message: 'Member removed from group successfully' });
      } catch (error) {
        this.handleError(error, 'remove group member');
      }
    },

    getInstructorLearners: async (instructorId: string): Promise<ApiResponse<User[]>> => {
      try {
        // Get instructor's courses
        const courses = await DatabaseService.getCourses({ instructorId });
        const courseIds = courses.map(c => c.id);
        
        // Get enrollments for those courses
        const learners: User[] = [];
        for (const courseId of courseIds) {
          const enrollments = await DatabaseService.getEnrollments({ courseId });
          for (const enrollment of enrollments) {
            const student = await DatabaseService.getStudent(enrollment.studentId);
            if (student && !learners.find(l => l.id === student.id)) {
              learners.push(student as User);
            }
          }
        }
        
        return this.createResponse(learners);
      } catch (error) {
        this.handleError(error, 'get instructor learners');
      }
    },

    getAdminUsers: async (): Promise<ApiResponse<User[]>> => {
      try {
        const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'instructor']));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return this.createResponse(users);
      } catch (error) {
        this.handleError(error, 'get admin users');
      }
    },

    sendToAdminTeam: async (content: string, senderId: string): Promise<ApiResponse> => {
      try {
        // Get all admin users
        const adminUsers = await this.messages.getAdminUsers();
        
        // Send message to each admin
        for (const admin of adminUsers.data) {
          await this.messages.sendMessage(admin.id, content, senderId, 'direct');
        }
        
        return this.createResponse({ message: 'Message sent to admin team' });
      } catch (error) {
        this.handleError(error, 'send to admin team');
      }
    }
  };

  // Notifications API
  notifications = {
    getAll: async (userId: string): Promise<ApiResponse<Notification[]>> => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        return this.createResponse(notifications);
      } catch (error) {
        this.handleError(error, 'get notifications');
      }
    },

    markAsRead: async (id: string): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'notifications', id), { isRead: true });
        return this.createResponse({ message: 'Notification marked as read' });
      } catch (error) {
        this.handleError(error, 'mark notification as read');
      }
    },

    markAllAsRead: async (userId: string): Promise<ApiResponse> => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          where('isRead', '==', false)
        );
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();

        return this.createResponse({ message: 'All notifications marked as read' });
      } catch (error) {
        this.handleError(error, 'mark all notifications as read');
      }
    },

    create: async (notificationData: Omit<Notification, 'id'>): Promise<ApiResponse<{ id: string }>> => {
      try {
        const docRef = await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          createdAt: serverTimestamp()
        });
        return this.createResponse({ id: docRef.id });
      } catch (error) {
        this.handleError(error, 'create notification');
      }
    }
  };

  // Test function to verify Firebase connection
  testConnection = async (): Promise<ApiResponse<{ message: string }>> => {
    try {
      console.log('Testing Firebase connection...');
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Test connection',
        timestamp: new Date().toISOString()
      });
      console.log('Test document created with ID:', testDoc.id);
      
      // Clean up test document
      await deleteDoc(testDoc);
      console.log('Test document deleted');
      
      return this.createResponse({ message: 'Firebase connection successful' });
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return this.createResponse({ message: 'Firebase connection failed' }, false, error.message);
    }
  };

  // Jobs API
  jobs = {
    getAll: async (status?: 'active' | 'inactive' | 'closed'): Promise<ApiResponse<Job[]>> => {
      try {
        console.log('Getting jobs with status:', status);
        let q = query(collection(db, 'jobs'));
        
        if (status) {
          q = query(
            collection(db, 'jobs'),
            where('status', '==', status)
          );
        }
        
        const querySnapshot = await getDocs(q);
        console.log('Found', querySnapshot.docs.length, 'jobs');
        const jobs = querySnapshot.docs.map(doc => {
          const jobData = { id: doc.id, ...doc.data() } as Job;
          console.log('Job data:', jobData);
          return jobData;
        });
        
        // Sort by postedAt in descending order
        jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        
        return this.createResponse(jobs);
      } catch (error) {
        console.error('Error getting jobs:', error);
        this.handleError(error, 'get jobs');
      }
    },

    getById: async (jobId: string): Promise<ApiResponse<Job>> => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
          return this.createResponse(jobData);
        }
        throw new Error('Job not found');
      } catch (error) {
        this.handleError(error, 'get job');
      }
    },

    create: async (jobData: Omit<Job, 'id' | 'postedAt' | 'updatedAt' | 'applications'>): Promise<ApiResponse<Job>> => {
      try {
        console.log('Creating job with data:', jobData);
        const newJob = {
          ...jobData,
          postedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          applications: []
        };
        
        console.log('Job data to be saved:', newJob);
        const docRef = await addDoc(collection(db, 'jobs'), newJob);
        console.log('Job created with ID:', docRef.id);
        const createdJob = { id: docRef.id, ...newJob } as Job;
        return this.createResponse(createdJob);
      } catch (error) {
        console.error('Error creating job:', error);
        this.handleError(error, 'create job');
      }
    },

    update: async (jobId: string, updateData: Partial<Omit<Job, 'id' | 'postedAt' | 'applications'>>): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          ...updateData,
          updatedAt: new Date().toISOString()
        });
        return this.createResponse({ message: 'Job updated successfully' });
      } catch (error) {
        this.handleError(error, 'update job');
      }
    },

    delete: async (jobId: string): Promise<ApiResponse> => {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        return this.createResponse({ message: 'Job deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete job');
      }
    },

    updateStatus: async (jobId: string, status: 'active' | 'inactive' | 'closed'): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          status,
          updatedAt: new Date().toISOString()
        });
        return this.createResponse({ message: 'Job status updated successfully' });
      } catch (error) {
        this.handleError(error, 'update job status');
      }
    }
  };

  // Job Applications API
  jobApplications = {
    getAll: async (jobId?: string, status?: string): Promise<ApiResponse<JobApplication[]>> => {
      try {
        console.log('Getting job applications with jobId:', jobId, 'status:', status);
        let q = query(collection(db, 'jobApplications'));
        
        if (jobId) {
          q = query(
            collection(db, 'jobApplications'),
            where('jobId', '==', jobId)
          );
        }
        
        if (status) {
          q = query(
            collection(db, 'jobApplications'),
            where('status', '==', status)
          );
        }
        
        const querySnapshot = await getDocs(q);
        console.log('Found', querySnapshot.docs.length, 'job applications');
        const applications = querySnapshot.docs.map(doc => {
          const appData = { id: doc.id, ...doc.data() } as JobApplication;
          console.log('Application data:', appData);
          return appData;
        });
        
        // Sort by appliedAt in descending order (newest first)
        applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        
        return this.createResponse(applications);
      } catch (error) {
        console.error('Error getting job applications:', error);
        this.handleError(error, 'get job applications');
      }
    },

    getById: async (applicationId: string): Promise<ApiResponse<JobApplication>> => {
      try {
        const appDoc = await getDoc(doc(db, 'jobApplications', applicationId));
        if (appDoc.exists()) {
          const appData = { id: appDoc.id, ...appDoc.data() } as JobApplication;
          return this.createResponse(appData);
        }
        throw new Error('Job application not found');
      } catch (error) {
        this.handleError(error, 'get job application');
      }
    },

    create: async (applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>): Promise<ApiResponse<JobApplication>> => {
      try {
        console.log('Creating job application with data:', applicationData);
        const newApplication = {
          ...applicationData,
          status: 'pending' as const,
          appliedAt: new Date().toISOString()
        };
        
        console.log('Application data to be saved:', newApplication);
        const docRef = await addDoc(collection(db, 'jobApplications'), newApplication);
        console.log('Application created with ID:', docRef.id);
        const createdApplication = { id: docRef.id, ...newApplication } as JobApplication;
        return this.createResponse(createdApplication);
      } catch (error) {
        console.error('Error creating job application:', error);
        this.handleError(error, 'create job application');
      }
    },

    update: async (applicationId: string, updateData: Partial<Omit<JobApplication, 'id' | 'appliedAt'>>): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'jobApplications', applicationId), {
          ...updateData,
          reviewedAt: new Date().toISOString()
        });
        return this.createResponse({ message: 'Job application updated successfully' });
      } catch (error) {
        this.handleError(error, 'update job application');
      }
    },

    delete: async (applicationId: string): Promise<ApiResponse> => {
      try {
        await deleteDoc(doc(db, 'jobApplications', applicationId));
        return this.createResponse({ message: 'Job application deleted successfully' });
      } catch (error) {
        this.handleError(error, 'delete job application');
      }
    },

    updateStatus: async (applicationId: string, status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired', reviewedBy?: string, notes?: string): Promise<ApiResponse> => {
      try {
        await updateDoc(doc(db, 'jobApplications', applicationId), {
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewedBy || null,
          notes: notes || null
        });
        return this.createResponse({ message: 'Job application status updated successfully' });
      } catch (error) {
        this.handleError(error, 'update job application status');
      }
    }
  };

  // Real-time subscriptions
  subscribeToUpdates = (callback: (data: any) => void) => {
    // This will be handled by DataSyncContext
    return () => {}; // Return unsubscribe function
  };

  // Health check
  healthCheck = async (): Promise<ApiResponse<{ status: string }>> => {
    try {
      // Simple health check by trying to read a collection
      await getDocs(query(collection(db, 'users'), limit(1)));
      return this.createResponse({ status: 'healthy' });
    } catch (error) {
      return this.createResponse({ status: 'unhealthy' }, false, error.message);
    }
  };
}

// Create and export API service instance
const firebaseApiService = new FirebaseApiService();
export default firebaseApiService;
