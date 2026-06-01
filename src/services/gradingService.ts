import { db } from '../firebase/config';
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Knowledge Module Grade Interface (DEPRECATED - use CourseAssessmentGrade instead)
export interface KnowledgeModuleGrade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  moduleNumber: number;
  
  // Assessment Type
  assessmentType: 'formative' | 'summative';
  
  // Grading Information
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string; // A+, A, B+, B, C+, C, D, F
  
  // Instructor Feedback
  instructorId: string;
  instructorName: string;
  comments: string;
  feedback: string;
  
  // Status
  status: 'pending' | 'graded' | 'redo_required' | 'resubmitted' | 'final';
  requiresRedo: boolean;
  redoReason?: string;
  redoDeadline?: string;
  
  // Submission Info
  submissionId?: string;
  submittedAt: string;
  gradedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Course Assessment Grade Interface (NEW - for course-based grading)
export interface CourseAssessmentGrade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: 'formative' | 'summative';
  
  // Grading Information
  marks: number;
  maxMarks: number;
  percentage: number;
  letterGrade: string; // A+, A, B+, B, C+, C, D, F
  
  // Instructor Feedback
  instructorId: string;
  instructorName: string;
  feedback: string;
  detailedFeedback?: string;
  
  // Status
  status: 'submitted' | 'graded' | 'returned';
  
  // Submission Info
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export class GradingService {
  /**
   * Create or update a grade for a knowledge module
   */
  static async gradeKnowledgeModule(gradeData: Omit<KnowledgeModuleGrade, 'id' | 'createdAt' | 'updatedAt' | 'percentage' | 'grade'>): Promise<KnowledgeModuleGrade> {
    try {
      // Calculate percentage
      const percentage = (gradeData.marks / gradeData.maxMarks) * 100;
      
      // Determine letter grade
      const grade = this.calculateLetterGrade(percentage);
      
      const fullGradeData = {
        ...gradeData,
        percentage,
        grade,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        gradedAt: new Date().toISOString()
      };
      
      // Check if grade already exists
      const existingGradeQuery = query(
        collection(db, 'knowledgeModuleGrades'),
        where('studentId', '==', gradeData.studentId),
        where('moduleId', '==', gradeData.moduleId),
        where('courseId', '==', gradeData.courseId)
      );
      
      const existingGrades = await getDocs(existingGradeQuery);
      
      if (!existingGrades.empty) {
        // Update existing grade
        const existingGradeDoc = existingGrades.docs[0];
        await updateDoc(doc(db, 'knowledgeModuleGrades', existingGradeDoc.id), {
          ...fullGradeData,
          updatedAt: new Date().toISOString()
        });
        
        return {
          id: existingGradeDoc.id,
          ...fullGradeData
        };
      } else {
        // Create new grade
        const docRef = await addDoc(collection(db, 'knowledgeModuleGrades'), fullGradeData);
        
        return {
          id: docRef.id,
          ...fullGradeData
        };
      }
    } catch (error) {
      console.error('Error grading knowledge module:', error);
      throw error;
    }
  }

  /**
   * Calculate letter grade from percentage
   */
  static calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  /**
   * Get grades for a specific student
   */
  static async getStudentGrades(studentId: string, courseId?: string): Promise<KnowledgeModuleGrade[]> {
    try {
      let q = query(
        collection(db, 'knowledgeModuleGrades'),
        where('studentId', '==', studentId),
        orderBy('moduleNumber', 'asc')
      );
      
      if (courseId) {
        q = query(
          collection(db, 'knowledgeModuleGrades'),
          where('studentId', '==', studentId),
          where('courseId', '==', courseId),
          orderBy('moduleNumber', 'asc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeModuleGrade));
    } catch (error) {
      console.error('Error getting student grades:', error);
      return [];
    }
  }

  /**
   * Get all grades for a course (instructor view)
   */
  static async getCourseGrades(courseId: string): Promise<KnowledgeModuleGrade[]> {
    try {
      const q = query(
        collection(db, 'knowledgeModuleGrades'),
        where('courseId', '==', courseId),
        orderBy('moduleNumber', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeModuleGrade));
    } catch (error) {
      console.error('Error getting course grades:', error);
      return [];
    }
  }

  /**
   * Get grades by instructor
   */
  static async getInstructorGrades(instructorId: string): Promise<KnowledgeModuleGrade[]> {
    try {
      const q = query(
        collection(db, 'knowledgeModuleGrades'),
        where('instructorId', '==', instructorId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeModuleGrade));
    } catch (error) {
      console.error('Error getting instructor grades:', error);
      return [];
    }
  }

  /**
   * Mark a module as requiring redo
   */
  static async markForRedo(
    gradeId: string, 
    redoReason: string, 
    redoDeadline?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'knowledgeModuleGrades', gradeId), {
        requiresRedo: true,
        redoReason,
        redoDeadline,
        status: 'redo_required',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking for redo:', error);
      throw error;
    }
  }

  /**
   * Update grade status
   */
  static async updateGradeStatus(
    gradeId: string, 
    status: KnowledgeModuleGrade['status']
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'knowledgeModuleGrades', gradeId), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating grade status:', error);
      throw error;
    }
  }

  /**
   * Delete a grade
   */
  static async deleteGrade(gradeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'knowledgeModuleGrades', gradeId));
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  }

  /**
   * Get grade statistics for a student
   */
  static async getStudentStatistics(studentId: string, courseId?: string): Promise<{
    totalModules: number;
    gradedModules: number;
    averagePercentage: number;
    averageGrade: string;
    modulesPending: number;
    modulesRequiringRedo: number;
    formativeCount: number;
    summativeCount: number;
    formativeAverage: number;
    summativeAverage: number;
  }> {
    try {
      const grades = await this.getStudentGrades(studentId, courseId);
      
      const gradedModules = grades.filter(g => g.status === 'graded' || g.status === 'final');
      const averagePercentage = gradedModules.length > 0 
        ? gradedModules.reduce((sum, g) => sum + g.percentage, 0) / gradedModules.length 
        : 0;
      
      const formativeGrades = gradedModules.filter(g => g.assessmentType === 'formative');
      const summativeGrades = gradedModules.filter(g => g.assessmentType === 'summative');
      
      const formativeAverage = formativeGrades.length > 0
        ? formativeGrades.reduce((sum, g) => sum + g.percentage, 0) / formativeGrades.length
        : 0;
      
      const summativeAverage = summativeGrades.length > 0
        ? summativeGrades.reduce((sum, g) => sum + g.percentage, 0) / summativeGrades.length
        : 0;
      
      return {
        totalModules: grades.length,
        gradedModules: gradedModules.length,
        averagePercentage,
        averageGrade: this.calculateLetterGrade(averagePercentage),
        modulesPending: grades.filter(g => g.status === 'pending').length,
        modulesRequiringRedo: grades.filter(g => g.requiresRedo).length,
        formativeCount: formativeGrades.length,
        summativeCount: summativeGrades.length,
        formativeAverage,
        summativeAverage
      };
    } catch (error) {
      console.error('Error getting student statistics:', error);
      return {
        totalModules: 0,
        gradedModules: 0,
        averagePercentage: 0,
        averageGrade: 'N/A',
        modulesPending: 0,
        modulesRequiringRedo: 0,
        formativeCount: 0,
        summativeCount: 0,
        formativeAverage: 0,
        summativeAverage: 0
      };
    }
  }

  /**
   * Get course grading statistics (for instructors)
   */
  static async getCourseStatistics(courseId: string): Promise<{
    totalStudents: number;
    totalGrades: number;
    averagePercentage: number;
    pendingGrades: number;
    gradedCount: number;
  }> {
    try {
      const grades = await this.getCourseGrades(courseId);
      
      const uniqueStudents = new Set(grades.map(g => g.studentId));
      const gradedModules = grades.filter(g => g.status === 'graded' || g.status === 'final');
      const averagePercentage = gradedModules.length > 0
        ? gradedModules.reduce((sum, g) => sum + g.percentage, 0) / gradedModules.length
        : 0;
      
      return {
        totalStudents: uniqueStudents.size,
        totalGrades: grades.length,
        averagePercentage,
        pendingGrades: grades.filter(g => g.status === 'pending').length,
        gradedCount: gradedModules.length
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      return {
        totalStudents: 0,
        totalGrades: 0,
        averagePercentage: 0,
        pendingGrades: 0,
        gradedCount: 0
      };
    }
  }

  // ===== COURSE ASSESSMENT GRADING METHODS =====

  /**
   * Get course assessment grades for a student
   */
  static async getStudentCourseAssessmentGrades(studentId: string, courseId?: string): Promise<CourseAssessmentGrade[]> {
    try {
      // Get all assessments for the student's courses
      const assessmentsQuery = courseId 
        ? query(collection(db, 'assessments'), where('courseId', '==', courseId))
        : query(collection(db, 'assessments'));
      
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      const assessments = assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const grades: CourseAssessmentGrade[] = [];

      // Process each assessment to extract grades
      for (const assessment of assessments) {
        if (assessment.submissions && Array.isArray(assessment.submissions)) {
          for (const submission of assessment.submissions) {
            if (submission.learnerId === studentId && submission.status === 'graded') {
              const percentage = assessment.maxMarks > 0 ? (submission.grade / assessment.maxMarks) * 100 : 0;
              const letterGrade = this.calculateLetterGrade(percentage);

              grades.push({
                id: `${assessment.id}_${submission.id}`,
                studentId: submission.learnerId,
                studentName: submission.learnerName,
                courseId: assessment.courseId,
                courseName: assessment.courseName,
                assessmentId: assessment.id,
                assessmentTitle: assessment.title,
                assessmentType: assessment.type,
                marks: submission.grade || 0,
                maxMarks: assessment.maxMarks,
                percentage,
                letterGrade,
                instructorId: assessment.instructorId,
                instructorName: assessment.instructorName,
                feedback: submission.feedback || '',
                detailedFeedback: submission.detailedFeedback || '',
                status: submission.status,
                submittedAt: submission.submittedAt,
                gradedAt: submission.gradedAt,
                gradedBy: submission.gradedBy,
                createdAt: submission.submittedAt,
                updatedAt: submission.gradedAt || submission.submittedAt
              });
            }
          }
        }
      }

      return grades.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch (error) {
      console.error('Error getting student course assessment grades:', error);
      return [];
    }
  }

  /**
   * Get course assessment grade statistics for a student
   */
  static async getStudentCourseAssessmentStatistics(studentId: string, courseId?: string): Promise<{
    totalAssessments: number;
    gradedAssessments: number;
    averagePercentage: number;
    averageGrade: string;
    assessmentsPending: number;
    formativeCount: number;
    summativeCount: number;
    formativeAverage: number;
    summativeAverage: number;
  }> {
    try {
      const grades = await this.getStudentCourseAssessmentGrades(studentId, courseId);
      
      if (grades.length === 0) {
        return {
          totalAssessments: 0,
          gradedAssessments: 0,
          averagePercentage: 0,
          averageGrade: 'N/A',
          assessmentsPending: 0,
          formativeCount: 0,
          summativeCount: 0,
          formativeAverage: 0,
          summativeAverage: 0
        };
      }

      const gradedAssessments = grades.filter(g => g.status === 'graded');
      const formativeGrades = grades.filter(g => g.assessmentType === 'formative' && g.status === 'graded');
      const summativeGrades = grades.filter(g => g.assessmentType === 'summative' && g.status === 'graded');

      const averagePercentage = gradedAssessments.length > 0
        ? gradedAssessments.reduce((sum, g) => sum + g.percentage, 0) / gradedAssessments.length
        : 0;

      const formativeAverage = formativeGrades.length > 0
        ? formativeGrades.reduce((sum, g) => sum + g.percentage, 0) / formativeGrades.length
        : 0;

      const summativeAverage = summativeGrades.length > 0
        ? summativeGrades.reduce((sum, g) => sum + g.percentage, 0) / summativeGrades.length
        : 0;

      return {
        totalAssessments: grades.length,
        gradedAssessments: gradedAssessments.length,
        averagePercentage,
        averageGrade: this.calculateLetterGrade(averagePercentage),
        assessmentsPending: grades.filter(g => g.status === 'submitted').length,
        formativeCount: formativeGrades.length,
        summativeCount: summativeGrades.length,
        formativeAverage,
        summativeAverage
      };
    } catch (error) {
      console.error('Error getting student course assessment statistics:', error);
      return {
        totalAssessments: 0,
        gradedAssessments: 0,
        averagePercentage: 0,
        averageGrade: 'N/A',
        assessmentsPending: 0,
        formativeCount: 0,
        summativeCount: 0,
        formativeAverage: 0,
        summativeAverage: 0
      };
    }
  }
}

export default GradingService;

