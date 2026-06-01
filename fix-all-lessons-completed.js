import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseConfig } from './scripts/firebase-config.mjs';

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAllLessonsCompleted() {
  try {
    console.log('🔧 Starting to fix all lessons as completed...');
    
    const studentId = 'dIwgPLyDkWfjZKnChLcP6qWuT9B2';
    const courseId = 'xmsp3X8Gu6zpWN9JyGLm';
    
    // Get the current progress document
    const progressRef = doc(db, 'studentProgress', `${studentId}_${courseId}`);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      console.log('❌ Progress document not found');
      return;
    }
    
    const currentData = progressDoc.data();
    console.log('📊 Current progress data:', {
      completedLessons: currentData.courseProgress?.completedLessons,
      totalLessons: currentData.courseProgress?.totalLessons,
      progressPercentage: currentData.courseProgress?.progressPercentage,
      lessonProgressCount: currentData.lessonProgress?.length
    });
    
    // Get the course data to get all lesson IDs
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    
    if (!courseDoc.exists()) {
      console.log('❌ Course document not found');
      return;
    }
    
    const courseData = courseDoc.data();
    const allLessons = courseData.units?.flatMap(unit => unit.lessons || []) || [];
    
    console.log('📚 Course lessons:', allLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title
    })));
    
    // Create lesson progress entries for all lessons
    const allLessonProgress = allLessons.map(lesson => ({
      lessonId: lesson.id,
      courseId: courseId,
      studentId: studentId,
      completed: true,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      timeSpent: 30, // 30 minutes per lesson
      attempts: 1,
      score: 100
    }));
    
    // Update course progress
    const updatedCourseProgress = {
      ...currentData.courseProgress,
      completedLessons: allLessons.length,
      totalLessons: allLessons.length,
      progressPercentage: 100,
      completedUnits: courseData.units?.length || 0,
      totalUnits: courseData.units?.length || 0,
      status: 'Completed',
      lastAccessedAt: new Date().toISOString()
    };
    
    // Save the updated progress
    await setDoc(progressRef, {
      courseProgress: updatedCourseProgress,
      lessonProgress: allLessonProgress,
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log('✅ Successfully updated all lessons as completed!');
    console.log('📊 Updated progress:', {
      completedLessons: updatedCourseProgress.completedLessons,
      totalLessons: updatedCourseProgress.totalLessons,
      progressPercentage: updatedCourseProgress.progressPercentage,
      completedUnits: updatedCourseProgress.completedUnits,
      totalUnits: updatedCourseProgress.totalUnits,
      status: updatedCourseProgress.status
    });
    
  } catch (error) {
    console.error('❌ Error fixing lesson progress:', error);
  }
}

// Run the fix
fixAllLessonsCompleted();
