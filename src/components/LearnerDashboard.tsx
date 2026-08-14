import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Calendar,
  Trophy,
  Target,
  FileText,
  Star,
  Award,
  TrendingUp,
  Download,
  MessageCircle,
  Zap,
  Users,
  BarChart3,
  FileCheck,
  Medal,
  Crown,
  Flame,
  Shield,
  Bookmark,
  Upload,
  Folder,
  File,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FolderPlus,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Settings,
  Plus,
  Eye,
  X,
  Bot,
  Compass,
  Store,
  RefreshCw,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { persistentProgressService } from "../services/persistentProgressService";
import firebaseApiService from "@/services/firebaseApi";
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { LearnerGradingTab } from './LearnerGradingTab';
import { db } from '../firebase/config';
import { CommunityPage } from "./CommunityPage";
import { OnlineMeet } from "./OnlineMeet";
import CourseStructureView from "./CourseStructureView";
import LessonViewer from "./LessonViewer";
import { Calendar as CalendarComponent } from "./Calendar";
import UserAvatar from './UserAvatar';
import Timetable from './Timetable';
import { TimetableEventDialog } from './TimetableEventDialog';
import AITodoList from './AITodoList';
import { GradingService } from '@/services/gradingService';
import { CalendarService, CalendarEvent } from '@/services/calendarService';
import { DatabaseService } from '@/firebase/database';
import { Course as CourseType, CourseAssessment, AssessmentSubmission } from "@/firebase/database";
import { FileUploadService } from "@/services/fileUploadService";
import { EventDetailsDialog } from './EventDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import CourseCompletionSummary from './CourseCompletionSummary';
import { FinalExamView } from './FinalExamView';
import { createYocoCheckoutForLearner } from '@/services/yocoFunnelService';
import { isRevolearnDomain, aiTutorPath, funnelPath, setLearnerHomePath } from '@/utils/funnelPath';
import { getLearnerProgressSummary, shouldShowLearnerGreeting, markLearnerGreetingShown } from '@/services/learnerProgressForAIService';
import { getAIGreetingMessage } from '@/services/aiGreetingService';
import { learnerTodoService } from '@/services/learnerTodoService';
import {
  downloadCertificateBlob,
  generateCertificateFromTemplate,
} from '@/services/certificateTemplateService';
import { getQuizAverageForExam, quizAverageLockMessage } from '@/utils/quizAverage';
import {
  computeLearnerCourseProgress,
  hasPassedFinalExam,
  FINAL_EXAM_PASS_PERCENT,
} from '@/utils/finalExamProgress';

const MAX_FINAL_EXAM_ATTEMPTS = 5;

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string | {
    firstName: string;
    lastName: string;
    email: string;
  };
  level: string;
  duration: string;
  lessons: number;
  units?: any[];
  modules?: any[];
  enrolledLearners: number;
  enrolledStudents?: number;
  rating: number | {
    average: number;
    count: number;
  };
  complianceStatus: string;
  thumbnail?: string;
  category?: string;
  price?: number;
  isPublished?: boolean;
  assessments?: CourseAssessment[];
  assignedStudents?: string[];
  studentAssignments?: {
    studentId: string;
    assignedAt: string;
    status: 'active' | 'inactive' | 'pending';
    progress?: number;
  }[];
  enrollmentMode?: 'manual' | 'auto';
}

interface Enrollment {
  id: string;
  course: Course;
  enrolledAt: string;
  status: string;
  progress: {
    percentage: number;
    completedLessons: any[];
  };
}

const VALID_TABS = ['overview', 'marketplace', 'courses', 'grades', 'calendar', 'todos'] as const;

