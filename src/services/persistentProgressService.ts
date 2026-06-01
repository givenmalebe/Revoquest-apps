import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  FINAL_EXAM_PASS_PERCENT,
  getFinalExamDisplayScore,
  hasPassedFinalExam,
} from '../utils/finalExamProgress';

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  studentId: string;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  timeSpent: number; // in minutes
  score?: number;
  attempts?: number;
  currentPosition?: number; // for video/reading progress
  notes?: string; // student notes
  bookmarks?: string[]; // bookmarked sections
}

export interface CourseProgress {
  courseId: string;
  studentId: string;
  totalLessons: number;
  completedLessons: number;
  totalUnits: number;
  completedUnits: number;
  currentUnitIndex: number; // Which unit the student is currently on (0-based)
  progressPercentage: number;
  currentLessonId?: string;
  lastAccessedAt: string;
  startedAt: string;
  completedAt?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  timeSpent: number; // total time in minutes
  averageScore?: number;
  lastPosition?: {
    unitId: string;
    lessonId: string;
    lessonIndex: number;
  };
}

export interface StudentProgressData {
  studentId: string;
  courseId: string;
  courseProgress: CourseProgress;
  lessonProgress: LessonProgress[];
  finalExamScore?: number;
  finalExamLatestScore?: number;
  finalExamPassedScore?: number;
  finalExamPassed?: boolean;
  finalExamPassedAt?: string;
  finalExamSubmittedAt?: string;
  finalExamAttempts?: number;
  certificateIssuedAt?: string;
  finalExamReview?: {
    attemptedAt: string;
    score: number;
    failedQuestions: Array<{
      questionId: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      sourceTag?: string;
      explanation?: string;
    }>;
    allQuestions?: Array<{
      questionId: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      sourceTag?: string;
      explanation?: string;
    }>;
    suggestedReviewTopics: string[];
  };
}

