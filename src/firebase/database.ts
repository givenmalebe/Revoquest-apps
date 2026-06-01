import {
  collection,
  doc,
  addDoc,
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
  arrayUnion
} from 'firebase/firestore';
import { db } from './config';

// Course interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  price: number;
  enrolledLearners: number;
  enrolledStudents?: number;
  rating: number;
  thumbnail: string;
  lessons: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // SETA/QCTO compliance
  saqaId?: string;
  setaUnitStandards?: string[];
  qctoQualifications?: string[];
  complianceStatus?: 'Compliant' | 'Pending Review' | 'Non-Compliant';
  // Course content
  modules?: CourseModule[];
  units?: CourseModule[]; // Support both modules and units for compatibility
  requirements?: string[];
  learningOutcomes?: string[];
  // Extended properties for AI-generated courses
  shortDescription?: string;
  language?: string;
  nqfLevel?: string;
  estimatedHours?: number;
  targetAudience?: string;
  prerequisites?: string[];
  courseOverview?: string;
  practicalApproach?: string;
  seoTitle?: string;
  seoDescription?: string;
  integrations?: {
    googleClassroom: boolean;
    microsoftTeams: boolean;
  };
  // Student management
  assignedStudents?: string[]; // Array of student IDs
  studentAssignments?: {
    studentId: string;
    assignedAt: string;
    status: 'active' | 'inactive' | 'pending';
    progress?: number;
  }[];
  enrollmentMode?: 'manual' | 'auto';
  // Assessments
  assessments?: CourseAssessment[];
  // AI-generated final exam (saved to Firebase when generated)
  finalExam?: {
    questions: Array<{ id: string; question: string; type: string; options?: string[]; correctAnswer?: string; points?: number }>;
    passingScore?: number;
    timeLimit?: number;
    totalPoints?: number;
    instructions?: string;
  };
}

export interface CourseAssessment {
  id: string;
  title: string;
  description: string;
  type: 'formative' | 'summative';
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  instructions: string;
  files: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  dueDate?: string;
  maxMarks: number;
  passingScore: number;
  isPublished: boolean;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  unitId?: string; // Optional: link to specific unit
  order: number; // Order within the course
  assignedLearners: string[]; // Array of learner IDs
  // Learner submissions
  submissions?: AssessmentSubmission[];
}

export interface AssessmentSubmission {
  id: string;
  learnerId: string;
  learnerName: string;
  submittedAt: string;
  files: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  status: 'submitted' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  // Marked documents for POE
  markedDocuments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
    description?: string;
  }[];
}

export interface CourseModule {
  id: string | number;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
  isPublished?: boolean;
}

export interface Lesson {
  id: string | number;
  title: string;
  description: string;
  content: string;
  type: 'video' | 'text' | 'reading' | 'quiz' | 'assignment' | 'learn' | 'practice' | 'challenge' | 'project' | 'discussion';
  duration: number; // in minutes
  order: number;
  isPublished: boolean;
  resources?: string[];
  objectives?: string[];
  youtubeUrl?: string;
  pdfUrl?: string;
  // Enhanced content types
  readingContent?: {
    sections: {
      title: string;
      content: string;
      keyPoints?: string[];
    }[];
    summary: string;
    keyTerms: string[];
    references: string[];
  };
  // Reading lesson content types
  readingContentType?: 'text' | 'slides' | 'files' | 'video';
  googleSlidesUrl?: string;
  uploadedFiles?: {
    id: string;
    name: string;
    type: 'pdf' | 'powerpoint' | 'document';
    url: string;
    size: number;
  }[];
  richTextContent?: string;
  quizContent?: {
    questions: {
      id: string;
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
      options?: string[];
      correctAnswer: string | string[];
      explanation?: string;
      points: number;
    }[];
    passingScore: number;
    timeLimit: number;
    totalPoints: number;
    instructions: string;
  };
  projectContent?: {
    title: string;
    description: string;
    objectives: string[];
    requirements: string[];
    deliverables: string[];
    resources: string[];
    evaluationCriteria: string[];
    estimatedTime: string;
  };
  videoContent?: {
    title: string;
    description: string;
    youtubeUrl?: string;
    duration: number;
    transcript?: string;
    keyMoments: {
      timestamp: string;
      title: string;
      description: string;
    }[];
  };
  quiz?: {
    questions: any[];
    passingScore: number;
    timeLimit: number;
  };
}

// Instructor interface
export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  specialization: string[];
  courses: string[];
  learners: number;
  rating: number;
  joinDate: string;
  qualifications: string[];
  setaRegistration?: string;
  qctoRegistration?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

// Student interfaces
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  enrolledCourses: string[];
  completedCourses: string[];
  currentGrade: string;
  joinDate: string;
  lastActive: string;
  progress: number;
  isActive: boolean;
  // Progress tracking
  courseProgress?: { [courseId: string]: number };
  assignments?: StudentAssignment[];
  certificates?: string[];
  badges?: string[];
  // Instructor-specific fields
  assignedLearners?: string[]; // Array of learner IDs assigned to this instructor
}

// Assignment interfaces
export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  points: number;
  type: 'Quiz' | 'Project' | 'Essay' | 'Presentation' | 'Portfolio';
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';
  grade?: number;
  submittedAt?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  // SETA/QCTO alignment
  setaAlignment?: string[];
  qctoAlignment?: string[];
}