export const LearnerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    courses: syncedCourses,
    students,
    assignments,
    poeSubmissions,
    isLoading: syncLoading,
    enrollStudent,
    syncData,
    refreshCourses,
    submitPOE,
    getPOESubmissions,
    getStudentAssignments,
    submitAssignment,
    deletePOEFolder,
    deletePOESubmission,
    subscribeToUpdates
  } = useDataSync();
  
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => 
    tabFromUrl && VALID_TABS.includes(tabFromUrl as any) ? tabFromUrl : "overview"
  );

  // Sync activeTab with URL ?tab= so AI can open a tab (e.g. /lms?tab=calendar)
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'messages') setActiveTab('overview');
    else if (t && VALID_TABS.includes(t as any)) setActiveTab(t === 'todos' ? 'overview' : t);
  }, [searchParams]);
  const [hasError, setHasError] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [showCourseOverview, setShowCourseOverview] = useState(false);
  const [showLessonViewer, setShowLessonViewer] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentUnit, setCurrentUnit] = useState<any>(null);
  /** Separate step after a unit's last lesson — not inside the lesson */
  const [viewingUnitQuiz, setViewingUnitQuiz] = useState(false);
  const [courseProgress, setCourseProgress] = useState<{ [courseId: string]: any }>({});
  
  // POE Upload State
  const [selectedModule, setSelectedModule] = useState<{
    id: string;
    module: string;
    course: string;
    courseId: string;
    moduleNumber: number;
    isCompleted: boolean;
  } | null>(null);
  const [poeFilterModule, setPoeFilterModule] = useState<string>('all');
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState<string | null>(null);
  
  // Folder Management State
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [viewingFolderContents, setViewingFolderContents] = useState<string | null>(null);
  const [showFolderContents, setShowFolderContents] = useState(false);
  
  // Timetable and Todo state
  const [timetableEvents, setTimetableEvents] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false);
  const [selectedTimetableEvent, setSelectedTimetableEvent] = useState<any>(null);
  
  // Grading state
  const [summativeGrades, setSummativeGrades] = useState<any[]>([]);
  // Avg quiz score: true average % across all quizzes taken (from lesson progress)
  const [quizPassRatePercent, setQuizPassRatePercent] = useState<number | null>(null);
  
  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [isProcessingEvent, setIsProcessingEvent] = useState(false);

  // Just paid? Add my course (manual enrollment sync)
  const [addCourseLoading, setAddCourseLoading] = useState(false);

  // My Courses: direct from Firebase so we always show what's in Firestore
  const [myCoursesFromFirebase, setMyCoursesFromFirebase] = useState<(Course & { units?: any[]; modules?: any[] })[] | null>(null);
  const [myCoursesFromFirebaseLoading, setMyCoursesFromFirebaseLoading] = useState(false);
  
  // Course Assessment state
  const [courseAssessments, setCourseAssessments] = useState<(CourseAssessment & { courseId?: string; courseTitle?: string })[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<(CourseAssessment & { courseId?: string; courseTitle?: string }) | null>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState<any[]>([]);
  const [uploadingSubmission, setUploadingSubmission] = useState(false);
  
  // Course completion summary state
  const [showCourseCompletionSummary, setShowCourseCompletionSummary] = useState(false);
  const [courseCompletionData, setCourseCompletionData] = useState<any>(null);
  // Final exam after last lesson (before completion summary)
  const [showFinalExam, setShowFinalExam] = useState(false);
  
  // Marketplace: all available courses for browse & enroll
  const [marketplaceCourses, setMarketplaceCourses] = useState<CourseType[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceCategoryFilter, setMarketplaceCategoryFilter] = useState('all');
  const [payingCourseId, setPayingCourseId] = useState<string | null>(null);

  // AI greeting popout (center screen, every time learner lands on dashboard)
  const [showAIGreetingPopout, setShowAIGreetingPopout] = useState(false);
  /** Full message from the AI tutor (includes progress, quizzes, exam taken, and what might need to happen) */
  const [aiGreetingMessage, setAiGreetingMessage] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // Show AI greeting popout whenever the learner lands on the dashboard; message is generated by the AI tutor from full progress (courses, quizzes, exams)
  useEffect(() => {
    if (!user?.id || user?.role !== 'learner') return;
    let cancelled = false;
    getLearnerProgressSummary(user.id)
      .then(async (summary) => {
        if (cancelled) return;
        setShowAIGreetingPopout(true);
        setAiGreetingMessage(null); // show loading until AI responds
        try {
          const message = await getAIGreetingMessage(summary, user?.firstName || user?.email || '');
          if (!cancelled) setAiGreetingMessage(message);
        } catch {
          if (!cancelled) {
            setAiGreetingMessage(
              summary.courseCount === 0
                ? "I'm here whenever you're ready to start—I can help with lessons, quizzes, and your final exam when you get there."
                : `You're ${summary.overallPercent}% through your courses. I see your progress and any exams you've taken—chat anytime for feedback or to get ready for your next step.`
            );
          }
        }
      })
      .catch(() => {
        if (!cancelled && shouldShowLearnerGreeting()) {
          markLearnerGreetingShown();
          setShowAIGreetingPopout(true);
          setAiGreetingMessage("I'm here to help with your courses, quizzes, and exams—chat whenever you like.");
        }
      });
    return () => { cancelled = true; };
  }, [user?.id, user?.role, user?.firstName, user?.email]);

  const loadMyCoursesFromFirebase = useCallback(async () => {
    if (!user?.id || user?.role !== 'learner') return;
    setMyCoursesFromFirebaseLoading(true);
    try {
      const enrollments = await DatabaseService.getEnrollments({ studentId: user.id });
      const courseIds = [...new Set(
        enrollments
          .filter((e) => e.status !== 'Dropped' && e.status !== 'Suspended')
          .map((e) => e.courseId)
      )];
      const coursePromises = courseIds.map((id) => DatabaseService.getCourse(id));
      const courses = (await Promise.all(coursePromises)).filter(Boolean) as (Course & { units?: any[]; modules?: any[] })[];
      setMyCoursesFromFirebase(courses);
    } catch (e) {
      console.error('Failed to load my courses from Firebase', e);
      setMyCoursesFromFirebase([]);
    } finally {
      setMyCoursesFromFirebaseLoading(false);
    }
  }, [user?.id, user?.role]);

  // After payment success: ensure course is enrolled (in case webhook didn't run), refetch courses so they appear in My Courses, then show the right toast.
  const paidHandled = useRef(false);
  useEffect(() => {
    if (searchParams.get('paid') !== '1' || !user?.id || paidHandled.current) return;
    paidHandled.current = true;
    const run = async () => {
      let enrolled = false;
      try {
        const { completeEnrollmentForCurrentUser } = await import('@/services/yocoFunnelService');
        const result = await completeEnrollmentForCurrentUser();
        enrolled = result?.success === true;
      } catch (_) {
        // Ignore: may already be enrolled via webhook
      }
      await refreshCourses?.();
      await syncData?.();
      await loadMyCoursesFromFirebase();
      if (enrolled) {
        toast({ title: 'Payment successful', description: "You're enrolled. The course is now in My Courses." });
      } else {
        toast({ title: 'Almost there', description: "If you just paid, click 'Just paid? Add my course' below to add it.", variant: 'default' });
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('paid');
        if (!next.has('tab')) next.set('tab', 'courses');
        return next;
      }, { replace: true });
    };
    run();
    const t2 = window.setTimeout(() => { refreshCourses?.(); syncData?.(); loadMyCoursesFromFirebase(); }, 2000);
    const t5 = window.setTimeout(() => { refreshCourses?.(); syncData?.(); loadMyCoursesFromFirebase(); }, 5000);
    return () => { clearTimeout(t2); clearTimeout(t5); };
  }, [searchParams, user?.id, syncData, refreshCourses, loadMyCoursesFromFirebase, setSearchParams, toast]);

  const handleJustPaidAddCourse = useCallback(async () => {
    setAddCourseLoading(true);
    try {
      const { completeEnrollmentForCurrentUser } = await import('@/services/yocoFunnelService');
      const result = await completeEnrollmentForCurrentUser();
      await refreshCourses?.();
      await syncData?.();
      await loadMyCoursesFromFirebase();
      if (result.success) {
        toast({ title: 'Course added', description: result.message || 'Your purchased course is now in My Courses.' });
      } else {
        toast({ title: 'No pending purchase', description: result.error || 'No recent purchase found. If you just paid, try again in a moment.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Could not add course', description: e instanceof Error ? e.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setAddCourseLoading(false);
    }
  }, [syncData, refreshCourses, loadMyCoursesFromFirebase, toast]);

  /** Start Yoco checkout immediately and redirect to the payment page. */
  const handlePayToEnroll = useCallback(async (course: CourseType | Course) => {
    const courseId = course.id;
    const price = Number(course.price ?? 0);
    if (price < 0.01) {
      toast({
        title: 'Cannot enroll',
        description: 'This course has no price set. Please contact support.',
        variant: 'destructive',
      });
      return;
    }
    setPayingCourseId(courseId);
    try {
      const baseUrl = window.location.origin;
      const onFunnel =
        isRevolearnDomain ||
        window.location.pathname.includes('/funnel') ||
        window.location.pathname === '/dashboard' ||
        window.location.pathname.startsWith('/dashboard');
      const successUrl = onFunnel
        ? `${baseUrl}${funnelPath('/dashboard')}?tab=courses&paid=1`
        : `${baseUrl}/lms?tab=courses&paid=1`;
      const cancelUrl = onFunnel
        ? `${baseUrl}${funnelPath('/dashboard')}?tab=marketplace`
        : `${baseUrl}/lms?tab=marketplace`;

      const result = await createYocoCheckoutForLearner({
        courseId,
        successUrl,
        cancelUrl,
      });
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      toast({
        title: 'Checkout failed',
        description: result.error || 'Could not open the payment page. Please try again.',
        variant: 'destructive',
      });
    } catch (e) {
      toast({
        title: 'Checkout failed',
        description: e instanceof Error ? e.message : 'Could not open the payment page. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPayingCourseId(null);
    }
  }, [toast]);

  // Load My Courses directly from Firebase on mount so we always show what's in Firestore
  useEffect(() => {
    if (!user?.id || user?.role !== 'learner') return;
    loadMyCoursesFromFirebase();
  }, [user?.id, user?.role, loadMyCoursesFromFirebase]);

  // When a learner has 0 courses: try to complete any pending purchase (e.g. just paid via Yoco but ?paid=1 was lost). Run once per session.
  const didAutoCompleteEnrollment = useRef(false);
  useEffect(() => {
    if (!user?.id || user?.role !== 'learner') return;
    if (myCoursesFromFirebase === null) return;
    if (Array.isArray(myCoursesFromFirebase) && myCoursesFromFirebase.length > 0) return;
    if (didAutoCompleteEnrollment.current) return;
    didAutoCompleteEnrollment.current = true;
    (async () => {
      try {
        const { completeEnrollmentForCurrentUser } = await import('@/services/yocoFunnelService');
        const result = await completeEnrollmentForCurrentUser();
        if (result?.success) {
          await refreshCourses?.();
          await loadMyCoursesFromFirebase();
        }
      } catch (_) {
        // Ignore
      }
    })();
  }, [user?.id, user?.role, myCoursesFromFirebase, loadMyCoursesFromFirebase, refreshCourses]);

  // After first registration: retry loading My Courses when we're on the tab with 0 courses so we pick up the newly enrolled course
  useEffect(() => {
    if (!user?.id || user?.role !== 'learner' || activeTab !== 'courses') return;
    if (myCoursesFromFirebase === null || (Array.isArray(myCoursesFromFirebase) && myCoursesFromFirebase.length > 0)) return;
    const t1 = window.setTimeout(() => loadMyCoursesFromFirebase(), 1500);
    const t2 = window.setTimeout(() => loadMyCoursesFromFirebase(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [user?.id, user?.role, activeTab, myCoursesFromFirebase, loadMyCoursesFromFirebase]);

  // Load all published courses for marketplace (browse & enroll)
  useEffect(() => {
    if (!user?.id || user?.role !== 'learner') return;
    let cancelled = false;
    setMarketplaceLoading(true);
    DatabaseService.getCourses({ isPublished: true })
      .then((list) => {
        if (!cancelled) setMarketplaceCourses(list);
      })
      .catch(() => {
        if (!cancelled) setMarketplaceCourses([]);
      })
      .finally(() => {
        if (!cancelled) setMarketplaceLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  const marketplaceCategories = useMemo(() => {
    const cats = new Set<string>();
    marketplaceCourses.forEach((c) => {
      if (c.category?.trim()) cats.add(c.category.trim());
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [marketplaceCourses]);

  const filteredMarketplaceCourses = useMemo(() => {
    const filtered =
      marketplaceCategoryFilter === 'all'
        ? marketplaceCourses
        : marketplaceCourses.filter(
            (c) => (c.category?.trim() || 'General') === marketplaceCategoryFilter
          );
    return DatabaseService.sortCoursesNewestFirst(filtered);
  }, [marketplaceCourses, marketplaceCategoryFilter]);

  // Load summative grades (for other uses)
  useEffect(() => {
    const loadSummativeGrades = async () => {
      if (!user?.id) return;
      try {
        const grades = await GradingService.getStudentCourseAssessmentGrades(user.id);
        const summative = grades.filter(g =>
          g.assessmentType === 'summative' && g.status === 'graded'
        );
        setSummativeGrades(summative);
      } catch (error) {
        console.error('Error loading summative grades:', error);
      }
    };
    loadSummativeGrades();
  }, [user?.id]);

  // Load average quiz score: the true average of the % the learner got on each quiz they took
  useEffect(() => {
    const loadQuizScoreAverage = async () => {
      if (!user?.id || user?.role !== 'learner') return;
      try {
        const allProgress = await persistentProgressService.getAllStudentProgress(user.id);
        const scores: number[] = [];
        for (const courseId of Object.keys(allProgress)) {
          const progress = await persistentProgressService.getStudentProgress(user.id, courseId);
          const lessonProgressList = progress?.lessonProgress || [];
          for (const lp of lessonProgressList) {
            if (typeof lp.score === 'number') {
              scores.push(lp.score);
            }
          }
        }
        if (scores.length === 0) {
          setQuizPassRatePercent(0);
        } else {
          const sum = scores.reduce((a, b) => a + b, 0);
          const avgRaw = sum / scores.length;
          const avgRounded = Number(avgRaw.toFixed(1)); // one decimal place to reflect true average
          setQuizPassRatePercent(avgRounded);
        }
      } catch (err) {
        console.error('Error loading quiz score average:', err);
        setQuizPassRatePercent(null);
      }
    };
    loadQuizScoreAverage();
  }, [user?.id, user?.role]);

  // Course assessment functions
  const handleAssessmentFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedAssessment || !user) return;

    setUploadingSubmission(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadedFile = await FileUploadService.uploadAssessmentSubmissionFile(
          file, 
          user.id, 
          selectedAssessment.courseId,
          selectedAssessment.id
        );
        return uploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setSubmissionFiles(prev => [...prev, ...uploadedFiles]);

      console.log('Assessment submission files uploaded successfully:', uploadedFiles);
    } catch (error) {
      console.error('Error uploading assessment submission files:', error);
    } finally {
      setUploadingSubmission(false);
    }
  };

  const removeSubmissionFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitAssessment = async () => {
    if (!selectedAssessment || !user || submissionFiles.length === 0) return;

    try {
      const submission: AssessmentSubmission = {
        id: `submission-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        learnerId: user.id,
        learnerName: user.firstName + ' ' + user.lastName,
        submittedAt: new Date().toISOString(),
        files: submissionFiles,
        status: 'submitted'
      };

      // Save submission to the assessments collection
      await DatabaseService.createAssessmentSubmission(selectedAssessment.id, submission);
      
      // Update local state
      setCourseAssessments(prev => 
        prev.map(assessment => 
          assessment.id === selectedAssessment.id
            ? {
                ...assessment,
                submissions: [...(assessment.submissions || []), submission]
              }
            : assessment
        )
      );

      toast({
        title: "Success",
        description: "Assessment submitted successfully"
      });

      setShowAssessmentDialog(false);
      setSubmissionFiles([]);
      setSelectedAssessment(null);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: `Failed to submit assessment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const downloadAssessmentFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  // POE Folders Interface
  interface POEFolder {
    id: string;
    name: string;
    moduleId?: string;
    moduleName?: string;
    courseId?: string;
    courseName?: string;
    createdAt: string;
    documentCount: number;
    parentFolder?: string;
  }
  
  // POE Folders - will be loaded from DataSyncContext
  const [poeFolders, setPoeFolders] = useState<POEFolder[]>([]);
  // Computed values from DataSyncContext
  const currentStudent = students.find(s => s.id === user?.id || s.email === user?.email);
  const enrolledCourseIds = useMemo(
    () => currentStudent?.enrolledCourses || user?.enrolledCourses || [],
    [currentStudent?.enrolledCourses, user?.enrolledCourses]
  );
  
  // Get assigned courses from all courses where this learner is assigned
  const assignedCourseIds = useMemo(() => {
    if (!user?.id) return [];
    return syncedCourses
      .filter(course => 
        course.assignedStudents?.includes(user.id) || 
        course.studentAssignments?.some(assignment => assignment.studentId === user.id)
      )
      .map(course => course.id);
  }, [syncedCourses, user?.id]);
  
  // Paid/owned courses come from actual enrollment records and the learner profile.
  const paidCourseIds = useMemo(() => {
    const directEnrollmentIds = myCoursesFromFirebase?.map(course => course.id) || [];
    return [...new Set([...enrolledCourseIds, ...directEnrollmentIds])];
  }, [enrolledCourseIds, myCoursesFromFirebase]);

  const hasPaidCourseAccess = useCallback((courseId: string) => {
    return paidCourseIds.includes(courseId);
  }, [paidCourseIds]);

  // Keep this name for existing downstream calculations, but do not include assigned-only courses.
  const allMyCourseIds = paidCourseIds;
  
  // Progress is now handled by persistentProgressService, not DataSyncContext
  // const myProgress = getStudentProgress(user?.id || '');
  const myPOESubmissions = getPOESubmissions(undefined, user?.id);

  // Use only real POE submissions from DataSyncContext
  const allPOESubmissions = myPOESubmissions;

  // Debug: Log POE submissions to verify folderId is present
  useEffect(() => {
    console.log('📄 All POE Submissions:', allPOESubmissions.length);
    console.log('📄 POE Submissions with folderId:', allPOESubmissions.filter(s => s.folderId).map(s => ({
      id: s.id,
      fileName: s.fileName,
      folderId: s.folderId,
      courseId: s.courseId
    })));
    console.log('📄 POE Submissions without folderId:', allPOESubmissions.filter(s => !s.folderId).map(s => ({
      id: s.id,
      fileName: s.fileName
    })));
  }, [allPOESubmissions]);

  const myAssignments = useMemo(() => {
    if (!user?.id) return [];
    try {
      return getStudentAssignments(user.id);
    } catch (error) {
      console.error('Error getting student assignments:', error);
      return [];
    }
  }, [user?.id, getStudentAssignments]);
  
  // Convert synced courses to local Course format - show only published courses the learner owns.
  const courses = useMemo(() => {
    console.log('LearnerDashboard - syncedCourses:', syncedCourses.length);
    console.log('LearnerDashboard - syncedCourses data:', syncedCourses);
    
    const filteredCourses = syncedCourses.filter(course => {
      console.log('LearnerDashboard - course:', course.title, 'isPublished:', course.isPublished);
      return course.isPublished && paidCourseIds.includes(course.id);
    });
    
    console.log('LearnerDashboard - filteredCourses:', filteredCourses.length);
    
    return filteredCourses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      level: course.level,
      duration: course.duration,
      lessons: course.lessons,
      units: course.units || course.modules || [],
      modules: course.modules || course.units || [],
      enrolledLearners: course.enrolledLearners || 0,
      rating: course.rating || 4.5,
      complianceStatus: (course as any).complianceStatus || 'Compliant',
      thumbnail: course.thumbnail,
      category: course.category,
      price: course.price,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
  }, [syncedCourses, paidCourseIds]);

  // Categorize course assessments by type for assessment display
  const formativeAssignments = courseAssessments.filter(assessment => 
    assessment.type === 'formative'
  );
  
  const summativeAssignments = courseAssessments.filter(assessment => 
    assessment.type === 'summative'
  );

  // Average quiz score: the % the learner got across all quizzes they took
  const displayAvgQuizScore = () => {
    if (quizPassRatePercent !== null) return quizPassRatePercent;
    return 0;
  };

  // Helper function to generate module names based on course category
  const getModuleName = (category: string, moduleNumber: number): string => {
    const moduleNames: { [key: string]: string[] } = {
      'Web Development': [
        'HTML Fundamentals',
        'CSS Styling & Layout',
        'JavaScript Basics',
        'DOM Manipulation',
        'Responsive Design',
        'Web APIs',
        'Frontend Frameworks',
        'Project Development'
      ],
      'Programming': [
        'Programming Fundamentals',
        'Variables & Data Types',
        'Control Structures',
        'Functions & Methods',
        'Object-Oriented Programming',
        'Data Structures',
        'Algorithms',
        'Final Project'
      ],
      'Database': [
        'Database Concepts',
        'SQL Fundamentals',
        'Database Design',
        'Normalization',
        'Advanced Queries',
        'Stored Procedures',
        'Database Security',
        'Performance Optimization'
      ],
      'Business': [
        'Business Fundamentals',
        'Market Analysis',
        'Strategic Planning',
        'Financial Management',
        'Operations Management',
        'Leadership Skills',
        'Project Management',
        'Business Ethics'
      ]
    };

    const categoryModules = moduleNames[category] || [
      'Foundation Concepts',
      'Core Principles',
      'Practical Applications',
      'Advanced Topics',
      'Case Studies',
      'Best Practices',
      'Integration',
      'Capstone Project'
    ];

    return categoryModules[moduleNumber - 1] || `Advanced Topic ${moduleNumber}`;
  };

  // Generate modules from enrolled courses
  const availableModules = courses
    .filter(course => enrolledCourseIds.includes(course.id))
    .flatMap(course => {
      // Generate modules for each enrolled course
      const moduleCount = Math.min(course.lessons || 6, 8); // Max 8 modules per course
      const courseProgressData = courseProgress[course.id];
      return Array.from({ length: moduleCount }, (_, index) => ({
        id: `${course.id}-module-${index + 1}`,
        module: `Module ${index + 1}: ${getModuleName(course.category, index + 1)}`,
        course: course.title,
        courseId: course.id,
        moduleNumber: index + 1,
        isCompleted: (courseProgressData?.progressPercentage || 0) > ((index + 1) / moduleCount) * 100
      }));
    });

  // Filter POE submissions based on selected module
  const filteredPOESubmissions = poeFilterModule === 'all' 
    ? myPOESubmissions 
    : myPOESubmissions.filter(poe => poe.moduleTitle === poeFilterModule);

  // Folder Management Functions
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: POEFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      moduleId: selectedModule?.id,
      moduleName: selectedModule?.module,
      courseId: selectedModule?.courseId,
      courseName: selectedModule?.course,
      createdAt: new Date().toISOString().split('T')[0],
      documentCount: 0,
      parentFolder: currentFolder || undefined
    };
    
    setPoeFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setSelectedModule(null);
    setShowCreateFolder(false);
    
    console.log('New folder created:', newFolder);
  };

  // Add function to assign module to existing folder
  const handleAssignModuleToFolder = (folderId: string, module: typeof selectedModule) => {
    if (!module) return;
    
    setPoeFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { 
            ...folder, 
            moduleId: module.id,
            moduleName: module.module,
            courseId: module.courseId,
            courseName: module.course
          }
        : folder
    ));
    
    console.log('Module assigned to folder:', folderId, module);
  };

  const handleOpenFolder = (folderId: string) => {
    const folder = poeFolders.find(f => f.id === folderId);
    if (folder) {
      setCurrentFolder(folderId);
      setFolderPath(prev => [...prev, folder.name]);
    }
  };

  const handleNavigateUp = () => {
    if (folderPath.length > 0) {
      setFolderPath(prev => prev.slice(0, -1));
      setCurrentFolder(null); // For simplicity, going back to root
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder? All documents inside will also be deleted.')) {
      try {
        // Use DataSyncContext delete method for proper backend integration
        await deletePOEFolder(folderId);
        
        // Update local state
        setPoeFolders(prev => prev.filter(f => f.id !== folderId));
        console.log('Folder deleted successfully:', folderId);
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert(`Failed to delete folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleViewFolderContents = (folderId: string) => {
    setViewingFolderContents(folderId);
    setShowFolderContents(true);
  };

  const handleCloseFolderContents = () => {
    setViewingFolderContents(null);
    setShowFolderContents(false);
  };

  // Get documents for a specific folder (memoized for performance)
  const getFolderDocuments = useCallback((folderId: string) => {
    const documents = allPOESubmissions.filter(submission => 
      submission.folderId === folderId
    );
    console.log(`📁 Folder ${folderId} documents:`, documents.length, documents.map(d => ({ id: d.id, fileName: d.fileName, folderId: d.folderId })));
    return documents;
  }, [allPOESubmissions]);

  // Get current folders to display (filtered by current location and module)
  const getCurrentFolders = () => {
    let folders = poeFolders;
    
    // Filter by module if selected
    if (poeFilterModule !== 'all') {
      const selectedModuleObj = availableModules.find(m => m.module === poeFilterModule);
      if (selectedModuleObj) {
        folders = folders.filter(f => f.moduleId === selectedModuleObj.id);
      }
    }
    
    // Filter by current folder location
    if (currentFolder) {
      folders = folders.filter(f => f.parentFolder === currentFolder);
    } else {
      folders = folders.filter(f => !f.parentFolder);
    }
    
    return folders;
  };

  // Create enrollments from current data. This intentionally excludes assigned-only courses.
  const enrollments: Enrollment[] = useMemo(() => {
    console.log('🎓 LearnerDashboard - courses for enrollments:', courses.length);
    console.log('🎓 LearnerDashboard - courses data:', courses.map(c => ({ id: c.id, title: c.title, isPublished: c.isPublished })));
    console.log('🎓 LearnerDashboard - allMyCourseIds:', allMyCourseIds);
    console.log('🎓 LearnerDashboard - assignedCourseIds:', assignedCourseIds);
    
    return courses
      .filter(course => paidCourseIds.includes(course.id))
      .map(course => {
      const courseProgressData = courseProgress[course.id];
      console.log(`🎓 Course "${course.title}":`, { id: course.id, progress: courseProgressData?.courseProgress?.progressPercentage });
      return {
        id: `enrollment-${course.id}`,
        course,
        enrolledAt: currentStudent?.joinDate || new Date().toISOString(),
        status: courseProgressData?.courseProgress?.progressPercentage === 100 ? 'completed' : 'active',
        progress: {
          percentage: courseProgressData?.courseProgress?.progressPercentage || 0,
          completedLessons: []
        }
      };
    });
  }, [courses, allMyCourseIds, assignedCourseIds, paidCourseIds, currentStudent?.joinDate]);

  // Function to refresh all course progress data
  const refreshAllCourseProgress = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Refreshing all course progress data for user:', user.id);
      
      // Get all enrolled courses
      const enrolledCourses = enrollments.map(enrollment => enrollment.course);
      
      // Load progress for each course
      const progressPromises = enrolledCourses.map(async (course) => {
        try {
          const progressData = await persistentProgressService.getStudentProgress(user.id, course.id);
          return { courseId: course.id, progressData };
        } catch (error) {
          console.error(`Error loading progress for course ${course.id}:`, error);
          return { courseId: course.id, progressData: null };
        }
      });
      
      const results = await Promise.all(progressPromises);
      
      // Update courseProgress state with all loaded data
      const progressMap: { [courseId: string]: any } = {};
      results.forEach(({ courseId, progressData }) => {
        if (progressData) {
          progressMap[courseId] = progressData;
        }
      });
      
      console.log('🔄 Updated courseProgress with refreshed data:', Object.keys(progressMap).length, 'courses');
      console.log('🔄 Progress data details:', Object.entries(progressMap).map(([courseId, data]) => ({
        courseId,
        hasCourseProgress: !!data.courseProgress,
        completedUnits: data.courseProgress?.completedUnits,
        totalUnits: data.courseProgress?.totalUnits,
        completedLessons: data.courseProgress?.completedLessons,
        totalLessons: data.courseProgress?.totalLessons
      })));
      setCourseProgress(prev => ({ ...prev, ...progressMap }));
      
    } catch (error) {
      console.error('❌ Error refreshing course progress:', error);
    }
  }, [user?.id]);

  // Note: Course progress data is loaded via real-time listener in useEffect above
  // No need to call refreshAllCourseProgress here as it would override the real-time data

  // Convert POE submissions to local format
  const poeUploads = useMemo(() => myPOESubmissions.map(submission => ({
    id: submission.id,
    moduleTitle: submission.moduleTitle,
    courseTitle: submission.courseName,
    fileName: submission.fileName,
    fileSize: submission.fileSize,
    uploadDate: submission.submittedAt,
    status: submission.status,
    feedback: submission.feedback,
    grade: submission.grade
  })), [myPOESubmissions]);

  // Set up real-time progress tracking with Firestore listeners
  useEffect(() => {
      if (!user?.id) {
      console.log('🔄 No user ID available for progress tracking');
        return;
      }
      
    console.log('🔄 Setting up real-time progress tracking for user:', user.id);

    // Create a Firestore query to listen to all student progress documents for this user
    const progressCollection = collection(db, 'studentProgress');
    const progressQuery = query(
      progressCollection,
      where('__name__', '>=', `${user.id}_`),
      where('__name__', '<=', `${user.id}_\uf8ff`)
    );

      // Set up the real-time listener
      const unsubscribe = onSnapshot(
        progressQuery,
        (querySnapshot) => {
          console.log('📊 Real-time progress update received, documents:', querySnapshot.size);

        const progressMap: { [courseId: string]: any } = {};
          const progressByCourse: { [courseId: string]: any[] } = {};

          // Group progress by course ID
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.courseProgress) {
              const courseId = data.courseProgress.courseId;
              if (!progressByCourse[courseId]) {
                progressByCourse[courseId] = [];
              }
              progressByCourse[courseId].push(data);
            }
          });

          // For each course, recalculate progress based on actual lesson completion
          for (const [courseId, progressList] of Object.entries(progressByCourse)) {
            if (progressList.length > 0) {
              // Get the most recent progress data
              const mostRecentProgress = progressList.reduce((best, current) => {
                const bestDate = new Date(best.courseProgress?.lastAccessedAt || 0);
                const currentDate = new Date(current.courseProgress?.lastAccessedAt || 0);
                return currentDate > bestDate ? current : best;
              });
              
              // Recalculate from course structure; passing the final exam always = 100%.
              const course = courses.find(c => c.id === courseId);
              if (!course) {
                console.log(`⏳ Course data not available yet for ${courseId}, skipping progress calculation`);
                progressMap[courseId] = mostRecentProgress;
                continue;
              }

              const stats = computeLearnerCourseProgress(course, mostRecentProgress);
              if (stats.totalLessons === 0) {
                progressMap[courseId] = mostRecentProgress;
                continue;
              }

              const correctedProgress = {
                ...mostRecentProgress,
                courseProgress: {
                  ...mostRecentProgress.courseProgress,
                  completedLessons: stats.completedLessons,
                  totalLessons: stats.totalLessons,
                  completedUnits: stats.completedUnits,
                  totalUnits: stats.totalUnits,
                  progressPercentage: stats.progressPercentage,
                  status: stats.status,
                  ...(stats.examPassed
                    ? { completedAt: mostRecentProgress.courseProgress?.completedAt || new Date().toISOString() }
                    : {}),
                }
              };
              
              progressMap[courseId] = correctedProgress;
              
              console.log(`✅ Recalculated progress for course ${courseId}: ${stats.completedLessons}/${stats.totalLessons} lessons (${stats.progressPercentage}%) examPassed=${stats.examPassed}`);
            }
          }

          console.log('📊 Setting course progress state with', Object.keys(progressMap).length, 'courses');
          console.log('📊 Progress map details:', Object.entries(progressMap).map(([id, prog]) => ({
            courseId: id,
            progress: prog.courseProgress.progressPercentage + '%',
            units: `${prog.courseProgress.completedUnits}/${prog.courseProgress.totalUnits}`,
            lessons: `${prog.courseProgress.completedLessons}/${prog.courseProgress.totalLessons}`
          })));
          setCourseProgress(prev => {
            const newState = { ...prev, ...progressMap };
            console.log('📊 New courseProgress state:', newState);
            console.log('📊 New courseProgress keys:', Object.keys(newState));
            return newState;
          });
        },
      (error) => {
        console.error('Error in progress listener:', error);
      }
    );

    // Clean up the listener when component unmounts
    return () => {
      console.log('🔄 Cleaning up progress listener');
      unsubscribe();
    };
  }, [user?.id]);


  // Recalculate completedUnits when both progress data and courses are available
  const recalculateCompletedUnits = useCallback(() => {
    if (Object.keys(courseProgress).length === 0 || courses.length === 0) {
      return;
    }

    console.log('🔧 Recalculating completedUnits for all courses...');
    
    const updatedProgress = { ...courseProgress };
    let hasChanges = false;

    for (const [courseId, progress] of Object.entries(courseProgress)) {
      if (progress && progress.courseProgress && progress.lessonProgress) {
        const course = courses.find(c => c.id === courseId);
        if (course && course.units) {
          const stats = computeLearnerCourseProgress(course, progress);
          
          if (
            progress.courseProgress.completedUnits !== stats.completedUnits ||
            progress.courseProgress.totalUnits !== stats.totalUnits ||
            progress.courseProgress.completedLessons !== stats.completedLessons ||
            progress.courseProgress.progressPercentage !== stats.progressPercentage
          ) {
            updatedProgress[courseId] = {
              ...progress,
              courseProgress: {
                ...progress.courseProgress,
                completedUnits: stats.completedUnits,
                totalUnits: stats.totalUnits,
                completedLessons: stats.completedLessons,
                totalLessons: stats.totalLessons,
                progressPercentage: stats.progressPercentage,
                status: stats.status,
              }
            };
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      setCourseProgress(updatedProgress);
    }
  }, [courseProgress, courses]);

  // Run recalculation when courses or progress data changes
  useEffect(() => {
    recalculateCompletedUnits();
  }, [recalculateCompletedUnits]);

  // Load calendar events
  useEffect(() => {
    if (!user?.id) return;

    console.log('📅 Loading calendar events for learner:', user.id);
    const unsubscribe = CalendarService.subscribeToUserEvents(user.id, (events) => {
      console.log('📅 Calendar events updated:', events.length);
      setCalendarEvents(events);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Load and sync todos from Firestore (AI-created and UI-created)
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = learnerTodoService.subscribeToTodos(user.id, (firestoreTodos) => {
      setTodos(firestoreTodos);
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((updateType: string, data: any) => {
      console.log('📡 Student received update:', updateType, data);
      
      switch (updateType) {
        case 'course_created':
        case 'course_updated':
          console.log('📚 Courses updated');
          break;
        case 'student_enrolled':
        case 'student_unenrolled':
          if (data.studentId === user?.id) {
            console.log('🎓 My enrollment status changed');
          }
          break;
        case 'progress_updated':
          if (data.studentId === user?.id) {
            console.log('📈 My progress updated');
            // Refresh progress when we receive a progress update
            refreshProgress();
          }
          break;
        case 'poe_reviewed':
          console.log('📄 POE submission reviewed');
          break;
      }
    });

    return unsubscribe;
  }, [subscribeToUpdates, user?.id]);

  // Note: Real-time progress tracking is now handled by Firestore listeners above
  // No need for periodic refreshes as changes are pushed automatically

  // Handle enrollment
  const handleEnroll = async (courseId: string) => {
    if (!user?.id) return;
    
    try {
      await enrollStudent(user.id, courseId);
      console.log('✅ Successfully enrolled in course');
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      setHasError(true);
    }
  };

  // Load progress for all enrolled courses
  const loadCourseProgress = async () => {
    if (!user) return;
    
    try {
      const progressMap: { [courseId: string]: any } = {};
      
      // Load progress for all courses, not just enrollments
      for (const course of courses) {
        const progress = await persistentProgressService.getStudentProgress(user.id, course.id);
        if (progress) {
          progressMap[course.id] = progress;
          console.log(`📊 Loaded progress for course ${course.id}:`, progress.courseProgress);
        } else {
          console.log(`📊 No progress found for course ${course.id}`);
        }
      }
      
      setCourseProgress(progressMap);
      console.log('📊 All course progress loaded:', progressMap);
    } catch (error) {
      console.error('Error loading course progress:', error);
    }
  };

  // Note: Course progress is now loaded via real-time Firestore listeners above
  // No manual loading needed - the real-time listener handles this automatically

  // Manual refresh progress function (for manual refresh button)
  // Note: This is optional since real-time listeners automatically update progress
  const refreshProgress = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Manual progress refresh triggered...');
      const allProgress = await persistentProgressService.getAllStudentProgress(user.id);
      console.log('📊 Manually refreshed progress:', allProgress);
      setCourseProgress(allProgress);
      } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  };

  // Progress updates are now handled by persistentProgressService
  // const handleProgressUpdate = async (courseId: string, progressData: any) => {
  //   if (!user?.id) return;
  //   
  //   try {
  //     await updateStudentProgress(user.id, courseId, progressData);
  //     console.log('📈 Progress updated successfully');
  //     } catch (error) {
  //     console.error('❌ Error updating progress:', error);
  //   }
  // };

  // Handle POE submission
  const handlePOEUpload = async (file: File, moduleTitle: string, courseId: string, folderId?: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, Word documents, and image files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find course or use first available course as fallback
      let course = courses.find(c => c.id === courseId);
      if (!course && courses.length > 0) {
        course = courses[0];
        console.log('📄 Using fallback course for POE upload:', course.title);
      }
      
      if (!course) {
        toast({
          title: "Error",
          description: "No courses available for POE upload",
          variant: "destructive",
        });
        return;
      }

      // Find folder if folderId is provided
      const folder = folderId ? poeFolders.find(f => f.id === folderId) : null;

      // Show loading state
      toast({
        title: "Uploading...",
        description: "Please wait while we upload your file",
      });

      // Upload file to Firebase Storage
      const uploadedFile = await FileUploadService.uploadPOEFile(
        file,
        user.id,
        course.id,
        folder?.moduleId || moduleTitle || 'unassigned'
      );
      
      console.log('📄 Uploading POE file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        moduleTitle: folder?.moduleName || moduleTitle,
        courseId: course.id,
        courseName: course.title,
        folderId: folderId
      });
      
      // Submit POE to Firestore
      await submitPOE({
        studentId: user.id,
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
        courseId: course.id,
        courseName: course.title,
        moduleTitle: folder?.moduleName || moduleTitle,
        fileName: file.name,
        fileUrl: uploadedFile.url,
        fileSize: file.size,
        fileType: uploadedFile.type,
        folderId: folderId,
        description: folder ? `Portfolio evidence uploaded to ${folder.name}` : `Portfolio evidence for ${moduleTitle}`
      });
      
      toast({
        title: "Upload Successful",
        description: `File "${file.name}" has been uploaded and is pending review.`,
      });
      
      console.log('📄 POE submitted and saved to Firestore successfully');
    } catch (error: any) {
      console.error('❌ Error submitting POE:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Data is now managed by DataSyncContext, no need for separate fetching or logging

  // Computed values for UI
  const enrolledCourses = useMemo(() => {
    const courses = enrollments.map(enrollment => enrollment.course);
    console.log('🎓 Enrolled courses computed:', courses.length);
    console.log('🎓 Enrolled courses details:', courses.map(c => ({ id: c.id, title: c.title })));
    return courses;
  }, [enrollments]);

  // My Courses tab: prefer list loaded directly from Firebase so we always show what's in Firestore
  const myCoursesForDisplay = useMemo(() => {
    if (myCoursesFromFirebase !== null) {
      return myCoursesFromFirebase.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        instructor: c.instructor,
        level: (c as any).level || 'Beginner',
        duration: c.duration,
        lessons: c.lessons,
        units: c.units || c.modules || [],
        modules: c.modules || c.units || [],
        enrolledLearners: c.enrolledLearners || 0,
        rating: c.rating || 4.5,
        complianceStatus: (c as any).complianceStatus || 'Compliant',
        thumbnail: c.thumbnail,
        category: c.category,
        price: c.price,
        isPublished: c.isPublished !== false,
        ...c
      }));
    }
    return enrolledCourses;
  }, [myCoursesFromFirebase, enrolledCourses]);
  
  // Load course assessments for enrolled courses
  useEffect(() => {
    const loadCourseAssessments = async () => {
      if (!user?.id || !enrolledCourses.length) {
        console.log('🎓 No user ID or enrolled courses:', { userId: user?.id, enrolledCoursesCount: enrolledCourses.length });
        return;
      }

      try {
        const allAssessments: (CourseAssessment & { courseId?: string; courseTitle?: string })[] = [];
        
        // Get enrolled course IDs for filtering
        const enrolledCourseIds = enrolledCourses.map(course => course.id);
        console.log('🎓 Enrolled course IDs:', enrolledCourseIds);
        
        // Check specifically for Programming course
        const programmingCourse = enrolledCourses.find(c => c.title.includes('Programming'));
        console.log('🎓 Programming course found:', programmingCourse ? {
          id: programmingCourse.id,
          title: programmingCourse.title,
          isPublished: programmingCourse.isPublished
        } : 'NOT FOUND');
        
        // Load assessments from standalone assessments collection
        const standaloneAssessments = await DatabaseService.getAssessments({
          courseId: undefined, // Get all assessments
          isPublished: true // Only published assessments
        });
        
        console.log('🎓 Loaded standalone assessments:', standaloneAssessments.length);
        console.log('🎓 All assessments details:', standaloneAssessments.map(a => ({ 
          id: a.id, 
          title: a.title, 
          type: a.type, 
          courseId: a.courseId,
          assignedLearners: a.assignedLearners 
        })));
        
        // Test: Load ALL assessments without any filters to see what exists
        const allAssessmentsTest = await DatabaseService.getAssessments();
        console.log('🧪 TEST: All assessments in Firebase (no filters):', allAssessmentsTest.length);
        console.log('🧪 TEST: All assessments details:', allAssessmentsTest.map(a => ({ 
          id: a.id, 
          title: a.title, 
          type: a.type, 
          courseId: a.courseId,
          courseName: a.courseName,
          isPublished: a.isPublished
        })));
        
        // Test: Load assessments specifically for Programming course
        if (programmingCourse) {
          const programmingAssessments = await DatabaseService.getAssessments({
            courseId: programmingCourse.id,
            isPublished: true
          });
          console.log('🧪 TEST: Programming course assessments:', programmingAssessments.length);
          console.log('🧪 TEST: Programming assessments details:', programmingAssessments.map(a => ({ 
            id: a.id, 
            title: a.title, 
            type: a.type, 
            courseId: a.courseId,
            courseName: a.courseName
          })));
        }
        
        // Filter assessments for enrolled courses
        const relevantAssessments = standaloneAssessments.filter(assessment => {
          // Check if assessment is for an enrolled course
          const isForEnrolledCourse = enrolledCourseIds.includes(assessment.courseId);
          
          // Check if this is for the Programming course specifically
          const programmingCourse = enrolledCourses.find(c => c.title.includes('Programming'));
          const isForProgrammingCourse = programmingCourse && assessment.courseId === programmingCourse.id;
          
          // For now, show all assessments for enrolled courses
          // TODO: Later we can implement proper learner assignment logic
          const isAssignedToLearner = true; // Show to all enrolled learners
          
          console.log(`🎓 Assessment "${assessment.title}":`, {
            courseId: assessment.courseId,
            courseName: assessment.courseName,
            isForEnrolledCourse,
            isForProgrammingCourse,
            programmingCourseId: programmingCourse?.id,
            assignedLearners: assessment.assignedLearners,
            isAssignedToLearner,
            userId: user.id
          });
          
          return isForEnrolledCourse && isAssignedToLearner;
        });
        
        console.log('🎓 Relevant assessments after filtering:', relevantAssessments.length);
        
        // Add course context to each assessment
        const courseAssessments = relevantAssessments.map(assessment => {
          const course = enrolledCourses.find(c => c.id === assessment.courseId);
          return {
            ...assessment,
            courseId: assessment.courseId,
            courseTitle: course?.title || assessment.courseName
          };
        });
        
        allAssessments.push(...courseAssessments);
        
        // Also check for assessments within course objects (for backward compatibility)
        for (const course of enrolledCourses) {
          if (course.assessments && course.assessments.length > 0) {
            // Filter assessments that are assigned to this learner
            const assignedAssessments = course.assessments.filter(assessment => {
              const hasAssignedLearners = assessment.assignedLearners && assessment.assignedLearners.length > 0;
              const isAssignedToLearner = hasAssignedLearners ? assessment.assignedLearners.includes(user.id) : true;
              
              console.log(`Course Assessment "${assessment.title}":`, {
                hasAssignedLearners,
                assignedLearners: assessment.assignedLearners,
                isAssignedToLearner,
                userId: user.id
              });
              
              return isAssignedToLearner;
            });
            
            // Add course context to each assessment
            const courseAssessments = assignedAssessments.map(assessment => ({
              ...assessment,
              courseId: course.id,
              courseTitle: course.title
            }));
            allAssessments.push(...courseAssessments);
          }
        }
        
        console.log('🎓 Total loaded assessments for learner:', allAssessments.length);
        console.log('🎓 Assessment details:', allAssessments.map(a => ({ 
          title: a.title, 
          type: a.type, 
          courseTitle: a.courseTitle,
          assignedLearners: a.assignedLearners 
        })));
        
        setCourseAssessments(allAssessments);
      } catch (error) {
        console.error('Error loading course assessments:', error);
      }
    };

    loadCourseAssessments();
  }, [user?.id, enrolledCourses]);
  
  const totalProgress = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    
    const totalProgressSum = enrolledCourses.reduce((sum, course) => {
      const progressData = courseProgress[course.id];
      const progressPercentage = progressData?.courseProgress?.progressPercentage || 0;
      return sum + progressPercentage;
    }, 0);
    
    return Math.round(totalProgressSum / enrolledCourses.length);
  }, [enrolledCourses, courseProgress]);

  // POE file upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, moduleTitle: string, courseId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePOEUpload(file, moduleTitle, courseId);
    }
  };

  // Assessment download handler
  const handleDownloadAssessment = async (assessment: any) => {
    try {
      if (!assessment) {
        throw new Error('Assessment not found');
      }
      
      // If assessment has files, download them
      if (assessment.files && assessment.files.length > 0) {
        assessment.files.forEach((file: any) => {
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        console.log(`Downloaded ${assessment.files.length} file(s) for assessment: ${assessment.title}`);
      } else {
        // If no files, create a text summary
        const course = enrolledCourses.find(c => c.id === assessment.courseId);
        const courseName = course?.title || 'Course';
        
        const assessmentContent = `
${assessment.type.toUpperCase()}: ${assessment.title}
Course: ${courseName}
Instructor: ${assessment.instructorName || 'Unknown'}
Due Date: ${assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'Not specified'}
Max Marks: ${assessment.maxMarks}
Passing Score: ${assessment.passingScore}
Status: ${assessment.isPublished ? 'Published' : 'Draft'}

DESCRIPTION:
${assessment.description || 'No description provided'}

INSTRUCTIONS:
${assessment.instructions || 'No instructions provided'}

---
Downloaded from Student Portal
Generated on: ${new Date().toLocaleString()}
        `;
        
        const blob = new Blob([assessmentContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assessment.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${assessment.type.toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        console.log(`Downloaded assessment summary: ${assessment.title}`);
      }
    } catch (error) {
      console.error('Error downloading assessment:', error);
      alert('Error downloading assessment. Please try again.');
    }
  };


  const handlePoeUpload = async (event: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, Word documents, and image files are allowed",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const folder = poeFolders.find(f => f.id === folderId);
    if (!folder) {
      toast({
        title: "Error",
        description: "Folder not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      toast({
        title: "Uploading...",
        description: "Please wait while we upload your file",
      });

      // Upload file to Firebase Storage
      const uploadedFile = await FileUploadService.uploadPOEFile(
        file,
        user.id,
        folder.courseId || 'unassigned',
        folder.moduleId || 'unassigned'
      );

      // Submit POE to Firestore
      await submitPOE({
        studentId: user.id,
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
        courseId: folder.courseId || 'unassigned',
        courseName: folder.courseName || 'Unassigned Course',
        moduleTitle: folder.moduleName || 'Unassigned Module',
        fileName: file.name,
        fileUrl: uploadedFile.url,
        fileSize: file.size,
        fileType: uploadedFile.type,
        folderId: folderId,
        description: `Portfolio evidence uploaded to ${folder.name}`
      });

      // Note: Folder document count is calculated dynamically from submissions
      // No need to manually update documentCount

      toast({
        title: "Upload Successful",
        description: `File "${file.name}" has been uploaded and is pending review.`,
      });
    } catch (error: any) {
      console.error('Error uploading POE:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset the input
    event.target.value = '';
  };

  const handleDeletePoe = (poeId: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      console.log('POE deleted:', poeId); // Handled by DataSync
      alert('Submission deleted successfully');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewCourse = (course: Course) => {
    console.log('handleViewCourse called with course:', course);
    if (!hasPaidCourseAccess(course.id)) {
      toast({
        title: "Payment required",
        description: "Please pay to enroll before opening this course.",
        variant: "destructive"
      });
      setActiveTab('marketplace');
      return;
    }

    setSelectedCourse(course);
    
    // ALWAYS start from lesson 1 when viewing a course
    const sortedLessons = getSortedLessons(course);
    setCurrentLessonIndex(0);
    setCurrentLesson(sortedLessons[0]);
    const unit = course.units?.[0];
    setCurrentUnit(unit);
    
    console.log('📚 Viewing course from lesson 1:', {
      lessonId: sortedLessons[0]?.id,
      lessonTitle: sortedLessons[0]?.title,
      unitId: unit?.id
    });
    
    setShowCourseDetail(true);
    setShowCourseOverview(false);
  };

  const handleCloseCourseDetail = async () => {
    setSelectedCourse(null);
    setShowCourseDetail(false);
    setShowCourseOverview(false);
    setShowLessonViewer(false);
    setViewingUnitQuiz(false);
    setCurrentLessonIndex(0);

    // Refresh progress when returning from lesson/course view
    console.log('🔄 Refreshing progress after closing course view...');
    if (user?.id) {
      try {
        const allProgress = await persistentProgressService.getAllStudentProgress(user.id);
        console.log('📊 Progress refreshed on close:', allProgress);
        setCourseProgress(allProgress);
      } catch (error) {
        console.error('Error refreshing progress on close:', error);
      }
    }
  };

  /** From full lesson view, go back to the course structure (units/lessons list), not the dashboard. */
  const handleBackToCourse = async () => {
    setShowLessonViewer(false);
    setViewingUnitQuiz(false);
    setShowCourseDetail(true);
    if (user?.id && selectedCourse?.id) {
      try {
        const progress = await persistentProgressService.getStudentProgress(user.id, selectedCourse.id);
        if (progress) {
          setCourseProgress(prev => ({ ...prev, [selectedCourse.id]: progress }));
        }
      } catch (e) {
        console.error('Error refreshing progress on back to course:', e);
      }
    }
  };

  // Helper function to get all lessons sorted by their logical order within unit structure
  const getSortedLessons = (course: Course) => {
    if (!course.units || course.units.length === 0) {
      return [];
    }

    // Create a flat list of lessons with their unit information
    const lessonsWithUnitInfo = course.units.flatMap((unit, unitIndex) => 
      (unit.lessons || []).map((lesson, lessonIndex) => ({
        ...lesson,
        unitId: unit.id,
        unitOrder: unit.order || unitIndex + 1,
        unitIndex,
        lessonIndex,
        // Ensure we have a proper order value
        order: lesson.order || lessonIndex + 1
      }))
    );

    console.log('📚 getSortedLessons - Raw lessons with unit info:', lessonsWithUnitInfo.map(l => ({ 
      id: l.id, 
      title: l.title, 
      order: l.order,
      unitOrder: l.unitOrder,
      unitId: l.unitId,
      unitIndex: l.unitIndex,
      lessonIndex: l.lessonIndex
    })));
    
    // Sort lessons by unit order first, then by lesson order within each unit
    const sortedLessons = lessonsWithUnitInfo.sort((a, b) => {
      // First sort by unit order
      if (a.unitOrder !== b.unitOrder) {
        return a.unitOrder - b.unitOrder;
      }
      
      // If same unit, sort by lesson order (logical sequence)
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      
      // If same order, sort by lesson index as fallback
      return a.lessonIndex - b.lessonIndex;
    });
    
    console.log('📚 getSortedLessons - Sorted lessons by order:', sortedLessons.map(l => ({ 
      id: l.id, 
      title: l.title, 
      order: l.order,
      unitOrder: l.unitOrder,
      unitId: l.unitId,
      unitIndex: l.unitIndex,
      lessonIndex: l.lessonIndex
    })));
    
    return sortedLessons;
  };

  const unitHasUsableQuiz = (unit: any) => {
    const quiz = unit?.quizContent;
    if (!quiz?.questions?.length) return false;
    const isSample = (q: any) => {
      const text = (q.question || '').toLowerCase().trim();
      return text.includes('sample question') || text.startsWith('what is the correct answer');
    };
    return !quiz.questions.every(isSample);
  };

  const tryOpenFinalExam = async () => {
    if (!selectedCourse || !user?.id) return;
    let progress = courseProgress[selectedCourse.id];
    try {
      const fresh = await persistentProgressService.getStudentProgress(user.id, selectedCourse.id);
      if (fresh) {
        progress = fresh;
        setCourseProgress((prev) => ({ ...prev, [selectedCourse.id]: fresh }));
      }
    } catch (err) {
      console.error('Could not refresh progress before exam:', err);
    }

    const alreadyPassed = hasPassedFinalExam(progress);
    const noAttemptsLeft =
      typeof progress?.finalExamAttempts === 'number' &&
      progress.finalExamAttempts >= MAX_FINAL_EXAM_ATTEMPTS;
    if (alreadyPassed || noAttemptsLeft) {
      await showCourseCompletionSummaryPopup();
      return;
    }

    const quizGate = getQuizAverageForExam(selectedCourse, progress?.lessonProgress);
    if (!quizGate.meetsThreshold) {
      setShowLessonViewer(false);
      setShowFinalExam(false);
      setViewingUnitQuiz(false);
      setShowCourseDetail(true);
      toast({
        title: 'Final exam locked',
        description: quizAverageLockMessage(quizGate),
        variant: 'destructive',
      });
      return;
    }

    setShowLessonViewer(false);
    setTimeout(() => setShowFinalExam(true), 400);
  };

  const goToNextUnitOrFinish = async (fromUnit: any) => {
    if (!selectedCourse) return;
    const sortedLessons = getSortedLessons(selectedCourse);
    const currentUnitIndex = selectedCourse.units?.findIndex((u) => String(u.id) === String(fromUnit?.id)) ?? -1;
    const nextUnit = selectedCourse.units?.[currentUnitIndex + 1];

    if (nextUnit && nextUnit.lessons && nextUnit.lessons.length > 0) {
      const firstLessonOfNextUnit = sortedLessons.find((l) => String(l.unitId) === String(nextUnit.id));
      if (firstLessonOfNextUnit) {
        setViewingUnitQuiz(false);
        setCurrentLesson({ ...firstLessonOfNextUnit, id: firstLessonOfNextUnit.id });
        setCurrentUnit(nextUnit);
        setCurrentLessonIndex(sortedLessons.findIndex((l) => l.id === firstLessonOfNextUnit.id));
        return;
      }
    }

    setViewingUnitQuiz(false);
    await tryOpenFinalExam();
  };

  const handleViewLesson = async (lesson: any, unit: any) => {
    console.log('Opening lesson viewer for:', lesson);
    console.log('Unit context:', unit);
    setViewingUnitQuiz(false);
    
    // Load completion status from database before opening lesson viewer
    if (selectedCourse) {
      const updatedCourse = await loadLessonCompletionStatus(selectedCourse);
      setSelectedCourse(updatedCourse);
      
      // Update the lesson object with the latest completion status
      // Use both lesson ID and unit ID to find the correct lesson
      const updatedLesson = updatedCourse.units
        ?.find(u => u.id === unit.id)
        ?.lessons?.find(l => l.id === lesson.id) || lesson;
      
      const updatedUnit = updatedCourse.units?.find(u => u.id === unit.id) || unit;

      console.log('Found lesson for viewer:', {
        requestedLessonId: lesson.id,
        requestedLessonTitle: lesson.title,
        requestedUnitId: unit.id,
        foundLessonId: updatedLesson.id,
        foundLessonTitle: updatedLesson.title,
        foundUnitId: updatedUnit.id,
        hasUnitQuiz: Boolean(updatedUnit.quizContent?.questions?.length)
      });
      
      setCurrentLesson(updatedLesson);
      setCurrentUnit(updatedUnit);
    } else {
      setCurrentLesson(lesson);
      setCurrentUnit(unit);
    }
    
    setShowLessonViewer(true);
    setShowCourseDetail(false);
  };

  const handleNextLesson = async (options?: { toUnitQuiz?: boolean; afterUnitQuiz?: boolean }) => {
    console.log('🔄 LearnerDashboard handleNextLesson called:', {
      selectedCourse: selectedCourse?.id,
      currentUnit: currentUnit?.id,
      currentLesson: currentLesson?.id,
      viewingUnitQuiz,
      toUnitQuiz: options?.toUnitQuiz,
      afterUnitQuiz: options?.afterUnitQuiz,
    });
    
    if (!selectedCourse || !currentUnit) {
      console.error('❌ Missing selectedCourse or currentUnit');
      return;
    }

    const courseUnit =
      selectedCourse.units?.find((u) => String(u.id) === String(currentUnit.id)) ||
      selectedCourse.modules?.find((u: any) => String(u.id) === String(currentUnit.id));
    const freshUnit = {
      ...currentUnit,
      ...(courseUnit || {}),
      lessons: courseUnit?.lessons || currentUnit.lessons || [],
      quizContent: courseUnit?.quizContent ?? currentUnit.quizContent,
    };

    // After unit quiz page (LessonViewer owns the quiz UI) → next unit / finish
    if (options?.afterUnitQuiz || viewingUnitQuiz) {
      setViewingUnitQuiz(false);
      await goToNextUnitOrFinish(freshUnit);
      return;
    }

    // Legacy: parent-driven quiz open (LessonViewer now opens quiz locally)
    if (options?.toUnitQuiz) {
      setCurrentUnit(freshUnit);
      setViewingUnitQuiz(true);
      return;
    }
    
    // Get all lessons sorted by their order property
    const sortedLessons = getSortedLessons(selectedCourse);
    
    // Check if there's a next lesson in the current unit
    const currentUnitLessons = sortedLessons.filter(l => String(l.unitId) === String(currentUnit.id));
    const currentLessonInUnitIndex = currentUnitLessons.findIndex(
      (l) => String(l.id) === String(currentLesson?.id)
    );
    const nextLessonInUnit =
      currentLessonInUnitIndex >= 0 ? currentUnitLessons[currentLessonInUnitIndex + 1] : undefined;
    
    if (nextLessonInUnit) {
      const lessonForViewer = {
        ...nextLessonInUnit,
        id: nextLessonInUnit.id
      };

      setViewingUnitQuiz(false);
      setCurrentLesson(lessonForViewer);
      setCurrentUnit(freshUnit);
      setCurrentLessonIndex(sortedLessons.findIndex(l => String(l.id) === String(nextLessonInUnit.id)));
      return;
    }

    // End of unit: open the unit quiz if one exists (backup if LessonViewer did not intercept)
    if (unitHasUsableQuiz(freshUnit)) {
      setCurrentUnit(freshUnit);
      setViewingUnitQuiz(true);
      return;
    }

    await goToNextUnitOrFinish(freshUnit);
  };

  const handleViewUnitQuiz = (unit: any) => {
    if (!selectedCourse) return;
    const courseUnit =
      selectedCourse.units?.find((u) => String(u.id) === String(unit.id)) ||
      selectedCourse.modules?.find((u: any) => String(u.id) === String(unit.id)) ||
      unit;
    const lessons = [...(courseUnit.lessons || [])].sort(
      (a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0)
    );
    const lastLesson = lessons[lessons.length - 1];
    if (!lastLesson) return;
    setCurrentLesson(lastLesson);
    setCurrentUnit({ ...courseUnit, quizContent: courseUnit.quizContent || unit.quizContent });
    setViewingUnitQuiz(true);
    setShowLessonViewer(true);
    setShowCourseDetail(false);
  };

  const showCourseCompletionSummaryPopup = async () => {
    console.log('🎉 Course completion summary triggered!', { user: user?.id, course: selectedCourse?.id });
    
    if (!user?.id || !selectedCourse) {
      console.error('Missing user or course data');
      return;
    }
    
    try {
      // Get the latest progress data
      const progressData = await persistentProgressService.getStudentProgress(user.id, selectedCourse.id);
      console.log('📊 Progress data loaded:', progressData);
      
      if (progressData) {
        setCourseProgress((prev) => ({ ...prev, [selectedCourse.id]: progressData }));
        setCourseCompletionData({
          course: selectedCourse,
          progressData: {
            ...progressData.courseProgress,
            progressPercentage: 100,
            status: 'Completed',
          },
          lessonProgress: progressData.lessonProgress
        });
        setShowCourseCompletionSummary(true);
        setShowLessonViewer(false);
        setShowFinalExam(false);
        console.log('✅ Course completion summary displayed');
      } else {
        console.log('⚠️ No progress data found, showing fallback alert');
        setShowLessonViewer(false);
        setShowCourseDetail(true);
        alert('Congratulations! You have completed the course!');
      }
    } catch (error) {
      console.error('Error loading course completion data:', error);
      // Fallback to simple alert
      setShowLessonViewer(false);
      setShowCourseDetail(true);
      alert('Congratulations! You have completed the course!');
    }
  };

  const handlePreviousLesson = () => {
    if (!selectedCourse || !currentUnit) return;

    // From unit quiz → back to last lesson of this unit
    if (viewingUnitQuiz) {
      setViewingUnitQuiz(false);
      return;
    }
    
    // Get all lessons sorted by their order property
    const sortedLessons = getSortedLessons(selectedCourse);
    const currentIndex = sortedLessons.findIndex(lesson => lesson.id === currentLesson?.id);
    
    console.log('🔄 Navigating to previous lesson:', { 
      currentIndex, 
      totalLessons: sortedLessons.length 
    });
    
    if (currentIndex > 0) {
      const prevLesson = sortedLessons[currentIndex - 1];
      const prevUnit = selectedCourse.units?.find(unit => 
        unit.lessons?.some(l => l.id === prevLesson.id)
      );

      // Crossing into a previous unit that has a quiz → show that unit's quiz step
      if (
        prevUnit &&
        String(prevUnit.id) !== String(currentUnit.id) &&
        unitHasUsableQuiz(prevUnit)
      ) {
        const prevUnitLessons = sortedLessons.filter((l) => String(l.unitId) === String(prevUnit.id));
        const lastLessonOfPrevUnit = prevUnitLessons[prevUnitLessons.length - 1];
        setCurrentLesson(lastLessonOfPrevUnit || prevLesson);
        setCurrentUnit(prevUnit);
        setCurrentLessonIndex(
          sortedLessons.findIndex((l) => l.id === (lastLessonOfPrevUnit || prevLesson).id)
        );
        setViewingUnitQuiz(true);
        return;
      }
      
      console.log('⬅️ Moving to previous lesson:', prevLesson.title, 'Order:', prevLesson.order);
      setViewingUnitQuiz(false);
      setCurrentLesson(prevLesson);
      setCurrentUnit(prevUnit);
      setCurrentLessonIndex(currentIndex - 1);
    }
  };


  // Function to load lesson completion status from database and update course data
  const loadLessonCompletionStatus = async (course: Course) => {
    if (!user?.id || !course) return course;

    try {
      console.log('📊 Loading lesson completion status for course:', course.id);
      
      const progressData = await persistentProgressService.getStudentProgress(user.id, course.id);
      
      if (progressData && progressData.lessonProgress) {
        console.log('📊 Found lesson progress data:', progressData.lessonProgress.length, 'lessons');
        
        // Create a map of completed lesson IDs for quick lookup
        const completedLessonIds = new Set(
          progressData.lessonProgress
            .filter((lp: any) => lp.completed)
            .map((lp: any) => lp.lessonId)
        );
        
        console.log('📊 Completed lesson IDs:', Array.from(completedLessonIds));
        
        // Update course data with completion status from database
        const updatedCourse = {
          ...course,
          units: course.units?.map(unit => ({
            ...unit,
            lessons: unit.lessons?.map(lesson => ({
              ...lesson,
              completed: completedLessonIds.has(lesson.id)
            }))
          }))
        };
        
        // Also update the courseProgress state with the latest progress data
        if (progressData.courseProgress) {
          const stats = computeLearnerCourseProgress(updatedCourse, progressData);
          console.log('📊 Updating courseProgress state with latest data:', {
            progressPercentage: stats.progressPercentage,
            completedLessons: stats.completedLessons,
            totalLessons: stats.totalLessons,
            completedUnits: stats.completedUnits,
            examPassed: stats.examPassed,
          });
          
          setCourseProgress(prev => ({
            ...prev,
            [course.id]: {
              ...progressData,
              courseProgress: {
                ...progressData.courseProgress,
                completedLessons: stats.completedLessons,
                totalLessons: stats.totalLessons,
                completedUnits: stats.completedUnits,
                totalUnits: stats.totalUnits,
                progressPercentage: stats.progressPercentage,
                status: stats.status,
              },
            }
          }));
        } else {
          const stats = computeLearnerCourseProgress(updatedCourse, progressData);
          
          setCourseProgress(prev => ({
            ...prev,
            [course.id]: {
              ...prev[course.id],
              ...progressData,
              courseProgress: {
                completedLessons: stats.completedLessons,
                totalLessons: stats.totalLessons,
                completedUnits: stats.completedUnits,
                totalUnits: stats.totalUnits,
                progressPercentage: stats.progressPercentage,
                lastAccessedAt: new Date().toISOString(),
                status: stats.status,
              }
            }
          }));
        }
        
        console.log('✅ Updated course with completion status from database');
        return updatedCourse;
      } else {
        console.log('ℹ️ No lesson progress data found, resetting all lessons to incomplete');
        
        // If no progress data found, ensure all lessons are marked as incomplete
        const updatedCourse = {
          ...course,
          units: course.units?.map(unit => ({
            ...unit,
            lessons: unit.lessons?.map(lesson => ({
              ...lesson,
              completed: false
            }))
          }))
        };
        
        // Also reset courseProgress for this course
        setCourseProgress(prev => ({
          ...prev,
          [course.id]: {
            courseProgress: {
              courseId: course.id,
              studentId: user.id,
              totalLessons: course.units?.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0) || 0,
              completedLessons: 0,
              totalUnits: course.units?.length || 0,
              completedUnits: 0,
              currentUnitIndex: 0,
              progressPercentage: 0,
              lastAccessedAt: new Date().toISOString(),
              startedAt: new Date().toISOString(),
              status: 'Not Started',
              timeSpent: 0
            },
            lessonProgress: []
          }
        }));
        
        console.log('✅ Reset all lessons to incomplete status');
        return updatedCourse;
      }
    } catch (error) {
      console.error('❌ Error loading lesson completion status:', error);
      
      // On error, reset all lessons to incomplete
      const updatedCourse = {
        ...course,
        units: course.units?.map(unit => ({
          ...unit,
          lessons: unit.lessons?.map(lesson => ({
            ...lesson,
            completed: false
          }))
        }))
      };
      
      // Also reset courseProgress for this course on error
      setCourseProgress(prev => ({
        ...prev,
        [course.id]: {
          courseProgress: {
            courseId: course.id,
            studentId: user.id,
            totalLessons: course.units?.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0) || 0,
            completedLessons: 0,
            totalUnits: course.units?.length || 0,
            completedUnits: 0,
            currentUnitIndex: 0,
            progressPercentage: 0,
            lastAccessedAt: new Date().toISOString(),
            startedAt: new Date().toISOString(),
            status: 'Not Started',
            timeSpent: 0
          },
          lessonProgress: []
        }
      }));
      
      console.log('✅ Reset all lessons to incomplete due to error');
      return updatedCourse;
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    console.log('📚 Lesson completed:', lessonId);
    
    if (!selectedCourse || !user?.id) {
      console.error('Course or user not available for lesson completion');
      return;
    }

    // Update local course state to mark lesson as completed
    const updatedCourse = {
      ...selectedCourse,
      units: selectedCourse.units?.map(unit => ({
        ...unit,
        lessons: unit.lessons?.map(lesson => 
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        )
      }))
    };
    
    console.log('✅ Updating course state with completed lesson:', {
      lessonId,
      before: selectedCourse.units?.flatMap(u => u.lessons).find(l => l.id === lessonId)?.completed,
      after: true
    });
    
    setSelectedCourse(updatedCourse);
    
    // Update courseProgress state with the new completion status
    const allLessons = updatedCourse.units?.flatMap(unit => unit.lessons || []) || [];
    const currentProgressData = courseProgress[selectedCourse.id];
    
    // Get all completed lesson IDs (include the lesson we just completed)
    const completedLessonIds = new Set([
      ...(currentProgressData?.lessonProgress?.filter(lp => lp.completed).map(lp => lp.lessonId) || []),
      lessonId
    ]);

    const mergedProgress = {
      ...currentProgressData,
      lessonProgress: [
        ...(currentProgressData?.lessonProgress || []).filter((lp) => lp.lessonId !== lessonId),
        {
          ...(currentProgressData?.lessonProgress || []).find((lp) => lp.lessonId === lessonId),
          lessonId,
          completed: true,
        },
      ],
    };
    const stats = computeLearnerCourseProgress(updatedCourse, mergedProgress);
    const completedLessons = stats.completedLessons;
    const totalLessons = stats.totalLessons;
    const progressPercentage = stats.progressPercentage;
    const completedUnits = stats.completedUnits;
    const totalUnits = stats.totalUnits;
    
    console.log('📊 Progress calculation details:', {
      totalLessons,
      completedLessons,
      progressPercentage,
      completedLessonIds,
      courseLessonIds: allLessons.map(l => l.id),
      matchingCompleted: allLessons.filter(lesson => completedLessonIds.has(lesson.id)).map(l => l.id),
      examPassed: stats.examPassed,
    });
    
    console.log('📊 Updating courseProgress after lesson completion:', {
      completedLessons,
      totalLessons,
      completedUnits,
      totalUnits,
      progressPercentage,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      unitsBreakdown: updatedCourse.units?.map(unit => ({
        id: unit.id,
        title: unit.title,
        lessonsCount: unit.lessons?.length || 0,
        completedLessons: unit.lessons?.filter(lesson => {
          return completedLessonIds.has(lesson.id);
        }).length || 0,
        allLessonsCompleted: unit.lessons?.length > 0 && unit.lessons?.every(lesson => completedLessonIds.has(lesson.id)) || false
      }))
    });
    
    setCourseProgress(prev => ({
      ...prev,
      [selectedCourse.id]: {
        ...prev[selectedCourse.id],
        courseProgress: {
          ...prev[selectedCourse.id]?.courseProgress,
          completedLessons,
          totalLessons,
          completedUnits,
          totalUnits,
          progressPercentage,
          lastAccessedAt: new Date().toISOString(),
          status: progressPercentage >= 100 ? 'Completed' : progressPercentage > 0 ? 'In Progress' : 'Not Started'
        }
      }
    }));
    
    // Check if this was the last lesson in the course
    const currentIndex = allLessons.findIndex(lesson => String(lesson.id) === String(lessonId));
    const isLastLesson = currentIndex === allLessons.length - 1;
    
    if (isLastLesson) {
      // If the last unit still has a unit quiz, stay in LessonViewer so the quiz page can show
      const lastUnit =
        updatedCourse.units?.[updatedCourse.units.length - 1] ||
        currentUnit;
      if (unitHasUsableQuiz(lastUnit)) {
        console.log('📝 Last lesson done but unit quiz pending — keeping lesson viewer open');
        return;
      }

      await tryOpenFinalExam();
    }
    
    // Progress will be automatically updated by the real-time Firestore listener
    // and displayed in the UI - no alert needed
    console.log('✅ Lesson marked as completed, progress will update automatically via real-time listener');
  };

  const handleStartCourse = async (courseOrId: Course | string) => {
    const courseId = typeof courseOrId === 'string' ? courseOrId : courseOrId.id;
    const courseFromProps = typeof courseOrId === 'string' ? null : courseOrId;
    console.log('handleStartCourse called with courseId:', courseId);
    if (!hasPaidCourseAccess(courseId)) {
      toast({
        title: "Payment required",
        description: "Please pay to enroll before starting this course.",
        variant: "destructive"
      });
      setActiveTab('marketplace');
      return;
    }

    try {
      // Load existing progress for this course
      const existingProgress = await persistentProgressService.getStudentProgress(user?.id || '', courseId);

      // Resolve course: use passed-in course (from My Courses list) or find from courses list
      const course = courseFromProps ?? courses.find(c => c.id === courseId) ?? myCoursesForDisplay.find((c: any) => c.id === courseId);
      if (!course) {
        alert('Course not found. Please refresh and try again.');
        return;
      }

      // Update courseProgress state to reflect the current progress
      if (existingProgress) {
        console.log('📊 Found existing progress:', existingProgress.courseProgress);
        setCourseProgress(prev => ({
          ...prev,
          [courseId]: existingProgress
        }));
      } else {
        console.log('📊 No existing progress found, creating new progress entry');
        const totalLessons = (course.units || course.modules || []).reduce((total: number, unit: any) =>
          total + (unit.lessons?.length || 0), 0);
        console.log('📊 Starting course with total lessons:', totalLessons);
        const firstUnit = course.units?.[0] || (course.modules as any)?.[0];
        const firstLessonId = firstUnit?.lessons?.[0]?.id ?? '';
        const firstUnitId = firstUnit?.id ?? '';
        if (firstLessonId && totalLessons >= 0) {
          const startResult = await persistentProgressService.startLesson(
            user?.id || '',
            courseId,
            String(firstLessonId),
            String(firstUnitId),
            0,
            totalLessons
          );
          console.log('📊 Start lesson result:', startResult);
          const newProgress = await persistentProgressService.getStudentProgress(user?.id || '', courseId);
          if (newProgress) {
            setCourseProgress(prev => ({ ...prev, [courseId]: newProgress }));
          }
        }
      }

      // Load lesson completion status and open course view
      const updatedCourse = await loadLessonCompletionStatus(course);
      setSelectedCourse(updatedCourse);
      const sortedLessons = getSortedLessons(updatedCourse);
      if (sortedLessons.length === 0) {
        alert('This course has no lessons yet.');
        return;
      }
      setCurrentLessonIndex(0);
      setCurrentLesson(sortedLessons[0]);
      const unit = updatedCourse.units?.[0] || (updatedCourse.modules as any)?.[0];
      setCurrentUnit(unit ?? null);
      console.log('📚 Starting from lesson 1:', { lessonId: sortedLessons[0]?.id, lessonTitle: sortedLessons[0]?.title });
      setShowCourseDetail(true);
    } catch (error: any) {
      console.error('handleStartCourse error', error);
      alert(error?.message || 'Failed to start course');
    }
  };

  const handleLessonComplete = async (courseId: string, lessonIndex: number) => {
    // Note: Progress will be automatically updated by the real-time Firestore listener
    // This function is kept for compatibility but the real work is done by the listener
    console.log('📊 Lesson complete event received, real-time listener will update progress automatically');
  };

  const handleViewOverview = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseOverview(true);
    setShowCourseDetail(false);
  };

  // Merge calendar events (from Firestore – including AI-created) into Timetable so they appear in the weekly view
  const timetableEventsMergedWithCalendar = useMemo(() => {
    const days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[] = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];
    const toHHmm = (iso: string) => {
      try {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } catch {
        return '09:00';
      }
    };
    const fromCalendar: any[] = calendarEvents.map((ev) => {
      const start = new Date(ev.startTime);
      const day = days[start.getDay()];
      const typeMap: Record<string, string> = {
        class: 'class', meeting: 'meeting', assignment: 'assignment', exam: 'exam',
        event: 'study', deadline: 'assignment'
      };
      return {
        id: `cal-${ev.id}`,
        title: ev.title,
        type: (typeMap[ev.type] || 'study') as any,
        startTime: toHHmm(ev.startTime),
        endTime: toHHmm(ev.endTime),
        day,
        description: ev.description,
        course: ev.courseTitle,
      };
    });
    return [...timetableEvents, ...fromCalendar];
  }, [timetableEvents, calendarEvents]);

  // Timetable handlers
  const handleAddEvent = () => {
    setSelectedTimetableEvent(null);
    setTimetableDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedTimetableEvent(event);
    setTimetableDialogOpen(true);
  };

  const handleSaveTimetableEvent = (event: any) => {
    if (selectedTimetableEvent) {
      // Update existing event
      setTimetableEvents(prev => 
        prev.map(e => e.id === event.id ? event : e)
      );
    } else {
      // Add new event
      setTimetableEvents(prev => [...prev, event]);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setTimetableEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Todo handlers (persist to Firestore so AI-created and UI-created todos stay in sync)
  const handleAddTodo = async (todo: any) => {
    if (!user?.id) return;
    try {
      await learnerTodoService.addTodo(user.id, {
        title: todo.title,
        description: todo.description,
        completed: false,
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate,
        category: todo.category || 'study',
        aiGenerated: false,
      });
      // Subscription will update state
    } catch (err) {
      console.error('Failed to add todo:', err);
      toast({ title: 'Error', description: 'Could not add task.', variant: 'destructive' });
    }
  };

  const handleUpdateTodo = async (id: string, updates: any) => {
    try {
      await learnerTodoService.updateTodo(id, updates);
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await learnerTodoService.deleteTodo(id);
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      await learnerTodoService.updateTodo(id, {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  // Calendar event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const handleCloseEventDetails = () => {
    setEventDetailsOpen(false);
    setSelectedEvent(null);
  };

  const handleAcceptEvent = async (eventId: string) => {
    if (!user?.id) return;
    
    setIsProcessingEvent(true);
    try {
      await CalendarService.acceptEventInvitation(eventId, user.id);
      console.log('✅ Successfully accepted event invitation');
      
      // Show success feedback
      toast({
        title: "Invitation Accepted",
        description: "You have successfully accepted the event invitation.",
      });
      
      // Update the selected event to reflect the change immediately
      if (selectedEvent) {
        setSelectedEvent(prev => prev ? {
          ...prev,
          attendees: [...(prev.attendees || []), user.id]
        } : null);
      }
    } catch (error) {
      console.error('❌ Error accepting event:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingEvent(false);
    }
  };

  const handleDeclineEvent = async (eventId: string) => {
    if (!user?.id) return;
    
    setIsProcessingEvent(true);
    try {
      await CalendarService.declineEventInvitation(eventId, user.id);
      console.log('✅ Successfully declined event invitation');
      
      // Show success feedback
      toast({
        title: "Invitation Declined",
        description: "You have successfully declined the event invitation.",
      });
      
      // Update the selected event to reflect the change immediately
      if (selectedEvent) {
        setSelectedEvent(prev => prev ? {
          ...prev,
          attendees: (prev.attendees || []).filter(id => id !== user.id)
        } : null);
      }
    } catch (error) {
      console.error('❌ Error declining event:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingEvent(false);
    }
  };


  const handleGenerateAITodos = () => {
    // Generate AI-powered todo suggestions based on course progress and assignments
    const aiTodos = [
      {
        id: `ai-todo-${Date.now()}`,
        title: 'Review completed lessons',
        description: 'Go through notes from recent lessons to reinforce learning',
        completed: false,
        priority: 'medium' as const,
        category: 'study' as const,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        aiGenerated: true,
        createdAt: new Date().toISOString()
      },
      {
        id: `ai-todo-${Date.now() + 1}`,
        title: 'Prepare for upcoming assignment',
        description: 'Start working on the next assignment to avoid last-minute rush',
        completed: false,
        priority: 'high' as const,
        category: 'assignment' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        aiGenerated: true,
        createdAt: new Date().toISOString()
      },
      {
        id: `ai-todo-${Date.now() + 2}`,
        title: 'Practice coding exercises',
        description: 'Complete 3-5 coding exercises to improve programming skills',
        completed: false,
        priority: 'medium' as const,
        category: 'study' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        aiGenerated: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    setTodos(prev => [...prev, ...aiTodos]);
  };

  const renderCourseCompletionSummary = () => {
    if (!courseCompletionData) return null;
    return (
      <CourseCompletionSummary
        course={courseCompletionData.course}
        progressData={courseCompletionData.progressData}
        lessonProgress={courseCompletionData.lessonProgress}
        isOpen={showCourseCompletionSummary}
        onClose={() => {
          setShowCourseCompletionSummary(false);
          setCourseCompletionData(null);
          setShowCourseDetail(true);
        }}
        onViewCertificate={async () => {
          if (!user) return;
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
          const learnerName = fullName || user.email || 'Learner';
          const learnerId = user.identityNumber || user.id || '';
          const issuedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          try {
            const blob = await generateCertificateFromTemplate({
              learnerName,
              learnerId,
              courseTitle: courseCompletionData.course.title || 'Course',
              issueDate: issuedDate,
            });
            downloadCertificateBlob(blob, courseCompletionData.course.title || 'Course');
          } catch (err) {
            console.error('Certificate download failed:', err);
            toast({
              title: 'Certificate error',
              description: 'Could not generate your certificate. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        onShareAchievement={() => {
          console.log('Share achievement for course:', courseCompletionData.course.title);
        }}
      />
    );
  };

  const handleTakeFinalExam = async () => {
    if (!user?.id || !selectedCourse) return;
    await tryOpenFinalExam();
  };

  const handleFinalExamComplete = async () => {
    setShowFinalExam(false);
    if (user?.id && selectedCourse?.id) {
      try {
        const progress = await persistentProgressService.getStudentProgress(user.id, selectedCourse.id);
        if (progress) {
          setCourseProgress((prev) => ({ ...prev, [selectedCourse.id]: progress }));
        }
      } catch (e) {
        console.error('Error refreshing progress after exam:', e);
      }
    }
    await showCourseCompletionSummaryPopup();
  };

  if (syncLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state with fallback data
  if (hasError) {
    console.log('LearnerDashboard rendering with fallback data due to API errors');
  }

  // Final exam after last lesson (before completion summary)
  if (showFinalExam && selectedCourse) {
    return (
      <>
        <div className="min-h-screen bg-slate-50">
          <FinalExamView
            course={selectedCourse}
            onComplete={handleFinalExamComplete}
            onBack={() => {
              setShowFinalExam(false);
              void handleBackToCourse();
            }}
          />
        </div>
        {renderCourseCompletionSummary()}
      </>
    );
  }

  // Lesson viewer for active learning
  if (showLessonViewer && selectedCourse && currentLesson && currentUnit) {
    const sortedLessons = getSortedLessons(selectedCourse);
    const currentIndex = sortedLessons.findIndex(lesson => lesson.id === currentLesson.id);
    const isFirstLesson = currentIndex === 0;
    const isLastLesson = currentIndex === sortedLessons.length - 1;
    
    return (
      <LessonViewer
        course={selectedCourse}
        currentLesson={currentLesson}
        currentUnit={currentUnit}
        courseProgress={courseProgress[selectedCourse.id]?.courseProgress}
        onClose={handleCloseCourseDetail}
        onBackToCourse={handleBackToCourse}
        onNextLesson={handleNextLesson}
        onPreviousLesson={handlePreviousLesson}
        onCompleteLesson={handleCompleteLesson}
        isFirstLesson={isFirstLesson}
        isLastLesson={isLastLesson}
        currentLessonIndex={currentIndex}
        totalLessons={sortedLessons.length}
        isUnitQuizView={viewingUnitQuiz}
      />
    );
  }

  // Course detail view for enrolled students
  if (showCourseDetail && selectedCourse) {
    return (
      <>
        <CourseStructureView 
          course={selectedCourse}
          courseProgress={courseProgress[selectedCourse.id]}
          onClose={handleCloseCourseDetail}
          onViewLesson={handleViewLesson}
          onViewUnitQuiz={handleViewUnitQuiz}
          onTakeExam={handleTakeFinalExam}
        />
        {renderCourseCompletionSummary()}
      </>
    );
  }

  // Course overview for non-enrolled students
  if (showCourseOverview && selectedCourse) {
    const isEnrolled = Array.isArray(enrolledCourses) ? enrolledCourses.some(enrolled => enrolled?.id === selectedCourse?.id) : false;
    
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
        <div className="min-h-screen">
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleCloseCourseDetail}>
                  ← Back to Courses
                </Button>
                <h1 className="text-xl font-semibold">Course Overview</h1>
                <div className="w-20"></div>
              </div>
            </div>
          </div>

          {/* Course Overview Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {/* Course Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">{selectedCourse.description}</p>
                  </div>
                  <Badge className={`${selectedCourse.complianceStatus === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedCourse.complianceStatus}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedCourse.lessons}</div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedCourse.duration}</div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedCourse.level}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {courseProgress[selectedCourse.id]?.courseProgress?.completedUnits || 0}/{(selectedCourse.units || selectedCourse.modules || []).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Units Completed</div>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">About this Course</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Course Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Instructor:</span>
                      <span className="text-gray-600">
                        {typeof selectedCourse.instructor === 'string' 
                          ? selectedCourse.instructor 
                          : `${selectedCourse.instructor.firstName} ${selectedCourse.instructor.lastName}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Category:</span>
                      <span className="text-gray-600">{selectedCourse.category || 'General'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Course Progress:</span>
                      <span className="text-gray-600 font-semibold">
                        {(() => {
                          const progressData = courseProgress[selectedCourse.id];
                          const completed = progressData?.completedLessons || 0;
                          const total = progressData?.totalLessons || 0;
                          const percentage = progressData?.progressPercentage || 0;
                          return `${percentage}% (${completed}/${total} lessons)`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Price:</span>
                      <span className="text-gray-600">R{selectedCourse.price || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Enrollment Action */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Ready to Start Learning?</h3>
                  <p className="text-gray-600 mb-4">
                    Enroll in this course to access all lessons, track your progress, and earn certificates.
                  </p>
                  {!isEnrolled ? (
                    <Button 
                      className="w-full md:w-auto"
                      onClick={() => {
                        handleCloseCourseDetail();
                        handleEnroll(selectedCourse.id);
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  ) : (
                    <Button className="w-full md:w-auto" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Already Enrolled
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDismissAIGreeting = () => setShowAIGreetingPopout(false);

  const handleOpenAITutorFromGreeting = () => {
    setShowAIGreetingPopout(false);
    setLearnerHomePath(
      isRevolearnDomain || window.location.pathname.includes('/funnel') || window.location.pathname.includes('/dashboard')
        ? funnelPath('/dashboard')
        : '/lms'
    );
    navigate(aiTutorPath());
  };

  const handleStartTour = () => {
    setShowAIGreetingPopout(false);
    setShowTour(true);
    setTourStep(0);
    setActiveTab('overview');
  };

  const TOUR_STEPS: { tab: string | null; title: string; description: string }[] = [
    { tab: null, title: 'Welcome to your dashboard', description: "Let's take a quick tour. I'll show you each tab and what to do so you can get the most out of your learning." },
    { tab: 'overview', title: 'Overview', description: 'Here you see your enrolled courses, overall progress, and quiz scores. Your course progress list, timetable, and AI to-dos are here.' },
    { tab: 'marketplace', title: 'Courses', description: 'Browse and enroll in short courses. Tap **Pay to enroll** on any course to purchase and add it to My Courses. New courses appear here so you can grow your learning.' },
    { tab: 'courses', title: 'My Courses', description: 'Start or continue your courses. Each card shows your progress and a button to continue learning or start the course.' },
    { tab: 'grades', title: 'Grades', description: 'See your quiz results by course, unit and lesson.' },
    { tab: 'calendar', title: 'Calendar', description: 'Check your schedule and upcoming events.' },
    { tab: 'community', title: 'Community', description: 'View announcements, events, and updates from admin and instructors.' },
    { tab: null, title: "You're all set!", description: 'Use the **Chat with AI Tutor** button at the top anytime for help. Enjoy your learning!' },
  ];

  const handleTourNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      const next = tourStep + 1;
      setTourStep(next);
      const step = TOUR_STEPS[next];
      if (step.tab) setActiveTab(step.tab);
    } else {
      setShowTour(false);
      setTourStep(0);
    }
  };

  const handleTourBack = () => {
    if (tourStep > 0) {
      const prev = tourStep - 1;
      setTourStep(prev);
      const step = TOUR_STEPS[prev];
      if (step.tab) setActiveTab(step.tab);
    }
  };

  const handleFinishTour = () => {
    setShowTour(false);
    setTourStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950">
      {/* AI greeting popout – centered, every time learner logs in */}
      {showAIGreetingPopout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
          <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800 shadow-2xl w-full max-w-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-9 w-9 text-slate-400 hover:text-slate-600 rounded-full -m-1"
                  onClick={handleDismissAIGreeting}
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
                      Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'there'}!
                    </p>
                    <div className="mt-2 max-h-60 overflow-y-auto pr-1">
                      <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                        {aiGreetingMessage ?? 'Your tutor is saying hi…'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                        onClick={handleOpenAITutorFromGreeting}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with your tutor
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 shrink-0"
                        onClick={handleStartTour}
                      >
                        <Compass className="w-4 h-4 mr-2" />
                        Take a quick tour
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-slate-500 shrink-0"
                        onClick={handleDismissAIGreeting}
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

      {/* In-app tour – explains each tab */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Step {tourStep + 1} of {TOUR_STEPS.length}</p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{TOUR_STEPS[tourStep].title}</h3>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {TOUR_STEPS[tourStep].description.replace(/\*\*(.*?)\*\*/g, '$1')}
              </p>
              <div className="flex items-center justify-between mt-6 gap-3">
                <div>
                  {tourStep > 0 ? (
                    <Button variant="outline" onClick={handleTourBack} className="gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
                <div className="flex gap-2">
                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <Button onClick={handleTourNext} className="gap-1 bg-orange-500 hover:bg-orange-600">
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleFinishTour} className="bg-orange-500 hover:bg-orange-600">
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
      <div className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="ring-2 ring-orange-500/20 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 rounded-2xl">
                <UserAvatar user={user} size="lg" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'there'}!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Continue your learning journey
                </p>
              </div>
            </div>
            <Button 
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/30 transition-all"
              onClick={() => {
                setLearnerHomePath(
                  isRevolearnDomain || window.location.pathname.includes('/funnel') || window.location.pathname.includes('/dashboard')
                    ? funnelPath('/dashboard')
                    : '/lms'
                );
                navigate(aiTutorPath());
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat with AI Tutor
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="flex w-full max-w-5xl rounded-full bg-slate-100 dark:bg-slate-800/60 p-1.5 sm:p-2 gap-2 flex-wrap sm:flex-nowrap items-center justify-between">
          <TabsTrigger
            value="overview"
            className="rounded-full py-2.5 sm:py-3 px-4 sm:px-6 text-xs sm:text-base font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-orange-400 flex-1 basis-[32%] min-w-[30%] text-center sm:flex-none sm:basis-auto sm:min-w-0 transition-all duration-200 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="marketplace"
            className="rounded-full py-2.5 sm:py-3 px-4 sm:px-6 text-xs sm:text-base font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-orange-400 flex-1 basis-[32%] min-w-[30%] text-center sm:flex-none sm:basis-auto sm:min-w-0 transition-all duration-200 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="rounded-full py-2.5 sm:py-3 px-4 sm:px-6 text-xs sm:text-base font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-orange-400 flex-1 basis-[32%] min-w-[30%] text-center sm:flex-none sm:basis-auto sm:min-w-0 transition-all duration-200 hover:text-slate-700 dark:hover:text-slate-300"
          >
            My Courses
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className="rounded-full py-2.5 sm:py-3 px-4 sm:px-6 text-xs sm:text-base font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-orange-400 flex-1 basis-[32%] min-w-[30%] text-center sm:flex-none sm:basis-auto sm:min-w-0 transition-all duration-200 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Grades
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="rounded-full py-2.5 sm:py-3 px-4 sm:px-6 text-xs sm:text-base font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-orange-400 flex-1 basis-[32%] min-w-[30%] text-center sm:flex-none sm:basis-auto sm:min-w-0 transition-all duration-200 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 mt-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled Courses</p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">{enrolledCourses.length}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Progress</p>
                    <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">{totalProgress}%</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Quiz Score</p>
                    <p className="text-3xl font-bold tracking-tight text-violet-600 dark:text-violet-400 mt-1">{displayAvgQuizScore()}%</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">average % on quizzes taken</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Course Progress */}
          <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </span>
                  Course Progress
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(enrolledCourses) && enrolledCourses.length > 0 ? enrolledCourses.map((course) => {
                  const enrollment = enrollments.find(e => e.course.id === course.id);
                  const progressValue = courseProgress[course.id]?.courseProgress?.progressPercentage || enrollment?.progress.percentage || 0;
                  
                  return (
                    <div key={course?.id} className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600/50 transition-colors">
                      <div className="flex items-center justify-between mb-3 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{course?.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {typeof course?.instructor === 'string' 
                                ? course.instructor 
                                : `${course?.instructor?.firstName} ${course?.instructor?.lastName}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{progressValue}%</div>
                          <Badge variant="secondary" className="text-xs rounded-lg mt-1">{course?.level}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Progress</span>
                          <span>{progressValue}% Complete</span>
                        </div>
                        <Progress value={progressValue} className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{course?.lessons || 0} lessons</span>
                          <span>{course?.duration || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-12 rounded-xl bg-slate-50 dark:bg-slate-700/20 border border-dashed border-slate-200 dark:border-slate-600/50">
                    <BookOpen className="w-14 h-14 mx-auto mb-4 text-slate-300 dark:text-slate-500" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">No enrolled courses yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Browse available courses to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timetable and AI To-Do List – Timetable shows both local events and calendar events (AI-created) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Timetable
              events={timetableEventsMergedWithCalendar}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
            <AITodoList
              todos={todos}
              onAddTodo={handleAddTodo}
              onUpdateTodo={handleUpdateTodo}
              onDeleteTodo={handleDeleteTodo}
              onToggleComplete={handleToggleComplete}
              onGenerateAITodos={handleGenerateAITodos}
            />
          </div>
        </TabsContent>

        {/* Courses Marketplace Tab – browse & enroll in short courses */}
        <TabsContent value="marketplace" className="space-y-8 mt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Short Courses
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              Browse and enroll in short courses. Start learning in minutes.
            </p>
          </div>
          {!marketplaceLoading && marketplaceCourses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto -mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 shrink-0">
                <Filter className="w-4 h-4" />
                <span>Category</span>
              </div>
              <Select value={marketplaceCategoryFilter} onValueChange={setMarketplaceCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {marketplaceCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {marketplaceLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-200 dark:bg-orange-900/40" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading courses...</p>
              </div>
            </div>
          ) : marketplaceCourses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/30 p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No courses available yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check back later for new short courses.</p>
            </div>
          ) : filteredMarketplaceCourses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/30 p-12 text-center">
              <Filter className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No courses in this category</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try another category or view all courses.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => setMarketplaceCategoryFilter('all')}
              >
                Show all courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMarketplaceCourses.map((course) => {
                const isEnrolled = hasPaidCourseAccess(course.id);
                return (
                  <Card
                    key={course.id}
                    className="group overflow-hidden bg-white dark:bg-slate-800/50 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                  >
                    <div className="relative h-44 overflow-hidden rounded-t-2xl">
                      {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                        <>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                      {isEnrolled && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-500/95 text-white border-0 shadow-md">Enrolled</Badge>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white drop-shadow-sm">
                        <span className="text-xs font-medium bg-black/30 px-2 py-1 rounded">{course.level}</span>
                        <span className="text-xs font-medium flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-300 fill-current" />
                          {typeof course.rating === 'number' ? course.rating : (course.rating as any)?.average ?? 0}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      {course.category && (
                        <Badge variant="secondary" className="text-xs font-medium w-fit mb-2">
                          {course.category}
                        </Badge>
                      )}
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {course.shortDescription || course.description || 'Short course'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {course.duration}
                        </span>
                        <span>{course.lessons || 0} lessons</span>
                      </div>
                      {isEnrolled ? (
                        <Button
                          className="w-full rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                          onClick={() => handleViewCourse(course as Course)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Open course
                        </Button>
                      ) : (
                        <Button
                          className="w-full rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                          disabled={payingCourseId === course.id}
                          onClick={() => handlePayToEnroll(course)}
                        >
                          {payingCourseId === course.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Opening payment…
                            </>
                          ) : (
                            'Pay to enroll'
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* My Courses Tab */}
        <TabsContent value="courses" className="space-y-8 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                My Courses
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Continue your learning journey</p>
            </div>
            {myCoursesFromFirebaseLoading && (
              <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(myCoursesForDisplay) && myCoursesForDisplay.length > 0 ? myCoursesForDisplay.map((course) => {
              const enrollment = enrollments.find(e => e.course.id === course.id);
              // Use progress data from persistentProgressService (lesson-based)
              const progressData = courseProgress[course.id];
              const progressStats = computeLearnerCourseProgress(course, progressData);
              const progressPercentage = progressStats.progressPercentage;
              const completedLessons = progressStats.completedLessons;
              const totalLessons = progressStats.totalLessons;
              const attemptsUsed = progressData?.finalExamAttempts ?? 0;
              const noAttemptsLeft = attemptsUsed >= MAX_FINAL_EXAM_ATTEMPTS;
              const passedFinalExam = progressStats.examPassed;
              const isCourseComplete = passedFinalExam || progressPercentage >= 100 || noAttemptsLeft;
              
              console.log(`🔍 Course ${course.title} progress:`, {
                courseId: course.id,
                hasProgressData: !!courseProgress[course.id],
                completedLessons,
                totalLessons,
                progressPercentage,
                rawProgress: courseProgress[course.id]
              });
              
              // Show "Continue" if progress > 0% (any lessons completed)
              // Show "Start Course" when progress is 0% and no lessons completed
              // Show "Complete" when lessons are done and final exam is passed or attempts are exhausted
              const hasStarted = progressPercentage > 0;
              
              return (
                <Card key={course.id} className="group relative overflow-hidden bg-white dark:bg-slate-800/50 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1 rounded-2xl">
                  {/* Course Thumbnail Header */}
                  <div className="relative h-52 overflow-hidden rounded-t-2xl">
                    {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
                      <>
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <BookOpen className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1 rounded-xl shadow-lg border-0">
                        {course.complianceStatus}
                      </Badge>
                    </div>
                    
                    {/* Course Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white drop-shadow-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 opacity-90" />
                          <span className="text-sm font-medium">{course.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-300 fill-current" />
                          <span className="text-sm font-medium">
                            {typeof course.rating === 'number' ? course.rating : (course.rating as any)?.average || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 flex items-center justify-center">
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {typeof course.instructor === 'string' 
                              ? course.instructor.charAt(0).toUpperCase()
                              : typeof course.instructor === 'object' && course.instructor 
                                ? ((course.instructor as any).firstName || '').charAt(0).toUpperCase()
                                : 'U'}
                          </span>
                        </div>
                        <span className="text-sm">
                          {typeof course.instructor === 'string' 
                            ? course.instructor 
                            : typeof course.instructor === 'object' && course.instructor 
                              ? `${(course.instructor as any).firstName || ''} ${(course.instructor as any).lastName || ''}`.trim()
                              : 'Unknown Instructor'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {progressPercentage}%
                        </span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-600" 
                      />
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{completedLessons} lessons completed</span>
                        <span>{totalLessons} total lessons</span>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-sky-500/20">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Duration</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{course.duration}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/20">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Units Completed</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
           {(() => {
             const progress = courseProgress[course.id];
             console.log('🔍 Course box progress data:', {
               courseId: course.id,
               courseTitle: course.title,
               hasProgress: !!progress,
               progressStructure: progress,
               completedUnits: progress?.courseProgress?.completedUnits,
               totalUnits: (course.units || course.modules || []).length,
               courseProgressKeys: progress ? Object.keys(progress) : [],
               courseProgressStructure: progress?.courseProgress ? Object.keys(progress.courseProgress) : [],
               allCourseProgressKeys: Object.keys(courseProgress),
               courseProgressValues: Object.values(courseProgress).map(p => ({
                 hasCourseProgress: !!p?.courseProgress,
                 completedUnits: p?.courseProgress?.completedUnits,
                 totalUnits: p?.courseProgress?.totalUnits
               })),
               // More detailed inspection
               progressCourseProgress: progress?.courseProgress,
               progressCourseProgressKeys: progress?.courseProgress ? Object.keys(progress.courseProgress) : [],
               progressCourseProgressValues: progress?.courseProgress ? Object.values(progress.courseProgress) : [],
               // Debug the courseProgress state directly
               fullCourseProgressState: courseProgress,
               courseProgressForThisCourse: courseProgress[course.id],
               allCourseProgressEntries: Object.entries(courseProgress),
               // Debug the actual progress structure
               progressStructureKeys: progress ? Object.keys(progress) : [],
               progressStructureValues: progress ? Object.values(progress) : [],
               progressCourseProgressKeys2: progress?.courseProgress ? Object.keys(progress.courseProgress) : [],
               progressCourseProgressValues2: progress?.courseProgress ? Object.values(progress.courseProgress) : [],
               // Debug the specific completedUnits calculation
               completedUnitsFromProgress: progress?.courseProgress?.completedUnits,
               totalUnitsFromProgress: progress?.courseProgress?.totalUnits,
               completedLessonsFromProgress: progress?.courseProgress?.completedLessons,
               totalLessonsFromProgress: progress?.courseProgress?.totalLessons
             });
             return `${progress?.courseProgress?.completedUnits || 0}/${(course.units || course.modules || []).length || 0}`;
           })()}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className={`w-full h-12 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                        isCourseComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30'
                          : hasStarted
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/30' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30'
                      }`}
                      onClick={() => {
                        if (hasStarted) {
                          handleViewCourse(course);
                        } else {
                          handleStartCourse(course);
                        }
                      }}
                    >
                      {isCourseComplete ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      ) : (
                        <Play className="w-5 h-5 mr-2" />
                      )}
                      {isCourseComplete ? 'Course completed' : hasStarted ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="col-span-full">
                <div className="rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/30">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Enrolled Courses</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-1">You haven't enrolled in any courses yet.</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Contact your instructor to get enrolled, or if you just paid with Yoco, add your course below.</p>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-950/50"
                    disabled={addCourseLoading}
                    onClick={handleJustPaidAddCourse}
                  >
                    {addCourseLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {addCourseLoading ? 'Adding your course…' : 'Just paid? Add my course'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Grading Tab */}
        <TabsContent value="grades" className="space-y-6 mt-8">
          <LearnerGradingTab />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-8">
          <CalendarComponent 
            events={calendarEvents}
            onEventClick={handleEventClick}
            userRole="learner"
            currentUserId={user?.id}
          />
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6 mt-8">
          <CommunityPage />
        </TabsContent>
      </Tabs>
      </div>

      {/* Folder Contents Modal */}
      <Dialog open={showFolderContents} onOpenChange={setShowFolderContents}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6 text-blue-600" />
                <div>
                  <DialogTitle>
                    {viewingFolderContents && poeFolders.find(f => f.id === viewingFolderContents)?.name}
                  </DialogTitle>
                  <DialogDescription>
                    {viewingFolderContents && (() => {
                      const folder = poeFolders.find(f => f.id === viewingFolderContents);
                      const documents = getFolderDocuments(viewingFolderContents);
                      return `${documents.length} document${documents.length !== 1 ? 's' : ''} ${folder?.moduleName ? `• ${folder.moduleName}` : '• No module assigned'}`;
                    })()}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseFolderContents}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {viewingFolderContents && (() => {
              const documents = getFolderDocuments(viewingFolderContents);
              
              if (documents.length === 0) {
                return (
                  <div className="text-center py-12 text-muted-foreground">
                    <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No documents yet</p>
                    <p className="text-sm">Upload documents to this folder to see them here</p>
                  </div>
                );
              }

              return documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <File className="w-8 h-8 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{doc.fileName}</h4>
                        <p className="text-sm text-muted-foreground truncate">{doc.moduleTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.fileSize)} • {new Date(doc.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(doc as any).grade && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {(doc as any).grade}/{(doc as any).points || 100}
                        </Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // In a real app, this would download or view the file
                          alert(`Would download: ${doc.fileName}`);
                        }}
                        className="ml-2"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  {(doc as any).feedback && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Instructor Feedback:</p>
                      <p className="text-sm mt-1">{(doc as any).feedback}</p>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Timetable Event Dialog */}
      <TimetableEventDialog
        isOpen={timetableDialogOpen}
        onClose={() => {
          setTimetableDialogOpen(false);
          setSelectedTimetableEvent(null);
        }}
        onSave={handleSaveTimetableEvent}
        event={selectedTimetableEvent}
      />

      {renderCourseCompletionSummary()}

      {/* Event Details Dialog */}
      <EventDetailsDialog
        isOpen={eventDetailsOpen}
        onClose={handleCloseEventDetails}
        event={selectedEvent}
        onAccept={handleAcceptEvent}
        onDecline={handleDeclineEvent}
        currentUserId={user?.id}
        isProcessing={isProcessingEvent}
      />

      {/* Assessment Submission Dialog */}
      {showAssessmentDialog && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {selectedAssessment.submissions?.find(s => s.learnerId === user?.id) 
                  ? 'View Submission' 
                  : 'Submit Assessment'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAssessmentDialog(false);
                  setSelectedAssessment(null);
                  setSubmissionFiles([]);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedAssessment.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedAssessment.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>Max Marks: {selectedAssessment.maxMarks}</span>
                  <span>Passing Score: {selectedAssessment.passingScore}</span>
                  {selectedAssessment.dueDate && (
                    <span>Due: {new Date(selectedAssessment.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Assessment Instructions */}
              {selectedAssessment.instructions && (
                <div>
                  <Label className="text-sm font-medium">Instructions:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                    {selectedAssessment.instructions}
                  </div>
                </div>
              )}

              {/* Assessment Files */}
              {selectedAssessment.files.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Assessment Documents:</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAssessment.files.map((file, fileIndex) => (
                      <Button
                        key={fileIndex}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAssessmentFile(file)}
                        className="text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {file.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Section - Always Show */}
              <div>
                <Label>Upload Your Work</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload your completed work (PDF, DOC, etc.)</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleAssessmentFileUpload}
                    className="hidden"
                    id="submission-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('submission-file-upload')?.click()}
                    disabled={uploadingSubmission}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingSubmission ? 'Uploading...' : 'Choose Files'}
                  </Button>
                </div>
                
                {/* Uploaded Files */}
                {submissionFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Files:</Label>
                    {submissionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubmissionFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button - Always Show */}
              <Button
                onClick={submitAssessment}
                disabled={submissionFiles.length === 0 || uploadingSubmission}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedAssessment.submissions?.find(s => s.learnerId === user?.id) ? 'Resubmit Assessment' : 'Submit Assessment'}
              </Button>

              {/* Existing Submission */}
              {selectedAssessment.submissions?.find(s => s.learnerId === user?.id) && (
                <div>
                  <Label>Your Submission:</Label>
                  <div className="mt-2 p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Submitted</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.submittedAt).toLocaleString()}
                    </p>
                    {selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.grade && (
                      <p className="text-sm text-gray-600">
                        Grade: {selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.grade}/{selectedAssessment.maxMarks}
                      </p>
                    )}
                    {selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.feedback && (
                      <p className="text-sm text-gray-600">
                        Feedback: {selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.feedback}
                      </p>
                    )}
                  </div>

                  {/* Original Assignment Documents */}
                  {selectedAssessment.files && selectedAssessment.files.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-blue-800 font-medium">Assignment Documents:</Label>
                      <div className="mt-2 space-y-2">
                        {selectedAssessment.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-sm font-medium text-blue-800">{file.name}</span>
                                <p className="text-xs text-blue-600">
                                  {FileUploadService.formatFileSize(file.size)} • Assignment Document
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadAssessmentFile(file)}
                              className="text-blue-600 hover:text-blue-800 border-blue-300"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marked Documents Section (Graded Assignments) */}
                  {selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.markedDocuments && 
                   selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.markedDocuments!.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-green-800 font-medium">Graded Assignments:</Label>
                      <div className="mt-2 space-y-2">
                        {selectedAssessment.submissions.find(s => s.learnerId === user?.id)!.markedDocuments!.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <div>
                                <span className="text-sm font-medium text-green-800">{file.name}</span>
                                <p className="text-xs text-green-600">
                                  {FileUploadService.formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.url;
                                link.download = file.name;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-green-600 hover:text-green-800 border-green-300"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssessmentDialog(false);
                  setSelectedAssessment(null);
                  setSubmissionFiles([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};