class PersistentProgressService {
  /** Firestore does not allow undefined. Recursively remove undefined from objects/arrays. */
  private stripUndefined(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.stripUndefined(item)).filter((item) => item !== undefined);
    }
    if (typeof obj === 'object' && obj.constructor?.name === 'Timestamp') return obj;
    if (typeof obj === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) continue;
        const cleaned = this.stripUndefined(v);
        if (cleaned !== undefined) out[k] = cleaned;
      }
      return out;
    }
    return obj;
  }

  // Helper function to deduplicate lesson progress entries
  private deduplicateLessonProgress(lessonProgressList: LessonProgress[]): LessonProgress[] {
    const seen = new Set<string>();
    const deduplicated: LessonProgress[] = [];
    
    for (const lesson of lessonProgressList) {
      // Only deduplicate if the lesson ID contains unit/lesson suffixes that indicate duplicates
      // For example: lesson-1-unit0-lesson0 should be treated as lesson-1
      // But lesson-1, lesson-2, lesson-3 should remain separate
      const isDuplicateId = lesson.lessonId.includes('-unit');
      
      let normalizedId = lesson.lessonId;
      if (isDuplicateId) {
        // Only normalize if it's clearly a duplicate with unit/lesson suffix
        normalizedId = lesson.lessonId.replace(/-unit\d+-lesson\d+$/, '');
      }
      
      if (!seen.has(normalizedId)) {
        seen.add(normalizedId);
        // Use the original lesson ID from the course structure if available
        const originalId = isDuplicateId ? normalizedId : lesson.lessonId;
        
        deduplicated.push({
          ...lesson,
          lessonId: originalId
        });
      } else {
        // If we've seen this lesson before, merge the data (keep the most recent completion)
        const existingIndex = deduplicated.findIndex(lp => {
          const existingNormalizedId = lp.lessonId.includes('-unit')
            ? lp.lessonId.replace(/-unit\d+-lesson\d+$/, '')
            : lp.lessonId;
          return existingNormalizedId === normalizedId;
        });
        
        if (existingIndex >= 0) {
          const existing = deduplicated[existingIndex];
          const existingCompletedAt = existing.completedAt ? new Date(existing.completedAt) : new Date(0);
          const currentCompletedAt = lesson.completedAt ? new Date(lesson.completedAt) : new Date(0);
          
          // Keep the most recent completion data
          if (currentCompletedAt > existingCompletedAt) {
            deduplicated[existingIndex] = {
              ...lesson,
              lessonId: existing.lessonId, // Keep the original ID
              timeSpent: Math.max(existing.timeSpent, lesson.timeSpent),
              attempts: Math.max(existing.attempts || 0, lesson.attempts || 0)
            };
          } else {
            // Keep existing but update time spent and attempts
            deduplicated[existingIndex] = {
              ...existing,
              timeSpent: Math.max(existing.timeSpent, lesson.timeSpent),
              attempts: Math.max(existing.attempts || 0, lesson.attempts || 0)
            };
          }
        }
      }
    }
    
    console.log('🔄 Deduplicated lesson progress:', {
      original: lessonProgressList.length,
      deduplicated: deduplicated.length,
      originalIds: lessonProgressList.map(lp => lp.lessonId),
      deduplicatedIds: deduplicated.map(lp => lp.lessonId)
    });
    
    return deduplicated;
  }

  // Helper function to clean data before saving to Firestore
  private cleanLessonProgressData(lessonProgress: LessonProgress): any {
    const cleaned: any = {
      lessonId: lessonProgress.lessonId || '',
      courseId: lessonProgress.courseId || '',
      studentId: lessonProgress.studentId || '',
      completed: Boolean(lessonProgress.completed),
      startedAt: lessonProgress.startedAt || new Date().toISOString(),
      lastAccessedAt: lessonProgress.lastAccessedAt || new Date().toISOString(),
      timeSpent: Number(lessonProgress.timeSpent) || 0,
      attempts: Number(lessonProgress.attempts) || 0,
      currentPosition: typeof lessonProgress.currentPosition === 'number' ? lessonProgress.currentPosition : 0,
      notes: lessonProgress.notes || '',
      bookmarks: Array.isArray(lessonProgress.bookmarks) ? lessonProgress.bookmarks : []
    };

    // Only add optional fields if they have valid values
    if (lessonProgress.completedAt) {
      cleaned.completedAt = lessonProgress.completedAt;
    }
    if (typeof lessonProgress.score === 'number') {
      cleaned.score = lessonProgress.score;
    }

    return cleaned;
  }

  // Helper function to calculate unit-based progress
  private async calculateUnitProgress(
    courseId: string,
    lessonProgressList: LessonProgress[]
  ): Promise<{ completedUnits: number; totalUnits: number; currentUnitIndex: number }> {
    try {
      // Get course data to know unit structure
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        return { completedUnits: 0, totalUnits: 0, currentUnitIndex: 0 };
      }
      
      const courseData = courseDoc.data();
      const units = courseData.units || courseData.modules || [];
      const totalUnits = units.length;
      
      console.log('📊 Starting unit progress calculation:', {
        totalUnits,
        totalLessonProgress: lessonProgressList.length,
        completedInProgress: lessonProgressList.filter(lp => lp.completed).length
      });
      
      // Calculate completed units and find current unit
      let completedUnits = 0;
      let currentUnitIndex = 0;
      
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        const unitLessons = unit.lessons || [];
        
        if (unitLessons.length === 0) continue;
        
        // Get all completed lesson IDs for debugging
        const allCompletedIds = lessonProgressList.filter(lp => lp.completed === true).map(lp => lp.lessonId);
        
        // Count completed lessons in this unit - check multiple ID formats
        const completedLessonsInUnit = unitLessons.filter((lesson: any) => {
          const lessonId = lesson.id;
          
          // Check if this lesson is completed in progress list
          const isCompleted = lessonProgressList.some(lp => {
            // Try exact match first
            if (lp.lessonId === lessonId && lp.completed === true) {
              return true;
            }
            
            // Try without dashes (e.g., "lesson11" vs "lesson-1-1")
            const normalizedProgressId = lp.lessonId.replace(/-/g, '');
            const normalizedLessonId = lessonId.replace(/-/g, '');
            if (normalizedProgressId === normalizedLessonId && lp.completed === true) {
              return true;
            }
            
            return false;
          });
          
          return isCompleted;
        }).length;
        
        // Unit is complete if ALL lessons are completed
        const allLessonsCompleted = completedLessonsInUnit === unitLessons.length;
        
        const debugInfo = {
          unitId: unit.id,
          unitTitle: unit.title,
          totalLessonsInUnit: unitLessons.length,
          completedLessonsInUnit,
          allLessonsCompleted,
          lessonIdsInCourse: unitLessons.map((l: any) => l.id),
          completedLessonIdsInProgress: allCompletedIds,
          matchDetails: unitLessons.map((l: any) => ({
            lessonId: l.id,
            hasMatch: lessonProgressList.some(lp => 
              (lp.lessonId === l.id || lp.lessonId.replace(/-/g, '') === l.id.replace(/-/g, '')) && lp.completed === true
            )
          }))
        };
        
        console.log(`📊 Unit ${i + 1} (${unit.title}) analysis:`, debugInfo);
        console.log(`📊 Unit ${i + 1} - Course Lesson IDs:`, unitLessons.map((l: any) => l.id).join(', '));
        console.log(`📊 Unit ${i + 1} - Completed Lesson IDs:`, allCompletedIds.join(', '));
        
        if (allLessonsCompleted) {
          completedUnits++;
          currentUnitIndex = i + 1; // Move to next unit
        } else if (completedLessonsInUnit > 0) {
          // Student is currently in this unit
          currentUnitIndex = i;
          break;
        } else if (completedUnits === 0) {
          // Haven't started any lessons yet
          currentUnitIndex = 0;
          break;
        }
      }
      
      console.log('📊 Unit Progress Calculation:', {
        totalUnits,
        completedUnits,
        currentUnitIndex,
        percentage: totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0
      });
      
      return { completedUnits, totalUnits, currentUnitIndex };
    } catch (error) {
      console.error('Error calculating unit progress:', error);
      return { completedUnits: 0, totalUnits: 0, currentUnitIndex: 0 };
    }
  }

  // Auto-save lesson progress when student starts viewing a lesson
  async startLesson(
    studentId: string,
    courseId: string,
    lessonId: string,
    unitId: string,
    lessonIndex: number,
    totalLessons?: number
  ): Promise<{ success: boolean; message: string; progress?: LessonProgress }> {
    try {
      console.log('📚 Starting lesson:', { studentId, courseId, lessonId, unitId, lessonIndex, totalLessons });

      // Get or create progress document
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      let courseProgress: CourseProgress;
      let lessonProgressList: LessonProgress[] = [];

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        courseProgress = data.courseProgress;
        lessonProgressList = data.lessonProgress || [];
      } else {
        // Create new progress document - Progress starts at 0%
        const unitProgress = await this.calculateUnitProgress(courseId, []);
        courseProgress = {
          courseId: courseId || '',
          studentId: studentId || '',
          totalLessons: totalLessons || 24,
          completedLessons: 0,
          totalUnits: unitProgress.totalUnits,
          completedUnits: 0,
          currentUnitIndex: 0, // Start at unit 0
          progressPercentage: 0, // Start at 0%
          lastAccessedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          status: 'Not Started',
          timeSpent: 0
        };
        console.log('✨ New course progress created - Starting fresh at 0%', {
          totalUnits: unitProgress.totalUnits,
          progressPercentage: 0
        });
      }

      // Update total lessons if provided
      if (totalLessons && totalLessons > 0) {
        courseProgress.totalLessons = totalLessons;
      }

      // Update course progress
      courseProgress.lastAccessedAt = new Date().toISOString();
      courseProgress.currentLessonId = lessonId;
      courseProgress.lastPosition = {
        unitId: unitId || '',
        lessonId: lessonId || '',
        lessonIndex: lessonIndex || 0
      };

      if (courseProgress.status === 'Not Started') {
        courseProgress.status = 'In Progress';
      }

      // Check if lesson progress already exists
      const existingLessonIndex = lessonProgressList.findIndex(
        lp => lp.lessonId === lessonId
      );

      if (existingLessonIndex >= 0) {
        // Update existing lesson progress
        lessonProgressList[existingLessonIndex] = {
          ...lessonProgressList[existingLessonIndex],
          lastAccessedAt: new Date().toISOString(),
          timeSpent: lessonProgressList[existingLessonIndex].timeSpent || 0
        };
      } else {
        // Add new lesson progress
        const newLessonProgress: LessonProgress = {
          lessonId,
          courseId,
          studentId,
          completed: false,
          startedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          timeSpent: 0,
          attempts: 0
        };
        lessonProgressList.push(newLessonProgress);
      }

      // Auto-complete Lesson 1 if it's not completed and we're starting other lessons in Unit 1
      if (lessonId.startsWith('lesson-1-') && lessonId !== 'lesson-1-1') {
        const lesson1Index = lessonProgressList.findIndex(lp => lp.lessonId === 'lesson-1-1');
        if (lesson1Index >= 0) {
          // Update existing Lesson 1 progress
          if (!lessonProgressList[lesson1Index].completed) {
            lessonProgressList[lesson1Index] = {
              ...lessonProgressList[lesson1Index],
              completed: true,
              completedAt: new Date().toISOString(),
              lastAccessedAt: new Date().toISOString(),
              timeSpent: lessonProgressList[lesson1Index].timeSpent || 0,
              currentPosition: lessonProgressList[lesson1Index].currentPosition || 0,
              score: lessonProgressList[lesson1Index].score,
              attempts: (lessonProgressList[lesson1Index].attempts || 0) + 1
            };
            console.log('🎯 Auto-completing Lesson 1 as prerequisite for starting other Unit 1 lessons');
          }
        } else {
          // Create new Lesson 1 progress entry
          lessonProgressList.push({
            lessonId: 'lesson-1-1',
            courseId: courseId || '',
            studentId: studentId || '',
            completed: true,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            timeSpent: 0,
            currentPosition: 0,
            score: undefined,
            attempts: 1
          });
          console.log('🎯 Auto-creating and completing Lesson 1 as prerequisite for starting other Unit 1 lessons');
        }
        
        // Force update the completed lessons count to include Lesson 1
        const completedLessons = lessonProgressList.filter(lp => lp.completed).length;
        courseProgress.completedLessons = completedLessons;
        console.log('🎯 Updated completed lessons count to include Lesson 1:', completedLessons);
      }

      // Calculate unit progress and auto-save
      const unitProgress = await this.calculateUnitProgress(courseId, lessonProgressList);
      courseProgress.completedUnits = unitProgress.completedUnits;
      courseProgress.totalUnits = unitProgress.totalUnits;
      courseProgress.currentUnitIndex = unitProgress.currentUnitIndex;
      
      // Calculate progress percentage based on lessons (more accurate for partial progress)
      const completedLessons = lessonProgressList.filter(lp => lp.completed).length;
      if (courseProgress.totalLessons > 0) {
        courseProgress.progressPercentage = Math.round((completedLessons / courseProgress.totalLessons) * 100);
      } else {
        courseProgress.progressPercentage = 0;
      }
      
      console.log('💾 Auto-saving progress:', {
        completedLessons: completedLessons,
        totalLessons: courseProgress.totalLessons,
        completedUnits: courseProgress.completedUnits,
        totalUnits: courseProgress.totalUnits,
        currentUnit: courseProgress.currentUnitIndex + 1,
        progressPercentage: courseProgress.progressPercentage,
        calculation: `(${completedLessons} / ${courseProgress.totalLessons}) * 100 = ${courseProgress.progressPercentage}%`
      });

      // Clean and save to Firestore (AUTO-SAVE); strip undefined for Firestore
      const cleanedLessonProgress = lessonProgressList.map(lp => this.cleanLessonProgressData(lp));
      const startPayload = this.stripUndefined({
        courseProgress,
        lessonProgress: cleanedLessonProgress,
        updatedAt: Timestamp.now()
      });
      await setDoc(progressRef, startPayload, { merge: true });

      const lessonProgress = lessonProgressList.find(lp => lp.lessonId === lessonId);
      console.log('📚 Lesson started successfully:', lessonProgress);

      return {
        success: true,
        message: 'Lesson started successfully',
        progress: lessonProgress
      };

    } catch (error) {
      console.error('Error starting lesson:', error);
      return {
        success: false,
        message: 'Failed to start lesson'
      };
    }
  }

  // Auto-save lesson progress periodically
  async updateLessonProgress(
    studentId: string,
    courseId: string,
    lessonId: string,
    timeSpent: number,
    currentPosition?: number,
    notes?: string,
    bookmarks?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      let courseProgress: CourseProgress;
      let lessonProgressList: LessonProgress[] = [];

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        courseProgress = data.courseProgress;
        lessonProgressList = data.lessonProgress || [];
      } else {
        // Create new progress document if it doesn't exist
        console.log('📚 Creating new progress document for lesson update');
        const unitProgress = await this.calculateUnitProgress(courseId, []);
        courseProgress = {
          courseId: courseId || '',
          studentId: studentId || '',
          totalLessons: 24,
          completedLessons: 0,
          totalUnits: unitProgress.totalUnits,
          completedUnits: 0,
          currentUnitIndex: 0,
          progressPercentage: 0,
          lastAccessedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          status: 'Not Started',
          timeSpent: 0
        };
      }

      const lessonIndex = lessonProgressList.findIndex(lp => lp.lessonId === lessonId);
      if (lessonIndex >= 0) {
        // Update existing lesson progress
        lessonProgressList[lessonIndex] = {
          ...lessonProgressList[lessonIndex],
          lastAccessedAt: new Date().toISOString(),
          timeSpent: timeSpent,
          currentPosition: typeof currentPosition === 'number' ? currentPosition : (lessonProgressList[lessonIndex].currentPosition || 0),
          notes: notes || lessonProgressList[lessonIndex].notes,
          bookmarks: bookmarks || lessonProgressList[lessonIndex].bookmarks
        };
      } else {
        // Create new lesson progress entry if it doesn't exist
        lessonProgressList.push({
          lessonId: lessonId || '',
          courseId: courseId || '',
          studentId: studentId || '',
          completed: false,
          startedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          timeSpent: timeSpent || 0,
          currentPosition: typeof currentPosition === 'number' ? currentPosition : 0,
          notes: notes || '',
          bookmarks: bookmarks || [],
          attempts: 0
        });
      }

        // Update course progress and calculate unit-based progress
        courseProgress.lastAccessedAt = new Date().toISOString();
        courseProgress.timeSpent = lessonProgressList.reduce((total, lp) => total + (lp.timeSpent || 0), 0);
        
      // Calculate lesson-based progress (more accurate for partial progress)
      const completedLessons = lessonProgressList.filter(lp => lp.completed).length;
      courseProgress.completedLessons = completedLessons;
      
      const unitProgress = await this.calculateUnitProgress(courseId, lessonProgressList);
      courseProgress.completedUnits = unitProgress.completedUnits;
      courseProgress.totalUnits = unitProgress.totalUnits;
      courseProgress.currentUnitIndex = unitProgress.currentUnitIndex;
      
      // Use lesson-based calculation for progress percentage (fixes 0% bug)
      courseProgress.progressPercentage = courseProgress.totalLessons > 0 
        ? Math.round((completedLessons / courseProgress.totalLessons) * 100)
        : 0;

        console.log('💾 Auto-saving lesson progress:', {
          lessonId,
          completedLessons: courseProgress.completedLessons,
          totalLessons: courseProgress.totalLessons,
          completedUnits: courseProgress.completedUnits,
          totalUnits: courseProgress.totalUnits,
          currentUnit: courseProgress.currentUnitIndex + 1,
          progressPercentage: courseProgress.progressPercentage,
          calculation: `(${courseProgress.completedLessons} / ${courseProgress.totalLessons}) * 100 = ${courseProgress.progressPercentage}%`
        });

        // Clean and auto-save to Firestore
        const cleanedLessonProgress = lessonProgressList.map(lp => this.cleanLessonProgressData(lp));
        
        // Deduplicate before saving
        const deduplicatedLessonProgress = this.deduplicateLessonProgress(cleanedLessonProgress.map(lp => ({
          ...lp,
          lessonId: lp.lessonId,
          courseId: lp.courseId,
          studentId: lp.studentId,
          completed: lp.completed,
          startedAt: lp.startedAt,
          lastAccessedAt: lp.lastAccessedAt,
          timeSpent: lp.timeSpent,
          attempts: lp.attempts,
          completedAt: lp.completedAt,
          score: lp.score,
          currentPosition: lp.currentPosition,
          notes: lp.notes,
          bookmarks: lp.bookmarks
        })));
        
        const payload = this.stripUndefined({
          courseProgress,
          lessonProgress: deduplicatedLessonProgress,
          updatedAt: Timestamp.now()
        });
        await setDoc(progressRef, payload, { merge: true });

        console.log('✅ Lesson progress auto-saved:', { lessonId, timeSpent, currentPosition });
        return { success: true, message: 'Progress updated successfully' };

    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return { success: false, message: 'Failed to update progress' };
    }
  }

  // Complete lesson and auto-save
  async completeLesson(
    studentId: string,
    courseId: string,
    lessonId: string,
    timeSpent: number,
    score?: number
  ): Promise<{ success: boolean; message: string; updatedProgress?: CourseProgress }> {
    try {
      console.log('📊 Completing lesson:', { studentId, courseId, lessonId, timeSpent, score });

      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      let courseProgress: CourseProgress;
      let lessonProgressList: LessonProgress[] = [];

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        courseProgress = data.courseProgress;
        lessonProgressList = data.lessonProgress || [];
        
        // Deduplicate lesson progress entries
        lessonProgressList = this.deduplicateLessonProgress(lessonProgressList);
        
        console.log('📊 Using existing progress document:', {
          completedLessons: courseProgress.completedLessons,
          progressPercentage: courseProgress.progressPercentage,
          totalLessons: courseProgress.totalLessons
        });
      } else {
        // Create new progress document if it doesn't exist
        console.log('📊 Creating new progress document for lesson completion');
        const unitProgress = await this.calculateUnitProgress(courseId, []);
        courseProgress = {
          courseId: courseId || '',
          studentId: studentId || '',
          totalLessons: 24,
          completedLessons: 0,
          totalUnits: unitProgress.totalUnits,
          completedUnits: 0,
          currentUnitIndex: 0,
          progressPercentage: 0,
          lastAccessedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          status: 'Not Started',
          timeSpent: 0
        };
      }

      // Update lesson progress
      const lessonIndex = lessonProgressList.findIndex(lp => lp.lessonId === lessonId);
      if (lessonIndex >= 0) {
        // Update existing lesson progress
        lessonProgressList[lessonIndex] = {
          ...lessonProgressList[lessonIndex],
          completed: true,
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          timeSpent: timeSpent,
          currentPosition: lessonProgressList[lessonIndex].currentPosition || 0,
          score: score || lessonProgressList[lessonIndex].score,
          attempts: (lessonProgressList[lessonIndex].attempts || 0) + 1
        };
      } else {
        // Create new lesson progress entry if it doesn't exist
        lessonProgressList.push({
          lessonId: lessonId || '',
          courseId: courseId || '',
          studentId: studentId || '',
          completed: true,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          timeSpent: timeSpent || 0,
          currentPosition: 0,
          score: score || undefined,
          attempts: 1
        });
      }

      // Auto-complete Lesson 1 if it's not completed and we're completing other lessons in Unit 1
      if (lessonId.startsWith('lesson-1-') && lessonId !== 'lesson-1-1') {
        const lesson1Index = lessonProgressList.findIndex(lp => lp.lessonId === 'lesson-1-1');
        if (lesson1Index >= 0) {
          // Update existing Lesson 1 progress
          if (!lessonProgressList[lesson1Index].completed) {
            lessonProgressList[lesson1Index] = {
              ...lessonProgressList[lesson1Index],
              completed: true,
              completedAt: new Date().toISOString(),
              lastAccessedAt: new Date().toISOString(),
              timeSpent: lessonProgressList[lesson1Index].timeSpent || 0,
              currentPosition: lessonProgressList[lesson1Index].currentPosition || 0,
              score: lessonProgressList[lesson1Index].score,
              attempts: (lessonProgressList[lesson1Index].attempts || 0) + 1
            };
            console.log('🎯 Auto-completing Lesson 1 as prerequisite for completing other Unit 1 lessons');
          }
        } else {
          // Create new Lesson 1 progress entry
          lessonProgressList.push({
            lessonId: 'lesson-1-1',
            courseId: courseId || '',
            studentId: studentId || '',
            completed: true,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            timeSpent: 0,
            currentPosition: 0,
            score: undefined,
            attempts: 1
          });
          console.log('🎯 Auto-creating and completing Lesson 1 as prerequisite for completing other Unit 1 lessons');
        }
        
        // Force update the completed lessons count to include Lesson 1
        const completedLessons = lessonProgressList.filter(lp => lp.completed).length;
        courseProgress.completedLessons = completedLessons;
        console.log('🎯 Updated completed lessons count to include Lesson 1:', completedLessons);
      }

      // Update course progress
      const completedLessons = lessonProgressList.filter(lp => lp.completed).length;
      courseProgress.completedLessons = completedLessons;
      
      // Calculate unit progress and update
      const unitProgress = await this.calculateUnitProgress(courseId, lessonProgressList);
      courseProgress.completedUnits = unitProgress.completedUnits;
      courseProgress.totalUnits = unitProgress.totalUnits;
      courseProgress.currentUnitIndex = unitProgress.currentUnitIndex;
      
      // Calculate progress percentage based on lessons (more accurate for partial progress)
      // Get course data to determine actual total lessons
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      let actualTotalLessons = courseProgress.totalLessons;
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        actualTotalLessons = courseData.units?.reduce((total: number, unit: any) => 
          total + (unit.lessons?.length || 0), 0) || courseProgress.totalLessons;
      }
      
      // Get all completed lesson IDs from progress data
      const completedLessonIds = lessonProgressList.filter(lp => lp.completed).map(lp => lp.lessonId);
      
      // Count unique completed lessons by matching against course lesson IDs
      let uniqueCompletedLessons = 0;
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        const allLessons = courseData.units?.flatMap((unit: any) => unit.lessons || []) || [];
        uniqueCompletedLessons = allLessons.filter((lesson: any) => completedLessonIds.includes(lesson.id)).length;
      } else {
        // Fallback to simple count if course data not available
        uniqueCompletedLessons = completedLessons;
      }
      
      let progressPercentage = actualTotalLessons > 0
        ? Math.round((uniqueCompletedLessons / actualTotalLessons) * 100)
        : 0;

      // All lessons complete = 99% until final exam is passed; then 100%
      const allLessonsDone = actualTotalLessons > 0 && uniqueCompletedLessons >= actualTotalLessons;
      const progressData = progressDoc.exists() ? progressDoc.data() : {};
      const examPassed = hasPassedFinalExam(progressData);
      if (allLessonsDone && !examPassed) {
        progressPercentage = 99;
      } else if (allLessonsDone && examPassed) {
        progressPercentage = 100;
      }

      console.log('💾 Auto-saving progress after lesson completion:', {
        completedLessons: courseProgress.completedLessons,
        totalLessons: courseProgress.totalLessons,
        actualTotalLessons,
        uniqueCompletedLessons,
        completedUnits: unitProgress.completedUnits,
        totalUnits: unitProgress.totalUnits,
        currentUnit: courseProgress.currentUnitIndex + 1,
        progressPercentage,
        allLessonsDone,
        examPassed,
        calculation: allLessonsDone ? (examPassed ? '100% (exam passed)' : '99% (exam pending)') : `(${uniqueCompletedLessons} / ${actualTotalLessons}) * 100 = ${progressPercentage}%`,
        completedLessonIds,
        courseLessonIds: courseDoc.exists() ? courseDoc.data().units?.flatMap((unit: any) => unit.lessons || []).map((lesson: any) => lesson.id) : []
      });

      courseProgress.progressPercentage = progressPercentage;
      courseProgress.totalLessons = actualTotalLessons;
      courseProgress.lastAccessedAt = new Date().toISOString();
      courseProgress.timeSpent = lessonProgressList.reduce((total, lp) => total + (lp.timeSpent || 0), 0);

      // Calculate average score
      const completedWithScores = lessonProgressList.filter(lp => lp.completed && lp.score !== undefined);
      if (completedWithScores.length > 0) {
        courseProgress.averageScore = Math.round(
          completedWithScores.reduce((sum, lp) => sum + (lp.score || 0), 0) / completedWithScores.length
        );
      }

      // Update status: 100% only when exam passed; 99% = In Progress (exam pending)
      if (progressPercentage >= 100) {
        courseProgress.status = 'Completed';
        courseProgress.completedAt = new Date().toISOString();
      } else if (progressPercentage > 0) {
        courseProgress.status = 'In Progress';
      }

      // Clean and save to Firestore
      try {
        const cleanedLessonProgress = lessonProgressList.map(lp => this.cleanLessonProgressData(lp));
        
        console.log('📊 Saving progress to Firestore:', {
          courseId,
          studentId,
          completedLessons,
          totalLessons: courseProgress.totalLessons,
          progressPercentage,
          lessonCount: cleanedLessonProgress.length
        });
        
        const completePayload = this.stripUndefined({
          courseProgress,
          lessonProgress: cleanedLessonProgress,
          updatedAt: Timestamp.now()
        });
        await setDoc(progressRef, completePayload, { merge: true });

        console.log('📊 Lesson completed successfully:', { 
          progressPercentage, 
          status: courseProgress.status,
          completedLessons,
          totalLessons: courseProgress.totalLessons
        });

        // Verify the save was successful by reading it back
        const verifyDoc = await getDoc(progressRef);
        if (verifyDoc.exists()) {
          const verifyData = verifyDoc.data();
          console.log('📊 Verification - saved progress:', verifyData.courseProgress);
        } else {
          console.error('📊 Verification failed - document not found after save');
        }

        return {
          success: true,
          message: 'Lesson completed successfully',
          updatedProgress: courseProgress
        };
      } catch (saveError) {
        console.error('📊 Error saving progress to Firestore:', saveError);
        return {
          success: false,
          message: 'Failed to save progress to database',
          updatedProgress: courseProgress
        };
      }

    } catch (error) {
      console.error('Error completing lesson:', error);
      return {
        success: false,
        message: 'Failed to complete lesson'
      };
    }
  }

  /**
   * Record a quiz attempt (pass or fail). Saves score and attempts so the AI tutor can discuss quiz results with the learner.
   */
  async recordQuizAttempt(
    studentId: string,
    courseId: string,
    lessonId: string,
    score: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      let courseProgress: CourseProgress;
      let lessonProgressList: LessonProgress[] = [];

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        courseProgress = data.courseProgress;
        lessonProgressList = data.lessonProgress || [];
        lessonProgressList = this.deduplicateLessonProgress(lessonProgressList);
      } else {
        const unitProgress = await this.calculateUnitProgress(courseId, []);
        courseProgress = {
          courseId,
          studentId,
          totalLessons: 0,
          completedLessons: 0,
          totalUnits: unitProgress.totalUnits,
          completedUnits: 0,
          currentUnitIndex: 0,
          progressPercentage: 0,
          lastAccessedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          status: 'Not Started',
          timeSpent: 0
        };
      }

      const lessonIndex = lessonProgressList.findIndex(lp => lp.lessonId === lessonId);
      const now = new Date().toISOString();
      if (lessonIndex >= 0) {
        lessonProgressList[lessonIndex] = {
          ...lessonProgressList[lessonIndex],
          score,
          attempts: (lessonProgressList[lessonIndex].attempts || 0) + 1,
          lastAccessedAt: now
        };
      } else {
        lessonProgressList.push({
          lessonId,
          courseId,
          studentId,
          completed: false,
          startedAt: now,
          lastAccessedAt: now,
          timeSpent: 0,
          score,
          attempts: 1
        });
      }

      courseProgress.lastAccessedAt = now;
      const cleanedLessonProgress = lessonProgressList.map(lp => this.cleanLessonProgressData(lp));
      const payload = this.stripUndefined({
        courseProgress,
        lessonProgress: cleanedLessonProgress,
        updatedAt: Timestamp.now()
      });
      await setDoc(progressRef, payload, { merge: true });
      return { success: true, message: 'Quiz attempt recorded' };
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
      return { success: false, message: 'Failed to record quiz attempt' };
    }
  }

  /**
   * Record final exam attempt: save score, submitted-at time, and increment attempt count.
   * When the learner passes (score >= 80%), sets course progress to 100% and status Completed.
   * Passing scores are kept if a later attempt fails.
   */
  async recordFinalExamAttempt(
    studentId: string,
    courseId: string,
    score: number,
    review?: {
      failedQuestions: Array<{
        questionId: string;
        question: string;
        selectedAnswer: string;
        correctAnswer: string;
        sourceTag?: string;
        explanation?: string;
      }>;
      allQuestions?: Array<{
        questionId: string;
        question: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        sourceTag?: string;
        explanation?: string;
      }>;
      suggestedReviewTopics: string[];
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      const data = progressDoc.exists() ? progressDoc.data() : null;
      const previousAttempts = typeof data?.finalExamAttempts === 'number' ? data.finalExamAttempts : 0;
      const finalExamAttempts = previousAttempts + 1;
      const now = new Date().toISOString();
      const passed = score >= FINAL_EXAM_PASS_PERCENT;
      const alreadyPassed = hasPassedFinalExam(data ?? undefined);
      const prevPassedScore =
        typeof data?.finalExamPassedScore === 'number'
          ? data.finalExamPassedScore
          : alreadyPassed && typeof data?.finalExamScore === 'number' && data.finalExamScore >= FINAL_EXAM_PASS_PERCENT
            ? data.finalExamScore
            : undefined;

      const finalExamReview = review
        ? {
            attemptedAt: now,
            score,
            failedQuestions: review.failedQuestions || [],
            allQuestions: review.allQuestions || [],
            suggestedReviewTopics: review.suggestedReviewTopics || []
          }
        : undefined;

      const buildExamFields = (): Record<string, unknown> => {
        const fields: Record<string, unknown> = {
          finalExamLatestScore: score,
          finalExamSubmittedAt: now,
          finalExamAttempts,
          ...(finalExamReview ? { finalExamReview } : {}),
        };
        if (passed) {
          const passedScore =
            typeof prevPassedScore === 'number' ? Math.max(prevPassedScore, score) : score;
          fields.finalExamPassed = true;
          fields.finalExamPassedScore = passedScore;
          fields.finalExamScore = passedScore;
          if (!data?.finalExamPassedAt) fields.finalExamPassedAt = now;
        } else if (alreadyPassed) {
          fields.finalExamPassed = true;
          const keepScore = prevPassedScore ?? data?.finalExamScore;
          if (typeof keepScore === 'number') {
            fields.finalExamPassedScore = keepScore;
            fields.finalExamScore = keepScore;
          }
        } else {
          fields.finalExamScore = score;
        }
        return fields;
      };

      if (progressDoc.exists()) {
        const updates: Record<string, unknown> = {
          ...buildExamFields(),
          updatedAt: Timestamp.now(),
        };
        if (passed || alreadyPassed) {
          const existingCourseProgress = data?.courseProgress || {
            courseId,
            studentId,
            totalLessons: 0,
            completedLessons: 0,
            totalUnits: 0,
            completedUnits: 0,
            currentUnitIndex: 0,
            progressPercentage: 0,
            lastAccessedAt: now,
            startedAt: now,
            status: 'In Progress',
            timeSpent: 0,
          };
          updates.courseProgress = {
            ...existingCourseProgress,
            progressPercentage: 100,
            status: 'Completed',
            completedAt: existingCourseProgress.completedAt || now,
            lastAccessedAt: now,
          };
        }
        await updateDoc(progressRef, updates as any);
      } else {
        const courseProgress = {
          courseId,
          studentId,
          totalLessons: 0,
          completedLessons: 0,
          totalUnits: 0,
          completedUnits: 0,
          currentUnitIndex: 0,
          progressPercentage: passed ? 100 : 0,
          lastAccessedAt: now,
          startedAt: now,
          status: passed ? 'Completed' : 'In Progress',
          timeSpent: 0,
          ...(passed ? { completedAt: now } : {}),
        };
        await setDoc(progressRef, {
          courseProgress,
          lessonProgress: [],
          ...buildExamFields(),
          updatedAt: Timestamp.now(),
        });
      }
      return { success: true, message: 'Final exam submitted' };
    } catch (error) {
      console.error('Error recording final exam attempt:', error);
      return { success: false, message: 'Failed to record final exam' };
    }
  }

  /**
   * Record that a certificate was issued (when learner passes final exam).
   * Saves certificateIssuedAt on student progress and a document in the certificates collection.
   * Uses one document per student per course (id: studentId_courseId) so re-issuing overwrites.
   */
  async recordCertificateIssued(
    studentId: string,
    courseId: string,
    courseTitle: string,
    learnerName: string,
    score: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const now = new Date().toISOString();
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        const certUpdates: Record<string, unknown> = {
          certificateIssuedAt: now,
          updatedAt: Timestamp.now(),
          finalExamPassed: true,
        };
        if (score >= FINAL_EXAM_PASS_PERCENT) {
          const prev =
            typeof data?.finalExamPassedScore === 'number' ? data.finalExamPassedScore : undefined;
          const passedScore = typeof prev === 'number' ? Math.max(prev, score) : score;
          certUpdates.finalExamPassedScore = passedScore;
          certUpdates.finalExamScore = passedScore;
          if (!data?.finalExamPassedAt) certUpdates.finalExamPassedAt = now;
        }
        await updateDoc(progressRef, certUpdates as any);
      }
      const certId = `${studentId}_${courseId}`;
      await setDoc(doc(db, 'certificates', certId), {
        studentId,
        courseId,
        courseTitle,
        learnerName,
        score,
        issuedAt: now,
        updatedAt: Timestamp.now()
      }, { merge: true });
      return { success: true, message: 'Certificate recorded' };
    } catch (error) {
      console.error('Error recording certificate:', error);
      return { success: false, message: 'Failed to record certificate' };
    }
  }

  /** Certificate score when progress was overwritten by a later failed attempt. */
  private async getCertificateScore(studentId: string, courseId: string): Promise<number | null> {
    try {
      const certDoc = await getDoc(doc(db, 'certificates', `${studentId}_${courseId}`));
      if (!certDoc.exists()) return null;
      const score = certDoc.data()?.score;
      return typeof score === 'number' ? score : null;
    } catch {
      return null;
    }
  }

  private async repairFinalExamPassFields(
    studentId: string,
    courseId: string,
    passedScore: number
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      if (!progressDoc.exists()) return;
      const data = progressDoc.data();
      const needsRepair =
        data.finalExamPassed !== true ||
        typeof data.finalExamPassedScore !== 'number' ||
        data.finalExamPassedScore < FINAL_EXAM_PASS_PERCENT ||
        (typeof data.finalExamScore === 'number' && data.finalExamScore < FINAL_EXAM_PASS_PERCENT);
      if (!needsRepair) return;
      await updateDoc(progressRef, {
        finalExamPassed: true,
        finalExamPassedScore: passedScore,
        finalExamScore: passedScore,
        ...(data.finalExamPassedAt ? {} : { finalExamPassedAt: data.certificateIssuedAt || new Date().toISOString() }),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.warn('Could not repair final exam pass fields:', error);
    }
  }

  // Get student's progress for a course
  async getStudentProgress(
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
      const progress: StudentProgressData = {
        studentId,
        courseId,
        courseProgress: data.courseProgress,
        lessonProgress: data.lessonProgress || [],
        finalExamScore: data.finalExamScore,
        finalExamLatestScore: data.finalExamLatestScore,
        finalExamPassedScore: data.finalExamPassedScore,
        finalExamPassed: data.finalExamPassed,
        finalExamPassedAt: data.finalExamPassedAt,
        finalExamSubmittedAt: data.finalExamSubmittedAt,
        finalExamAttempts: data.finalExamAttempts,
        certificateIssuedAt: data.certificateIssuedAt,
        finalExamReview: data.finalExamReview,
      };

      const displayScore = getFinalExamDisplayScore(progress);
      if (
        (progress.certificateIssuedAt || hasPassedFinalExam(progress)) &&
        (displayScore == null || displayScore < FINAL_EXAM_PASS_PERCENT)
      ) {
        const certScore = await this.getCertificateScore(studentId, courseId);
        if (certScore != null && certScore >= FINAL_EXAM_PASS_PERCENT) {
          progress.finalExamPassed = true;
          progress.finalExamPassedScore = certScore;
          progress.finalExamScore = certScore;
          void this.repairFinalExamPassFields(studentId, courseId, certScore);
        }
      }

      return progress;
    } catch (error) {
      console.error('Error getting student progress:', error);
      return null;
    }
  }

  // Get student's last position in a course
  async getLastPosition(
    studentId: string,
    courseId: string
  ): Promise<{ unitId: string; lessonId: string; lessonIndex: number } | null> {
    try {
      const progress = await this.getStudentProgress(studentId, courseId);
      return progress?.courseProgress.lastPosition || null;
    } catch (error) {
      console.error('Error getting last position:', error);
      return null;
    }
  }

  // Get all students' progress for a course (for instructors)
  async getCourseStudentsProgress(courseId: string): Promise<StudentProgressData[]> {
    try {
      const progressCollection = collection(db, 'studentProgress');
      const q = query(progressCollection, where('courseProgress.courseId', '==', courseId));
      const querySnapshot = await getDocs(q);

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
      console.error('Error getting course students progress:', error);
      return [];
    }
  }

  // Get course progress statistics
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
      const completedStudents = studentsProgress.filter(sp => sp.courseProgress.status === 'Completed').length;
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
      console.error('Error getting course progress stats:', error);
      return {
        totalStudents: 0,
        completedStudents: 0,
        averageProgress: 0,
        averageTimeSpent: 0,
        completionRate: 0
      };
    }
  }

  // Auto-save progress every 10 seconds with enhanced retry logic
  startAutoSave(
    studentId: string,
    courseId: string,
    lessonId: string,
    getTimeSpent: () => number,
    getCurrentPosition: () => number,
    getStudentNotes: () => string,
    getBookmarks: () => string[]
  ): NodeJS.Timeout {
    let retryCount = 0;
    const maxRetries = 3;
    
    const interval = setInterval(async () => {
      try {
        console.log('💾 Starting auto-save...', { studentId, courseId, lessonId });
        
        const result = await this.updateLessonProgress(
          studentId,
          courseId,
          lessonId,
          getTimeSpent(),
          getCurrentPosition(),
          getStudentNotes(),
          getBookmarks()
        );
        
        if (result.success) {
          console.log('💾 Auto-save successful');
          retryCount = 0; // Reset retry count on success
        } else {
          console.warn('💾 Auto-save failed:', result.message);
          retryCount++;
          
          if (retryCount <= maxRetries) {
            console.log(`💾 Retrying auto-save (${retryCount}/${maxRetries})...`);
            setTimeout(async () => {
              try {
                const retryResult = await this.updateLessonProgress(
                  studentId,
                  courseId,
                  lessonId,
                  getTimeSpent(),
                  getCurrentPosition(),
                  getStudentNotes(),
                  getBookmarks()
                );
                
                if (retryResult.success) {
                  console.log('💾 Auto-save retry successful');
                  retryCount = 0;
                } else {
                  console.error('💾 Auto-save retry failed:', retryResult.message);
                }
              } catch (retryError) {
                console.error('💾 Auto-save retry error:', retryError);
              }
            }, 2000 * retryCount); // Exponential backoff
          } else {
            console.error('💾 Auto-save failed after maximum retries');
            retryCount = 0; // Reset for next cycle
          }
        }
      } catch (error) {
        console.error('💾 Auto-save error:', error);
        retryCount++;
      }
    }, 10000); // Save every 10 seconds for more frequent saves

    return interval;
  }

  // Force save progress immediately (for critical moments)
  async forceSaveProgress(
    studentId: string,
    courseId: string,
    lessonId: string,
    timeSpent: number,
    currentPosition?: number,
    notes?: string,
    bookmarks?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🚀 Force saving progress...', { studentId, courseId, lessonId, timeSpent });
      
      const result = await this.updateLessonProgress(
        studentId,
        courseId,
        lessonId,
        timeSpent,
        currentPosition,
        notes,
        bookmarks
      );
      
      if (result.success) {
        console.log('🚀 Force save successful');
      } else {
        console.error('🚀 Force save failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('🚀 Force save error:', error);
      return {
        success: false,
        message: 'Failed to force save progress'
      };
    }
  }

  // Get all progress for a student across all courses
  async getAllStudentProgress(studentId: string): Promise<{ [courseId: string]: CourseProgress }> {
    try {
      console.log('📊 Getting all progress for student:', studentId);
      
      const progressCollection = collection(db, 'studentProgress');
      const q = query(progressCollection, where('__name__', '>=', `${studentId}_`), where('__name__', '<=', `${studentId}_\uf8ff`));
      const querySnapshot = await getDocs(q);

      console.log('📊 Query snapshot size:', querySnapshot.size);
      
      const allProgress: { [courseId: string]: CourseProgress } = {};
      const progressByCourse: { [courseId: string]: CourseProgress[] } = {};
      
      // Group progress by course ID
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📊 Document data:', doc.id, data);
        if (data.courseProgress) {
          const courseId = data.courseProgress.courseId;
          if (!progressByCourse[courseId]) {
            progressByCourse[courseId] = [];
          }
          progressByCourse[courseId].push(data.courseProgress);
        }
      });

      // For each course, keep only the best progress (highest percentage, most recent)
      for (const [courseId, progressList] of Object.entries(progressByCourse)) {
        if (progressList.length > 1) {
          console.log(`🔄 Found ${progressList.length} progress documents for course ${courseId}, keeping the best one`);
          
          // Sort by progress percentage (highest first), then by lastAccessedAt (most recent first)
          progressList.sort((a, b) => {
            if (b.progressPercentage !== a.progressPercentage) {
              return b.progressPercentage - a.progressPercentage;
            }
            return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
          });
          
          // Keep the best progress
          allProgress[courseId] = progressList[0];
          console.log(`✅ Kept progress for course ${courseId}: ${progressList[0].progressPercentage}% (${progressList[0].completedLessons} lessons)`);
        } else {
          allProgress[courseId] = progressList[0];
          console.log(`✅ Single progress for course ${courseId}: ${progressList[0].progressPercentage}% (${progressList[0].completedLessons} lessons)`);
        }
      }

      console.log('📊 Loaded progress for courses:', Object.keys(allProgress));
      console.log('📊 Final progress data:', allProgress);
      return allProgress;
    } catch (error) {
      console.error('Error getting all student progress:', error);
      return {};
    }
  }

  // DEBUG: Reset all progress for a student
  async resetStudentProgress(studentId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ DEBUG: Resetting all progress for student:', studentId);
      
      let deletedCount = 0;
      const deletedTypes: string[] = [];
      
      // 1. Reset student progress documents
      const progressQuery = query(
        collection(db, 'studentProgress'),
        where('studentId', '==', studentId)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      
      if (!progressSnapshot.empty) {
        const deletePromises = progressSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        deletedCount += progressSnapshot.docs.length;
        deletedTypes.push(`${progressSnapshot.docs.length} progress documents`);
        console.log('🗑️ Deleted progress documents:', progressSnapshot.docs.length);
      }
      
      // 2. Reset course structure completion status
      const courseStructureQuery = query(
        collection(db, 'courseStructures'),
        where('studentId', '==', studentId)
      );
      
      const courseStructureSnapshot = await getDocs(courseStructureQuery);
      
      if (!courseStructureSnapshot.empty) {
        const deletePromises = courseStructureSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        deletedCount += courseStructureSnapshot.docs.length;
        deletedTypes.push(`${courseStructureSnapshot.docs.length} course structure documents`);
        console.log('🗑️ Deleted course structure documents:', courseStructureSnapshot.docs.length);
      }
      
      // 3. Reset any other student-specific data
      const studentDataQuery = query(
        collection(db, 'studentData'),
        where('studentId', '==', studentId)
      );
      
      const studentDataSnapshot = await getDocs(studentDataQuery);
      
      if (!studentDataSnapshot.empty) {
        const deletePromises = studentDataSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        deletedCount += studentDataSnapshot.docs.length;
        deletedTypes.push(`${studentDataSnapshot.docs.length} student data documents`);
        console.log('🗑️ Deleted student data documents:', studentDataSnapshot.docs.length);
      }
      
      if (deletedCount === 0) {
        console.log('ℹ️ No progress data found for student:', studentId);
        return { success: true, message: 'No progress data found to reset' };
      }
      
      console.log('✅ DEBUG: Successfully reset all progress for student:', studentId);
      console.log('🗑️ Total deleted documents:', deletedCount);
      console.log('🗑️ Deleted types:', deletedTypes);
      
      return { 
        success: true, 
        message: `Successfully reset all progress data. Deleted ${deletedCount} documents: ${deletedTypes.join(', ')}.` 
      };
    } catch (error) {
      console.error('❌ DEBUG: Error resetting student progress:', error);
      return { 
        success: false, 
        message: `Failed to reset progress: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // DEBUG: Reset progress for a specific course
  async resetCourseProgress(studentId: string, courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ DEBUG: Resetting progress for student:', studentId, 'course:', courseId);
      
      // Get progress document for this student and course
      const progressDoc = doc(db, 'studentProgress', `${studentId}_${courseId}`);
      const progressSnapshot = await getDoc(progressDoc);
      
      if (!progressSnapshot.exists()) {
        console.log('ℹ️ No progress found for student:', studentId, 'course:', courseId);
        return { success: true, message: 'No progress found to reset' };
      }
      
      // Delete the progress document
      await deleteDoc(progressDoc);
      
      console.log('✅ DEBUG: Successfully reset course progress for student:', studentId, 'course:', courseId);
      
      return { 
        success: true, 
        message: `Successfully reset progress for course ${courseId}.` 
      };
    } catch (error) {
      console.error('❌ DEBUG: Error resetting course progress:', error);
      return { 
        success: false, 
        message: `Failed to reset course progress: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const persistentProgressService = new PersistentProgressService();
