import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  Star,
  CheckCircle,
  Clock,
  Download,
  Youtube,
  BookOpen,
  Target,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Bot,
  Compass,
  MessageCircle,
  X,
  Pencil
} from "lucide-react";
import { UploadedFile, FileUploadService } from "@/services/fileUploadService";
import SimplePDFView from './SimplePDFView';
import { persistentProgressService } from '../services/persistentProgressService';
import { lessonContentService } from '../services/lessonContentService';
import { DatabaseService } from '../firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { getDisplayCorrectAnswer, gradeQuestions } from '@/utils/quizGrading';


interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'reading' | 'quiz' | 'assignment' | 'challenge' | 'project' | 'discussion' | 'learn' | 'slides';
  duration: string;
  completed: boolean;
  content?: string;
  youtubeUrl?: string;
  description?: string;
  objectives?: string[];
  resources?: (string | { id: string; type: string; title: string; url?: string; addedAt: string; file?: any })[];
  readingContent?: {
    sections: {
      title: string;
      content: string;
      keyPoints?: string[];
    }[];
    summary: string;
    keyTerms: string[];
    references: string[];
  } | string;
  // Reading lesson content types
  readingContentType?: 'text' | 'slides' | 'files' | 'video';
  googleSlidesUrl?: string;
  uploadedFiles?: UploadedFile[];
  richTextContent?: string;
  quizContent?: {
    questions: {
      id: string;
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
      options?: string[];
      correctAnswer?: string | string[];
      explanation?: string;
    }[];
    passingScore: number;
    timeLimit?: number;
  };
  projectContent?: {
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    criteria: string[];
    resources: string[];
    timeline: string;
  };
  videoContent?: {
    title: string;
    description: string;
    transcript?: string;
    keyMoments: {
      timestamp: string;
      title: string;
      description: string;
    }[];
  };
}

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface LessonViewerProps {
  course: any;
  currentLesson: Lesson;
  currentUnit: Unit;
  courseProgress?: any; // Progress data from the main dashboard
  onClose: () => void;
  /** When provided, "Back to Course" uses this to return to the course structure view instead of closing. */
  onBackToCourse?: () => void;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  onCompleteLesson: (lessonId: string) => void;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  currentLessonIndex: number;
  totalLessons: number;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  course,
  currentLesson,
  currentUnit,
  courseProgress,
  onClose,
  onBackToCourse,
  onNextLesson,
  onPreviousLesson,
  onCompleteLesson,
  isFirstLesson,
  isLastLesson,
  currentLessonIndex,
  totalLessons
}) => {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false); // Will be loaded from database
  const [isLoadingCompletionStatus, setIsLoadingCompletionStatus] = useState(true); // Track loading state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCorrectByQuestionId, setQuizCorrectByQuestionId] = useState<Record<string, boolean>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  // Quiz can come from the lesson or be generated on-the-fly for lessons that don't have one yet
  const [lessonQuizContent, setLessonQuizContent] = useState<Lesson['quizContent'] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [lessonStartTime, setLessonStartTime] = useState<Date | null>(null);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // AI popout and course-page tour: show only once per login (session)
  const COURSE_PAGE_POPOUT_KEY = 'course_page_tour_popout_shown';
  const [showCoursePageAIPopout, setShowCoursePageAIPopout] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(COURSE_PAGE_POPOUT_KEY) === 'true' ? false : true
  );
  const [showCoursePageTour, setShowCoursePageTour] = useState(false);
  const [coursePageTourStep, setCoursePageTourStep] = useState(0);

  const dismissCoursePagePopout = () => {
    try {
      sessionStorage.setItem(COURSE_PAGE_POPOUT_KEY, 'true');
    } catch (_) {}
    setShowCoursePageAIPopout(false);
  };

  const isQuizEmptyOrTemplate = useCallback((quiz?: any) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return true;
    return quiz.questions.some((q: any) => {
      const text = (q.question || '').toLowerCase();
      return (
        text.includes('sample question') ||
        text.includes('what is the correct answer') ||
        (text.includes('primary purpose of') && text.includes('in')) ||
        (text.includes('can be applied across different areas of')) ||
        (text.includes('key benefits of')) ||
        (text.includes('contributes to the success of') && text.includes('projects'))
      );
    });
  }, []);

  // Effective quiz: from lesson or generated on-the-fly (so every lesson can have a quiz)
  const effectiveQuizContent =
    lessonQuizContent && !isQuizEmptyOrTemplate(lessonQuizContent)
      ? lessonQuizContent
      : currentLesson.quizContent && !isQuizEmptyOrTemplate(currentLesson.quizContent)
      ? currentLesson.quizContent
      : null;

  // Sync quiz from lesson when lesson changes; reset quiz UI state
  useEffect(() => {
    const initialQuiz = currentLesson.quizContent && !isQuizEmptyOrTemplate(currentLesson.quizContent)
      ? currentLesson.quizContent
      : null;
    setLessonQuizContent(initialQuiz);
    setShowQuizResults(false);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizCorrectByQuestionId({});
  }, [currentLesson.id, currentLesson.quizContent, isQuizEmptyOrTemplate]);

  // When lesson changes (Next/Previous), scroll main content AND window to top immediately.
  // Use 'instant' (no animation) so the quiz auto-generation that follows cannot push it back down.
  useEffect(() => {
    // Scroll the inner CardContent container
    if (mainContentScrollRef.current) {
      mainContentScrollRef.current.scrollTop = 0;
    }
    // Also reset the browser window scroll position (catches full-page layouts)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentLesson.id, currentLessonIndex]);

  const generateQuizForLesson = React.useCallback(async () => {
    if (!course || !currentUnit || !currentLesson) return;
    const courseId = course.id;
    const unitId = currentUnit.id;
    const lessonIdForThisRun = currentLesson.id;
    const unitsSnapshot = (course.units || course.modules || []) as Unit[];
    setIsGeneratingQuiz(true);
    try {
      const title = currentLesson.title || 'This lesson';
      const contentParts: string[] = [];

      // Generic lesson text
      if (currentLesson.content) contentParts.push(currentLesson.content);
      if (currentLesson.description) contentParts.push(currentLesson.description);
      if (currentLesson.objectives?.length) {
        contentParts.push('Learning objectives: ' + currentLesson.objectives.join('. '));
      }

      // Reading content (string or structured)
      if (typeof currentLesson.readingContent === 'string') {
        contentParts.push(currentLesson.readingContent);
      } else if (currentLesson.readingContent) {
        const sectionsText = currentLesson.readingContent.sections
          ?.map((s) => `${s.title}\n${s.content}`)
          .join('\n\n');
        if (sectionsText) contentParts.push(sectionsText);
        if (currentLesson.readingContent.summary) {
          contentParts.push('Summary: ' + currentLesson.readingContent.summary);
        }
      }

      // Video lessons – include transcript/description so quiz matches the video
      if (currentLesson.videoContent) {
        if (currentLesson.videoContent.description) {
          contentParts.push('Video description: ' + currentLesson.videoContent.description);
        }
        if (currentLesson.videoContent.transcript) {
          contentParts.push('Video transcript: ' + currentLesson.videoContent.transcript);
        }
      }

      // Slides lessons – if we have rich text or reading sections, feed that in
      if (currentLesson.readingContentType === 'slides') {
        if (currentLesson.richTextContent) {
          contentParts.push('Slides notes: ' + currentLesson.richTextContent);
        }
      }

      const lessonText = contentParts.join('\n\n').trim() || title;
      const generated = await lessonContentService.generateQuizFromLessonContent(title, lessonText);
      if (lessonIdForThisRun !== currentLesson.id) return;
      setLessonQuizContent(generated);
      const updatedUnits = unitsSnapshot.map((u) =>
        u.id === unitId
          ? { ...u, lessons: u.lessons.map((l) => (l.id === lessonIdForThisRun ? { ...l, quizContent: generated } : l)) }
          : u
      );
      await DatabaseService.updateCourse(courseId, { units: updatedUnits, modules: updatedUnits });
    } catch (err) {
      console.error('Failed to generate quiz for lesson:', err);
    } finally {
      if (lessonIdForThisRun === currentLesson.id) {
        setIsGeneratingQuiz(false);
        // After quiz generation finishes, re-scroll to top so the new quiz content
        // doesn't push the viewport to the bottom of the page.
        if (mainContentScrollRef.current) {
          mainContentScrollRef.current.scrollTop = 0;
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  }, [course, currentUnit, currentLesson]);

  // Ensure every lesson has a quiz: auto-generate when we open a lesson that doesn't have one or has a template quiz (e.g. after Next Lesson)
  useEffect(() => {
    const hasNoQuiz = isQuizEmptyOrTemplate(currentLesson.quizContent);
    if (!hasNoQuiz || !course || !currentUnit || !currentLesson) return;
    generateQuizForLesson();
  }, [currentLesson.id, currentLesson.quizContent, course, currentUnit, currentLesson, generateQuizForLesson, isQuizEmptyOrTemplate]);

  const lessonTourRefs = {
    backToCourse: useRef<HTMLDivElement>(null),
    lessonHeader: useRef<HTMLDivElement>(null),
    mainContent: useRef<HTMLDivElement>(null),
    timerBlock: useRef<HTMLDivElement>(null),
    navButtons: useRef<HTMLDivElement>(null),
  };
  const mainContentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCoursePageTour) return;
    const step = coursePageTourStep;
    const el =
      step === 0 || step === 1 ? lessonTourRefs.backToCourse.current
      : step === 2 ? lessonTourRefs.lessonHeader.current
      : step === 3 ? lessonTourRefs.mainContent.current
      : step === 4 ? lessonTourRefs.timerBlock.current
      : step === 5 ? lessonTourRefs.navButtons.current
      : null;
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showCoursePageTour, coursePageTourStep]);
  
  // Time-based completion tracking - Countdown timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [requiredTimeMinutes, setRequiredTimeMinutes] = useState<number>(0);
  const [timeRequirementMet, setTimeRequirementMet] = useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [showTimerEdit, setShowTimerEdit] = useState<boolean>(false);
  const [timerEditMinutes, setTimerEditMinutes] = useState<number>(0);

  const applyTimerEdit = () => {
    const mins = Math.max(1, Math.min(180, Math.round(Number(timerEditMinutes)) || 1));
    setRequiredTimeMinutes(mins);
    setTimeRemainingSeconds(mins * 60);
    setTimeRequirementMet(false);
    setTimerStarted(true);
    setShowTimerEdit(false);
  };

  const openTimerEdit = () => {
    setTimerEditMinutes(requiredTimeMinutes || 1);
    setShowTimerEdit(true);
  };

  // Load lesson completion status from database on mount
  useEffect(() => {
    const loadLessonCompletionStatus = async () => {
      if (!user || !course || !currentLesson) return;

      try {
        setIsLoadingCompletionStatus(true);
        console.log('📊 Loading lesson completion status from database:', {
          studentId: user.id,
          courseId: course.id,
          lessonId: currentLesson.id
        });

        const progressData = await persistentProgressService.getStudentProgress(user.id, course.id);
        
        if (progressData && progressData.lessonProgress) {
          const lessonProgress = progressData.lessonProgress.find(
            (lp: any) => lp.lessonId === currentLesson.id
          );
          
          if (lessonProgress) {
            console.log('✅ Found lesson progress in database:', {
              lessonId: currentLesson.id,
              completed: lessonProgress.completed,
              timeSpent: lessonProgress.timeSpent,
              score: lessonProgress.score
            });
            
            setIsCompleted(lessonProgress.completed || false);
            
            // Load additional data if available
            if (lessonProgress.timeSpent && !lessonProgress.completed) {
              const timeSpentMinutes = lessonProgress.timeSpent;
              // Use the actual lesson duration, not a default
              const lessonDuration = typeof currentLesson.duration === 'number' 
                ? currentLesson.duration 
                : parseInt(currentLesson.duration.toString()) || 1; // Use lesson duration, fallback to 1 minute
              const remainingMinutes = Math.max(0, lessonDuration - timeSpentMinutes);
              setTimeRemainingSeconds(remainingMinutes * 60);
              setTimerStarted(true);
              console.log('⏱️ Resuming timer from saved progress:', {
                timeSpent: timeSpentMinutes,
                lessonDuration: lessonDuration,
                remaining: remainingMinutes
              });
            }
            if (lessonProgress.score) {
              setQuizScore(lessonProgress.score);
            }
          } else {
            console.log('ℹ️ No lesson progress found in database, lesson not completed');
            setIsCompleted(false);
          }
        } else {
          console.log('ℹ️ No progress data found for course');
          setIsCompleted(false);
        }
      } catch (error) {
        console.error('❌ Error loading lesson completion status:', error);
        setIsCompleted(false);
      } finally {
        setIsLoadingCompletionStatus(false);
      }
    };

    loadLessonCompletionStatus();
  }, [user, course, currentLesson]);

  // Function to refresh lesson completion status
  const refreshLessonCompletionStatus = async () => {
    if (!user || !course || !currentLesson) return;

    try {
      setIsLoadingCompletionStatus(true);
      const progressData = await persistentProgressService.getStudentProgress(user.id, course.id);
      
      if (progressData && progressData.lessonProgress) {
        const lessonProgress = progressData.lessonProgress.find(
          (lp: any) => lp.lessonId === currentLesson.id
        );
        
        if (lessonProgress) {
          setIsCompleted(lessonProgress.completed || false);
          
          // Also refresh time spent data
          if (lessonProgress.timeSpent) {
            // Convert time spent back to remaining time for countdown timer
            const timeSpentMinutes = lessonProgress.timeSpent;
            const requiredMinutes = requiredTimeMinutes || 30; // Default to 30 minutes
            const remainingMinutes = Math.max(0, requiredMinutes - timeSpentMinutes);
            setTimeRemainingSeconds(remainingMinutes * 60);
            setTimerStarted(true);
            console.log('⏱️ Refreshed timer from saved progress:', {
              timeSpent: timeSpentMinutes,
              required: requiredMinutes,
              remaining: remainingMinutes
            });
          }
          if (lessonProgress.score) {
            setQuizScore(lessonProgress.score);
          }
        } else {
          setIsCompleted(false);
        }
      } else {
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('❌ Error refreshing lesson completion status:', error);
      setIsCompleted(false);
    } finally {
      setIsLoadingCompletionStatus(false);
    }
  };

  // Manual save function with force save
  const saveProgress = async () => {
    if (!user || !course || !currentLesson) return;
    
    try {
      const timeSpent = lessonStartTime 
        ? Math.round((new Date().getTime() - lessonStartTime.getTime()) / (1000 * 60))
        : 0;

      console.log('💾 Force saving progress...', { timeSpent, currentPosition, studentNotes, bookmarks });
      
      const result = await persistentProgressService.forceSaveProgress(
        user.id,
        course.id,
        currentLesson.id,
        timeSpent,
        currentPosition,
        studentNotes,
        bookmarks
      );
      
      if (result.success) {
        console.log('💾 Progress force saved successfully');
      } else {
        console.error('💾 Force save failed:', result.message);
      }
    } catch (error) {
      console.error('💾 Failed to force save progress:', error);
    }
  };

  useEffect(() => {
    // Don't set completion status here - it should only come from database
    // setIsCompleted(currentLesson.completed); // REMOVED: This was overriding database data
    
    // Use instructor-set duration directly (already in minutes)
    const required = typeof currentLesson.duration === 'number' 
      ? currentLesson.duration 
      : parseInt(currentLesson.duration.toString()) || 1; // Fallback to 1 minute instead of 30
    
    console.log('⏱️ Using instructor-set lesson duration:', {
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      instructorDuration: currentLesson.duration,
      parsedDuration: required,
      durationType: typeof currentLesson.duration,
      isCompleted: isCompleted
    });
    
    setRequiredTimeMinutes(required);
    
    // Reset timer state for each new lesson
    setTimerStarted(false);
    setTimeRequirementMet(false);
    setTimeRemainingSeconds(0); // Reset timer to 0 initially
    
    // Check if lesson is already completed - if so, skip timer
    if (isCompleted) {
      console.log('⏱️ Lesson already completed - skipping timer:', {
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        isCompleted: isCompleted
      });
      
      // Set timer as completed immediately for completed lessons
      setTimeRequirementMet(true);
      setTimeRemainingSeconds(0);
      setTimerStarted(false);
      
      return; // Exit early - no timer needed
    }
    
    // Initialize countdown timer for new lesson (fresh start) - only for incomplete lessons
    const initialTime = required * 60; // Convert minutes to seconds
    setTimeRemainingSeconds(initialTime);
    setTimeRequirementMet(false);
    setTimerStarted(true);
    
    console.log('⏱️ Timer initialized for new lesson (fresh start):', {
      lessonId: currentLesson.id,
      duration: required,
      timeRemaining: initialTime,
      isCompleted: isCompleted
    });
    
    // Start the countdown timer immediately
    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        const newTime = prev - 1;
        
        // Check if countdown has reached zero
        if (newTime <= 0) {
          setTimeRequirementMet(true);
          console.log('⏱️ Countdown completed! Lesson can be finished.', {
            lessonId: currentLesson?.id,
            timeRemaining: newTime
          });
        }
        
        return Math.max(0, newTime); // Don't go below 0
      });
    }, 1000);
    
    return () => {
      console.log('⏱️ Cleaning up timer for lesson:', currentLesson?.id);
      clearInterval(timer);
    };
  }, [currentLesson.duration, currentLesson.id, isCompleted]);

  // Remove the separate countdown timer useEffect since it's now combined above

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!user || !course || !currentLesson || isCompleted) return;

    const autoSave = async () => {
      try {
        const timeSpentMinutes = Math.floor((requiredTimeMinutes * 60 - timeRemainingSeconds) / 60);
        await persistentProgressService.updateLessonProgress(
          user.id,
          course.id,
          currentLesson.id,
          timeSpentMinutes,
          false // Not completed yet
        );
        console.log('💾 Auto-saved lesson progress:', { timeSpentMinutes, timeRemaining: timeRemainingSeconds });
      } catch (error) {
        console.error('❌ Error auto-saving progress:', error);
      }
    };

    // Auto-save every 30 seconds
    const interval = setInterval(autoSave, 30000);

    return () => clearInterval(interval);
  }, [user, course, currentLesson, timeRemainingSeconds, isCompleted, requiredTimeMinutes]);

  // Track lesson start time and start progress tracking
  useEffect(() => {
    const startTime = new Date();
    setLessonStartTime(startTime);
    
    // Start lesson progress tracking
    if (user && course && currentLesson) {
      const unitId = course.units?.find(unit => 
        unit.lessons?.some(lesson => lesson.id === currentLesson.id)
      )?.id || '';
      
      const lessonIndex = course.units?.flatMap(unit => unit.lessons || [])
        .findIndex(lesson => lesson.id === currentLesson.id) || 0;

      // Calculate total lessons
      const totalLessons = course.units?.reduce((total: number, unit: any) => 
        total + (unit.lessons?.length || 0), 0) || 0;

      // Start lesson progress tracking
      persistentProgressService.startLesson(
        user.id,
        course.id,
        currentLesson.id,
        unitId,
        lessonIndex,
        totalLessons
      ).then(result => {
        if (result.success) {
          console.log('📚 Lesson progress tracking started:', result.message);
        } else {
          console.error('📚 Failed to start lesson tracking:', result.message);
        }
      }).catch(error => {
        console.error('📚 Error starting lesson tracking:', error);
      });

      // Start auto-save every 10 seconds for more frequent saves
      const interval = persistentProgressService.startAutoSave(
        user.id,
        course.id,
        currentLesson.id,
        () => Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60)), // Calculate time spent
        () => currentPosition,
        () => studentNotes,
        () => bookmarks
      );
      
      setAutoSaveInterval(interval);
    }

    return () => {
      // Cleanup auto-save interval
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
    };
  }, [currentLesson.id, user, course]);

  // Reset PDF error when switching lessons
  useEffect(() => {
    setPdfError(null);
  }, [currentLesson.id]);

  // Save progress when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveProgress();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Save progress before unmounting
      saveProgress();
      
      // Remove event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clear auto-save interval
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
    };
  }, [autoSaveInterval, lessonStartTime, currentPosition, studentNotes, bookmarks, user, course, currentLesson]);




  // Helper functions for reading lesson content
  const getGoogleSlidesEmbedUrl = (url: string) => {
    // Handle different Google Slides URL formats
    
    // 1. Check if it's already an embed URL (contains /embed)
    if (url.includes('/embed')) {
      return url;
    }
    
    // 2. Check if it's a pub URL (public sharing URL) - convert to embed
    const pubMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)\/pub/);
    if (pubMatch) {
      return `https://docs.google.com/presentation/d/${pubMatch[1]}/embed?start=false&loop=false&delayms=3000`;
    }
    
    // 3. Check if it's a regular presentation URL - convert to embed
    const presentationMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
    if (presentationMatch) {
      return `https://docs.google.com/presentation/d/${presentationMatch[1]}/embed?start=false&loop=false&delayms=3000`;
    }
    
    // 4. If it's already a proper embed URL with parameters, return as-is
    if (url.includes('docs.google.com/presentation') && url.includes('embed')) {
      return url;
    }
    
    // 5. If none of the above, return the original URL
    return url;
  };

  const formatFileSize = FileUploadService.formatFileSize;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'quiz': return <FileText className="w-5 h-5" />;
      case 'project': return <Target className="w-5 h-5" />;
      case 'discussion': return <Lightbulb className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Auto-complete lesson (called automatically when navigating or passing quiz)
  const handleCompleteLesson = async (scoreOverride?: number) => {
    if (!user) {
      console.error('❌ Cannot complete lesson: User not authenticated');
      return;
    }

    // Check if lesson is already completed
    if (isCompleted) {
      console.log('✅ Lesson already completed, skipping completion');
      onCompleteLesson(currentLesson.id);
      return;
    }

    const timeSpentMinutes = Math.floor((requiredTimeMinutes * 60 - timeRemainingSeconds) / 60);
    const requiredMinutes = requiredTimeMinutes;
    
    console.log('📊 Completing lesson (timer restrictions disabled for testing):', {
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      timeSpent: timeSpentMinutes,
      required: requiredMinutes,
      timeRequirementMet: timeRequirementMet
    });

    setIsCompleted(true);
    
    // Calculate total time spent on lesson
    const totalTimeSpent = lessonStartTime 
      ? Math.round((new Date().getTime() - lessonStartTime.getTime()) / (1000 * 60)) // Convert to minutes
      : timeSpentMinutes;

    // Stop auto-save interval before completing lesson
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      setAutoSaveInterval(null);
    }

    // Update progress in database using persistent service
    try {
      const finalScore = scoreOverride !== undefined ? scoreOverride : (quizScore > 0 ? quizScore : undefined);
      const result = await persistentProgressService.completeLesson(
        user.id,
        course.id,
        currentLesson.id,
        totalTimeSpent,
        finalScore
      );

      if (result.success) {
        console.log('📊 Lesson completed successfully:', result.message);
        
        // Log detailed progress information
        const { completedLessons, totalLessons, completedUnits, totalUnits, progressPercentage } = result.updatedProgress || {};
        console.log('📊 Updated course progress:', {
          progressPercentage: `${progressPercentage}%`,
          units: `${completedUnits}/${totalUnits}`,
          lessons: `${completedLessons}/${totalLessons}`,
          status: result.updatedProgress?.status,
          timeSpent: totalTimeSpent
        });
        
        // Refresh the completion status to ensure consistency
        await refreshLessonCompletionStatus();
        
        // Notify parent component about lesson completion
        onCompleteLesson(currentLesson.id);
      } else {
        console.error('📊 Failed to complete lesson:', result.message);
        // Reset completion status if database update failed
        setIsCompleted(false);
        alert('Failed to save lesson completion. Please try again.');
      }
    } catch (error) {
      console.error('📊 Error completing lesson:', error);
      // Reset completion status if error occurred
      setIsCompleted(false);
      alert('An error occurred while completing the lesson. Please try again.');
    }
  };

  const handleQuizSubmit = async () => {
    if (!effectiveQuizContent || !user || !course) return;
    setIsSubmittingQuiz(true);
    const { percentage: score, correctByQuestionId } = gradeQuestions(
      effectiveQuizContent.questions.map(question => ({ ...question, points: 1 })),
      quizAnswers
    );
    setQuizCorrectByQuestionId(correctByQuestionId);
    setQuizScore(score);
    setShowQuizResults(true);
    try {
      await persistentProgressService.recordQuizAttempt(user.id, course.id, currentLesson.id, score);
      if (score >= effectiveQuizContent.passingScore) {
        await handleCompleteLesson(score);
      }
    } catch (err) {
      console.error('Failed to record quiz attempt:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Check if completing this lesson completes the unit
  const checkUnitCompletion = async () => {
    if (!user || !course || !currentUnit) return false;
    
    try {
      // Get all lessons in current unit
      const unitLessons = currentUnit.lessons || [];
      
      // Get progress for all lessons
      const progressData = await persistentProgressService.getStudentProgress(user.id, course.id);
      if (!progressData) return false;
      
      const lessonProgress = progressData.lessonProgress || [];
      
      // Check if all lessons in unit are completed (including current lesson)
      const completedCount = unitLessons.filter((lesson: any) => {
        const progress = lessonProgress.find((lp: any) => lp.lessonId === lesson.id);
        return progress?.completed === true; // Only count actually completed lessons
      }).length;
      
      // Unit is complete if ALL lessons are completed (including the current lesson)
      const isUnitComplete = completedCount === unitLessons.length;
      
      console.log('📊 Unit completion check:', {
        unitId: currentUnit.id,
        totalLessons: unitLessons.length,
        completedCount,
        isUnitComplete
      });
      
      return isUnitComplete;
    } catch (error) {
      console.error('Error checking unit completion:', error);
      return false;
    }
  };

  // Smart next lesson handler - auto-completes current lesson when navigating
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
    if (!isCompleted && user) {
      console.log('📚 Lesson not completed, completing it first...');
      setIsCompletingLesson(true);
      
      try {
        // Auto-complete current lesson before moving to next
        await handleCompleteLesson();
        
        // Small delay to ensure completion is processed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Lesson completed, proceeding to next lesson');
      } catch (error) {
        console.error('📊 Error completing lesson:', error);
        // Still proceed to next lesson even if completion fails
      } finally {
        setIsCompletingLesson(false);
      }
    } else {
      console.log('📚 Lesson already completed or no user, proceeding directly...');
    }

    // Now navigate to next lesson or complete course
    if (isLastLesson) {
      console.log('🎉 Last lesson completed! Triggering course completion...');
      // Trigger course completion summary through the parent component
      if (onCompleteLesson) {
        await onCompleteLesson(currentLesson.id);
      }
    } else {
      console.log('➡️ Moving to next lesson...');
      // Move to next lesson
      onNextLesson();
    }
  };

  const renderVideoContent = () => {
    // Debug: Log the current lesson data
    console.log('🎥 LessonViewer - Current lesson data:', currentLesson);
    console.log('🎥 LessonViewer - YouTube URL:', currentLesson.youtubeUrl);
    console.log('🎥 LessonViewer - Lesson type:', currentLesson.type);
    
    // Extract video ID from YouTube URL and convert to embed URL
    const getEmbedUrl = (url: string) => {
      if (!url) {
        console.log('🎥 No YouTube URL provided');
        return null;
      }
      
      console.log('🎥 Processing YouTube URL:', url);
      
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
          console.log('🎥 Generated embed URL:', embedUrl);
          return embedUrl;
        }
      }
      
      // If it's already an embed URL, return as is
      if (url.includes('youtube.com/embed/')) {
        console.log('🎥 URL is already an embed URL:', url);
        return url;
      }
      
      console.log('🎥 Could not parse YouTube URL:', url);
      return null;
    };

    const embedUrl = getEmbedUrl(currentLesson.youtubeUrl || '');
    console.log('🎥 Final embed URL:', embedUrl);
    
    return (
      <div className="space-y-6">
        {embedUrl && (
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={currentLesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
        {!embedUrl && currentLesson.youtubeUrl && (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Video not available</p>
              <a 
                href={currentLesson.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open in YouTube
              </a>
            </div>
          </div>
        )}
        
        {!currentLesson.youtubeUrl && (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No video URL provided</p>
              <p className="text-sm text-gray-500">This lesson should have a YouTube video</p>
            </div>
          </div>
        )}
      
        {currentLesson.videoContent && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Key Moments</h3>
            <div className="space-y-2">
              {currentLesson.videoContent.keyMoments.map((moment, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline">{moment.timestamp}</Badge>
                  <div>
                    <h4 className="font-medium">{moment.title}</h4>
                    <p className="text-sm text-gray-600">{moment.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReadingContent = () => {
    console.log('📖 Reading content type:', typeof currentLesson.readingContent);
    console.log('📖 Reading content:', currentLesson.readingContent);
    console.log('📖 Current lesson full data:', currentLesson);
    console.log('📖 Reading content type setting:', currentLesson.readingContentType);
    console.log('📖 Google Slides URL:', currentLesson.googleSlidesUrl);
    console.log('📖 Uploaded files:', currentLesson.uploadedFiles);
    console.log('📖 Rich text content:', currentLesson.richTextContent);
    
    // Debug PDF file URLs
    if (currentLesson.uploadedFiles && currentLesson.uploadedFiles.length > 0) {
      currentLesson.uploadedFiles.forEach((file, index) => {
        console.log(`📖 File ${index}:`, {
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          size: file.size
        });
      });
    }
    
    const readingContentType = currentLesson.readingContentType || 'text';
    
    return (
      <div className="space-y-6">
        {/* Google Slides Content */}
        {readingContentType === 'slides' && currentLesson.googleSlidesUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Presentation</h3>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={getGoogleSlidesEmbedUrl(currentLesson.googleSlidesUrl)}
                title="Google Slides Presentation"
                className="w-full h-full"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
          </div>
        )}
        
        {/* File Content (PDF/PowerPoint) */}
        {readingContentType === 'files' && currentLesson.uploadedFiles && currentLesson.uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documents</h3>
            <div className="space-y-3">
              {currentLesson.uploadedFiles.map((file) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-8 h-8 ${FileUploadService.getFileTypeIcon(file.type)}`} />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Download the file
                          const link = document.createElement('a');
                          link.href = file.url;
                          link.download = file.name;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* PDF Viewer */}
      {file.type === 'pdf' && (
        <div className="mt-4">
          <SimplePDFView
            file={{
              id: file.id,
              name: file.name,
              type: 'pdf' as const,
              url: file.url,
              size: file.size
            }}
            onError={(error) => setPdfError(error)}
          />
        </div>
      )}
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Video Content for Reading Lessons */}
        {readingContentType === 'video' && currentLesson.youtubeUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Content</h3>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={(() => {
                  const url = currentLesson.youtubeUrl;
                  if (!url) return '';
                  
                  const patterns = [
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                    /youtube\.com\/v\/([^&\n?#]+)/,
                    /youtube\.com\/embed\/([^&\n?#]+)/
                  ];
                  
                  for (const pattern of patterns) {
                    const match = url.match(pattern);
                    if (match) {
                      return `https://www.youtube.com/embed/${match[1]}`;
                    }
                  }
                  
                  return url.includes('youtube.com/embed/') ? url : `https://www.youtube.com/embed/${url}`;
                })()}
                title="Video Content"
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        )}
        
        {/* AI-generated curriculum / rich text lesson content */}
        {(currentLesson.richTextContent && (readingContentType === 'text' || currentLesson.type === 'learn')) && (
          <div className="curriculum-lesson-wrapper space-y-4">
            <div 
              className="curriculum-lesson-content prose prose-slate max-w-none p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm"
              dangerouslySetInnerHTML={{ __html: currentLesson.richTextContent }}
            />
            <style>{`
              .curriculum-lesson-content .curriculum-lesson {
                display: block;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1e293b;
                line-height: 1.7;
              }
              .curriculum-lesson-content .curriculum-lesson * { box-sizing: border-box; }

              /* ===== TIME ESTIMATE ===== */
              .curriculum-lesson-content .lesson-time-estimate {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 2rem;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
                border: 1px solid #7dd3fc;
                border-radius: 1rem;
                box-shadow: 0 4px 12px rgba(14,165,233,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
              }
              .curriculum-lesson-content .time-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.4rem 1rem;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
                color: white;
                font-size: 0.8125rem;
                font-weight: 700;
                border-radius: 9999px;
                box-shadow: 0 2px 8px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
                letter-spacing: 0.01em;
              }
              .curriculum-lesson-content .time-hint {
                font-size: 0.8125rem;
                color: #0c4a6e;
                opacity: 0.85;
                font-weight: 500;
              }

              /* ===== UNIT CONTEXT ===== */
              .curriculum-lesson-content .unit-context {
                font-size: 0.875rem;
                color: #2563eb;
                font-weight: 700;
                margin: 0 0 1.5rem 0;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }

              /* ===== SECTION HEADINGS ===== */
              .curriculum-lesson-content .section-heading {
                font-size: 1.375rem;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 0.5rem 0;
                letter-spacing: -0.01em;
              }
              .curriculum-lesson-content .section-rule {
                border: none;
                height: 3px;
                background: linear-gradient(90deg, #3b82f6 0%, #93c5fd 50%, transparent 100%);
                margin: 0 0 1.25rem 0;
                border-radius: 2px;
              }

              /* ===== LEARNING OBJECTIVES ===== */
              .curriculum-lesson-content .lesson-objectives {
                margin-bottom: 2rem;
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%);
                border-left: 5px solid #2563eb;
                border-radius: 0 0.75rem 0.75rem 0;
                padding: 1.25rem 1.5rem;
                box-shadow: 0 4px 16px rgba(37,99,235,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .curriculum-lesson-content .objectives-heading {
                font-size: 1.125rem;
                font-weight: 800;
                color: #1e40af;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .objectives-intro {
                font-size: 0.9375rem;
                color: #475569;
                margin: 0 0 0.75rem 0;
                font-weight: 500;
              }
              .curriculum-lesson-content .objectives-list {
                margin: 0;
                padding-left: 0;
                list-style: none;
                color: #1e3a5f;
                font-size: 0.9375rem;
                line-height: 1.8;
              }
              .curriculum-lesson-content .objective-item {
                margin-bottom: 0.5rem;
                padding-left: 2rem;
                position: relative;
              }
              .curriculum-lesson-content .objective-item::before {
                content: "✓";
                position: absolute;
                left: 0;
                top: 0;
                color: #16a34a;
                font-weight: 800;
                font-size: 1rem;
                text-shadow: 0 1px 2px rgba(22,163,74,0.2);
              }

              /* ===== SECTION BADGES ===== */
              .curriculum-lesson-content .section-badge {
                display: inline-block;
                padding: 0.25rem 0.625rem;
                font-size: 0.6875rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: #1e40af;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-radius: 0.375rem;
                margin-bottom: 0.75rem;
                border: 1px solid #93c5fd;
              }

              /* ===== KEY TERM BADGE ===== */
              .curriculum-lesson-content .key-term-badge {
                padding: 0.125rem 0.4rem;
                background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
                color: #3730a3;
                border-radius: 0.25rem;
                font-weight: 700;
                border: 1px solid #a5b4fc;
                font-size: 0.875em;
              }

              /* ===== CONTENT BLOCKS (cards) ===== */
              .curriculum-lesson-content .main-content {
                margin-top: 1.5rem;
              }
              .curriculum-lesson-content .content-block {
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);
                transition: box-shadow 0.2s ease;
              }
              .curriculum-lesson-content .content-block:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
              }
              .curriculum-lesson-content .content-subheading {
                font-size: 1.125rem;
                font-weight: 800;
                color: #1e40af;
                margin: 0 0 0.75rem 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }
              .curriculum-lesson-content .content-block p {
                font-size: 0.9375rem;
                line-height: 1.75;
                color: #475569;
                margin: 0 0 0.75rem 0;
              }
              .curriculum-lesson-content .content-block p:last-child {
                margin-bottom: 0;
              }

              /* ===== FORMULA BOX ===== */
              .curriculum-lesson-content .formula-box {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
                border: 2px solid #93c5fd;
                border-radius: 0.75rem;
                padding: 1.25rem 1.5rem;
                margin: 1rem 0;
                text-align: center;
                font-size: 1.0625rem;
                color: #1e3a5f;
                box-shadow: 0 3px 10px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.6);
                font-weight: 600;
                letter-spacing: 0.01em;
              }

              /* ===== KEY RULE BOX ===== */
              .curriculum-lesson-content .key-rule-box {
                background: linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%);
                border: 2px solid #fbbf24;
                border-left: 6px solid #eab308;
                border-radius: 0 0.75rem 0.75rem 0;
                padding: 1.25rem 1.5rem;
                margin: 1rem 0;
                font-size: 0.9375rem;
                color: #713f12;
                box-shadow: 0 3px 10px rgba(234,179,8,0.12);
                line-height: 1.7;
              }
              .curriculum-lesson-content .key-rule-box h4 {
                margin: 0 0 0.5rem 0;
                font-weight: 800;
                color: #854d0e;
              }

              /* ===== EXAMPLE BLOCK ===== */
              .curriculum-lesson-content .example-block {
                background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%);
                border: 1px solid #d8b4fe;
                border-left: 5px solid #8b5cf6;
                border-radius: 0 0.75rem 0.75rem 0;
                padding: 1.25rem 1.5rem;
                margin: 1rem 0;
                box-shadow: 0 3px 10px rgba(139,92,246,0.1);
              }
              .curriculum-lesson-content .example-title {
                font-size: 1rem;
                font-weight: 800;
                color: #6d28d9;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .solution-steps {
                margin: 0.5rem 0 0 0;
                padding-left: 1.25rem;
                color: #4c1d95;
                font-size: 0.9375rem;
                line-height: 1.8;
              }
              .curriculum-lesson-content .solution-steps li {
                margin-bottom: 0.35rem;
              }
              .curriculum-lesson-content .solution-steps li:last-child {
                margin-bottom: 0;
              }

              /* ===== EXAM TIP BOX ===== */
              .curriculum-lesson-content .exam-tip-box {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
                border: 2px solid #86efac;
                border-left: 6px solid #22c55e;
                border-radius: 0 0.75rem 0.75rem 0;
                padding: 1.25rem 1.5rem;
                margin: 1rem 0;
                font-size: 0.9375rem;
                color: #166534;
                box-shadow: 0 3px 10px rgba(34,197,94,0.1);
                line-height: 1.7;
              }
              .curriculum-lesson-content .exam-tip-box strong {
                color: #15803d;
                font-weight: 800;
              }

              /* ===== CALLOUT BOX ===== */
              .curriculum-lesson-content .callout-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
                border-left: 5px solid #3b82f6;
                border-radius: 0 0.75rem 0.75rem 0;
                box-shadow: 0 3px 12px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
              }
              .curriculum-lesson-content .callout-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #1e40af;
              }
              .curriculum-lesson-content .callout-box strong {
                color: #1d4ed8;
                font-weight: 800;
              }

              /* ===== DEFINITION BOX ===== */
              .curriculum-lesson-content .definition-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%);
                border-left: 5px solid #8b5cf6;
                border-radius: 0 0.75rem 0.75rem 0;
                box-shadow: 0 3px 12px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
              }
              .curriculum-lesson-content .definition-box h4 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #6d28d9;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .definition-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #4c1d95;
              }

              /* ===== WARNING BOX ===== */
              .curriculum-lesson-content .warning-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
                border-left: 5px solid #f97316;
                border-radius: 0 0.75rem 0.75rem 0;
                box-shadow: 0 3px 12px rgba(249,115,22,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
              }
              .curriculum-lesson-content .warning-box h4 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #c2410c;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .warning-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #9a3412;
              }

              /* ===== HIGHLIGHT BOX ===== */
              .curriculum-lesson-content .highlight-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%);
                border: 2px solid #fbbf24;
                border-radius: 0.75rem;
                box-shadow: 0 3px 12px rgba(250,204,21,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .curriculum-lesson-content .highlight-box h4 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #854d0e;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .highlight-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #713f12;
              }

              /* ===== INFO BOX ===== */
              .curriculum-lesson-content .info-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
                border-left: 5px solid #22c55e;
                border-radius: 0 0.75rem 0.75rem 0;
                box-shadow: 0 3px 12px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
              }
              .curriculum-lesson-content .info-box h4 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #15803d;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .info-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #166534;
              }

              /* ===== QUOTE BOX ===== */
              .curriculum-lesson-content .quote-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.75rem;
                background: #f8fafc;
                border-left: 5px solid #94a3b8;
                border-radius: 0 0.75rem 0.75rem 0;
                font-style: italic;
                color: #475569;
                font-size: 1rem;
                line-height: 1.75;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              }
              .curriculum-lesson-content .quote-box cite {
                display: block;
                margin-top: 0.75rem;
                font-size: 0.8125rem;
                font-style: normal;
                color: #94a3b8;
                font-weight: 600;
              }

              /* ===== DEEP DIVE ===== */
              .curriculum-lesson-content .deep-dive {
                margin: 1.5rem 0;
                padding: 1.5rem;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
                border: 1px solid #cbd5e1;
                border-radius: 1rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
              }
              .curriculum-lesson-content .deep-dive h4 {
                font-size: 1rem;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 0.75rem 0;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid #e2e8f0;
              }
              .curriculum-lesson-content .deep-dive p {
                margin: 0 0 0.75rem 0;
                font-size: 0.9375rem;
                line-height: 1.75;
                color: #334155;
              }
              .curriculum-lesson-content .deep-dive p:last-child {
                margin-bottom: 0;
              }

              /* ===== REAL-WORLD BOX ===== */
              .curriculum-lesson-content .real-world-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
                border: 2px solid #6ee7b7;
                border-radius: 0.75rem;
                box-shadow: 0 3px 12px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .curriculum-lesson-content .real-world-box h4 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #047857;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .real-world-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #065f46;
              }

              /* ===== COMMON MISTAKE BOX ===== */
              .curriculum-lesson-content .common-mistake-box {
                margin: 1.25rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%);
                border-left: 5px solid #ef4444;
                border-radius: 0 0.75rem 0.75rem 0;
                box-shadow: 0 3px 12px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
              }
              .curriculum-lesson-content .common-mistake-box h4 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #b91c1c;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .common-mistake-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #991b1b;
              }

              /* ===== CONTENT DIVIDER ===== */
              .curriculum-lesson-content .content-divider {
                border: none;
                height: 3px;
                background: linear-gradient(90deg, transparent 0%, #cbd5e1 15%, #94a3b8 50%, #cbd5e1 85%, transparent 100%);
                margin: 2.5rem 0;
                border-radius: 2px;
              }

              /* ===== SECTION NUMBER ===== */
              .curriculum-lesson-content .section-number {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 2.25rem;
                height: 2.25rem;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border-radius: 50%;
                font-size: 0.875rem;
                font-weight: 800;
                flex-shrink: 0;
                box-shadow: 0 3px 8px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
              }

              /* ===== QUIZ PREP ===== */
              .curriculum-lesson-content .quiz-prep-box {
                margin-top: 2.5rem;
                margin-bottom: 1.5rem;
                padding: 1.5rem;
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
                border: 2px solid #f59e0b;
                border-radius: 1rem;
                box-shadow: 0 4px 16px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .curriculum-lesson-content .quiz-prep-heading {
                font-size: 1.0625rem;
                font-weight: 800;
                color: #92400e;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .quiz-prep-text {
                font-size: 0.9375rem;
                line-height: 1.65;
                color: #78350f;
                margin: 0;
              }

              /* ===== KEY TAKEAWAYS ===== */
              .curriculum-lesson-content .key-takeaways {
                margin-top: 2.5rem;
              }
              .curriculum-lesson-content .takeaways-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-top: 1rem;
              }
              @media (max-width: 640px) {
                .curriculum-lesson-content .takeaways-grid {
                  grid-template-columns: 1fr;
                }
              }
              .curriculum-lesson-content .takeaway-card {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: 0.75rem;
                padding: 1rem 1.25rem;
                box-shadow: 0 3px 10px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
              }
              .curriculum-lesson-content .takeaway-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59,130,246,0.15);
              }
              .curriculum-lesson-content .takeaway-title {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #1e40af;
                margin: 0 0 0.35rem 0;
              }
              .curriculum-lesson-content .takeaway-card p {
                margin: 0;
                font-size: 0.875rem;
                line-height: 1.6;
                color: #1e3a5f;
              }

              /* ===== PRACTICE ===== */
              .curriculum-lesson-content .practice-opportunities { margin-top: 2rem; }
              .curriculum-lesson-content .challenge-set {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 1px solid #86efac;
                border-radius: 0.75rem;
                padding: 1.25rem 1.5rem;
                margin: 1rem 0;
              }
              .curriculum-lesson-content .challenge-set h4 {
                font-size: 1rem;
                font-weight: 800;
                color: #166534;
                margin: 0 0 0.5rem 0;
              }
              .curriculum-lesson-content .practice-list {
                margin: 0.5rem 0 0 1rem;
                padding-left: 1.25rem;
                font-size: 0.9375rem;
                color: #166534;
                line-height: 1.8;
              }
              .curriculum-lesson-content .solutions-link {
                margin-top: 0.75rem;
                font-size: 0.9375rem;
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                font-weight: 600;
              }

              /* ===== COMPARISON TABLE ===== */
              .curriculum-lesson-content .comparison-table {
                overflow-x: auto;
                margin: 1.5rem 0;
                border-radius: 0.75rem;
                border: 1px solid #e2e8f0;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05);
              }
              .curriculum-lesson-content .comparison-table table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9375rem;
              }
              .curriculum-lesson-content .comparison-table th {
                background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
                color: white;
                font-weight: 700;
                padding: 0.875rem 1rem;
                text-align: left;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.03em;
              }
              .curriculum-lesson-content .comparison-table td {
                padding: 0.875rem 1rem;
                border-bottom: 1px solid #e2e8f0;
                color: #334155;
              }
              .curriculum-lesson-content .comparison-table tr:nth-child(even) td {
                background: #f8fafc;
              }
              .curriculum-lesson-content .comparison-table tr:last-child td {
                border-bottom: none;
              }
              .curriculum-lesson-content .comparison-table tr:hover td {
                background: #f1f5f9;
              }

              /* ===== KEY POINTS / SUMMARY BOXES ===== */
              .curriculum-lesson-content .key-points-box,
              .curriculum-lesson-content .summary-box {
                margin-top: 1.5rem;
                padding: 1.25rem 1.5rem;
                border-radius: 0.75rem;
              }
              .curriculum-lesson-content .key-points-box {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                box-shadow: 0 3px 10px rgba(59,130,246,0.1);
              }
              .curriculum-lesson-content .key-points-box h3,
              .curriculum-lesson-content .summary-box h3 {
                font-size: 1rem;
                font-weight: 800;
                color: #1e293b;
                margin: 0 0 0.75rem 0;
              }
              .curriculum-lesson-content .key-points-list {
                margin: 0;
                padding-left: 1.25rem;
                color: #1e3a5f;
                font-size: 0.9375rem;
                line-height: 1.7;
              }
              .curriculum-lesson-content .summary-box {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
                border: 1px solid #86efac;
                box-shadow: 0 3px 10px rgba(34,197,94,0.1);
              }
              .curriculum-lesson-content .summary-box p {
                margin: 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #166534;
              }

              /* ===== KEY TERMS ===== */
              .curriculum-lesson-content .key-terms-box {
                margin-top: 1.5rem;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-radius: 0.75rem;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 6px rgba(0,0,0,0.03);
              }
              .curriculum-lesson-content .key-terms-box h3 {
                font-size: 0.9375rem;
                font-weight: 800;
                color: #475569;
                margin: 0 0 0.75rem 0;
                text-transform: uppercase;
                letter-spacing: 0.04em;
              }
              .curriculum-lesson-content .term {
                display: inline-block;
                padding: 0.2rem 0.6rem;
                margin: 0.2rem 0.25rem 0.2rem 0;
                background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
                color: #3730a3;
                border-radius: 0.375rem;
                font-size: 0.8125rem;
                font-weight: 600;
                border: 1px solid #a5b4fc;
              }

              /* ===== LESSON INTRO / STEPS ===== */
              .curriculum-lesson-content .lesson-intro {
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 3px solid #e2e8f0;
              }
              .curriculum-lesson-content .lesson-intro p {
                font-size: 1.0625rem;
                line-height: 1.8;
                color: #334155;
              }
              .curriculum-lesson-content .lesson-steps {
                margin-top: 1.5rem;
                margin-bottom: 2rem;
              }
              .curriculum-lesson-content .step-list {
                list-style: none;
                padding-left: 0;
                counter-reset: step;
              }
              .curriculum-lesson-content .step {
                counter-increment: step;
                margin-bottom: 1.5rem;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
                border-radius: 0.75rem;
                border-left: 5px solid #3b82f6;
                position: relative;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
              }
              .curriculum-lesson-content .step::before {
                content: counter(step);
                position: absolute;
                left: -0.75rem;
                top: 1.25rem;
                width: 2rem;
                height: 2rem;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border-radius: 50%;
                font-size: 0.875rem;
                font-weight: 800;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
              }
              .curriculum-lesson-content .step-title {
                font-size: 1.0625rem;
                font-weight: 700;
                color: #1e293b;
                margin: 0 0 0.5rem 0;
                padding-left: 0.5rem;
              }
              .curriculum-lesson-content .step-body {
                padding-left: 0.5rem;
              }
              .curriculum-lesson-content .step-body p {
                margin: 0.25rem 0 0 0;
                font-size: 0.9375rem;
                line-height: 1.7;
                color: #475569;
              }

              /* ===== IMAGES ===== */
              .curriculum-lesson-content .lesson-generated-image {
                width: 100%;
                max-width: 100%;
                height: auto;
                border-radius: 0.75rem;
                margin: 1rem 0;
                display: block;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
              }
              .curriculum-lesson-content .lesson-image {
                margin: 1rem 0;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                border-radius: 0.75rem;
                font-size: 0.8125rem;
                color: #64748b;
                border: 1px solid #cbd5e1;
              }

              /* ===== LESSON STEP SECTION ===== */
              .curriculum-lesson-content .lesson-step-section {
                margin-bottom: 1.5rem;
              }
            `}</style>
          </div>
        )}

        {/* Quiz section: every lesson has a quiz (from course or generated on-the-fly) */}
        {effectiveQuizContent && effectiveQuizContent.questions?.length > 0 ? (
          <div className="mt-8">
            {renderQuizContent()}
          </div>
        ) : !isGeneratingQuiz ? (
          <div className="mt-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-slate-600" />
                    Quiz for this lesson
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    This lesson doesn&apos;t have a quiz yet. Generate one now to test your understanding; your results will be saved to the Grades tab.
                  </p>
                </div>
                <Button
                  onClick={generateQuizForLesson}
                  disabled={isGeneratingQuiz}
                  className="bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Generate quiz for this lesson
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center gap-3 text-slate-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Generating your quiz…</span>
          </div>
        )}
        
        {/* Fallback to AI-generated content or basic content */}
        {(!currentLesson.googleSlidesUrl && !currentLesson.uploadedFiles?.length && !currentLesson.richTextContent && !currentLesson.youtubeUrl) && (
          <div className="space-y-6">
            {currentLesson.readingContent ? (
              <div className="prose max-w-none">
                {typeof currentLesson.readingContent === 'string' ? (
                  // Handle string content (from AI generation)
                  <div className="space-y-4">
                    {currentLesson.readingContent.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed text-base">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                ) : (
                  // Handle structured content (from enhanced service)
                  <>
                    {currentLesson.readingContent.sections?.map((section, index) => (
                      <div key={index} className="space-y-4">
                        <h3 className="text-xl font-semibold">{section.title}</h3>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 leading-relaxed">{section.content}</p>
                        </div>
                        {section.keyPoints && section.keyPoints.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Key Points:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {section.keyPoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="text-blue-800">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Summary</h3>
                      <p className="text-gray-700">{currentLesson.readingContent.summary}</p>
                    </div>
                    
                    {currentLesson.readingContent.keyTerms?.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Key Terms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentLesson.readingContent.keyTerms.map((term, index) => (
                            <Badge key={index} variant="secondary">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{currentLesson.content || currentLesson.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQuizContent = () => (
    <div className="space-y-6">
      {effectiveQuizContent && (
        <>
          {!showQuizResults ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-slate-600" />
                  <h2 className="text-xl font-bold text-slate-900">Quiz: Test Your Understanding</h2>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  {effectiveQuizContent.instructions || 'Complete this quiz to verify your understanding of the lesson content.'}
                </p>
                <div className="space-y-6">
                  {effectiveQuizContent.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-lg border border-sky-100 bg-sky-50/30 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-sky-100 px-2 text-sm font-semibold text-sky-700">
                          Q{index + 1}
                        </span>
                        <div className="flex-1 space-y-4">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {question.question}
                          </p>
                          {question.type === 'multiple-choice' && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <label
                                  key={optionIndex}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50/50"
                                >
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    onChange={(e) => setQuizAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                                    className="h-4 w-4 accent-sky-600"
                                  />
                                  <span className="text-slate-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {question.type === 'true-false' && (
                            <div className="space-y-2">
                              {['True', 'False'].map((val) => (
                                <label
                                  key={val}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50/50"
                                >
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={val.toLowerCase()}
                                    onChange={(e) => setQuizAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                                    className="h-4 w-4 accent-sky-600"
                                  />
                                  <span className="text-slate-700">{val}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {question.type === 'short-answer' && (
                            <input
                              type="text"
                              placeholder="Your answer..."
                              onChange={(e) => setQuizAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleQuizSubmit}
                  size="lg"
                  disabled={isSubmittingQuiz}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {isSubmittingQuiz ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <Badge className="bg-emerald-600 text-white">Submitted</Badge>
                  <span className="text-sm text-slate-500">Check your marks below</span>
                </div>
                <div className="text-4xl font-bold text-blue-600">{quizScore}%</div>
                <p className="mt-2 text-lg text-slate-700">
                  {quizScore >= effectiveQuizContent.passingScore
                    ? "Congratulations! You passed the quiz!"
                    : `You need ${effectiveQuizContent.passingScore}% to pass. Try again!`}
                </p>
                {quizScore < effectiveQuizContent.passingScore ? (
                  <Button
                    onClick={() => {
                      setShowQuizResults(false);
                      setQuizAnswers({});
                      setQuizCorrectByQuestionId({});
                    }}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Your result has been saved. Chat with your tutor anytime for feedback or to schedule one-on-one time on tricky topics.
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-slate-600" />
                  Check your marks
                </h3>
                <div className="space-y-4">
                  {effectiveQuizContent.questions.map((question, index) => {
                    const isCorrect = quizCorrectByQuestionId[question.id];
                    const userAnswer = quizAnswers[question.id];
                    const correctAnswer = getDisplayCorrectAnswer(question) || '—';
                    return (
                      <div
                        key={question.id}
                        className={`rounded-lg border p-4 ${
                          isCorrect ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="shrink-0">
                            {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-amber-600" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">Q{index + 1}: {question.question}</p>
                            <p className="mt-1 text-sm text-slate-600">
                              Your answer: {userAnswer || '—'}
                              {!isCorrect && (
                                <span className="block mt-1 text-slate-700">
                                  Correct answer: {correctAnswer}
                                </span>
                              )}
                            </p>
                            {question.explanation && (
                              <p className="mt-2 text-sm text-slate-500 italic">{question.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderProjectContent = () => (
    <div className="space-y-6">
      {currentLesson.projectContent && (
        <>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{currentLesson.projectContent.title}</h3>
            <p className="text-gray-700 mb-4">{currentLesson.projectContent.description}</p>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span>Timeline: {currentLesson.projectContent.timeline}</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentLesson.projectContent.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentLesson.projectContent.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentLesson.projectContent.criteria.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{criterion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderLessonContent = () => {
    switch (currentLesson.type) {
      case 'video':
        return renderVideoContent();
      case 'reading':
      case 'learn':
      case 'article':
        return renderReadingContent();
      case 'quiz':
        return renderQuizContent();
      case 'project':
        return renderProjectContent();
      case 'slides':
        return renderReadingContent();
      default:
        return (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{currentLesson.content || currentLesson.description}</p>
          </div>
        );
    }
  };

  // Debug: Log the lesson data at the start of render
  console.log('🎥 LessonViewer RENDER - Current lesson:', currentLesson);
  console.log('🎥 LessonViewer RENDER - Lesson type:', currentLesson.type);
  console.log('🎥 LessonViewer RENDER - YouTube URL:', currentLesson.youtubeUrl);
  console.log('🎥 LessonViewer RENDER - Reading content:', currentLesson.readingContent);
  console.log('🎥 LessonViewer RENDER - Quiz content:', effectiveQuizContent);

  const COURSE_PAGE_TOUR_STEPS: { title: string; description: string }[] = [
    { title: 'This is your lesson page', description: "This is where you learn. I'm touring with you so you know every part of the page and which buttons open the next lesson." },
    { title: 'Back to Course', description: '**Back to Course** (top left) takes you back to the course outline. Use it when you want to pick a different lesson or see the full list.' },
    { title: 'Where you are', description: `You're on **${currentLesson.title}** in **${currentUnit.title}**. The header always shows the current lesson and unit so you know which page you're on.` },
    { title: 'Where you learn', description: 'The **main area** is the lesson content—video, reading, quiz, or other materials. Work through it here. The **sidebar** has objectives and resources for this lesson.' },
    { title: 'Timer and Complete', description: 'Stay for the **required time** (timer at top). When it finishes, the **Next** button lets you complete this lesson and go to the next one. Your progress is saved when you complete.' },
    { title: 'Open every page in the course', description: `Use **Previous Lesson** to go back and **Next Lesson** (or **Next Unit**) to go forward. These buttons open every lesson in the course—one page after another. Work through the content on each page, then click Next to learn the next lesson. You're ready to learn!` },
  ];

  const handleStartCoursePageTour = () => {
    dismissCoursePagePopout();
    setShowCoursePageTour(true);
    setCoursePageTourStep(0);
  };

  const handleCoursePageTourNext = () => {
    if (coursePageTourStep < COURSE_PAGE_TOUR_STEPS.length - 1) {
      setCoursePageTourStep((s) => s + 1);
    } else {
      setShowCoursePageTour(false);
      setCoursePageTourStep(0);
    }
  };

  const handleCoursePageTourBack = () => {
    if (coursePageTourStep > 0) {
      setCoursePageTourStep((s) => s - 1);
    }
  };

  const handleFinishCoursePageTour = () => {
    setShowCoursePageTour(false);
    setCoursePageTourStep(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* AI greeting popout – centered, when starting or continuing a course */}
      {showCoursePageAIPopout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800 shadow-2xl w-full max-w-lg">
            <CardContent className="p-6">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-9 w-9 text-slate-400 hover:text-slate-600 rounded-full -m-1"
                  onClick={dismissCoursePagePopout}
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="flex items-start gap-4 pr-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      Welcome to {course?.title ?? 'this course'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      I'll take a tour with you so you see this page and all the buttons to learn and open every lesson.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                        onClick={handleStartCoursePageTour}
                      >
                        <Compass className="w-4 h-4 mr-2" />
                        Take a tour
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 shrink-0"
                        onClick={() => {
                          dismissCoursePagePopout();
                          window.location.href = '/ai-tutor';
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open AI Tutor
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-slate-500 shrink-0"
                        onClick={dismissCoursePagePopout}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course page tour – how to use the page and learn */}
      {showCoursePageTour && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Step {coursePageTourStep + 1} of {COURSE_PAGE_TOUR_STEPS.length}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {COURSE_PAGE_TOUR_STEPS[coursePageTourStep].title}
                  </h3>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {COURSE_PAGE_TOUR_STEPS[coursePageTourStep].description.replace(/\*\*(.*?)\*\*/g, '$1')}
              </p>
              <div className="flex items-center justify-between mt-6 gap-3">
                <div>
                  {coursePageTourStep > 0 ? (
                    <Button variant="outline" onClick={handleCoursePageTourBack} className="gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
                <div className="flex gap-2">
                  {coursePageTourStep < COURSE_PAGE_TOUR_STEPS.length - 1 ? (
                    <Button onClick={handleCoursePageTourNext} className="gap-1 bg-orange-500 hover:bg-orange-600">
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleFinishCoursePageTour} className="bg-orange-500 hover:bg-orange-600">
                      Finish tour
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div
        ref={lessonTourRefs.backToCourse}
        className={`bg-white border-b flex-shrink-0 transition-all duration-300 ${showCoursePageTour && (coursePageTourStep === 0 || coursePageTourStep === 1) ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-50' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3 sm:py-0 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={onBackToCourse ?? onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div className="hidden sm:block h-6 w-px bg-gray-300" />
              <div
                ref={lessonTourRefs.lessonHeader}
                className={`transition-all duration-300 ${showCoursePageTour && coursePageTourStep === 2 ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white rounded-lg' : ''}`}
              >
                <h1 className="text-base sm:text-lg font-semibold">{currentLesson.title}</h1>
                <p className="text-xs sm:text-sm text-gray-500">{currentUnit.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Countdown Timer Display - editable */}
              <div
                ref={lessonTourRefs.timerBlock}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-300 text-xs sm:text-sm flex-wrap sm:flex-nowrap justify-start sm:justify-center ${showCoursePageTour && coursePageTourStep === 4 ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white' : ''} ${
                timeRemainingSeconds > 0 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {showTimerEdit ? (
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-xs text-slate-600 whitespace-nowrap">Set countdown (min):</span>
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={timerEditMinutes}
                      onChange={(e) => setTimerEditMinutes(parseInt(e.target.value, 10) || 1)}
                      className="w-16 h-8 text-sm"
                    />
                    <Button type="button" size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={applyTimerEdit}>
                      Set
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowTimerEdit(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Clock className={`w-4 h-4 ${timeRemainingSeconds > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                    <div className="flex flex-col">
                      <div className={`font-medium ${timeRemainingSeconds > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                        {timeRemainingSeconds > 0 
                          ? `${Math.floor(timeRemainingSeconds / 60)}:${(timeRemainingSeconds % 60).toString().padStart(2, '0')} remaining`
                          : 'Timer Complete!'
                        }
                      </div>
                      <div className={`text-xs ${timeRemainingSeconds > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {requiredTimeMinutes}:00 total required
                      </div>
                    </div>
                    {!isCompleted && (
                      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900" onClick={openTimerEdit} title="Change countdown time">
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    )}
                    {timeRequirementMet && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Ready to complete</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 min-h-0 flex flex-col">
          <div className="grid gap-6 lg:grid-cols-3 flex-1 min-h-0 lg:grid-rows-[minmax(0,1fr)]">
            {/* Lesson Content - Scrollable */}
            <div
              ref={lessonTourRefs.mainContent}
              className={`lg:col-span-2 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${showCoursePageTour && coursePageTourStep === 3 ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-50 rounded-xl' : ''}`}
            >
              <Card className="flex flex-col h-full min-h-0 overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {getLessonIcon(currentLesson.type)}
                    <div>
                      <CardTitle className="text-xl">{currentLesson.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {currentLesson.duration} min
                        </Badge>
                        <Badge variant={currentLesson.type === 'video' ? 'default' : 'secondary'}>
                          {currentLesson.type.charAt(0).toUpperCase() + currentLesson.type.slice(1)}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  ref={mainContentScrollRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 min-h-0 pb-24"
                >
                  {renderLessonContent()}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Scrollable (stacks below main content on mobile) */}
            <div className="flex flex-col space-y-6 overflow-visible lg:overflow-y-auto min-h-0 max-h-full">
              {/* Learning Objectives */}
              {currentLesson.objectives && currentLesson.objectives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Learning Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentLesson.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Resources / Study Resources - learner can download */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Study Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, index) => {
                        const res = typeof resource === 'string' ? { title: resource, url: resource, type: 'link' as const } : resource;
                        const resourceUrl = res.url || (res as { file?: { url?: string } }).file?.url || '#';
                        const resourceTitle = res.title || 'Resource';
                        const resourceType = res.type || 'link';
                        const isFile = resourceType === 'pdf' || resourceType === 'document';
                        const fileName = (res as { file?: { name?: string } }).file?.name;
                        
                        return (
                          <div key={index} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                            <a
                              href={resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={isFile && fileName ? fileName : undefined}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 flex-1 min-w-0"
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate">{resourceTitle}</span>
                              {resourceType !== 'link' && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {resourceType.toUpperCase()}
                                </Badge>
                              )}
                            </a>
                            {resourceUrl !== '#' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0 h-8"
                                asChild
                              >
                                <a href={resourceUrl} target="_blank" rel="noopener noreferrer" download={isFile && fileName ? fileName : undefined}>
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{courseProgress?.progressPercentage || 0}%</span>
                    </div>
                    <Progress value={courseProgress?.progressPercentage || 0} />
                    <div className="text-sm text-gray-500">
                      {courseProgress?.completedLessons || 0} of {courseProgress?.totalLessons || totalLessons} lessons completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation - Fixed at bottom with refined styling */}
        <div
          ref={lessonTourRefs.navButtons}
          className={`bg-white border-t shadow-lg flex-shrink-0 sm:sticky sm:bottom-0 z-20 transition-all duration-300 ${showCoursePageTour && coursePageTourStep === 5 ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-50' : ''}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Previous Lesson Button */}
              <Button
                variant="outline"
                onClick={onPreviousLesson}
                disabled={isFirstLesson}
                className="flex items-center gap-2 px-6 py-3 h-12 min-w-[140px] w-full sm:w-auto transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </Button>

              {/* Center Actions - Completion Status Display */}
              <div className="flex flex-col items-center gap-2 order-3 sm:order-none">
                {isLoadingCompletionStatus ? (
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>Loading lesson status...</span>
                  </div>
                ) : isCompleted ? (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Lesson Completed!</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>
                        {Math.floor((requiredTimeMinutes * 60 - timeRemainingSeconds) / 60)}:{String((requiredTimeMinutes * 60 - timeRemainingSeconds) % 60).padStart(2, '0')} / {requiredTimeMinutes}:00
                      </span>
                      {!isCompleted && (
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-1.5 text-xs text-slate-500 hover:text-slate-700" onClick={openTimerEdit} title="Change countdown time">
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="w-48 mt-1 mx-auto">
                      <Progress 
                        value={((requiredTimeMinutes * 60 - timeRemainingSeconds) / (requiredTimeMinutes * 60)) * 100} 
                        className="h-2"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {timeRequirementMet ? 'Time requirement met!' : `${Math.ceil(timeRemainingSeconds / 60)} min remaining`}
                    </p>
                  </div>
                )}
              </div>

              {/* Unit Progress Indicator */}
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg order-2 sm:order-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-blue-800 font-medium">
                    {(() => {
                      // Find the unit's position in the course (1-based)
                      const unitIndex = course.units?.findIndex((u: any) => u.id === currentUnit?.id) ?? -1;
                      const unitNumber = unitIndex >= 0 ? unitIndex + 1 : 1;
                      return `Unit ${unitNumber}: ${currentUnit?.title}`;
                    })()}
                  </span>
                </div>
                <div className="text-blue-600 text-sm">
                  {(() => {
                    const unitLessons = currentUnit?.lessons || [];
                    // Use the lesson's order property to show logical lesson number
                    // The order property represents the intended lesson sequence (1, 2, 3...)
                    const lessonOrder = currentLesson?.order || 1;
                    return `Lesson ${lessonOrder} of ${unitLessons.length}`;
                  })()}
                </div>
              </div>


              {/* Next Lesson/Unit Button - Disabled until timer completes */}
              <Button
                onClick={handleSmartNextLesson}
                disabled={isCompletingLesson || isLoadingCompletionStatus || (!timeRequirementMet && !isCompleted)}
                className={`flex items-center gap-2 px-8 py-3 h-12 min-w-[160px] font-semibold transition-all duration-200 hover:shadow-lg ${
                  !timeRequirementMet && !isCompleted && !isCompletingLesson && !isLoadingCompletionStatus
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
                    : isLastLesson 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
                title={
                  isLoadingCompletionStatus 
                    ? 'Loading lesson status...' 
                    : !timeRequirementMet && !isCompleted
                      ? `Timer must complete before proceeding (${Math.ceil(timeRemainingSeconds / 60)} min remaining)`
                      : ''
                }
              >
                {isCompletingLesson ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Completing...
                  </>
                ) : isLoadingCompletionStatus ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : !timeRequirementMet && !isCompleted ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Timer Active
                  </>
                ) : (
                  <>
                    {isLastLesson ? 'Finish Course' : (() => {
                      // Check if this is the last lesson in the current unit
                      const unitLessons = currentUnit?.lessons || [];
                      const currentLessonIndex = unitLessons.findIndex((l: any) => l.id === currentLesson.id);
                      const isLastInUnit = currentLessonIndex === unitLessons.length - 1;
                      return isLastInUnit ? 'Next Unit' : 'Next Lesson';
                    })()}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