export interface StudentAssignment {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';
  grade?: number;
  submittedAt?: string;
  feedback?: string;
  submission?: string;
  createdAt: string;
  updatedAt: string;
}

// Enrollment interface
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  status: 'Active' | 'Completed' | 'Dropped' | 'Suspended';
  lastAccessed: string;
  completionDate?: string;
  grade?: number;
  /** Amount paid for this enrollment (course purchase). Used for revenue reporting. */
  amountPaid?: number;
}

// Certificate interface
export interface Certificate {
  id: string;
  learnerId: string;
  courseId: string;
  title: string;
  issuedDate: string;
  expiryDate?: string;
  setaUnitStandard?: string;
  qctoQualification?: string;
  credits: number;
  status: 'Issued' | 'Pending' | 'Expired';
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  studentId: string;
  studentEmail?: string;
  courseId: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastActivity: string;
  currentLesson?: string;
  timeSpent: number; // in minutes
  completionRate: number;
  averageGrade: number;
}

// Community/Announcement interface for admin posts to enrolled learners
export interface CommunityPost {
  id: string;
  title: string;
  content: string; // HTML or plain text
  authorId: string; // admin or instructor ID
  authorName: string;
  authorRole: 'admin' | 'instructor';
  authorAvatar?: string;
  type: 'announcement' | 'promotion' | 'event' | 'sale' | 'news';
  targetAudience: 'all' | 'course' | 'specific'; // 'all' = all enrolled learners, 'course' = specific course, 'specific' = specific learners
  targetCourseId?: string; // if targetAudience is 'course'
  targetLearnerIds?: string[]; // if targetAudience is 'specific'
  isPublished: boolean;
  isPinned: boolean;
  scheduledFor?: string; // future date to publish
  publishedAt?: string;
  expiresAt?: string; // optional expiration
  metadata?: {
    link?: string; // URL for CTAs (e.g., course link, external page)
    linkText?: string;
    imageUrl?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'assignment' | 'course' | 'system' | 'achievement' | 'announcement' | 'calendar' | 'event';
  isRead: boolean;
  createdAt: string;
  data?: any;
  senderId?: string;
  senderName?: string;
  metadata?: {
    chatId?: string;
    messageId?: string;
    courseId?: string;
    assignmentId?: string;
    eventId?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

// Checkout session interface (Yoco funnel payments)
// Used for admin revenue reporting from the original payment sessions.
export interface CheckoutSession {
  id: string;
  checkoutId?: string;
  courseId?: string;
  courseTitle?: string;
  customerEmail?: string;
  customerEmailLower?: string;
  firstName?: string;
  lastName?: string;
  /** National ID / identity number captured at checkout */
  identityNumber?: string;
  status?: string;
  createdAt?: string;
  completedAt?: string;
  /** Amount actually paid by the learner for this checkout (preferred for revenue). */
  amountPaid?: number;
  /** Optional raw amount in cents if stored. */
  amountCents?: number;
}

export class DatabaseService {
  // Course operations
  /** Ensure course has numeric price for revenue (total revenue = sum of course purchases). */
  private static normalizeCoursePrice<T extends { price?: unknown }>(course: T): T {
    const price = course.price;
    const num = typeof price === 'number' && !Number.isNaN(price) ? price : Number(price) || 0;
    return { ...course, price: num } as T;
  }

  static async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const preparedCourseData = {
        ...courseData,
        price: typeof courseData.price === 'number' && !Number.isNaN(courseData.price) ? courseData.price : Number(courseData.price) || 0,
        assignedStudents: courseData.assignedStudents ?? [],
        studentAssignments: courseData.studentAssignments ?? [],
        enrolledLearners: courseData.enrolledLearners ?? 0,
        enrolledStudents: courseData.enrolledStudents ?? 0,
        enrollmentMode: courseData.enrollmentMode ?? 'manual'
      };

      console.log('DatabaseService.createCourse - Saving course data:', preparedCourseData);
      console.log('Course units:', preparedCourseData.units);
      console.log('Total lessons:', preparedCourseData.units?.reduce((total, unit) => total + unit.lessons.length, 0) || 0);

      // Firestore does not allow undefined; strip it recursively from nested objects (e.g. units.lessons)
      const cleaned = DatabaseService.cleanDataForFirebase(preparedCourseData) as typeof preparedCourseData;
      const docRef = await addDoc(collection(db, 'courses'), {
        ...cleaned,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Course saved to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Helper function to recursively remove undefined values
  static cleanDataForFirebase(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj
        .map(item => this.cleanDataForFirebase(item))
        .filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          const cleanedValue = this.cleanDataForFirebase(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    try {
      console.log('DatabaseService.updateCourse - Updating course:', courseId);
      console.log('Update data:', updates);
      console.log('Update units:', updates.units);
      console.log('Update lessons count:', updates.lessons);

      // Ensure price is always stored as a number for correct revenue
      const updatesWithPrice =
        updates.price !== undefined
          ? { ...updates, price: typeof updates.price === 'number' && !Number.isNaN(updates.price) ? updates.price : Number(updates.price) || 0 }
          : updates;

      // Clean the data recursively to remove all undefined values
      const cleanUpdates = this.cleanDataForFirebase(updatesWithPrice);
      
      console.log('Clean updates (no undefined values):', cleanUpdates);
      
      await updateDoc(doc(db, 'courses', courseId), {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Course updated successfully in Firebase');
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const data = { id: courseDoc.id, ...courseDoc.data() } as Course;
        return DatabaseService.normalizeCoursePrice(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  }

  static async getCourses(filters?: {
    instructorId?: string;
    isPublished?: boolean;
    category?: string;
    limit?: number;
  }): Promise<Course[]> {
    try {
      // Build query constraints array
      const constraints = [];

      if (filters?.instructorId) {
        constraints.push(where('instructorId', '==', filters.instructorId));
      }
      if (filters?.isPublished !== undefined) {
        constraints.push(where('isPublished', '==', filters.isPublished));
      }
      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }

      // Always add orderBy at the end
      constraints.push(orderBy('createdAt', 'desc'));

      // Add limit if specified
      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      // Create query with all constraints
      const q = query(collection(db, 'courses'), ...constraints);

      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => DatabaseService.normalizeCoursePrice({ id: doc.id, ...doc.data() } as Course));
      
      console.log('DatabaseService.getCourses - Loaded courses:', courses.length);
      if (courses.length > 0) {
        console.log('First course data:', courses[0]);
        console.log('First course units:', courses[0].units);
        console.log('First course lessons count:', courses[0].units?.reduce((total, unit) => total + unit.lessons.length, 0) || 0);
      }
      
      return courses;
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }


  static async getStudent(studentId: string): Promise<Student | null> {
    try {
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      if (studentDoc.exists()) {
        return { id: studentDoc.id, ...studentDoc.data() } as Student;
      }
      return null;
    } catch (error) {
      console.error('Error getting student:', error);
      throw error;
    }
  }

  // Enrollment operations
  static async enrollStudent(studentId: string, courseId: string, amountPaid?: number): Promise<string> {
    try {
      // If amountPaid not provided, use course price for revenue tracking
      let revenueAmount = amountPaid;
      if (revenueAmount === undefined || revenueAmount === null) {
        const course = await this.getCourse(courseId);
        revenueAmount = course?.price ?? 0;
      }

      const enrollmentData: Omit<Enrollment, 'id'> = {
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        status: 'Active',
        lastAccessed: new Date().toISOString(),
        amountPaid: revenueAmount
      };

      const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);

      // Update student's enrolled courses
      const student = await this.getStudent(studentId);
      if (student) {
        await updateDoc(doc(db, 'users', studentId), {
          enrolledCourses: [...student.enrolledCourses, courseId]
        });
      }

      // Update course enrollment count
      const course = await this.getCourse(courseId);
      if (course) {
        const current = course.enrolledStudents ?? course.enrolledLearners ?? 0;
        await updateDoc(doc(db, 'courses', courseId), {
          enrolledStudents: current + 1
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  static async unenrollStudent(studentId: string, courseId: string): Promise<void> {
    try {
      // Find and delete enrollment
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(enrollmentsQuery);
      
      for (const enrollmentDoc of querySnapshot.docs) {
        await deleteDoc(enrollmentDoc.ref);
      }

      // Update student's enrolled courses
      const student = await this.getStudent(studentId);
      if (student) {
        await updateDoc(doc(db, 'users', studentId), {
          enrolledCourses: student.enrolledCourses.filter(id => id !== courseId)
        });
      }

      // Update course enrollment count
      const course = await this.getCourse(courseId);
      if (course) {
        await updateDoc(doc(db, 'courses', courseId), {
          enrolledStudents: Math.max(0, course.enrolledStudents - 1)
        });
      }
    } catch (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  }

  static async getEnrollments(filters?: {
    studentId?: string;
    courseId?: string;
    status?: string;
  }): Promise<Enrollment[]> {
    try {
      let q = query(collection(db, 'enrollments'));

      if (filters?.studentId) {
        q = query(q, where('studentId', '==', filters.studentId));
      }
      if (filters?.courseId) {
        q = query(q, where('courseId', '==', filters.courseId));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
    } catch (error) {
      console.error('Error getting enrollments:', error);
      throw error;
    }
  }

  // Assignment operations
  static async createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'assignments'), {
        ...assignmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  static async getAssignments(filters?: {
    courseId?: string;
    studentId?: string;
  }): Promise<Assignment[]> {
    try {
      let q = query(collection(db, 'assignments'));

      if (filters?.courseId) {
        q = query(q, where('courseId', '==', filters.courseId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
    } catch (error) {
      console.error('Error getting assignments:', error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToCourses(callback: (courses: Course[]) => void, filters?: {
    instructorId?: string;
    isPublished?: boolean;
  }) {
    let q = query(collection(db, 'courses'));

    console.log('🔍 Setting up real-time listener with filters:', filters);

    if (filters?.instructorId) {
      q = query(q, where('instructorId', '==', filters.instructorId));
      console.log('🔍 Filtering by instructorId:', filters.instructorId);
    }
    if (filters?.isPublished !== undefined) {
      q = query(q, where('isPublished', '==', filters.isPublished));
      console.log('🔍 Filtering by isPublished:', filters.isPublished);
    }

    return onSnapshot(q, (querySnapshot) => {
      try {
        const courses = querySnapshot.docs.map(doc => DatabaseService.normalizeCoursePrice({ id: doc.id, ...doc.data() } as Course));
        console.log('🔍 Real-time listener received courses:', courses.length);
        if (courses.length > 0) {
          console.log('🔍 Course instructorIds:', courses.map(c => ({ title: c.title, instructorId: c.instructorId })));
        }
        callback(courses);
      } catch (error) {
        console.error('Error processing courses snapshot:', error);
        callback([]);
      }
    }, (error) => {
      // Handle AbortError specifically - this is often not a real error
      if (error.code === 'cancelled' || error.name === 'AbortError' || error.message?.includes('aborted')) {
        // Silently handle AbortError - this is normal during cleanup
        return;
      }
      console.error('Error in courses subscription:', error);
      callback([]);
    });
  }

  static subscribeToStudents(callback: (students: Student[]) => void) {
    const q = query(collection(db, 'users'), where('role', 'in', ['student', 'learner']));

    return onSnapshot(q, (querySnapshot) => {
      try {
        const students = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Student, 'id'>)
        }));
        callback(students);
      } catch (error) {
        console.error('Error processing students snapshot:', error);
        callback([]);
      }
    }, (error) => {
      // Handle AbortError specifically - this is often not a real error
      if (error.code === 'cancelled' || error.name === 'AbortError' || error.message?.includes('aborted')) {
        // Silently handle AbortError - this is normal during cleanup
        return;
      }
      console.error('Error in students subscription:', error);
      callback([]);
    });
  }

  static subscribeToAllUsers(callback: (users: any[]) => void) {
    const usersRef = collection(db, 'users');

    return onSnapshot(usersRef, (querySnapshot) => {
      try {
        const allUsers = querySnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            role: userData.role || userData.userType || 'learner',
            avatar: userData.avatar || '',
            phone: userData.phone || '',
            enrolledCourses: userData.enrolledCourses || [],
            completedCourses: userData.completedCourses || [],
            currentGrade: userData.currentGrade || '',
            joinDate: userData.joinDate || userData.createdAt || new Date().toISOString(),
            lastActive: userData.lastActive || userData.updatedAt || new Date().toISOString(),
            progress: userData.progress || 0,
            isActive: userData.isActive !== false,
            courseProgress: userData.courseProgress || {},
            assignments: userData.assignments || [],
            certificates: userData.certificates || [],
            badges: userData.badges || [],
            uid: userData.uid || doc.id
          };
        });
        callback(allUsers);
      } catch (error) {
        console.error('Error processing all users snapshot:', error);
        callback([]);
      }
    }, (error) => {
      if (error.code === 'cancelled' || error.name === 'AbortError' || error.message?.includes('aborted')) {
        return;
      }
      console.error('Error in all users subscription:', error);
      callback([]);
    });
  }

  static subscribeToEnrollments(callback: (enrollments: Enrollment[]) => void, filters?: {
    courseId?: string;
    studentId?: string;
  }) {
    let q = query(collection(db, 'enrollments'));

    if (filters?.courseId) {
      q = query(q, where('courseId', '==', filters.courseId));
    }
    if (filters?.studentId) {
      q = query(q, where('studentId', '==', filters.studentId));
    }

    return onSnapshot(q, (querySnapshot) => {
      try {
        const enrollments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
        callback(enrollments);
      } catch (error) {
        console.error('Error processing enrollments snapshot:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error in enrollments subscription:', error);
      callback([]);
    });
  }

  /** Load checkoutSessions from Firestore (admin-only read enforced by security rules). */
  static async getCheckoutSessions(filters?: {
    status?: string;
  }): Promise<CheckoutSession[]> {
    try {
      let q = query(collection(db, 'checkoutSessions'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as Omit<CheckoutSession, 'id'>;
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      console.error('Error getting checkout sessions:', error);
      return [];
    }
  }

  static subscribeToAssignments(callback: (assignments: Assignment[]) => void, filters?: {
    courseId?: string;
    instructorId?: string;
  }) {
    let q = query(collection(db, 'assignments'));

    if (filters?.courseId) {
      q = query(q, where('courseId', '==', filters.courseId));
    }
    if (filters?.instructorId) {
      q = query(q, where('instructorId', '==', filters.instructorId));
    }

    return onSnapshot(q, (querySnapshot) => {
      try {
        const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
        callback(assignments);
      } catch (error) {
        console.error('Error processing assignments snapshot:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error in assignments subscription:', error);
      callback([]);
    });
  }

  // Student operations
  static async getStudents(): Promise<Student[]> {
    try {
      console.log('DatabaseService.getStudents - Fetching students from Firestore');
      
      // First try to get from students collection
      try {
        const studentsRef = collection(db, 'students');
        const querySnapshot = await getDocs(studentsRef);
        
        const students = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Student));
        
        console.log('DatabaseService.getStudents - Fetched students from students collection:', students.length);
        
        // If students collection is empty, try users collection
        if (students.length === 0) {
          console.log('DatabaseService.getStudents - Students collection is empty, trying users collection');
          
          // First, let's get ALL users to see what we have
          const usersRef = collection(db, 'users');
          const allUsersSnapshot = await getDocs(usersRef);
          console.log('DatabaseService.getStudents - All users in collection:', allUsersSnapshot.docs.length);
          
                    allUsersSnapshot.docs.forEach(doc => {
                      const userData = doc.data();
                      console.log('DatabaseService.getStudents - User data:', {
                        id: doc.id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        role: userData.role,
                        userType: userData.userType,
                        enrolledCourses: userData.enrolledCourses,
                        completedCourses: userData.completedCourses,
                        courseProgress: userData.courseProgress
                      });
                      
                      // Special check for Fulufhelo
                      if (userData.email === 'fulufhelo@youthdevelopers.co.za') {
                        console.log('🔍 FULUFHELO ENROLLMENT CHECK:', {
                          id: doc.id,
                          firstName: userData.firstName,
                          lastName: userData.lastName,
                          email: userData.email,
                          enrolledCourses: userData.enrolledCourses,
                          completedCourses: userData.completedCourses,
                          courseProgress: userData.courseProgress,
                          allFields: Object.keys(userData)
                        });
                      }
                    });
          
          // Return ALL users immediately - we want to see everyone in Firebase
          const learnerUsers = allUsersSnapshot.docs.filter(doc => {
            const role = (doc.data().role || doc.data().userType || '').toLowerCase();
            return role === 'learner' || role === 'student';
          });

          const usersAsStudents = learnerUsers.map(doc => {
            const userData = doc.data();
            return {
              id: doc.id,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              role: 'learner',
              avatar: userData.avatar || '',
              phone: userData.phone || '',
              enrolledCourses: userData.enrolledCourses || [],
              completedCourses: userData.completedCourses || [],
              currentGrade: userData.currentGrade || '',
              joinDate: userData.joinDate || new Date().toISOString(),
              lastActive: userData.lastActive || new Date().toISOString(),
              progress: userData.progress || 0,
              isActive: userData.isActive !== false,
              courseProgress: userData.courseProgress || {},
              assignments: userData.assignments || [],
              certificates: userData.certificates || [],
              assignedLearners: [],
              badges: userData.badges || []
            } as Student;
          });

          console.log('DatabaseService.getStudents - Returning filtered learner users:', usersAsStudents.length);
          return usersAsStudents;
        }
        
        return students;
      } catch (studentsError) {
        console.log('DatabaseService.getStudents - Students collection failed, trying users collection');
        
        // If students collection fails, try users collection with role filter
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', 'in', ['learner', 'student']));
        const querySnapshot = await getDocs(q);
        
        const students = querySnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            avatar: userData.avatar || '',
            phone: userData.phone || '',
            enrolledCourses: userData.enrolledCourses || [],
            completedCourses: userData.completedCourses || [],
            currentGrade: userData.currentGrade || '',
            joinDate: userData.joinDate || new Date().toISOString(),
            lastActive: userData.lastActive || new Date().toISOString(),
            progress: userData.progress || 0,
            isActive: userData.isActive !== false,
            courseProgress: userData.courseProgress || {},
            assignments: userData.assignments || [],
            certificates: userData.certificates || [],
            badges: userData.badges || []
          } as Student;
        });
        
        console.log('DatabaseService.getStudents - Fetched students from users collection:', students.length);
        return students;
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  // Get all users (for admin dashboard)
  static async getAllUsers(): Promise<any[]> {
    try {
      console.log('DatabaseService.getAllUsers - Fetching all users from Firestore');
      
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const allUsers = querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          role: userData.role || userData.userType || 'learner',
          avatar: userData.avatar || '',
          phone: userData.phone || '',
          enrolledCourses: userData.enrolledCourses || [],
          completedCourses: userData.completedCourses || [],
          currentGrade: userData.currentGrade || '',
          joinDate: userData.joinDate || userData.createdAt || new Date().toISOString(),
          lastActive: userData.lastActive || userData.updatedAt || new Date().toISOString(),
          progress: userData.progress || 0,
          isActive: userData.isActive !== false,
          courseProgress: userData.courseProgress || {},
          assignments: userData.assignments || [],
          certificates: userData.certificates || [],
          badges: userData.badges || [],
          uid: userData.uid || doc.id
        };
      });
      
      console.log('DatabaseService.getAllUsers - Fetched all users:', allUsers.length);
      return allUsers;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  /** Delete a user from Firebase Firestore (users collection). */
  static async deleteUser(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to delete a user');
    }
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  }

  static async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        return { id: studentSnap.id, ...studentSnap.data() } as Student;
      }
      return null;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      return null;
    }
  }

  static async createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isActive: true
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  static async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        ...updates,
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Assignment operations
  static async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'assignments', assignmentId));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Student progress operations
  static async getStudentProgress(filters?: {
    studentId?: string;
    courseId?: string;
  }): Promise<StudentProgress[]> {
    try {
      console.log('DatabaseService.getStudentProgress - Fetching student progress from Firestore');
      
      let q = query(collection(db, 'studentProgress'));
      
      if (filters?.studentId) {
        q = query(q, where('studentId', '==', filters.studentId));
      }
      
      if (filters?.courseId) {
        q = query(q, where('courseId', '==', filters.courseId));
      }
      
      const querySnapshot = await getDocs(q);
      const progressData: StudentProgress[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const courseProgressData = data.courseProgress || {};

        const studentId = data.studentId || courseProgressData.studentId || doc.id.split('_')[0];
        const courseId = data.courseId || courseProgressData.courseId || doc.id.split('_')[1];

        progressData.push({
          studentId,
          studentEmail: data.studentEmail || data.email,
          courseId,
          progress:
            courseProgressData.progressPercentage ??
            data.progressPercentage ??
            data.progress ??
            courseProgressData.completedLessons ??
            0,
          lessonsCompleted:
            courseProgressData.completedLessons ??
            data.lessonsCompleted ??
            0,
          totalLessons:
            courseProgressData.totalLessons ??
            data.totalLessons ??
            0,
          lastActivity:
            courseProgressData.lastAccessedAt ??
            data.lastAccessedAt ??
            data.lastActivity ??
            new Date().toISOString(),
          currentLesson:
            courseProgressData.currentLessonId ??
            data.currentLesson,
          timeSpent:
            courseProgressData.timeSpent ??
            data.timeSpent ??
            0,
          completionRate:
            courseProgressData.progressPercentage ??
            data.progressPercentage ??
            data.completionRate ??
            0,
          averageGrade:
            courseProgressData.averageScore ??
            data.averageGrade ??
            0
        });
      });
      
      console.log('DatabaseService.getStudentProgress - Loaded progress records:', progressData.length);
      return progressData;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return [];
    }
  }

  /** Map a single doc to StudentProgress (shared by getStudentProgress and subscribeToStudentProgress). */
  private static mapStudentProgressDoc(doc: { id: string; data: Record<string, unknown> }): StudentProgress {
    const data = doc.data;
    const courseProgressData = (data.courseProgress as Record<string, unknown>) || {};
    const studentId = (data.studentId || courseProgressData.studentId || doc.id.split('_')[0]) as string;
    const courseId = (data.courseId || courseProgressData.courseId || doc.id.split('_')[1]) as string;
    const progress =
      (courseProgressData.progressPercentage as number) ??
      (data.progressPercentage as number) ??
      (data.progress as number) ??
      (courseProgressData.completedLessons as number) ??
      0;
    const completionRate =
      (courseProgressData.progressPercentage as number) ??
      (data.progressPercentage as number) ??
      (data.completionRate as number) ??
      0;
    return {
      studentId,
      studentEmail: (data.studentEmail || data.email) as string | undefined,
      courseId,
      progress: typeof progress === 'number' ? progress : 0,
      lessonsCompleted: (courseProgressData.completedLessons ?? data.lessonsCompleted ?? 0) as number,
      totalLessons: (courseProgressData.totalLessons ?? data.totalLessons ?? 0) as number,
      lastActivity: (courseProgressData.lastAccessedAt ?? data.lastAccessedAt ?? data.lastActivity ?? new Date().toISOString()) as string,
      currentLesson: (courseProgressData.currentLessonId ?? data.currentLesson) as string | undefined,
      timeSpent: (courseProgressData.timeSpent ?? data.timeSpent ?? 0) as number,
      completionRate: typeof completionRate === 'number' ? completionRate : 0,
      averageGrade: (courseProgressData.averageScore ?? data.averageGrade ?? 0) as number,
    };
  }

  static subscribeToStudentProgress(callback: (progress: StudentProgress[]) => void, filters?: {
    studentId?: string;
    courseId?: string;
  }): () => void {
    let q = query(collection(db, 'studentProgress'));
    if (filters?.studentId) {
      q = query(q, where('studentId', '==', filters.studentId));
    }
    if (filters?.courseId) {
      q = query(q, where('courseId', '==', filters.courseId));
    }
    return onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const progressData: StudentProgress[] = querySnapshot.docs.map((d) =>
            DatabaseService.mapStudentProgressDoc({ id: d.id, data: d.data() as Record<string, unknown> })
          );
          callback(progressData);
        } catch (error) {
          console.error('Error processing student progress snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        console.error('Error in student progress subscription:', error);
        callback([]);
      }
    );
  }

  static async deleteStudentProgress(progressId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'studentProgress', progressId));
    } catch (error) {
      console.error('Error deleting student progress:', error);
      throw error;
    }
  }

  /** Get all certificates (issued when learners pass final exam). For admin overview count. */
  static async getCertificates(): Promise<Certificate[]> {
    try {
      const snapshot = await getDocs(collection(db, 'certificates'));
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          learnerId: data.studentId ?? data.learnerId ?? '',
          courseId: data.courseId ?? '',
          title: data.courseTitle ?? data.title ?? 'Course',
          issuedDate: data.issuedAt ?? data.issuedDate ?? new Date().toISOString(),
          expiryDate: data.expiryDate,
          setaUnitStandard: data.setaUnitStandard,
          qctoQualification: data.qctoQualification,
          credits: data.credits ?? 0,
          status: (data.status as Certificate['status']) ?? 'Issued',
          downloadUrl: data.downloadUrl,
          createdAt: data.updatedAt ?? data.createdAt ?? new Date().toISOString(),
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        } as Certificate;
      });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }

  // Message operations
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Meeting operations
  static async deleteMeeting(meetingId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Assessment operations
  static async createAssessment(assessmentData: Omit<CourseAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('🔥 DatabaseService.createAssessment - Input data:', JSON.stringify(assessmentData, null, 2));
      
      const docRef = await addDoc(collection(db, 'assessments'), {
        ...assessmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('🔥 DatabaseService.createAssessment - Document created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ DatabaseService.createAssessment - Error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static async updateAssessment(assessmentId: string, updates: Partial<CourseAssessment>): Promise<void> {
    try {
      await updateDoc(doc(db, 'assessments', assessmentId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }

  static async deleteAssessment(assessmentId: string): Promise<void> {
    try {
      console.log('🗑️ Attempting to delete assessment with ID:', assessmentId);
      const assessmentRef = doc(db, 'assessments', assessmentId);
      console.log('🗑️ Assessment reference:', assessmentRef);
      
      await deleteDoc(assessmentRef);
      console.log('✅ Assessment successfully deleted from Firebase:', assessmentId);
    } catch (error) {
      console.error('❌ Error deleting assessment:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        assessmentId
      });
      throw error;
    }
  }

  // Assessment submission operations
  static async createAssessmentSubmission(assessmentId: string, submission: AssessmentSubmission): Promise<string> {
    try {
      console.log('📝 Creating assessment submission:', {
        assessmentId,
        submissionId: submission.id,
        learnerId: submission.learnerId,
        fileCount: submission.files.length
      });

      // Add submission to the assessment document
      const assessmentRef = doc(db, 'assessments', assessmentId);
      await updateDoc(assessmentRef, {
        submissions: arrayUnion(submission)
      });

      console.log('✅ Assessment submission created successfully:', submission.id);
      return submission.id;
    } catch (error) {
      console.error('❌ Error creating assessment submission:', error);
      throw error;
    }
  }

  static async getAssessmentSubmissions(assessmentId: string): Promise<AssessmentSubmission[]> {
    try {
      const assessmentRef = doc(db, 'assessments', assessmentId);
      const assessmentSnap = await getDoc(assessmentRef);
      
      if (assessmentSnap.exists()) {
        const assessmentData = assessmentSnap.data();
        return assessmentData.submissions || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting assessment submissions:', error);
      throw error;
    }
  }

  // Marked document operations
  static async uploadMarkedDocument(
    assessmentId: string,
    submissionId: string,
    markedDocument: {
      id: string;
      name: string;
      type: string;
      url: string;
      size: number;
      uploadedAt: string;
      uploadedBy: string;
      description?: string;
    }
  ): Promise<void> {
    try {
      console.log('📝 Uploading marked document:', {
        assessmentId,
        submissionId,
        documentId: markedDocument.id,
        documentName: markedDocument.name
      });

      const assessmentRef = doc(db, 'assessments', assessmentId);
      const assessmentSnap = await getDoc(assessmentRef);
      
      if (!assessmentSnap.exists()) {
        throw new Error('Assessment not found');
      }

      const assessmentData = assessmentSnap.data();
      const submissions = assessmentData.submissions || [];
      
      // Find the submission and add the marked document
      const submissionIndex = submissions.findIndex((sub: AssessmentSubmission) => sub.id === submissionId);
      
      if (submissionIndex === -1) {
        throw new Error('Submission not found');
      }

      // Initialize markedDocuments array if it doesn't exist
      if (!submissions[submissionIndex].markedDocuments) {
        submissions[submissionIndex].markedDocuments = [];
      }

      // Add the marked document
      submissions[submissionIndex].markedDocuments.push(markedDocument);
      
      // Update the submission status to 'graded' if it's not already
      if (submissions[submissionIndex].status !== 'graded') {
        submissions[submissionIndex].status = 'graded';
        submissions[submissionIndex].gradedAt = new Date().toISOString();
      }

      // Update the assessment document
      await updateDoc(assessmentRef, {
        submissions: submissions,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Marked document uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading marked document:', error);
      throw error;
    }
  }

  static async deleteMarkedDocument(
    assessmentId: string,
    submissionId: string,
    documentId: string
  ): Promise<void> {
    try {
      console.log('🗑️ Deleting marked document:', {
        assessmentId,
        submissionId,
        documentId
      });

      const assessmentRef = doc(db, 'assessments', assessmentId);
      const assessmentSnap = await getDoc(assessmentRef);
      
      if (!assessmentSnap.exists()) {
        throw new Error('Assessment not found');
      }

      const assessmentData = assessmentSnap.data();
      const submissions = assessmentData.submissions || [];
      
      // Find the submission and remove the marked document
      const submissionIndex = submissions.findIndex((sub: AssessmentSubmission) => sub.id === submissionId);
      
      if (submissionIndex === -1) {
        throw new Error('Submission not found');
      }

      if (submissions[submissionIndex].markedDocuments) {
        submissions[submissionIndex].markedDocuments = submissions[submissionIndex].markedDocuments.filter(
          (doc: any) => doc.id !== documentId
        );
      }

      // Update the assessment document
      await updateDoc(assessmentRef, {
        submissions: submissions,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Marked document deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting marked document:', error);
      throw error;
    }
  }

  static async getAssessment(assessmentId: string): Promise<CourseAssessment | null> {
    try {
      const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
      if (assessmentDoc.exists()) {
        return { id: assessmentDoc.id, ...assessmentDoc.data() } as CourseAssessment;
      }
      return null;
    } catch (error) {
      console.error('Error getting assessment:', error);
      throw error;
    }
  }

  static async getAssessments(filters?: {
    courseId?: string;
    instructorId?: string;
    type?: 'formative' | 'summative';
    isPublished?: boolean;
    limit?: number;
  }): Promise<CourseAssessment[]> {
    try {
      console.log('🔥 DatabaseService.getAssessments - Filters:', filters);
      
      const constraints = [];

      if (filters?.courseId) {
        constraints.push(where('courseId', '==', filters.courseId));
        console.log('🔥 Added courseId filter:', filters.courseId);
      }
      if (filters?.instructorId) {
        constraints.push(where('instructorId', '==', filters.instructorId));
        console.log('🔥 Added instructorId filter:', filters.instructorId);
      }
      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
        console.log('🔥 Added type filter:', filters.type);
      }
      if (filters?.isPublished !== undefined) {
        constraints.push(where('isPublished', '==', filters.isPublished));
        console.log('🔥 Added isPublished filter:', filters.isPublished);
      }

      constraints.push(orderBy('createdAt', 'desc'));
      console.log('🔥 Total constraints:', constraints.length);

      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(collection(db, 'assessments'), ...constraints);
      console.log('🔥 Executing query on assessments collection');
      
      const querySnapshot = await getDocs(q);
      console.log('🔥 Query executed, found documents:', querySnapshot.docs.length);
      
      const assessments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔥 Document data:', { id: doc.id, title: data.title, courseId: data.courseId });
        return { id: doc.id, ...data } as CourseAssessment;
      });
      
      console.log('🔥 Returning assessments:', assessments.length);
      return assessments;
    } catch (error) {
      console.error('❌ Error getting assessments:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Update an assessment submission with grade and feedback.
   */
  static async updateAssessmentSubmission(
    assessmentId: string,
    submissionId: string,
    updatedSubmission: any
  ): Promise<void> {
    try {
      const assessmentRef = doc(db, 'assessments', assessmentId);
      const assessmentSnap = await getDoc(assessmentRef);

      if (!assessmentSnap.exists()) {
        throw new Error('Assessment not found');
      }

      const assessmentData = assessmentSnap.data() as Assessment;
      const submissionIndex = assessmentData.submissions.findIndex(s => s.id === submissionId);

      if (submissionIndex === -1) {
        throw new Error('Submission not found');
      }

      // Update the submission
      assessmentData.submissions[submissionIndex] = {
        ...assessmentData.submissions[submissionIndex],
        ...updatedSubmission
      };

      await updateDoc(assessmentRef, { submissions: assessmentData.submissions });
      console.log(`✅ Submission ${submissionId} updated successfully`);
    } catch (error) {
      console.error('❌ Error updating assessment submission:', error);
      throw error;
    }
  }

  // Get user profile by UID
  static async getUserProfile(uid: string): Promise<any | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('👤 Fetched user profile:', uid, userData);
        return {
          uid: userSnap.id,
          ...userData
        };
      } else {
        console.log('👤 User profile not found:', uid);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  }

  // ========== Community Posts (Announcements) ==========

  /**
   * Create a new community post (admin/instructor announcement)
   */
  static async createCommunityPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const publishedAt = postData.isPublished ? now : null;

      const post = {
        ...postData,
        createdAt: now,
        updatedAt: now,
        publishedAt: publishedAt,
      };

      const docRef = await addDoc(collection(db, 'communityPosts'), post);
      console.log('✅ Community post created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating community post:', error);
      throw error;
    }
  }

  /**
   * Update a community post
   */
  static async updateCommunityPost(postId: string, updates: Partial<Omit<CommunityPost, 'id' | 'createdAt'>>): Promise<void> {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        ...updates,
        updatedAt: new Date().toISOString(),
        // If publishing now, set publishedAt
        ...(updates.isPublished && !updates.publishedAt ? { publishedAt: new Date().toISOString() } : {})
      });
      console.log('✅ Community post updated:', postId);
    } catch (error) {
      console.error('❌ Error updating community post:', error);
      throw error;
    }
  }

  /**
   * Delete a community post
   */
  static async deleteCommunityPost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
      console.log('✅ Community post deleted:', postId);
    } catch (error) {
      console.error('❌ Error deleting community post:', error);
      throw error;
    }
  }

  /**
   * Get community posts visible to a specific learner.
   * @param learnerId - The learner's user ID
   * @param options - Filtering options (includeExpired, includeUnpublished)
   * @returns Array of CommunityPost sorted by pinned + publishedAt desc
   */
  static async getCommunityPostsForLearner(learnerId: string, options?: {
    includeExpired?: boolean;
    includeUnpublished?: boolean;
    limit?: number;
  }): Promise<CommunityPost[]> {
    try {
      const constraints: any[] = [];

      if (!options?.includeUnpublished) {
        constraints.push(where('isPublished', '==', true));
      }

      constraints.push(orderBy('isPinned', 'desc'));
      constraints.push(orderBy('publishedAt', 'desc'));
      if (options?.limit) constraints.push(limit(options.limit));

      const q = query(collection(db, 'communityPosts'), ...constraints);
      const querySnapshot = await getDocs(q);

      const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));

      // Client-side filtering for target audience and expiry
      const filtered = posts.filter(post => {
        if (post.expiresAt && new Date(post.expiresAt) < new Date()) {
          return false;
        }
        return true;
      });

      return filtered;
    } catch (error) {
      console.error('❌ Error getting community posts:', error);
      throw error;
    }
  }

  /**
   * Get all community posts (for admin management)
   */
  static async getAllCommunityPosts(): Promise<CommunityPost[]> {
    try {
      const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
    } catch (error) {
      console.error('❌ Error getting all community posts:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for community posts
   */
  static subscribeToCommunityPosts(callback: (posts: CommunityPost[]) => void): () => void {
    const q = query(
      collection(db, 'communityPosts'),
      where('isPublished', '==', true),
      orderBy('isPinned', 'desc'),
      orderBy('publishedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost))
        .filter(post => !post.expiresAt || new Date(post.expiresAt) >= new Date());
      callback(posts);
    }, (error) => {
      console.error('❌ Error subscribing to community posts:', error);
    });

    return unsubscribe;
  }
}

// Export the database service instance
export const databaseService = new DatabaseService();
