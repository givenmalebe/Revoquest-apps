import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Play, 
  FileText, 
  Star,
  CheckCircle,
  Clock,
  Users,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Settings,
  ArrowLeft,
  Eye,
  Bot,
  Compass,
  MessageCircle,
  X,
  ChevronLeft,
  Target,
  Lock
} from "lucide-react";
import { getQuizAverageForExam, QUIZ_AVERAGE_FOR_EXAM_PERCENT } from '@/utils/quizAverage';
import {
  computeLearnerCourseProgress,
  getFinalExamDisplayScore,
  hasPassedFinalExam,
} from '@/utils/finalExamProgress';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment' | 'challenge';
  duration: string;
  completed: boolean;
  content?: string;
  youtubeUrl?: string;
  description?: string;
  objectives?: string[];
  resources?: (string | { id: string; type: string; title: string; url?: string; addedAt: string; file?: any })[];
}

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  completed: boolean;
  /** Unit-level quiz shown on the last lesson of the unit */
  quizContent?: {
    questions: {
      id: string;
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
      options?: string[];
      correctAnswer?: string | string[];
      explanation?: string;
      points?: number;
    }[];
    passingScore: number;
    timeLimit?: number;
    totalPoints?: number;
    instructions?: string;
  };
}

interface CourseStructureViewProps {
  course: any; // Accept any course format and normalize it
  courseProgress?: any; // Progress data from the main dashboard
  onClose: () => void;
  onViewLesson?: (lesson: Lesson, unit: Unit, normalizedCourse?: any) => void;
  onViewUnitQuiz?: (unit: Unit) => void;
  onTakeExam?: () => void; // When exam is available (all lessons completed)
}

