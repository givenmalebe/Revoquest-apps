import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from "lucide-react";

// Test component to verify timer functionality
const TimerTest = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRequirementMet, setTimeRequirementMet] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  
  const lessons = [
    { id: 'lesson-1', title: 'Lesson 1', duration: 2 }, // 2 minutes for testing
    { id: 'lesson-2', title: 'Lesson 2', duration: 3 }, // 3 minutes for testing
    { id: 'lesson-3', title: 'Lesson 3', duration: 1 }, // 1 minute for testing
  ];
  
  const currentLesson = lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const requiredTimeMinutes = currentLesson?.duration || 1;
  
  // Timer effect - starts countdown when lesson changes
  useEffect(() => {
    console.log('⏱️ Timer effect triggered for lesson:', currentLesson?.title);
    
    // Reset timer state for each new lesson
    setTimerStarted(false);
    setTimeRequirementMet(false);
    setTimeRemainingSeconds(0);
    setIsCompleted(false);
    
    // Initialize countdown timer for new lesson
    const initialTime = requiredTimeMinutes * 60; // Convert minutes to seconds
    setTimeRemainingSeconds(initialTime);
    setTimeRequirementMet(false);
    setTimerStarted(true);
    
    console.log('⏱️ Timer initialized:', {
      lessonId: currentLesson?.id,
      duration: requiredTimeMinutes,
      timeRemaining: initialTime
    });
    
    // Start the countdown timer
    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        const newTime = prev - 1;
        
        // Check if countdown has reached zero
        if (newTime <= 0) {
          setTimeRequirementMet(true);
          console.log('⏱️ Countdown completed! Lesson can be finished.');
        }
        
        return Math.max(0, newTime); // Don't go below 0
      });
    }, 1000);
    
    return () => {
      console.log('⏱️ Cleaning up timer for lesson:', currentLesson?.id);
      clearInterval(timer);
    };
  }, [currentLessonIndex, requiredTimeMinutes]);
  
  const handleSmartNextLesson = async () => {
    console.log('🔄 Next lesson button clicked:', {
      isCompleted,
      isLastLesson,
      timeRequirementMet,
      timeRemainingSeconds,
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
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Timer Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Current Lesson</h2>
        <p>Lesson {currentLessonIndex + 1} of {lessons.length}</p>
        <p className="text-gray-600">{currentLesson?.title}</p>
        <p className="text-sm">Duration: {requiredTimeMinutes} minutes</p>
        <p className="text-sm">Completed: {isCompleted ? 'Yes' : 'No'}</p>
      </div>
      
      {/* Timer Display */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Timer Status:</span>
          <span className={`font-bold ${timeRequirementMet ? 'text-green-600' : 'text-amber-600'}`}>
            {timeRequirementMet ? 'COMPLETED' : 'ACTIVE'}
          </span>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono">
            {formatTime(timeRemainingSeconds)}
          </div>
          <div className="text-sm text-gray-500">
            {timeRequirementMet ? 'Ready to proceed!' : 'Time remaining'}
          </div>
        </div>
      </div>
      
      {/* Timer Status Indicator */}
      {!timeRequirementMet && (
        <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <Clock className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 font-medium">
            Timer Active: {Math.ceil(timeRemainingSeconds / 60)} minutes remaining
          </span>
        </div>
      )}
      
      {/* Next Button */}
      <Button
        onClick={handleSmartNextLesson}
        disabled={isCompletingLesson || !timeRequirementMet}
        className={`w-full ${
          !timeRequirementMet && !isCompletingLesson
            ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
            : isLastLesson 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={
          !timeRequirementMet 
            ? `Timer must complete before proceeding (${Math.ceil(timeRemainingSeconds / 60)} min remaining)`
            : ''
        }
      >
        {isCompletingLesson ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Completing...
          </>
        ) : !timeRequirementMet ? (
          <>
            <Clock className="w-4 h-4 mr-2" />
            Timer Active
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
        <p>Expected: Timer starts → Countdown → Button enabled → Next lesson</p>
      </div>
    </div>
  );
};

export default TimerTest;
