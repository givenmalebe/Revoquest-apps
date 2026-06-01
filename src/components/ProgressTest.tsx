import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { persistentProgressService } from '../services/persistentProgressService';

const ProgressTest: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load course data
        const courseId = 'xmsp3X8Gu6zpWN9JyGLm';
        const progress = await persistentProgressService.getStudentProgress(user.id, courseId);
        
        if (progress) {
          setProgressData(progress);
          
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/firebase/config');

          const courseRef = doc(db, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            setCourseData(courseDoc.data());
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user]);

  if (!progressData || !courseData) {
    return <div>Loading...</div>;
  }

  // Calculate progress using the new logic
  const allLessons = courseData.units?.flatMap((unit: any) => unit.lessons || []) || [];
  const completedLessonIds = progressData.lessonProgress?.filter((lp: any) => lp.completed).map((lp: any) => lp.lessonId) || [];
  const completedLessons = allLessons.filter((lesson: any) => completedLessonIds.includes(lesson.id)).length;
  const totalLessons = allLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Progress Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Course Data:</h3>
        <p>Total Lessons: {totalLessons}</p>
        <p>Course Lesson IDs: {allLessons.map((l: any) => l.id).join(', ')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Progress Data:</h3>
        <p>Completed Lesson IDs: {completedLessonIds.join(', ')}</p>
        <p>Completed Lessons Count: {completedLessons}</p>
        <p>Progress Percentage: {progressPercentage}%</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Matching Analysis:</h3>
        <p>Matching Completed: {allLessons.filter((lesson: any) => completedLessonIds.includes(lesson.id)).map((l: any) => l.id).join(', ')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Raw Progress Data:</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(progressData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ProgressTest;