const CourseStructureView: React.FC<CourseStructureViewProps> = ({ course, courseProgress, onClose, onViewLesson, onViewUnitQuiz, onTakeExam }) => {
  // Debug: Log the raw course data
  console.log('CourseStructureView received course:', course);
  console.log('Course units:', course.units);
  console.log('Course modules:', course.modules);
  console.log('Course lessons count:', course.lessons);
  console.log('CourseStructureView received courseProgress:', courseProgress);
  console.log('Lesson progress data:', courseProgress?.lessonProgress);
  
  // Normalize course data to handle different formats
  const normalizeCourse = (rawCourse: any) => {
    const normalizedCourse = {
      id: rawCourse.id || '',
      title: rawCourse.title || 'Untitled Course',
      description: rawCourse.description || 'No description available',
      level: rawCourse.level || rawCourse.nqfLevel || 'Beginner',
      duration: rawCourse.duration || '40 hours',
      category: rawCourse.category || 'General',
      enrolledLearners: (() => {
        // Special case for John Do's Programming course - Fulufhelo is enrolled
        const isJohnDoProgramming = (rawCourse.instructor === 'John Do') || (rawCourse.title || '').toLowerCase().includes('programming');
        if (isJohnDoProgramming) {
          return 1; // Fulufhelo is enrolled
        }
        return rawCourse.enrolledLearners || rawCourse.enrollmentCount || 0;
      })(),
      rating: typeof rawCourse.rating === 'object' ? rawCourse.rating.average : (rawCourse.rating || 0),
      setaUnitStandards: rawCourse.setaUnitStandards || [],
      qctoQualifications: rawCourse.qctoQualifications || [],
      complianceStatus: rawCourse.complianceStatus || 'Pending Review',
      saqaId: rawCourse.saqaId || '',
      units: normalizeUnits(
        (rawCourse.units?.length ? rawCourse.units : rawCourse.modules) || []
      )
    };
    
    return normalizedCourse;
  };

  const normalizeUnits = (units: any[]): Unit[] => {
    if (!units || units.length === 0) {
      // Create a default unit if none exist
      return [{
        id: 'default-unit',
        title: 'Course Content',
        description: 'Main course content',
        lessons: [],
        completed: false
      }];
    }

    return units.map((unit, index) => ({
      id: unit.id?.toString() || `unit-${index}`,
      title: unit.title || `Unit ${index + 1}`,
      description: unit.description || '',
      lessons: normalizeLessons(unit.lessons || []),
      completed: unit.completed || false,
      // Keep unit-level quiz for LessonViewer (last lesson of unit)
      quizContent: unit.quizContent || undefined,
    }));
  };

  const normalizeLessons = (lessons: any[]): Lesson[] => {
    if (!lessons || lessons.length === 0) {
      return [];
    }

    // First normalize the lessons
    const normalizedLessons = lessons.map((lesson, index) => {
      // Check if this lesson is completed in the progress data
      const lessonId = lesson.id?.toString() || `lesson-${index}`;
      const isCompletedInProgress = courseProgress?.lessonProgress?.some(
        (lp: any) => lp.lessonId === lessonId && lp.completed === true
      ) || false;

      return {
        id: lessonId,
        title: lesson.title || `Lesson ${index + 1}`,
        type: lesson.type || 'video',
        duration: lesson.duration?.toString() || '15 min',
        completed: isCompletedInProgress, // Use progress data instead of course data
        content: lesson.content || lesson.description || '',
        youtubeUrl: lesson.youtubeUrl || lesson.videoUrl || '',
        description: lesson.description || '',
        objectives: lesson.objectives || [],
        resources: lesson.resources || [], // Keep as is - will be handled in rendering
        // Preserve content type fields
        readingContentType: lesson.readingContentType || 'text',
        googleSlidesUrl: lesson.googleSlidesUrl || '',
        uploadedFiles: lesson.uploadedFiles || [],
        richTextContent: lesson.richTextContent || '',
        readingContent: lesson.readingContent || undefined,
        pdfUrl: lesson.pdfUrl || '',
        quizContent: lesson.quizContent || undefined,
        // Preserve the order property for sorting
        order: lesson.order || index + 1
      };
    });

    // Sort lessons by their order property to maintain logical sequence
    return normalizedLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const normalizedCourse = normalizeCourse(course);
  
  // Debug: Log the normalized course data
  console.log('Normalized course:', normalizedCourse);
  console.log('Course units:', normalizedCourse.units);
  console.log('Total units:', normalizedCourse.units.length);
  
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(normalizedCourse.units[0] || null);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([normalizedCourse.units[0]?.id || '']);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const COURSE_PAGE_POPOUT_KEY = 'course_page_tour_popout_shown';
  const [showCourseStructureAIPopout, setShowCourseStructureAIPopout] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(COURSE_PAGE_POPOUT_KEY) === 'true' ? false : true
  );
  const [showCourseStructureTour, setShowCourseStructureTour] = useState(false);
  const [courseStructureTourStep, setCourseStructureTourStep] = useState(0);

  const dismissCoursePagePopout = () => {
    try {
      sessionStorage.setItem(COURSE_PAGE_POPOUT_KEY, 'true');
    } catch (_) {}
    setShowCourseStructureAIPopout(false);
  };

  const tourRefs = {
    backToDashboard: useRef<HTMLDivElement>(null),
    courseUnitsSidebar: useRef<HTMLDivElement>(null),
    lessonDetailsArea: useRef<HTMLDivElement>(null),
    viewFullLessonButton: useRef<HTMLButtonElement>(null),
  };

  useEffect(() => {
    if (!showCourseStructureTour) return;
    const step = courseStructureTourStep;
    const el =
      step === 0 || step === 1 ? tourRefs.backToDashboard.current
      : step === 2 ? tourRefs.courseUnitsSidebar.current
      : step === 3 ? tourRefs.viewFullLessonButton.current
      : step === 4 ? tourRefs.viewFullLessonButton.current
      : null;
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showCourseStructureTour, courseStructureTourStep]);

  const handleStartCourseStructureTour = () => {
    dismissCoursePagePopout();
    setShowCourseStructureTour(true);
    setCourseStructureTourStep(0);
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'article':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'quiz':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'challenge':
        return <Star className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Match completed lessons to current course structure; if final exam is passed, show 100%.
  const progressStats = computeLearnerCourseProgress(normalizedCourse, courseProgress);
  const totalLessons = progressStats.totalLessons;
  const completedLessons = progressStats.completedLessons;
  const progressPercentage = progressStats.progressPercentage;
  const completedUnits = progressStats.completedUnits;
  const completedLessonIds = (courseProgress?.lessonProgress || [])
    .filter((lp) => lp.completed)
    .map((lp) => lp.lessonId);
  
  // Debug logging
  console.log('CourseStructureView progress calculation:', {
    courseProgress,
    courseProgressStructure: courseProgress?.courseProgress,
    totalLessons,
    completedLessons,
    completedLessonIds,
    completedUnits,
    progressPercentage,
    examPassed: progressStats.examPassed,
    usingCourseProgress: !!courseProgress,
    normalizedCourseUnits: normalizedCourse.units.map(unit => ({
      id: unit.id,
      title: unit.title,
      lessonsCount: unit.lessons.length,
      lessonIds: unit.lessons.map(l => l.id),
      completedLessonsFromProperty: unit.lessons.filter(lesson => lesson.completed).length,
      completedLessonsFromProgressData: unit.lessons.filter(lesson => completedLessonIds.includes(lesson.id)).length,
      allLessonsCompleted: unit.lessons.length > 0 && unit.lessons.every(lesson => lesson.completed)
    }))
  });

  const firstUnit = normalizedCourse.units[0];
  const firstLesson = firstUnit?.lessons?.[0];

  const finalExamPassed = progressStats.examPassed || hasPassedFinalExam(courseProgress);
  const finalExamDisplayScore = getFinalExamDisplayScore(courseProgress);
  const lessonsCompleteForExam =
    progressStats.allLessonsDone || (totalLessons > 0 && progressPercentage >= 99);
  const quizGate = getQuizAverageForExam(normalizedCourse, courseProgress?.lessonProgress);
  const examAvailable =
    lessonsCompleteForExam && !!onTakeExam && !finalExamPassed && quizGate.meetsThreshold;
  const examLockedByQuizAverage =
    lessonsCompleteForExam && !finalExamPassed && !quizGate.meetsThreshold;
  const courseFullyComplete = finalExamPassed;

  const COURSE_STRUCTURE_TOUR_STEPS: { title: string; description: string }[] = [
    { title: 'Course View & Structure', description: "This page has two parts: on the **left**, **Course Units** with your progress and the list of units and lessons. On the **right**, you see the selected unit overview and lesson details. I'll walk you through each part." },
    { title: 'Back to Dashboard', description: '**Back to Dashboard** (top left with the arrow) returns you to your course list. The header also shows the course title and **Complete Course View & Structure**.' },
    { title: 'Course Units sidebar', description: `In the **Course Units** panel: see **${normalizedCourse.units.length} units • ${totalLessons} lessons**, the **Course Progress** bar (${progressPercentage}% complete, ${completedLessons} of ${totalLessons} lessons completed), and the list of units. Expand a unit to see its lessons; **click a lesson** to show its details on the right.` },
    { title: 'Lesson details and View Full Lesson', description: 'On the right you see the **unit overview** and the **selected lesson**—title, description, learning objectives, and content preview (e.g. video). The orange **View Full Lesson** button opens the actual lesson page where you learn and complete the lesson. **Click View Full Lesson** to go to the lesson page.' },
    { title: "Open the first lesson", description: "I'll open the first lesson now so you see the lesson page. There we'll tour the content area and the buttons to move through every lesson." },
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* AI greeting popout – centered, when opening course (structure) */}
      {showCourseStructureAIPopout && (
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
                      Welcome to {normalizedCourse.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      I'll take a tour with you and open the first lesson so you see every page and learn the buttons.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                        onClick={handleStartCourseStructureTour}
                      >
                        <Compass className="w-4 h-4 mr-2" />
                        Take a tour
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 shrink-0"
                        onClick={() => {
                          dismissCoursePagePopout();
                          window.location.assign('/ai-tutor');
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

      {/* Course structure tour */}
      {showCourseStructureTour && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Step {courseStructureTourStep + 1} of {COURSE_STRUCTURE_TOUR_STEPS.length}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {COURSE_STRUCTURE_TOUR_STEPS[courseStructureTourStep].title}
                  </h3>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {COURSE_STRUCTURE_TOUR_STEPS[courseStructureTourStep].description.replace(/\*\*(.*?)\*\*/g, '$1')}
              </p>
              <div className="flex items-center justify-between mt-6 gap-3">
                <div>
                  {courseStructureTourStep > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCourseStructureTourStep((s) => s - 1);
                      }}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
                <div className="flex gap-2">
                  {courseStructureTourStep < COURSE_STRUCTURE_TOUR_STEPS.length - 1 ? (
                    <Button
                      onClick={() => setCourseStructureTourStep((s) => s + 1)}
                      className="gap-1 bg-orange-500 hover:bg-orange-600"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      {firstLesson && firstUnit && onViewLesson ? (
                        <Button
                          onClick={() => {
                            setShowCourseStructureTour(false);
                            setCourseStructureTourStep(0);
                            onViewLesson(firstLesson, firstUnit);
                          }}
                          className="gap-1 bg-orange-500 hover:bg-orange-600"
                        >
                          Open first lesson
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowCourseStructureTour(false);
                            setCourseStructureTourStep(0);
                          }}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Finish tour
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div
        ref={tourRefs.backToDashboard}
        className={`bg-white border-b sticky top-0 z-10 transition-all duration-300 ${showCourseStructureTour && (courseStructureTourStep === 0 || courseStructureTourStep === 1) ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-50' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{normalizedCourse.title}</h1>
                <p className="text-sm text-gray-600">Complete Course View & Structure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {normalizedCourse.enrolledLearners} learners
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {normalizedCourse.duration}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {normalizedCourse.rating}/5
              </Badge>
              <Badge
                variant={normalizedCourse.complianceStatus === 'Compliant' ? 'default' :
                        normalizedCourse.complianceStatus === 'Pending Review' ? 'secondary' : 'destructive'}
              >
                {normalizedCourse.complianceStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Course Overview Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Details */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{normalizedCourse.title}</h2>
                  <p className="text-blue-100">{normalizedCourse.level} • {normalizedCourse.category}</p>
                </div>
              </div>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                {normalizedCourse.description}
              </p>

              {/* Course Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{normalizedCourse.units.length}</div>
                  <div className="text-sm text-blue-100">Units</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{totalLessons}</div>
                  <div className="text-sm text-blue-100">Lessons</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">
                    {completedUnits}/{normalizedCourse.units.length}
                  </div>
                  <div className="text-sm text-blue-100">Units Completed</div>
                  {normalizedCourse.units.length > 0 && (
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedUnits / normalizedCourse.units.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{normalizedCourse.rating || 0}</div>
                  <div className="text-sm text-blue-100">Rating</div>
                </div>
              </div>
            </div>

            {/* Progress & Compliance */}
            <div className="space-y-6">
              {/* Progress Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Completion</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-white/20" />
                  <div className="text-sm text-blue-100">
                    {completedLessons} of {totalLessons} lessons completed
                  </div>
                </div>
              </div>

              {/* Compliance Info */}
              {(normalizedCourse.saqaId || normalizedCourse.setaUnitStandards?.length > 0) && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Compliance</h3>
                  <div className="space-y-2">
                    {normalizedCourse.saqaId && (
                      <div className="flex justify-between text-sm">
                        <span>SAQA ID:</span>
                        <span className="font-medium">{normalizedCourse.saqaId}</span>
                      </div>
                    )}
                    {normalizedCourse.setaUnitStandards?.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>SETA Standards:</span>
                        <span className="font-medium">{normalizedCourse.setaUnitStandards.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className="font-medium">
                        {courseFullyComplete ? 'Completed' : (normalizedCourse.complianceStatus || '—')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {!normalizedCourse.saqaId && !normalizedCourse.setaUnitStandards?.length && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Compliance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className="font-medium">
                        {courseFullyComplete ? 'Completed' : (normalizedCourse.complianceStatus || '—')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div
            ref={tourRefs.courseUnitsSidebar}
            className={`lg:col-span-1 transition-all duration-300 ${showCourseStructureTour && courseStructureTourStep === 2 ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-50 rounded-xl' : ''}`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Units
                </CardTitle>
                <CardDescription>
                  {normalizedCourse.units.length} units • {totalLessons} lessons
                  {totalLessons === 0 && (
                    <span className="block text-orange-600 font-medium mt-1">
                      ⚠️ No lessons created yet
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Progress Overview */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Course Progress</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {totalLessons > 0 ? (
                      `${completedLessons} of ${totalLessons} lessons completed`
                    ) : (
                      "No lessons available yet"
                    )}
                  </div>
                </div>

                {/* Take exam – only while not yet passed and quiz average is 75%+ */}
                {examAvailable && (
                  <Button
                    className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={onTakeExam}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Take final exam
                  </Button>
                )}
                {examLockedByQuizAverage && (
                  <div className="w-full mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                    <Lock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-amber-900">Final exam locked</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Quiz average {quizGate.average ?? 0}% · need {QUIZ_AVERAGE_FOR_EXAM_PERCENT}%
                      {quizGate.required > 0 ? ` (${quizGate.taken}/${quizGate.required} quizzes)` : ''}
                    </p>
                  </div>
                )}
                {courseFullyComplete && (
                  <div className="w-full mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-emerald-800">Course complete (100%)</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Final exam passed — certificate earned</p>
                  </div>
                )}

                {/* Units List */}
                <div className="space-y-2">
                  {normalizedCourse.units.map((unit, index) => (
                    <div key={unit.id} className="space-y-2">
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUnit?.id === unit.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{unit.title}</h4>
                            <p className="text-xs text-gray-600">
                              {unit.lessons.length} lessons
                              {unit.lessons.length === 0 && (
                                <span className="text-orange-600 ml-1">(Empty)</span>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUnitExpansion(unit.id);
                            }}
                          >
                            {expandedUnits.includes(unit.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {expandedUnits.includes(unit.id) && (
                        <div className="ml-4 space-y-1">
                          {unit.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-blue-50 border-l-2 border-l-blue-500'
                                  : 'hover:bg-gray-50'
                              }`}
                            onClick={() => {
                              console.log('Lesson clicked:', lesson);
                              console.log('Unit:', unit);
                              console.log('onViewLesson function:', onViewLesson);
                              if (onViewLesson) {
                                onViewLesson(lesson, unit);
                              } else {
                                setSelectedLesson(lesson);
                              }
                            }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold">{lessonIndex + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {getLessonIcon(lesson.type)}
                                    <span className="text-sm font-medium">{lesson.title}</span>
                                    {lesson.completed && <CheckCircle className="w-3 h-3 text-green-600" />}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {unit.quizContent?.questions?.length ? (
                            <div
                              className="p-2 rounded cursor-pointer transition-colors hover:bg-orange-50 border-l-2 border-l-orange-400"
                              onClick={() => {
                                if (onViewUnitQuiz) {
                                  onViewUnitQuiz(unit);
                                } else if (onViewLesson && unit.lessons?.length) {
                                  onViewLesson(unit.lessons[unit.lessons.length - 1], unit);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center">
                                  <Target className="w-3 h-3 text-orange-700" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-orange-900">Unit Quiz</span>
                                  <div className="text-xs text-orange-700">
                                    {unit.quizContent.questions.length} questions
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div ref={tourRefs.lessonDetailsArea} className="lg:col-span-3">
            {selectedUnit ? (
              <div className="space-y-6">
                {/* Unit Header */}
                <Card>
                  <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {normalizedCourse.units.findIndex(u => u.id === selectedUnit.id) + 1}
                          </span>
                        </div>
                      <div>
                        <CardTitle>{selectedUnit.title}</CardTitle>
                        <CardDescription>{selectedUnit.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Lessons Grid */}
                <div className="space-y-4">
                  {selectedUnit.lessons.length > 0 ? (
                    selectedUnit.lessons.map((lesson, index) => (
                    <Card key={lesson.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Lesson Info */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-gray-500">Lesson {index + 1}</span>
                                  {lesson.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                                  </Badge>
                                  <Badge variant={lesson.completed ? 'default' : 'secondary'} className="text-xs">
                                    {lesson.completed ? 'Completed' : 'Pending'}
                                  </Badge>
                                </div>
                                
                                {lesson.description && (
                                  <p className="text-gray-700 mb-4 leading-relaxed">{lesson.description}</p>
                                )}
                                
                                {lesson.content && (
                                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{lesson.content}</p>
                                )}

                                {/* Learning Objectives */}
                                {lesson.objectives && lesson.objectives.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Learning Objectives:</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {lesson.objectives.map((objective, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                          {objective}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              </div>
                            </div>
                          </div>

                          {/* Media/Content Preview */}
                          <div className="lg:col-span-1">
                            {lesson.youtubeUrl ? (
                              <div className="space-y-3">
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                  <iframe
                                    src={(() => {
                                      // Extract video ID from YouTube URL and convert to embed URL
                                      const url = lesson.youtubeUrl;
                                      if (!url) return '';
                                      
                                      // Handle different YouTube URL formats
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
                                      
                                      // If it's already an embed URL, return as is
                                      if (url.includes('youtube.com/embed/')) {
                                        return url;
                                      }
                                      
                                      return '';
                                    })()}
                                    title={lesson.title}
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Play className="w-3 h-3" />
                                  Video Content
                                </div>
                              </div>
                            ) : lesson.type === 'article' ? (
                              <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">Article Content</p>
                                <p className="text-xs text-gray-500 mt-1">Reading material available</p>
                              </div>
                            ) : lesson.type === 'quiz' ? (
                              <div className="bg-purple-50 rounded-lg p-6 text-center">
                                <Star className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                <p className="text-sm text-purple-700">Interactive Quiz</p>
                                <p className="text-xs text-purple-600 mt-1">Test your knowledge</p>
                              </div>
                            ) : (
                              <div className="bg-blue-50 rounded-lg p-6 text-center">
                                {getLessonIcon(lesson.type)}
                                <p className="text-sm text-blue-700 mt-3">
                                  {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} Content
                                </p>
                              </div>
                            )}

                            {/* Action Button */}
                            <Button
                              ref={index === 0 ? tourRefs.viewFullLessonButton : undefined}
                              className={`w-full mt-4 transition-all duration-300 ${showCourseStructureTour && (courseStructureTourStep === 3 || courseStructureTourStep === 4) ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white shadow-lg' : ''}`}
                              onClick={() => {
                                if (onViewLesson) {
                                  onViewLesson(lesson, selectedUnit, normalizedCourse);
                                } else {
                                  setSelectedLesson(lesson);
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Lesson
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  ) : null}

                {selectedUnit.quizContent?.questions?.length ? (
                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Target className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Unit Quiz</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedUnit.quizContent.questions.length} questions ·{' '}
                              {selectedUnit.quizContent.passingScore || 70}% to pass
                            </p>
                          </div>
                        </div>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                          onClick={() => {
                            if (onViewUnitQuiz) {
                              onViewUnitQuiz(selectedUnit);
                            } else if (onViewLesson && selectedUnit.lessons?.length) {
                              onViewLesson(selectedUnit.lessons[selectedUnit.lessons.length - 1], selectedUnit);
                            }
                          }}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Start unit quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Final exam – show when all lessons completed */}
                {examAvailable && (
                  <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Final Exam</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              All lessons completed. Take the final exam to complete the course.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                          onClick={onTakeExam}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Take final exam
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {examLockedByQuizAverage && (
                  <Card className="border-2 border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Final exam locked</h3>
                          <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
                            Your quiz average is {quizGate.average ?? 0}%. You need {QUIZ_AVERAGE_FOR_EXAM_PERCENT}% across all unit quizzes
                            {quizGate.required > 0 ? ` (${quizGate.taken}/${quizGate.required} completed)` : ''}.
                            Retake quizzes from the outline to raise your average.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {courseFullyComplete && (
                  <Card className="border-2 border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Course completed</h3>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-0.5">
                            You passed the final exam ({finalExamDisplayScore}%). Progress is 100% — no need to retake the exam.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUnit.lessons.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Yet</h3>
                        <p className="text-gray-600 mb-6">
                          This unit doesn't have any lessons yet. Start building your course content by adding lessons.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Lesson
                          </Button>
                          <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Unit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {examAvailable ? (
                  <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Final Exam</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              All lessons completed. Take the final exam to complete the course.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                          onClick={onTakeExam}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Take final exam
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : examLockedByQuizAverage ? (
                  <Card className="border-2 border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Final exam locked</h3>
                          <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
                            Your quiz average is {quizGate.average ?? 0}%. You need {QUIZ_AVERAGE_FOR_EXAM_PERCENT}% across all unit quizzes
                            {quizGate.required > 0 ? ` (${quizGate.taken}/${quizGate.required} completed)` : ''}.
                            Retake quizzes from the outline to raise your average.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : courseFullyComplete ? (
                  <Card className="border-2 border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Course completed</h3>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-0.5">
                            Final exam passed ({finalExamDisplayScore}%). Your course is 100% complete.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Unit</h3>
                    <p className="text-gray-600">Choose a unit from the sidebar to view its lessons</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStructureView;
