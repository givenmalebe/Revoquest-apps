import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

// Simple test component to verify next button functionality
const NextButtonTest = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const lessons = [
    { id: 'lesson-1', title: 'Lesson 1' },
    { id: 'lesson-2', title: 'Lesson 2' },
    { id: 'lesson-3', title: 'Lesson 3' },
  ];
  
  const currentLesson = lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  
  const handleSmartNextLesson = async () => {
    console.log('🔄 Next lesson button clicked:', {
      isCompleted,
      isLastLesson,
      currentLessonId: currentLesson?.id,
      currentLessonTitle: currentLesson?.title
    });

    // If lesson is not completed, complete it first
    if (!isCompleted) {
      console.log('📚 Lesson not completed, completing it first...');
      setIsCompletingLesson(true);
      
      try {
        // Simulate lesson completion
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsCompleted(true);
        console.log('✅ Lesson completed, proceeding to next lesson');
      } catch (error) {
        console.error('📊 Error completing lesson:', error);
      } finally {
        setIsCompletingLesson(false);
      }
    } else {
      console.log('📚 Lesson already completed, proceeding directly...');
    }

    // Now navigate to next lesson or complete course
    if (isLastLesson) {
      console.log('🎉 Last lesson completed! Course finished!');
      alert('Course completed!');
    } else {
      console.log('➡️ Moving to next lesson...');
      setCurrentLessonIndex(currentLessonIndex + 1);
      setIsCompleted(false); // Reset for next lesson
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Next Button Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Current Lesson</h2>
        <p>Lesson {currentLessonIndex + 1} of {lessons.length}</p>
        <p className="text-gray-600">{currentLesson?.title}</p>
        <p className="text-sm">Completed: {isCompleted ? 'Yes' : 'No'}</p>
      </div>
      
      <Button
        onClick={handleSmartNextLesson}
        disabled={isCompletingLesson}
        className="w-full"
      >
        {isCompletingLesson ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Completing...
          </>
        ) : (
          <>
            {isLastLesson ? 'Finish Course' : 'Next Lesson'}
            <span className="ml-2">→</span>
          </>
        )}
      </Button>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Check browser console for debug messages</p>
        <p>Expected: 🔄 → 📚 → ✅ → ➡️</p>
      </div>
    </div>
  );
};

export default NextButtonTest;
