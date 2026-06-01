import { db } from '../firebase/config';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  studentId: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
  timeSpent?: number; // in minutes
  attempts?: number;
}

export interface CourseProgress {
  courseId: string;
  studentId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  currentLessonId?: string;
  lastAccessedAt: string;
  startedAt: string;
  completedAt?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  timeSpent: number; // total time in minutes
  averageScore?: number;
}

export interface StudentProgressData {
  studentId: string;
  courseId: string;
  courseProgress: CourseProgress;
  lessonProgress: LessonProgress[];
}

class ProgressService {
  // Update lesson completion when student clicks "Next"
  async completeLesson(
    studentId: string, 
    courseId: string, 
    lessonId: string, 
    timeSpent: number = 0,
    score?: number
  ): Promise<{ success: boolean; message: string; updatedProgress?: CourseProgress }> {
    try {
      console.log('📊 Completing lesson:', { studentId, courseId, lessonId, timeSpent, score });

      // Get or create course progress document
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      let courseProgress: CourseProgress;
      let lessonProgressList: LessonProgress[] = [];

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        courseProgress = data.courseProgress;
        lessonProgressList = data.lessonProgress || [];
      } else {
        // Create new progress document
        courseProgress = {
          courseId,
          studentId,
          totalLessons: 0, // Will be updated when we get course data
          completedLessons: 0,
          progressPercentage: 0,
          lastAccessedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          status: 'Not Started',
          timeSpent: 0
        };
      }

      // Get course data to determine total lessons
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data();
      const totalLessons = courseData.units?.reduce((total: number, unit: any) => 
        total + (unit.lessons?.length || 0), 0) || 0;

      // Update total lessons if not set
      if (courseProgress.totalLessons === 0) {
        courseProgress.totalLessons = totalLessons;
      }

      // Check if lesson is already completed
      const existingLessonIndex = lessonProgressList.findIndex(
        lp => lp.lessonId === lessonId
      );

      if (existingLessonIndex >= 0) {
        // Update existing lesson progress
        lessonProgressList[existingLessonIndex] = {
          ...lessonProgressList[existingLessonIndex],
          completed: true,
          completedAt: new Date().toISOString(),
          timeSpent: (lessonProgressList[existingLessonIndex].timeSpent || 0) + timeSpent,
          score: score || lessonProgressList[existingLessonIndex].score,
          attempts: (lessonProgressList[existingLessonIndex].attempts || 0) + 1
        };
      } else {
        // Add new lesson progress
        lessonProgressList.push({
          lessonId,
          courseId,
          studentId,
          completed: true,
          completedAt: new Date().toISOString(),
          timeSpent,
          score,
          attempts: 1
        });
      }

      // Update course progress
      const completedLessons = lessonProgressList.filter(lp => lp.completed).length;
      // Fix division by zero and ensure progress is valid
      const progressPercentage = totalLessons > 0 
        ? Math.min(Math.round((completedLessons / totalLessons) * 100), 100)
        : 0;
      
      courseProgress.completedLessons = completedLessons;
      courseProgress.progressPercentage = progressPercentage;
      courseProgress.lastAccessedAt = new Date().toISOString();
      courseProgress.timeSpent = lessonProgressList.reduce((total, lp) => total + (lp.timeSpent || 0), 0);
      
      // Calculate average score
      const completedWithScores = lessonProgressList.filter(lp => lp.completed && lp.score !== undefined);
      if (completedWithScores.length > 0) {
        courseProgress.averageScore = Math.round(
          completedWithScores.reduce((sum, lp) => sum + (lp.score || 0), 0) / completedWithScores.length
        );
      }

      // Update status
      if (progressPercentage >= 100) {
        courseProgress.status = 'Completed';
        courseProgress.completedAt = new Date().toISOString();
      } else if (progressPercentage > 0) {
        courseProgress.status = 'In Progress';
      }

      // Save to Firestore
      await updateDoc(progressRef, {
        courseProgress,
        lessonProgress: lessonProgressList,
        updatedAt: serverTimestamp()
      });

      console.log('📊 Lesson completed successfully:', {
        completedLessons,
        totalLessons,
        progressPercentage,
        status: courseProgress.status
      });

      return {
        success: true,
        message: `Lesson completed! Progress: ${progressPercentage}%`,
        updatedProgress: courseProgress
      };

    } catch (error) {
      console.error('📊 Error completing lesson:', error);
      return {
        success: false,
        message: `Failed to complete lesson: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get student progress for a specific course
  async getStudentCourseProgress(
    studentId: string, 
    courseId: string
  ): Promise<StudentProgressData | null> {
    try {
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        return null;
      }

      const data = progressDoc.data();
      return {
        studentId,
        courseId,
        courseProgress: data.courseProgress,
        lessonProgress: data.lessonProgress || []
      };
    } catch (error) {
      console.error('📊 Error getting student progress:', error);
      return null;
    }
  }

  // Get all students' progress for a course (for instructor dashboard)
  async getCourseStudentsProgress(courseId: string): Promise<StudentProgressData[]> {
    try {
      const progressQuery = query(
        collection(db, 'studentProgress'),
        where('courseProgress.courseId', '==', courseId)
      );
      
      const querySnapshot = await getDocs(progressQuery);
      const studentsProgress: StudentProgressData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        studentsProgress.push({
          studentId: data.courseProgress.studentId,
          courseId: data.courseProgress.courseId,
          courseProgress: data.courseProgress,
          lessonProgress: data.lessonProgress || []
        });
      });

      return studentsProgress;
    } catch (error) {
      console.error('📊 Error getting course students progress:', error);
      return [];
    }
  }

  // Get all progress for a specific student
  async getStudentAllProgress(studentId: string): Promise<StudentProgressData[]> {
    try {
      const progressQuery = query(
        collection(db, 'studentProgress'),
        where('courseProgress.studentId', '==', studentId)
      );
      
      const querySnapshot = await getDocs(progressQuery);
      const studentProgress: StudentProgressData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        studentProgress.push({
          studentId: data.courseProgress.studentId,
          courseId: data.courseProgress.courseId,
          courseProgress: data.courseProgress,
          lessonProgress: data.lessonProgress || []
        });
      });

      return studentProgress;
    } catch (error) {
      console.error('📊 Error getting student all progress:', error);
      return [];
    }
  }

  // Update current lesson (when student navigates to a lesson)
  async updateCurrentLesson(
    studentId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        await updateDoc(progressRef, {
          'courseProgress.currentLessonId': lessonId,
          'courseProgress.lastAccessedAt': new Date().toISOString(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('📊 Error updating current lesson:', error);
    }
  }

  // Get progress statistics for instructor dashboard
  async getCourseProgressStats(courseId: string): Promise<{
    totalStudents: number;
    completedStudents: number;
    averageProgress: number;
    averageTimeSpent: number;
    completionRate: number;
  }> {
    try {
      const studentsProgress = await this.getCourseStudentsProgress(courseId);
      
      const totalStudents = studentsProgress.length;
      const completedStudents = studentsProgress.filter(
        sp => sp.courseProgress.status === 'Completed'
      ).length;
      
      const averageProgress = studentsProgress.length > 0 
        ? Math.round(studentsProgress.reduce((sum, sp) => sum + sp.courseProgress.progressPercentage, 0) / studentsProgress.length)
        : 0;
      
      const averageTimeSpent = studentsProgress.length > 0
        ? Math.round(studentsProgress.reduce((sum, sp) => sum + sp.courseProgress.timeSpent, 0) / studentsProgress.length)
        : 0;
      
      const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

      return {
        totalStudents,
        completedStudents,
        averageProgress,
        averageTimeSpent,
        completionRate
      };
    } catch (error) {
      console.error('📊 Error getting course progress stats:', error);
      return {
        totalStudents: 0,
        completedStudents: 0,
        averageProgress: 0,
        averageTimeSpent: 0,
        completionRate: 0
      };
    }
  }
}

export const progressService = new ProgressService();
