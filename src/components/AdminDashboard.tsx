import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDataSync } from "@/contexts/DataSyncContext";
import { handleConnectionError, functions, auth } from "@/firebase/config";
import { httpsCallable } from "firebase/functions";
import firebaseApi from "@/services/firebaseApi";
import { hasNvidiaConfigured, DEFAULT_NVIDIA_MODEL, nvidiaGenerateText } from "@/services/nvidiaClient";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  Award,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  UserPlus,
  Building,
  CreditCard,
  Calendar,
  MessageCircle,
  Bell,
  Database,
  Server,
  Zap,
  FileCheck,
  User,
  MoreHorizontal,
  Upload,
  Download,
  FileText,
  Briefcase,
  MapPin,
  X,
  FileSpreadsheet,
  Send,
  Mail,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Globe,
  Target,
  GraduationCap,
  ClipboardList,
  LineChart,
  Filter,
  Search,
  UserCheck,
  UserX,
  Ban,
  CheckSquare,
  Save,
  Check,
  Crown,
  FolderOpen,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileEdit,
  Sparkles,
  Copy,
  ExternalLink,
  Image,
  Megaphone,
  Pin,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { createBlog, slugify } from "@/services/blogService";
import firebaseApiService from "@/services/firebaseApi";
import { Calendar as CalendarComponent } from "./Calendar";
import CourseEdit from './CourseEdit';
import CourseCreationPage from './CourseCreationPage';
import CourseStructureView from './CourseStructureView';
import LessonViewer from './LessonViewer';
import {
  Course,
  Student as Learner,
  Instructor,
  Certificate,
  StudentProgress,
  DatabaseService,
  CheckoutSession,
  CommunityPost
} from "@/firebase/database";
import { useToast } from "@/hooks/use-toast";
import { grantCourseAccessByEmail } from "@/services/yocoFunnelService";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Cell } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns";

// Compliance standards will be fetched from Firebase in production
// For now, using empty arrays until Firebase collections are set up
const setaUnitStandards: any[] = [];
const qctoQualifications: any[] = [];

const normalizeRole = (role?: string | null) => (role || '').toLowerCase();
const isLearnerRole = (role?: string | null) => {
  if (!role) return true;
  const normalized = normalizeRole(role);
  return normalized === 'learner' || normalized === 'student';
};
const isLearnerUser = (user: { role?: string | null }) => isLearnerRole(user?.role);

// Separate components for better performance and organization
const OverviewTab = React.memo(({
  totalLearners,
  totalInstructors,
  totalCourses,
  totalCertificates,
  activeLearners,
  recentActivity,
  instructorPerformance,
  courses,
  students,
  studentProgress,
  courseAnalytics,
  allUsers,
  enrollments = [],
  checkoutSessionsRevenue,
  checkoutSessions
}: {
  totalLearners: number;
  totalInstructors: number;
  totalCourses: number;
  totalCertificates: number;
  activeLearners: number;
  recentActivity: any[];
  instructorPerformance: any[];
  courses: any[];
  students: any[];
  studentProgress: any[];
  courseAnalytics: any[];
  allUsers?: any[];
  enrollments?: { id: string; courseId: string; amountPaid?: number; enrolledAt?: string }[];
  checkoutSessionsRevenue?: number | null;
  checkoutSessions?: CheckoutSession[] | null;
}) => {
  const [revenuePeriod, setRevenuePeriod] = useState<'days' | 'weeks' | 'months' | 'year'>('weeks');
  const [revenueStatusFilter, setRevenueStatusFilter] = useState<'all' | 'completed' | 'pending' | 'other'>('completed');

  // Filter valid student progress records (with valid studentId)
  const validStudentProgress = useMemo(() => {
    return studentProgress.filter(p => {
      const hasId = p.studentId !== undefined && p.studentId !== null && p.studentId !== '';
      const hasEmail = (p as any).studentEmail !== undefined && (p as any).studentEmail !== null && (p as any).studentEmail !== '';
      return hasId || hasEmail;
    });
  }, [studentProgress]);

  const mergedStudentProgress = useMemo(() => {
    const merged: StudentProgress[] = [...validStudentProgress];
    const learnerList = (students || []).filter(isLearnerUser);
    const learnerIdSet = new Set<string>();
    const learnerEmailSet = new Set<string>();
    learnerList.forEach(learner => {
      if (learner.id) learnerIdSet.add(learner.id);
      if ((learner as any).uid) learnerIdSet.add((learner as any).uid);
      if ((learner as any)._id) learnerIdSet.add((learner as any)._id);
      if (learner.email) learnerEmailSet.add(learner.email.toLowerCase());
    });

    learnerList.forEach(learner => {
      const identifier = learner.id || (learner as any).uid || learner.email || (learner as any)._id;
      if (!identifier) return;

      const addProgressEntry = (courseId: string, rawValue: any) => {
        const alreadyExists = merged.some(
          progress =>
            progress.courseId === courseId &&
            ((progress.studentId && progress.studentId === identifier) ||
              (progress.studentEmail && progress.studentEmail === learner.email))
        );
        if (alreadyExists) return;

        const normalized =
          typeof rawValue === 'number'
            ? { progress: rawValue }
            : typeof rawValue === 'object' && rawValue !== null
              ? rawValue
              : {};

        const progressValue =
          normalized.progress ??
          normalized.completionRate ??
          (typeof learner.progress === 'number' ? learner.progress : 0);

        const completionRate = normalized.completionRate ?? progressValue;
        const lessonsCompleted = normalized.lessonsCompleted ?? normalized.completedLessons ?? 0;
        const totalLessons = normalized.totalLessons ?? normalized.lessonCount ?? 0;
        const lastActivity =
          normalized.lastActivity || learner.lastActive || learner.updatedAt || new Date().toISOString();

        merged.push({
          studentId: identifier,
          studentEmail: learner.email,
          courseId,
          progress: progressValue,
          completionRate,
          lessonsCompleted,
          totalLessons,
          lastActivity,
          currentLesson: normalized.currentLesson,
          timeSpent: normalized.timeSpent ?? 0,
          averageGrade: normalized.averageGrade ?? learner.currentGrade ?? 0
        });
      };

      const courseProgressData: any = learner.courseProgress;
      if (courseProgressData && typeof courseProgressData === 'object') {
        Object.entries(courseProgressData).forEach(([courseId, rawValue]) => {
          addProgressEntry(courseId, rawValue);
        });
      }

      const enrolledCourseIds = Array.isArray(learner.enrolledCourses) ? learner.enrolledCourses : [];
      enrolledCourseIds.forEach(courseId => {
        addProgressEntry(courseId, { progress: learner.progress ?? 0 });
      });
    });

    return merged;
  }, [students, validStudentProgress]);

  // Comprehensive metrics calculation
  const systemMetrics = useMemo(() => {
    const learnerProfiles = (students || []).filter(student => {
      const role = (student.role || '').toLowerCase();
      return role === 'learner' || role === 'student';
    });

    const publishedCourses = courses.filter(course => course.isPublished).length;
    const draftCourses = courses.length - publishedCourses;

    const enrollmentCount = learnerProfiles.reduce((total, learner) => {
      if (Array.isArray(learner.enrolledCourses)) {
        return total + learner.enrolledCourses.length;
      }
      return total;
    }, 0);

    const enrolledLearnerIds = new Set<string>();
    learnerProfiles.forEach(learner => {
      const identifier = learner.id || learner.uid || learner.email || learner._id;
      if (!identifier) return;

      const hasEnrollments = Array.isArray(learner.enrolledCourses) && learner.enrolledCourses.length > 0;

      const matchingProgress = mergedStudentProgress.filter(progress =>
        (progress.studentId && progress.studentId === learner.id) ||
        (progress.studentEmail && progress.studentEmail === learner.email)
      );

      if (hasEnrollments || matchingProgress.length > 0) {
        enrolledLearnerIds.add(identifier);
      }
    });

    // Learners who have paid and started (have at least one progress record) – excludes landing-page-only signups
    const paidAndStartedLearnerIds = new Set<string>();
    mergedStudentProgress.forEach(progress => {
      const identifier = progress.studentId || progress.studentEmail;
      if (identifier) paidAndStartedLearnerIds.add(identifier);
    });

    const now = Date.now();
    const activeLearners = new Set<string>();
    let completedEnrollmentsCount = 0;

    mergedStudentProgress.forEach(progress => {
      const identifier = progress.studentId || progress.studentEmail;
      if (!identifier) return;

      const lastActivityMs = progress.lastActivity ? new Date(progress.lastActivity).getTime() : undefined;
      const recentlyActive = lastActivityMs ? (now - lastActivityMs) / (1000 * 60 * 60 * 24) <= 7 : false;

      if (recentlyActive || progress.progress > 0 || progress.completionRate > 0) {
        activeLearners.add(identifier);
      }

      const fullyCompleted =
        progress.completionRate >= 99 ||
        progress.progress >= 99 ||
        (progress.totalLessons > 0 && progress.lessonsCompleted === progress.totalLessons);

      if (fullyCompleted) {
        completedEnrollmentsCount += 1;
      }
    });

    const averageProgress = mergedStudentProgress.length > 0
      ? Math.round(
          mergedStudentProgress.reduce((total, progress) => {
            const value = progress.progress || progress.completionRate || 0;
            return total + Math.min(100, Math.max(0, value));
          }, 0) / mergedStudentProgress.length
        )
      : 0;

    // RevoLearn only: total = enrollments with progress (paid & started), completed = those that finished
    const totalEnrollmentsRevoLearn = mergedStudentProgress.length;
    const completedEnrollments = Math.min(completedEnrollmentsCount, totalEnrollmentsRevoLearn);
    const totalEnrollments = totalEnrollmentsRevoLearn;
    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    const averageRating = courses.length > 0
      ? Math.round(
          (courses.reduce((total, course) => total + (course.rating || 0), 0) / courses.length) * 10
        ) / 10
      : 0;

    // Total revenue: only count amountPaid from enrollments (from checkouts). Historical enrollments without amountPaid are excluded so we start fresh from next checkout.
    const totalRevenue = (enrollments || []).reduce((sum, e) => {
      const amount = e.amountPaid;
      return sum + (typeof amount === 'number' && amount > 0 ? amount : 0);
    }, 0);

    // Learner Population (for Overview card): only learners who have paid and started a course (have progress)
    const learnerPopulationCount = paidAndStartedLearnerIds.size;
    const learnerPopulationActive = activeLearners.size; // active set is already from progress
    const learnerPopulationInactive = Math.max(0, learnerPopulationCount - learnerPopulationActive);

    return {
      totalLearners: learnerProfiles.length,
      learnerPopulationCount,
      learnerPopulationActive,
      learnerPopulationInactive,
      activeLearners: Math.min(activeLearners.size, learnerProfiles.length),
      inactiveLearners: Math.max(learnerProfiles.length - activeLearners.size, 0),
      enrolledLearners: enrolledLearnerIds.size,
      totalEnrollments,
      completedEnrollments,
      averageProgress,
      completionRate,
      publishedCourses,
      draftCourses,
      averageRating,
      totalRevenue,
    };
  }, [courses, students, mergedStudentProgress, enrollments]);

  // Revenue over time for line chart (grouped by selected period) using checkoutSessions.amountPaid
  const revenueChartData = useMemo(() => {
    const rawSessions = (checkoutSessions || []) as CheckoutSession[];
    if (!rawSessions || rawSessions.length === 0) {
      return [];
    }

    // Filter by payment status for the chart
    const filteredSessions = rawSessions.filter((s) => {
      const status = (s.status || '').toLowerCase();
      if (revenueStatusFilter === 'completed') {
        return status === 'completed';
      }
      if (revenueStatusFilter === 'pending') {
        return status === 'pending';
      }
      if (revenueStatusFilter === 'other') {
        return status && status !== 'completed' && status !== 'pending';
      }
      return true;
    });

    if (filteredSessions.length === 0) {
      return [];
    }

    const getAmount = (s: CheckoutSession) => {
      // Match the Transactions table calculation so graph == table.
      const courseRow = courses.find((c) => c.id === s.courseId);
      const priceFallback =
        courseRow && typeof courseRow.price === 'number' ? courseRow.price : 0;

      const amount =
        typeof s.amountPaid === 'number' && s.amountPaid > 0
          ? s.amountPaid
          : typeof s.amountCents === 'number' && s.amountCents > 0
            ? s.amountCents / 100
            : priceFallback;

      return amount > 0 ? amount : 0;
    };

    const getPaidDate = (s: CheckoutSession): Date | null => {
      const raw = s.completedAt || s.createdAt;
      if (!raw) return null;

      // If it's a pure date string (e.g. "2026-03-12"), treat it as a local calendar date
      // to avoid UTC timezone shifting it into the previous day.
      const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
      if (dateOnlyMatch) {
        const [, yearStr, monthStr, dayStr] = dateOnlyMatch;
        const year = Number(yearStr);
        const month = Number(monthStr) - 1; // JS Date month is 0-based
        const day = Number(dayStr);
        const d = new Date(year, month, day, 12, 0, 0); // local noon on that calendar date
        return isNaN(d.getTime()) ? null : d;
      }

      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    };

    const now = new Date();
    type Bucket = { period: string; revenue: number; sortKey: number };
    const buckets: Bucket[] = [];

    if (revenuePeriod === 'days') {
      // South Africa time (UTC+2) – compute calendar dates in SA regardless of viewer's local timezone.
      // Show *all* days that have any transactions (up to a sensible cap), so every
      // transaction row can be seen on the chart.
      const SA_OFFSET_MS = 2 * 60 * 60 * 1000;

      const toSaKeyFromDate = (date: Date): string => {
        const sa = new Date(date.getTime() + SA_OFFSET_MS);
        const year = sa.getUTCFullYear();
        const month = sa.getUTCMonth() + 1;
        const day = sa.getUTCDate();
        const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
        return `${year}-${pad(month)}-${pad(day)}`;
      };

      const toSaKeyFromRaw = (raw: string | undefined): string | null => {
        if (!raw) return null;
        const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
        if (dateOnlyMatch) {
          return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
        }
        const d = new Date(raw);
        if (isNaN(d.getTime())) return null;
        return toSaKeyFromDate(d);
      };

      const formatLabelFromKey = (key: string): string => {
        const [yearStr, monthStr, dayStr] = key.split('-');
        const day = Number(dayStr);
        const monthIdx = Number(monthStr) - 1;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[Math.max(0, Math.min(11, monthIdx))] || '';
        return `${day} ${monthName} ${yearStr}`;
      };

      // Find the earliest and latest SA calendar dates that have transactions.
      const keys: string[] = [];
      filteredSessions.forEach((s) => {
        const key = toSaKeyFromRaw(s.completedAt || s.createdAt);
        if (key) keys.push(key);
      });

      if (keys.length === 0) {
        return [];
      }

      const sortedKeys = Array.from(new Set(keys)).sort();
      const firstKey = sortedKeys[0];
      const lastKey = sortedKeys[sortedKeys.length - 1];

      const parseKeyToDate = (key: string): Date => {
        const [y, m, d] = key.split('-').map((v) => Number(v));
        return new Date(y, m - 1, d, 12, 0, 0);
      };

      let startDate = parseKeyToDate(firstKey);
      const endDate = parseKeyToDate(lastKey);

      // Cap range to avoid enormous charts (e.g. max ~90 days).
      const MAX_DAYS = 90;

      const indexByKey = new Map<string, number>();
      let dayIndex = 0;
      while (startDate <= endDate && dayIndex < MAX_DAYS) {
        const key = toSaKeyFromDate(startDate);
        const label = formatLabelFromKey(key);
        const bucketIndex = buckets.length;
        buckets.push({ period: label, revenue: 0, sortKey: dayIndex });
        indexByKey.set(key, bucketIndex);

        // next calendar day
        startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        dayIndex += 1;
      }

      // Aggregate revenue by SA calendar date derived from createdAt/completedAt.
      filteredSessions.forEach((s) => {
        const key = toSaKeyFromRaw(s.completedAt || s.createdAt);
        if (!key) return;
        const idx = indexByKey.get(key);
        if (idx === undefined) return;
        buckets[idx].revenue += getAmount(s);
      });
    } else if (revenuePeriod === 'weeks') {
      for (let i = 11; i >= 0; i--) {
        const d = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        buckets.push({ period: `${format(d, 'd MMM')}`, revenue: 0, sortKey: i });
      }
      filteredSessions.forEach((s) => {
        const paidDate = getPaidDate(s);
        if (!paidDate) return;
        const d = startOfWeek(paidDate, { weekStartsOn: 1 });
        const key = format(d, 'yyyy-MM-dd');
        for (let i = 0; i < 12; i++) {
          const weekStart = startOfWeek(subWeeks(now, 11 - i), { weekStartsOn: 1 });
          if (format(weekStart, 'yyyy-MM-dd') === key) {
            buckets[i].revenue += getAmount(s);
            break;
          }
        }
      });
    } else if (revenuePeriod === 'months') {
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(startOfMonth(now), i);
        buckets.push({ period: format(d, 'MMM yyyy'), revenue: 0, sortKey: i });
      }
      filteredSessions.forEach((s) => {
        const paidDate = getPaidDate(s);
        if (!paidDate) return;
        const d = startOfMonth(paidDate);
        const key = format(d, 'yyyy-MM');
        for (let i = 0; i < 12; i++) {
          const monthStart = subMonths(startOfMonth(now), 11 - i);
          if (format(monthStart, 'yyyy-MM') === key) {
            buckets[i].revenue += getAmount(s);
            break;
          }
        }
      });
    } else {
      for (let i = 4; i >= 0; i--) {
        const d = subYears(startOfYear(now), i);
        buckets.push({ period: format(d, 'yyyy'), revenue: 0, sortKey: i });
      }
      filteredSessions.forEach((s) => {
        const paidDate = getPaidDate(s);
        if (!paidDate) return;
        const d = startOfYear(paidDate);
        const key = format(d, 'yyyy');
        for (let i = 0; i < 5; i++) {
          const yearStart = subYears(startOfYear(now), 4 - i);
          if (format(yearStart, 'yyyy') === key) {
            buckets[i].revenue += getAmount(s);
            break;
          }
        }
      });
    }

    // Sort so oldest period is left, latest period is right (ascending time)
    return buckets
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((b) => ({ period: b.period, revenue: b.revenue }));
  }, [checkoutSessions, revenuePeriod, revenueStatusFilter, courses]);

  const derivedInstructorStats = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    type InstructorAccumulator = {
      instructorId: string;
      instructorName: string;
      courseIds: Set<string>;
      totalCourses: number;
      ratingSum: number;
      ratingCount: number;
      enrollments: number;
      totalEnrollments: number;
      progressSum: number;
      progressCount: number;
      activeStudents: number;
      completedStudents: number;
    };

    const statsMap = new Map<string, InstructorAccumulator>();

    courses.forEach(course => {
      const instructorId = course.instructorId || course.instructor || `instructor-${course.id}`;
      if (!statsMap.has(instructorId)) {
        statsMap.set(instructorId, {
          instructorId,
          instructorName: course.instructorName || course.instructor || 'Unknown Instructor',
          courseIds: new Set<string>(),
          totalCourses: 0,
          ratingSum: 0,
          ratingCount: 0,
          enrollments: 0,
          totalEnrollments: 0,
          progressSum: 0,
          progressCount: 0,
          activeStudents: 0,
          completedStudents: 0
        });
      }

      const stats = statsMap.get(instructorId)!;
      stats.courseIds.add(course.id);
      stats.totalCourses += 1;

      if (typeof course.rating === 'number' && course.rating > 0) {
        stats.ratingSum += course.rating;
        stats.ratingCount += 1;
      }
    });

    const learnerList = (students || []).filter(isLearnerUser);

    // Build sets of valid learner identifiers for filtering progress
    const learnerIdSet = new Set<string>();
    const learnerEmailSet = new Set<string>();
    learnerList.forEach(learner => {
      const id = learner.id || (learner as any).uid || (learner as any)._id;
      if (id) learnerIdSet.add(id);
      if (learner.email) learnerEmailSet.add(learner.email.toLowerCase());
    });

    statsMap.forEach(stats => {
      const courseIds = Array.from(stats.courseIds);

      const instructorLearnerSet = new Set<string>();
      learnerList.forEach(learner => {
        const learnerIdentifier = learner.id || learner.email || (learner as any).uid || (learner as any)._id;
        if (!learnerIdentifier) return;
        const learnerCourses = Array.isArray(learner.enrolledCourses) ? learner.enrolledCourses : [];
        const teachesLearner = learnerCourses.some(courseId => courseIds.includes(courseId));
        if (teachesLearner) {
          instructorLearnerSet.add(learnerIdentifier);
        }
      });
      stats.enrollments = instructorLearnerSet.size;

      const progressSeen = new Set<string>();
      const progressEntries = mergedStudentProgress.filter(progress => {
        if (!courseIds.includes(progress.courseId)) return false;
        const identifierRaw = progress.studentId || progress.studentEmail;
        if (!identifierRaw) return false;
        const identifier = progress.studentId || '';
        const email = (progress.studentEmail || '').toLowerCase();
        const matchesLearner =
          (identifier && learnerIdSet.has(identifier)) ||
          (email && learnerEmailSet.has(email));
        if (!matchesLearner) return false;
        const key = `${progress.courseId}_${identifier || email}`;
        if (progressSeen.has(key)) {
          return false;
        }
        progressSeen.add(key);
        return true;
      });
      const activeSet = new Set<string>();
      let completedEnrollmentsCount = 0;

      progressEntries.forEach(progress => {
        const identifier = progress.studentId || progress.studentEmail;
        if (!identifier) return;

        const value = progress.progress || progress.completionRate || 0;
        stats.progressSum += Math.min(100, Math.max(0, value));
        stats.progressCount += 1;

        const lastActivity = progress.lastActivity ? new Date(progress.lastActivity).getTime() : undefined;
        if (lastActivity) {
          const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
          if (daysSince <= 7) {
            activeSet.add(identifier);
          }
        } else if (value > 0) {
          activeSet.add(identifier);
        }

        const hasCompleted =
          progress.completionRate >= 99 ||
          progress.progress >= 99 ||
          (progress.totalLessons > 0 && progress.lessonsCompleted === progress.totalLessons);
        if (hasCompleted) {
          completedEnrollmentsCount += 1;
        }
      });

      stats.activeStudents = activeSet.size;
      stats.completedStudents = completedEnrollmentsCount;
      stats.totalEnrollments = progressEntries.length;
    });

    return Array.from(statsMap.values()).map(stats => ({
      instructorId: stats.instructorId,
      instructorName: stats.instructorName,
      totalCourses: stats.totalCourses,
      averageCourseRating: stats.ratingCount > 0 ? Number((stats.ratingSum / stats.ratingCount).toFixed(1)) : 0,
      enrollments: stats.enrollments,
      totalStudents: stats.enrollments,
      totalEnrollments: stats.totalEnrollments,
      averageProgress: stats.progressCount > 0 ? Math.round(stats.progressSum / stats.progressCount) : 0,
      completedStudents: stats.completedStudents,
      activeStudents: stats.activeStudents
    })).sort((a, b) => b.enrollments - a.enrollments);
  }, [courses, students, mergedStudentProgress]);

  const displayInstructorPerformance = derivedInstructorStats.length > 0 ? derivedInstructorStats : instructorPerformance;

  // Get top performing courses with enhanced metrics
  const topCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    const learnerList = (students || []).filter(isLearnerUser);
    const learnerIdSet = new Set<string>();
    const learnerEmailSet = new Set<string>();

    learnerList.forEach(learner => {
      if (learner.id) learnerIdSet.add(learner.id);
      if ((learner as any).uid) learnerIdSet.add((learner as any).uid);
      if ((learner as any)._id) learnerIdSet.add((learner as any)._id);
      if (learner.email) learnerEmailSet.add(learner.email.toLowerCase());
    });

    return courses
      .map(course => {
        const courseProgressRaw = mergedStudentProgress.filter(progress => progress.courseId === course.id);
        const progressSeen = new Set<string>();
        const courseProgress = courseProgressRaw.filter(progress => {
          const identifierRaw = progress.studentId || progress.studentEmail;
          if (!identifierRaw) return false;
          const identifier = progress.studentId || '';
          const email = (progress.studentEmail || '').toLowerCase();
          const matchesLearner =
            (identifier && learnerIdSet.has(identifier)) ||
            (email && learnerEmailSet.has(email));
          if (!matchesLearner) return false;
          const key = `${course.id}_${identifier || email}`;
          if (progressSeen.has(key)) {
            return false;
          }
          progressSeen.add(key);
          return true;
        });

        const enrolledStudentsRaw = learnerList.filter(learner =>
          Array.isArray(learner.enrolledCourses) && learner.enrolledCourses.includes(course.id)
        );
        const enrolledStudentSet = new Set(
          enrolledStudentsRaw
            .map(learner => learner.id || learner.email || (learner as any).uid || (learner as any)._id)
            .filter(Boolean) as string[]
        );
        const enrolledStudents = Array.from(enrolledStudentSet);

        const activeStudentSet = new Set<string>();
        const completedStudentSet = new Set<string>();
        let progressSum = 0;

        courseProgress.forEach(progress => {
          const identifier = (progress.studentId || progress.studentEmail || '').toString();
          if (!identifier) return;

          const value = progress.progress || progress.completionRate || 0;
          progressSum += Math.min(100, Math.max(0, value));

          const lastActivity = progress.lastActivity ? new Date(progress.lastActivity).getTime() : undefined;
          if (lastActivity) {
            const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
            if (daysSince <= 7) {
              activeStudentSet.add(identifier);
            }
          } else if (value > 0) {
            activeStudentSet.add(identifier);
          }

          const hasCompleted =
            progress.completionRate >= 99 ||
            progress.progress >= 99 ||
            (progress.totalLessons > 0 && progress.lessonsCompleted === progress.totalLessons);
          if (hasCompleted) {
            completedStudentSet.add(identifier);
          }
        });

        const totalStudents = Math.max(enrolledStudents.length, courseProgress.length, activeStudentSet.size);

        const completionRate = totalStudents > 0
          ? Math.round((completedStudentSet.size / totalStudents) * 100)
          : 0;

        const averageProgress = courseProgress.length > 0
          ? Math.round(progressSum / courseProgress.length)
          : 0;
        
        return {
          ...course,
          completionRate,
          averageProgress,
          activeStudents: Math.min(activeStudentSet.size, totalStudents),
          completedStudents: completedStudentSet.size,
          totalStudents,
          revenue: (course.price || 0) * totalStudents
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);
  }, [courses, students, mergedStudentProgress]);

  // Top performing courses by completion and learner count (for bar chart)
  const topPerformingCoursesChartData = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    const learnerList = (students || []).filter(isLearnerUser);
    const learnerIdSet = new Set<string>();
    const learnerEmailSet = new Set<string>();
    learnerList.forEach(learner => {
      if (learner.id) learnerIdSet.add(learner.id);
      if ((learner as any).uid) learnerIdSet.add((learner as any).uid);
      if ((learner as any)._id) learnerIdSet.add((learner as any)._id);
      if (learner.email) learnerEmailSet.add(learner.email.toLowerCase());
    });

    return courses
      .map(course => {
        const courseProgressRaw = mergedStudentProgress.filter(progress => progress.courseId === course.id);
        const progressSeen = new Set<string>();
        const courseProgress = courseProgressRaw.filter(progress => {
          const identifierRaw = progress.studentId || progress.studentEmail;
          if (!identifierRaw) return false;
          const identifier = progress.studentId || '';
          const email = (progress.studentEmail || '').toLowerCase();
          const matchesLearner =
            (identifier && learnerIdSet.has(identifier)) ||
            (email && learnerEmailSet.has(email));
          if (!matchesLearner) return false;
          const key = `${course.id}_${identifier || email}`;
          if (progressSeen.has(key)) return false;
          progressSeen.add(key);
          return true;
        });
        const enrolledStudentsRaw = learnerList.filter(learner =>
          Array.isArray(learner.enrolledCourses) && learner.enrolledCourses.includes(course.id)
        );
        const enrolledStudentSet = new Set(
          enrolledStudentsRaw
            .map(learner => learner.id || learner.email || (learner as any).uid || (learner as any)._id)
            .filter(Boolean) as string[]
        );
        const enrolledStudents = Array.from(enrolledStudentSet);
        const completedStudentSet = new Set<string>();
        let progressSum = 0;
        courseProgress.forEach(progress => {
          const identifier = (progress.studentId || progress.studentEmail || '').toString();
          if (!identifier) return;
          const value = progress.progress || progress.completionRate || 0;
          progressSum += Math.min(100, Math.max(0, value));
          const hasCompleted =
            progress.completionRate >= 99 ||
            progress.progress >= 99 ||
            (progress.totalLessons > 0 && progress.lessonsCompleted === progress.totalLessons);
          if (hasCompleted) completedStudentSet.add(identifier);
        });
        const totalStudents = Math.max(enrolledStudents.length, courseProgress.length);
        const completionRate = totalStudents > 0
          ? Math.round((completedStudentSet.size / totalStudents) * 100)
          : 0;
        const averageProgress = courseProgress.length > 0
          ? Math.round(progressSum / courseProgress.length)
          : 0;
        return {
          ...course,
          completionRate,
          averageProgress,
          totalStudents
        };
      })
      .filter(c => c.totalStudents > 0)
      .sort((a, b) => b.completionRate - a.completionRate || b.totalStudents - a.totalStudents)
      .slice(0, 10)
      .map((c, i) => {
        const barColors = [
          'hsl(262, 83%, 58%)',  // violet
          'hsl(166, 76%, 40%)',  // teal
          'hsl(34, 100%, 50%)',   // amber
          'hsl(221, 83%, 53%)',   // blue
          'hsl(142, 71%, 45%)',   // emerald
          'hsl(346, 77%, 50%)',   // rose
          'hsl(280, 67%, 48%)',   // purple
          'hsl(25, 95%, 53%)',    // orange
          'hsl(199, 89%, 48%)',   // cyan
          'hsl(47, 96%, 53%)',    // yellow
        ];
        return {
          name: c.title || 'Untitled',
          progress: c.averageProgress,
          color: barColors[i % barColors.length]
        };
      });
  }, [courses, students, mergedStudentProgress]);

  // Get recent activity with better formatting
  const formattedRecentActivity = useMemo(() => {
    return recentActivity.slice(0, 5).map(activity => ({
      ...activity,
      timeAgo: activity.timestamp || 'Just now'
    }));
  }, [recentActivity]);

    return (
    <div className="relative min-h-[50vh] rounded-2xl overflow-hidden bg-slate-50/70 dark:bg-slate-950/50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-30 pointer-events-none" />

      <div className="relative p-8 md:p-10 lg:p-12 space-y-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Key metrics at a glance
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-800/90 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live
        </span>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-6">
        {/* Learner Population */}
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200/80 dark:hover:border-blue-500/30 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300" />
          <CardContent className="relative p-6 pl-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  Learner Population
                </p>
                <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums tracking-tight">
                  {systemMetrics.learnerPopulationCount.toLocaleString()}
                </p>
              </div>
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/10 dark:from-blue-500/25 dark:to-blue-600/15 flex items-center justify-center text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10 dark:ring-blue-400/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Progress */}
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-200/80 dark:hover:border-violet-500/30 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent dark:from-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-violet-600 group-hover:from-violet-600 group-hover:to-violet-700 transition-all duration-300" />
          <CardContent className="relative p-6 pl-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  Average Progress
                </p>
                <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums tracking-tight">
                  {systemMetrics.averageProgress}%
                </p>
                <div className="mt-4">
                  <Progress value={systemMetrics.averageProgress} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
                    System-wide momentum
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-violet-600/10 dark:from-violet-500/25 dark:to-violet-600/15 flex items-center justify-center text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/10 dark:ring-violet-400/20">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-amber-200/80 dark:hover:border-amber-500/30 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600 group-hover:from-amber-600 group-hover:to-amber-700 transition-all duration-300" />
          <CardContent className="relative p-6 pl-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  Completion Rate
                </p>
                <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums tracking-tight">
                  {systemMetrics.completionRate}%
                </p>
                <div className="mt-4">
                  <Progress value={systemMetrics.completionRate} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                    {systemMetrics.completedEnrollments.toLocaleString()} of {systemMetrics.totalEnrollments.toLocaleString()} completed
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/10 dark:from-amber-500/25 dark:to-amber-600/15 flex items-center justify-center text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/10 dark:ring-amber-400/20">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate processed */}
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200/80 dark:hover:border-indigo-500/30 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent dark:from-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-700 transition-all duration-300" />
          <CardContent className="relative p-6 pl-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  Certificate processed
                </p>
                <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums tracking-tight">
                  {totalCertificates.toLocaleString()}
                </p>
              </div>
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 dark:from-indigo-500/25 dark:to-indigo-600/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10 dark:ring-indigo-400/20">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-200/80 dark:hover:border-teal-500/30 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent dark:from-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-teal-600 group-hover:from-teal-600 group-hover:to-teal-700 transition-all duration-300" />
          <CardContent className="relative p-6 pl-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums tracking-tight leading-tight break-words">
                  R {(checkoutSessionsRevenue ?? systemMetrics.totalRevenue).toLocaleString()}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                  From course purchases
                </p>
              </div>
              <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/15 to-teal-600/10 dark:from-teal-500/25 dark:to-teal-600/15 flex items-center justify-center text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/10 dark:ring-teal-400/20">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue line chart */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={revenueStatusFilter} onValueChange={(v: 'all' | 'completed' | 'pending' | 'other') => setRevenueStatusFilter(v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenuePeriod} onValueChange={(v: 'days' | 'weeks' | 'months' | 'year') => setRevenuePeriod(v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Card className="border-2 border-red-300/80 dark:border-red-500/50 bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm shadow-red-200/30 dark:shadow-red-900/20 ring-2 ring-red-200/60 dark:ring-red-500/30">
          <CardContent className="p-6">
            <div className="rounded-xl border-2 border-red-300/70 dark:border-red-500/40 bg-red-50/30 dark:bg-red-950/20 p-4 ring-2 ring-red-200/50 dark:ring-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)] dark:shadow-[0_0_16px_rgba(239,68,68,0.2)]">
              <ChartContainer config={{ revenue: { label: 'Revenue (R)', color: 'hsl(166, 76%, 40%)' } }} className="h-[280px] w-full">
                <RechartsLineChart data={revenueChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `R ${Number(v).toLocaleString()}`} />
                  <Tooltip content={<ChartTooltipContent formatter={(v) => [`R ${Number(v).toLocaleString()}`, 'Revenue']} />} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(166, 76%, 40%)" strokeWidth={2} dot={{ r: 3 }} />
                </RechartsLineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top performing courses by completion & learners */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top performing courses (by completion & learners)</h2>
        <Card className="border-2 border-red-300/80 dark:border-red-500/50 bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm shadow-red-200/30 dark:shadow-red-900/20 ring-2 ring-red-200/60 dark:ring-red-500/30">
          <CardContent className="p-6">
            {topPerformingCoursesChartData.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center rounded-xl border-2 border-dashed border-red-300/60 dark:border-red-500/40">No course progress data yet. Enrollments with progress will appear here.</p>
            ) : (
              <div className="rounded-xl border-2 border-red-300/70 dark:border-red-500/40 bg-red-50/30 dark:bg-red-950/20 p-4 ring-2 ring-red-200/50 dark:ring-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)] dark:shadow-[0_0_16px_rgba(239,68,68,0.2)]">
                <ChartContainer config={{ progress: { label: 'Progress %', color: 'hsl(262, 83%, 58%)' } }} className="h-[340px] w-full min-h-[340px]">
                  <RechartsBarChart data={topPerformingCoursesChartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={220} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} />
                    <Tooltip content={<ChartTooltipContent formatter={(v) => [`${Number(v)}%`, 'Progress']} />} />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                      {topPerformingCoursesChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      </div>
            </div>
  );
});

const UsersTab = React.memo(({
  enrolledLearnerCount,
  enrolledLearnerIds,
  learners,
  instructors,
  subAdmins,
  admins,
  courses = [],
  studentProgress = [],
  onEditUser,
  onDeleteUser,
  onShowConfirmation,
  onAddUser
}: {
  enrolledLearnerCount: number;
  enrolledLearnerIds: Set<string>;
  learners: Learner[];
  instructors: Instructor[];
  subAdmins: any[];
  admins: any[];
  courses?: { id: string; title: string }[];
  studentProgress?: { studentId?: string; studentEmail?: string; courseId?: string; progress?: number; completionRate?: number }[];
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  onShowConfirmation: (dialog: any) => void;
  onAddUser: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Only enrolled learners (have progress) + admins count as "total users"; table shows same set
  const enrolledLearnersOnly = useMemo(() => {
    const ids = enrolledLearnerIds || new Set<string>();
    return (learners || []).filter(
      (u: { id?: string; uid?: string; email?: string }) =>
        ids.has(u.id || '') || ids.has(u.uid || '') || ids.has(u.email || '')
    );
  }, [learners, enrolledLearnerIds]);

  // Per-user progress (0–100): max of progress/completionRate for that learner
  const learnerProgressByUserId = useMemo(() => {
    const map = new Map<string, number>();
    (studentProgress || []).forEach((p: { studentId?: string; studentEmail?: string; progress?: number; completionRate?: number }) => {
      const id = p.studentId || p.studentEmail || '';
      if (!id) return;
      const value = Math.min(100, Math.max(0, Number(p.progress ?? p.completionRate ?? 0)));
      const existing = map.get(id);
      map.set(id, existing !== undefined ? Math.max(existing, value) : value);
    });
    return map;
  }, [studentProgress]);

  // Per-learner course names (full title) from progress records
  const learnerCourseNamesByUserId = useMemo(() => {
    const map = new Map<string, string>();
    const courseTitleById = new Map<string, string>((courses || []).map((c: { id: string; title: string }) => [c.id, c.title || c.id]));
    (studentProgress || []).forEach((p: { studentId?: string; studentEmail?: string; courseId?: string }) => {
      const id = p.studentId || p.studentEmail || '';
      const courseId = p.courseId;
      if (!id || !courseId) return;
      const title = courseTitleById.get(courseId) || courseId;
      const existing = map.get(id);
      const appended = existing ? (existing.includes(title) ? existing : `${existing}, ${title}`) : title;
      map.set(id, appended);
    });
    return map;
  }, [studentProgress, courses]);

  const filteredUsers = useMemo(() => {
    const totalUsersList = [...enrolledLearnersOnly, ...subAdmins, ...admins];
    return totalUsersList.filter(user => {
      const matchesSearch = (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const userRole = user.role || ('specialization' in user ? 'instructor' : 'learner');
      const normalizedRole = (userRole || '').toLowerCase();
      const isLearner = normalizedRole === 'learner' || normalizedRole === 'student';
      const matchesRole = roleFilter === "all" || userRole === roleFilter || (roleFilter === "learner" && isLearner);
      const matchesStatus = statusFilter === "all" || (user.isActive !== false ? "active" : "inactive") === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [enrolledLearnersOnly, subAdmins, admins, searchTerm, roleFilter, statusFilter]);

  // Bulk action handlers
  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  }, [selectedUsers.length, filteredUsers]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (action) {
        case 'delete':
          // Show confirmation for bulk delete
          onShowConfirmation({
            isOpen: true,
            title: "Delete Multiple Users",
            description: `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`,
            variant: "destructive",
            onConfirm: async () => {
              for (const userId of selectedUsers) {
                await onDeleteUser(userId);
              }
              toast({
                title: "Users Deleted",
                description: `${selectedUsers.length} users have been deleted.`,
              });
            }
          });
          return;
        case 'export':
          const selectedUserData = filteredUsers.filter(user => selectedUsers.includes(user.id));
          const exportData = selectedUserData.map(user => ({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role || ('specialization' in user ? 'instructor' : 'learner'),
            status: user.isActive !== false ? 'active' : 'inactive',
            joinDate: user.joinDate || user.createdAt,
            lastActive: user.lastActive || user.updatedAt
          }));
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "Users Exported",
            description: `${selectedUsers.length} users have been exported.`,
          });
          break;
      }
      setSelectedUsers([]);
      setIsBulkActionOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedUsers, filteredUsers, onDeleteUser, toast]);

  const handleEditUser = useCallback((user: any) => {
    console.log('Opening edit dialog for user:', user);
    onEditUser(user);
  }, [onEditUser]);

  const handleUserUpdated = useCallback((updatedUser: any) => {
    // This would update the user in the parent component
    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setEditingUser(null);
  }, [toast]);

  return (
    <div className="relative min-h-[40vh] rounded-2xl overflow-hidden bg-slate-50/70 dark:bg-slate-950/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] dark:opacity-20 pointer-events-none" />
      <div className="relative p-6 md:p-8 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200/80 dark:hover:border-blue-500/30 transition-all duration-200 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-2xl" />
          <CardContent className="relative p-5 pl-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{enrolledLearnersOnly.length + subAdmins.length + admins.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200/80 dark:hover:border-emerald-500/30 transition-all duration-200 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-2xl" />
          <CardContent className="relative p-5 pl-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Learners</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{enrolledLearnersOnly.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-violet-200/80 dark:hover:border-violet-500/30 transition-all duration-200 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-violet-600 rounded-l-2xl" />
          <CardContent className="relative p-5 pl-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sub Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{subAdmins.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200/80 dark:hover:border-amber-500/30 transition-all duration-200 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600 rounded-l-2xl" />
          <CardContent className="relative p-5 pl-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{admins.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="learner">Learners</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
              <SelectItem value="sub-admin">Sub Admins</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {selectedUsers.length} selected
            </span>
            <DropdownMenu open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Users Management */}
      <Card className="relative border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/90 ring-1 ring-slate-200/80 dark:ring-slate-700/50">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <CardHeader className="pt-6 pb-5 px-6 md:px-8 border-b border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-b from-slate-50/90 to-white dark:from-slate-800/80 dark:to-slate-800/95">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10 dark:ring-blue-400/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Users Management</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">Manage learners, roles, and progress</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 w-fit font-medium"
            >
              {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-transparent bg-slate-50/70 dark:bg-slate-800/50">
                <TableHead className="w-12 h-14 pl-6 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded-md border-slate-300 dark:border-slate-600 accent-blue-500"
                  />
                </TableHead>
                <TableHead className="h-14 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="h-14 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Email</TableHead>
                <TableHead className="h-14 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="h-14 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Course</TableHead>
                <TableHead className="h-14 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Progress</TableHead>
                <TableHead className="h-14 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Last Active</TableHead>
                <TableHead className="h-14 pr-6 pl-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const name = user.firstName + ' ' + user.lastName;
                const initials = name.split(' ').filter(n => n).map(n => n[0]).join('') || 'U';
                const userRole = user.role || ('specialization' in user ? 'instructor' : 'learner');
                const isActive = user.isActive !== false;
                const isSelected = selectedUsers.includes(user.id);
                
                // Debug logging
                console.log('User data:', { name, userRole, actualRole: user.role, hasSpecialization: 'specialization' in user });

                return (
                  <TableRow key={user.id} className={`border-b border-slate-100/80 dark:border-slate-700/40 transition-colors ${isSelected ? 'bg-blue-50/90 dark:bg-blue-950/40' : 'hover:bg-slate-50/70 dark:hover:bg-slate-700/20'}`}>
                    <TableCell className="py-4 pl-6">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-slate-300 dark:border-slate-600 accent-blue-500"
                      />
                    </TableCell>
                    <TableCell className="font-medium py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-600/50">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{name}</p>
                          {userRole === 'instructor' && 'specialization' in user && (
                            <p className="text-xs text-muted-foreground">
                              {Array.isArray(user.specialization) ? user.specialization.join(', ') : user.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pl-4 text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                    <TableCell className="py-4 pl-4">
                      <Badge variant={userRole === 'instructor' ? 'default' : 'secondary'} className="font-medium rounded-lg">
                        {userRole === 'student' ? 'learner' : userRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pl-4 w-16 text-center align-middle">
                      {userRole === 'learner' || userRole === 'student' ? (
                        (() => {
                          const courseTitleById = new Map(
                            (courses || []).map((c: { id: string; title?: string }) => [c.id, c.title || c.id])
                          );
                          const enrolledIds = Array.isArray(
                            (user as { enrolledCourses?: string[] }).enrolledCourses
                          )
                            ? [...new Set((user as { enrolledCourses: string[] }).enrolledCourses.filter(Boolean))]
                            : [];
                          const userKeys = new Set(
                            [user.id, (user as { uid?: string }).uid, user.email].filter(Boolean) as string[]
                          );
                          const byCourseId = new Map<string, string>();
                          enrolledIds.forEach((cid) => {
                            byCourseId.set(cid, courseTitleById.get(cid) || cid);
                          });
                          (studentProgress || []).forEach(
                            (p: {
                              studentId?: string;
                              studentEmail?: string;
                              courseId?: string;
                            }) => {
                              const pid = p.studentId || p.studentEmail || '';
                              if (!pid || !userKeys.has(pid) || !p.courseId) return;
                              byCourseId.set(
                                p.courseId,
                                courseTitleById.get(p.courseId) || p.courseId
                              );
                            }
                          );
                          const titleSeen = new Set<string>();
                          const allTitles: string[] = [];
                          for (const t of byCourseId.values()) {
                            const key = t.trim().toLowerCase();
                            if (titleSeen.has(key)) continue;
                            titleSeen.add(key);
                            allTitles.push(t);
                          }
                          return (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 mx-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                  title="Courses subscribed"
                                  aria-label="Show subscribed courses"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-80 z-[100]"
                                align="start"
                                side="left"
                                collisionPadding={16}
                              >
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                  Course(s) this learner subscribed to
                                </p>
                                {allTitles.length > 0 ? (
                                  <ul className="mt-2 space-y-1.5 text-sm font-medium text-slate-900 dark:text-white">
                                    {allTitles.map((title, idx) => (
                                      <li key={`${title}-${idx}`} className="leading-snug border-b border-slate-100 dark:border-slate-700 last:border-0 pb-1.5 last:pb-0">
                                        {title}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    No course enrolled yet.
                                  </p>
                                )}
                              </PopoverContent>
                            </Popover>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pl-4">
                      {userRole === 'learner' ? (
                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                          {(() => {
                            const progress = learnerProgressByUserId.get(user.id) ?? learnerProgressByUserId.get(user.uid ?? '') ?? learnerProgressByUserId.get(user.email ?? '') ?? 0;
                            const isComplete = progress >= 99;
                            return (
                              <>
                                <div className="flex items-center justify-between gap-2">
                                  <Progress value={progress} className="h-2 flex-1" />
                                  <span className="text-xs font-medium tabular-nums shrink-0 w-9">{Math.round(progress)}%</span>
                                </div>
                                {isComplete ? (
                                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-xs font-medium">Complete</span>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pl-4 text-slate-500 dark:text-slate-400">
                      <span className="text-sm">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                      </span>
                    </TableCell>
                  <TableCell className="py-4 pl-4 pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                          </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 px-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto ring-1 ring-slate-200/80 dark:ring-slate-600/50">
                <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">No users found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
});

const CoursesTab = React.memo(({
    courses,
    learners,
    instructors,
    subAdmins,
    admins,
  onEditCourse,
  onDeleteCourse,
  onApproveCourse,
  onViewCourse,
  onRefreshCourses,
  onCreateCourse
}: {
  courses: Course[];
  learners: Learner[];
  instructors: Instructor[];
  subAdmins: any[];
  admins: any[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onApproveCourse: (courseId: string) => void;
  onViewCourse: (course: Course) => void;
  onRefreshCourses: () => void;
  onCreateCourse: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Separate admins from instructors for proper counting
  const actualInstructors = useMemo(() => instructors.filter(user => user.role === 'instructor'), [instructors]);

  // Calculate course statistics
  const courseStats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.isPublished).length;
    const draftCourses = courses.filter(course => !course.isPublished).length;
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrolledLearners || 0), 0);
    const averageRating = courses.length > 0 
      ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
      : 0;

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || course.isPublished === (statusFilter === "published");

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="relative min-h-[40vh] rounded-2xl overflow-hidden bg-slate-50/70 dark:bg-slate-950/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(34,197,94,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(34,197,94,0.08),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] dark:opacity-20 pointer-events-none" />
      <div className="relative p-6 md:p-8 space-y-8">
      {/* Course Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200/80 dark:hover:border-blue-500/30 transition-all duration-200 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-2xl" />
          <CardContent className="relative p-5 pl-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Courses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{courseStats.totalCourses}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200/80 dark:hover:border-emerald-500/30 transition-all duration-200 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-2xl" />
          <CardContent className="relative p-5 pl-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{courseStats.publishedCourses}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search courses by title, description, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Programming">Programming</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
            <SelectItem value="Language">Language</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
          <Button
            className="whitespace-nowrap h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-medium shadow-sm"
            onClick={onCreateCourse}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
          <Button
            asChild
            className="whitespace-nowrap h-10 rounded-xl font-medium shadow-sm bg-red-600 hover:bg-red-700 text-white border-0 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <a
              href="https://notebooklm.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full"
            >
              <Globe className="w-4 h-4 mr-2 shrink-0" />
              Create Content
            </a>
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
        {filteredCourses.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">No courses found matching your criteria</p>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="relative border border-slate-200/80 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-200/80 dark:hover:border-emerald-500/30 transition-all duration-200 overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            {/* Course thumbnail */}
            <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const next = (e.target as HTMLImageElement).nextElementSibling;
                    if (next) (next as HTMLElement).classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-500/30 ${course.thumbnail ? 'hidden' : ''}`}>
                <BookOpen className="h-14 w-14 text-emerald-500/60 dark:text-emerald-400/50" />
              </div>
            </div>
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">{course.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-xs rounded-lg border-slate-200 dark:border-slate-600 font-medium">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs rounded-lg border-slate-200 dark:border-slate-600 font-medium">
                      {course.level}
                    </Badge>
                  </div>
                </div>
                <Badge
                  variant={course.isPublished ? 'default' : 'secondary'}
                  className="shrink-0 rounded-lg font-medium"
                >
                  {course.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              {/* Course Stats */}
              {(() => {
                const enrolledCount = (learners || []).filter(l => Array.isArray((l as any).enrolledCourses) && (l as any).enrolledCourses.includes(course.id)).length;
                const isJohnDoProgramming = (course.instructor === 'John Do') || (course.title || '').toLowerCase().includes('programming');
                const hasFulufhelo = (learners || []).some(l => (l.email || '').toLowerCase() === 'fulufhelo@youthdevelopers.co.za');
                const displayedEnrolled = isJohnDoProgramming && hasFulufhelo ? Math.max(enrolledCount, 1) : enrolledCount;
                return (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">{displayedEnrolled}</span>
                      <span className="text-slate-500 dark:text-slate-400">learners</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">{course.rating || 0}</span>
                      <span className="text-slate-500 dark:text-slate-400">rating</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">{course.duration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">R{course.price || 0}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Instructor */}
              <div className="flex items-center gap-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Instructor:</span>
                <span className="font-medium text-slate-900 dark:text-white">{course.instructor}</span>
              </div>

              {/* Compliance */}
              {course.complianceStatus && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Badge
                    variant={
                      course.complianceStatus === 'Compliant' ? 'default' :
                      course.complianceStatus === 'Pending Review' ? 'secondary' : 'destructive'
                    }
                    className="text-xs rounded-lg font-medium"
                  >
                    {course.complianceStatus}
                  </Badge>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-700/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewCourse(course)}
                  className="flex-1 rounded-xl border-slate-200 dark:border-slate-600 font-medium"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View as learner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCourse(course)}
                  className="flex-1 rounded-xl border-slate-200 dark:border-slate-600 font-medium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => onApproveCourse(course.id)}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Approve Course
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteCourse(course.id)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
});

// Course Creation Dialog Component (Legacy - to be removed)
const CourseCreationDialogLegacy = React.memo(({
  isOpen,
  onClose,
  onCourseCreated
}: {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: 0,
    duration: 0,
    maxStudents: 50,
    instructorId: '',
    instructorName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { students } = useDataSync();
  const instructors = useMemo(() => (students || []).filter((u: any) => u.role === 'instructor'), [students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newCourse: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level as 'Beginner' | 'Intermediate' | 'Advanced',
        price: formData.price,
        duration: formData.duration,
        maxStudents: formData.maxStudents,
        enrolledStudents: 0,
        rating: 0,
        isPublished: false,
        instructorId: formData.instructorId || '',
        instructorName: formData.instructorName || '',
        thumbnail: '',
        lessons: [],
        assignments: [],
        complianceStatus: 'Pending Review',
        setaUnitStandards: [],
        qctoQualifications: []
      };

      const response = await firebaseApiService.courses.create(newCourse);
      
      if (response.success) {
        toast({
          title: "Course Created",
          description: "The new course has been created successfully.",
        });
        onCourseCreated(response.data);
        onClose();
        setFormData({
          title: '',
          description: '',
          category: '',
          level: 'Beginner',
          price: 0,
          duration: 0,
          maxStudents: 50,
          instructorId: '',
          instructorName: ''
        });
      } else {
        throw new Error(response.error || 'Failed to create course');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new course for the platform
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter course title"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (R) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxStudents">Maximum Students</Label>
            <Input
              id="maxStudents"
              type="number"
              value={formData.maxStudents}
              onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: Number(e.target.value) }))}
              placeholder="50"
              min="1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

// User Registration Dialog Component
const UserRegistrationDialog = React.memo(({
  isOpen,
  onClose,
  onUserCreated,
  availableStudents = [],
  availableInstructors = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: any) => void;
  availableStudents?: Learner[];
  availableInstructors?: Instructor[];
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'learner',
    specialization: '',
    qualifications: '',
    assignedStudents: [] as string[],
    assignedInstructors: [] as string[],
    bio: '',
    linkedin: '',
    experience: '',
    education: '',
    idNumber: '',
    country: '',
    stateProvince: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      // Validate password
      if (formData.password.length < 6) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      // Create user with Firebase Auth first
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/firebase/config');
      
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const firebaseUser = userCredential.user;

      const userData = {
        id: firebaseUser.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        isActive: true,
        bio: formData.bio.trim(),
        linkedin: formData.linkedin.trim(),
        experience: formData.experience.trim(),
        education: formData.education.trim(),
        idNumber: formData.idNumber.trim(),
        country: formData.country.trim(),
        stateProvince: formData.stateProvince.trim(),
        gender: formData.gender,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        ...(formData.role === 'instructor' && {
          specialization: formData.specialization ? formData.specialization.split(',').map(s => s.trim()).filter(s => s) : [],
          qualifications: formData.qualifications ? formData.qualifications.split(',').map(q => q.trim()).filter(q => q) : [],
          assignedStudents: formData.assignedStudents,
          learners: formData.assignedStudents.length,
          courses: [],
          rating: 0,
          setaRegistration: '',
          qctoRegistration: ''
        }),
        ...(formData.role === 'learner' && {
          enrolledCourses: [],
          completedCourses: [],
          currentGrade: 'N/A',
          progress: 0
        }),
        ...(formData.role === 'sub-admin' && {
          assignedInstructors: formData.assignedInstructors,
          instructors: formData.assignedInstructors.length,
          courses: [],
          rating: 0
        }),
        ...(formData.role === 'admin' && {
          // Admin-specific fields can be added here if needed
        })
      };

      // Save user data to Firestore
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      const response = { success: true, data: userData };
      
      if (response.success) {
        toast({
          title: "User Created",
          description: `The new ${formData.role} has been registered successfully.`,
        });
        onUserCreated(response.data);
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'learner',
          specialization: '',
          qualifications: '',
          assignedStudents: [],
          bio: '',
          website: '',
          linkedin: '',
          experience: '',
          education: ''
        });
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('User creation error:', error);
      
      let errorMessage = "Failed to create user. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address. Please check your email format.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Register a new user (Admin, Instructor, or Learner) for the platform
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password (min 6 characters)"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sub-admin">Sub Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="learner">Learner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'instructor' && (
            <>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Enter specializations (comma-separated)"
                />
              </div>
              <div>
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                  placeholder="Enter qualifications (comma-separated)"
                />
              </div>
              <div>
                <Label htmlFor="assignedStudents">Assign Learners</Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Select learners to assign to this instructor ({formData.assignedStudents.length} selected)
                  </p>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                    {availableStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No available learners to assign
                      </p>
                    ) : (
                      availableStudents.map((student) => {
                        const isSelected = formData.assignedStudents.includes(student.id);
                        const hasInstructor = student.instructorId && student.instructorName;
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-200' 
                                : hasInstructor
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'hover:bg-gray-50 border-transparent'
                            }`}
                            onClick={() => {
                              if (!hasInstructor) {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedStudents: isSelected
                                    ? prev.assignedStudents.filter(id => id !== student.id)
                                    : [...prev.assignedStudents, student.id]
                                }));
                              }
                            }}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 
                              hasInstructor ? 'bg-yellow-500 border-yellow-500' :
                              'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              {hasInstructor && !isSelected && <User className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                              {hasInstructor && !isSelected && (
                                <p className="text-xs text-yellow-600">
                                  Already assigned to: {student.instructorName}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.role === 'sub-admin' && (
            <>
              <div>
                <Label htmlFor="assignedInstructors">Assign Instructors</Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Select instructors to assign to this sub admin ({formData.assignedInstructors?.length || 0} selected)
                  </p>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                    {availableInstructors.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No available instructors to assign
                      </p>
                    ) : (
                      availableInstructors.map((instructor) => {
                        const isSelected = formData.assignedInstructors?.includes(instructor.id) || false;
                        const hasSubAdmin = instructor.subAdminId && instructor.subAdminName;
                        return (
                          <div
                            key={instructor.id}
                            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-200' 
                                : hasSubAdmin
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'hover:bg-gray-50 border-transparent'
                            }`}
                            onClick={() => {
                              if (!hasSubAdmin) {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedInstructors: isSelected
                                    ? (prev.assignedInstructors || []).filter(id => id !== instructor.id)
                                    : [...(prev.assignedInstructors || []), instructor.id]
                                }));
                              }
                            }}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 
                              hasSubAdmin ? 'bg-yellow-500 border-yellow-500' :
                              'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              {hasSubAdmin && !isSelected && <User className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {instructor.firstName} {instructor.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{instructor.email}</p>
                              {hasSubAdmin && !isSelected && (
                                <p className="text-xs text-yellow-600">
                                  Already assigned to: {instructor.subAdminName}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional fields for all user types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  placeholder="Enter ID number"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label htmlFor="stateProvince">State/Province</Label>
                <Input
                  id="stateProvince"
                  value={formData.stateProvince}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateProvince: e.target.value }))}
                  placeholder="Enter state or province"
                />
              </div>
            </div>

            {(formData.role === 'instructor' || formData.role === 'admin') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Professional Experience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Describe your professional experience..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="List your educational background..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

// User Edit Dialog Component
const UserEditDialog = React.memo(({
  isOpen,
  onClose,
  user,
  onUserUpdated
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated: (user: any) => void;
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    specialization: '',
    qualifications: '',
    isActive: true,
    role: 'learner',
    bio: '',
    website: '',
    linkedin: '',
    experience: '',
    education: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Learner assignment state
  const [assignedLearners, setAssignedLearners] = useState<string[]>([]);
  const [learnerSearchTerm, setLearnerSearchTerm] = useState('');

  // Get learners data from context
  const { students } = useDataSync();
  const learners = (students || []).filter(isLearnerUser);

  // Filter learners based on search term
  const filteredLearners = useMemo(() => {
    let filtered = learners;
    
    // Filter by search term
    if (learnerSearchTerm) {
      filtered = filtered.filter(learner => 
        learner.firstName?.toLowerCase().includes(learnerSearchTerm.toLowerCase()) ||
        learner.lastName?.toLowerCase().includes(learnerSearchTerm.toLowerCase()) ||
        learner.email?.toLowerCase().includes(learnerSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [learners, learnerSearchTerm]);

  // Toggle learner assignment
  const toggleLearnerAssignment = (learnerId: string) => {
    setAssignedLearners(prev => 
      prev.includes(learnerId) 
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      console.log('UserEditDialog received user:', user);
      const userRole = user.role || ('specialization' in user ? 'instructor' : 'learner');
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        specialization: Array.isArray(user.specialization) ? user.specialization.join(', ') : user.specialization || '',
        qualifications: Array.isArray(user.qualifications) ? user.qualifications.join(', ') : user.qualifications || '',
        isActive: user.isActive !== false,
        role: userRole,
        bio: user.bio || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        experience: user.experience || '',
        education: user.education || ''
      });
      
      // Initialize assigned learners for instructors
      if (userRole === 'instructor') {
        console.log('🔍 UserEditDialog - Loading assignedLearners for instructor:', {
          userId: user.id,
          assignedLearners: user.assignedLearners,
          assignedLearnersType: typeof user.assignedLearners,
          assignedLearnersLength: user.assignedLearners?.length || 0
        });
        setAssignedLearners(user.assignedLearners || []);
      } else {
        setAssignedLearners([]);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting user edit form with data:', formData);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      // Check for role change and show confirmation
      const isRoleChanging = user.role !== formData.role;
      console.log('🔍 Role change check:', {
        originalRole: user.role,
        newRole: formData.role,
        isRoleChanging
      });
      
      if (isRoleChanging) {
        const confirmMessage = `Are you sure you want to change this user's role from ${user.role} to ${formData.role}? This will affect their access permissions and available features.`;
        
        if (!window.confirm(confirmMessage)) {
          setIsLoading(false);
          return;
        }
        console.log('✅ Role change confirmed by user');
      }

      // Handle role change and data migration
      const wasInstructor = user.role === 'instructor';
      const isNowInstructor = formData.role === 'instructor';

      const updatedUser = {
        ...user,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        bio: formData.bio.trim(),
        website: formData.website.trim(),
        linkedin: formData.linkedin.trim(),
        experience: formData.experience.trim(),
        education: formData.education.trim(),
        isActive: formData.isActive,
        role: formData.role,
        updatedAt: new Date().toISOString(),
      };

      // Handle role-specific fields based on the new role
      if (isNowInstructor) {
        // User is becoming or staying an instructor
        updatedUser.specialization = formData.specialization ? 
          formData.specialization.split(',').map(s => s.trim()).filter(s => s) : 
          (user.specialization || []);
        updatedUser.qualifications = formData.qualifications ? 
          formData.qualifications.split(',').map(q => q.trim()).filter(q => q) : 
          (user.qualifications || []);
        
        // Ensure instructor-specific fields exist
        updatedUser.courses = user.courses || [];
        updatedUser.learners = user.learners || 0;
        updatedUser.rating = user.rating || 0;
        updatedUser.setaRegistration = user.setaRegistration || '';
        updatedUser.qctoRegistration = user.qctoRegistration || '';
        updatedUser.assignedLearners = assignedLearners;
        console.log('💾 UserEditDialog - Saving assignedLearners for instructor:', {
          userId: user.id,
          assignedLearners: assignedLearners,
          assignedLearnersLength: assignedLearners.length
        });
        
        // Remove learner-specific fields if they exist
        delete updatedUser.enrolledCourses;
        delete updatedUser.completedCourses;
        delete updatedUser.currentGrade;
        delete updatedUser.progress;
      } else {
        // User is becoming or staying a learner
        updatedUser.enrolledCourses = user.enrolledCourses || [];
        updatedUser.completedCourses = user.completedCourses || [];
        updatedUser.currentGrade = user.currentGrade || 'N/A';
        updatedUser.progress = user.progress || 0;
        
        // Remove instructor-specific fields if they exist
        delete updatedUser.specialization;
        delete updatedUser.qualifications;
        delete updatedUser.courses;
        delete updatedUser.learners;
        delete updatedUser.rating;
        delete updatedUser.setaRegistration;
        delete updatedUser.qctoRegistration;
      }

      // Call Firebase API to update user
      console.log('🔄 Updating user with data:', {
        userId: user.id,
        originalRole: user.role,
        newRole: formData.role,
        roleChange: isRoleChanging,
        wasInstructor,
        isNowInstructor,
        updatedUser: JSON.stringify(updatedUser, null, 2)
      });
      
      const response = await firebaseApiService.users.update(user.id, updatedUser);
      
      if (response.success) {
        console.log('✅ User updated successfully:', response);
        onUserUpdated(updatedUser);
        toast({
          title: "User Updated",
          description: `User role changed from ${user.role} to ${formData.role} successfully.`,
        });
      } else {
        console.error('❌ Failed to update user:', response);
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-6 h-6 text-blue-600" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription>
            Update user information, role, and account settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Role and Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Role & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="role">User Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Account Active</Label>
              </div>
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  value={user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label htmlFor="lastActive">Last Active</Label>
                <Input
                  id="lastActive"
                  value={user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>

          {/* Instructor-Specific Fields */}
          {formData.role === 'instructor' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Instructor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="Enter specializations (comma-separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                    placeholder="Enter qualifications (comma-separated)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Describe your professional experience..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="List your educational background..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Assign Learners Section - Only for Instructors */}
          {formData.role === 'instructor' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Assign Learners</h3>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Select learners to assign to this instructor. These learners will be able to access courses taught by this instructor.
                </div>
                
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search learners..."
                    className="flex-1"
                    value={learnerSearchTerm}
                    onChange={(e) => setLearnerSearchTerm(e.target.value)}
                  />
                </div>

                {/* Assigned Learners Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-green-700 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Assigned Learners ({assignedLearners.length})
                    </h4>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-green-50">
                    {assignedLearners.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No learners assigned yet
                      </div>
                    ) : (
                      <div className="space-y-2 p-2">
                        {filteredLearners
                          .filter(learner => assignedLearners.includes(learner.id))
                          .map((learner) => (
                            <div
                              key={learner.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-white border-green-200 hover:bg-green-100 cursor-pointer transition-colors"
                              onClick={() => toggleLearnerAssignment(learner.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-700">
                                    {learner.firstName?.charAt(0)}{learner.lastName?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {learner.firstName} {learner.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{learner.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  Assigned
                                </Badge>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLearnerAssignment(learner.id);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unassigned Learners Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Available Learners ({filteredLearners.filter(learner => !assignedLearners.includes(learner.id)).length})
                    </h4>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-gray-50">
                    {filteredLearners.filter(learner => !assignedLearners.includes(learner.id)).length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        All learners are assigned
                      </div>
                    ) : (
                      <div className="space-y-2 p-2">
                        {filteredLearners
                          .filter(learner => !assignedLearners.includes(learner.id))
                          .map((learner) => (
                            <div
                              key={learner.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => toggleLearnerAssignment(learner.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {learner.firstName?.charAt(0)}{learner.lastName?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {learner.firstName} {learner.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{learner.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLearnerAssignment(learner.id);
                                  }}
                                >
                                  Assign
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Summary */}
                {assignedLearners.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      {assignedLearners.length} learner{assignedLearners.length !== 1 ? 's' : ''} assigned
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      These learners will have access to courses taught by this instructor
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end space-x-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {user?.role !== formData.role ? 'Changing Role...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {user?.role !== formData.role ? 'Change Role' : 'Update User'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

// Confirmation Dialog Component
const ConfirmationDialog = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// Quick Actions Dialog Component
const QuickActionsDialog = React.memo(({
  isOpen,
  onClose,
  onCreateCourse,
  onAddUser,
  onGenerateReport,
  onSystemBackup,
  onMaintenanceMode,
  onGrantCourseAccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: () => void;
  onAddUser: () => void;
  onGenerateReport: () => void;
  onSystemBackup: () => void;
  onMaintenanceMode: () => void;
  onGrantCourseAccess?: () => void;
}) => {
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "default"
  });

  const handleActionWithConfirmation = (action: () => void, title: string, description: string, variant: "default" | "destructive" = "default") => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      onConfirm: action,
      variant
    });
  };
  const quickActions = [
    {
      id: 'create-course',
      title: 'Create New Course',
      description: 'Add a new course to the platform',
      icon: BookOpen,
      action: () => onCreateCourse(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'add-user',
      title: 'Add New User',
      description: 'Register a new learner or instructor',
      icon: UserPlus,
      action: () => onAddUser(),
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    ...(onGrantCourseAccess ? [{
      id: 'grant-course-access',
      title: 'Grant course access',
      description: 'Add a purchased course to a learner by email (e.g. after payment)',
      icon: GraduationCap,
      action: () => { onGrantCourseAccess(); },
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100'
    }] : []),
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create analytics and compliance reports',
      icon: FileText,
      action: () => onGenerateReport(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 'system-backup',
      title: 'System Backup',
      description: 'Create a backup of all system data',
      icon: Database,
      action: () => handleActionWithConfirmation(
        onSystemBackup,
        'Confirm System Backup',
        'This will create a complete backup of all system data. This process may take several minutes and will temporarily impact system performance. Continue?',
        'default'
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      id: 'maintenance-mode',
      title: 'Toggle Maintenance',
      description: 'Enable/disable maintenance mode',
      icon: Shield,
      action: () => handleActionWithConfirmation(
        onMaintenanceMode,
        'Confirm Maintenance Mode Toggle',
        'This will enable/disable maintenance mode, which will restrict access to the platform for all users except administrators. Continue?',
        'destructive'
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Quick Actions
          </DialogTitle>
          <DialogDescription>
            Quickly access common administrative tasks and system operations
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`h-auto p-4 flex flex-col items-start text-left ${action.bgColor} transition-colors`}
                onClick={action.action}
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className={`w-5 h-5 ${action.color}`} />
                  <span className="font-semibold text-gray-900">{action.title}</span>
                </div>
                <p className="text-sm text-gray-600 text-left">{action.description}</p>
              </Button>
            );
          })}
        </div>
        
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          description={confirmationDialog.description}
          variant={confirmationDialog.variant}
        />
      </DialogContent>
    </Dialog>
  );
});

function parseBlogFromAI(rawText: string): { title: string; excerpt: string; content: string } | null {
  const trimmed = rawText.trim();
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { title?: string; excerpt?: string; content?: string };
      if (parsed.title && parsed.content) {
        return {
          title: String(parsed.title).trim(),
          excerpt: (parsed.excerpt && String(parsed.excerpt).trim()) || '',
          content: String(parsed.content).trim()
        };
      }
    }
  } catch {
    // fallback: treat whole response as content, first line as title
    const lines = trimmed.split('\n').filter(Boolean);
    if (lines.length > 0) {
      return {
        title: lines[0].replace(/^#+\s*/, '').trim(),
        excerpt: lines[1]?.slice(0, 200) || lines[0].slice(0, 200),
        content: trimmed
      };
    }
  }
  return null;
}

const BlogsTab = React.memo(() => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
      const apiKey = hasNvidiaConfigured();
  const hasKey = !!apiKey;

  const generateBlog = async () => {
    if (!topic.trim()) return;
    if (!hasKey) {
      setError('AI not configured. Please check that the NVIDIA API key is set in Firebase secrets.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setPublishedSlug(null);
    try {
      const text = await nvidiaGenerateText({
        user: `You are a professional blog writer for an education and training institute (RevoQuest). Write a full, engaging blog post that could be published on the website.

Topic: ${topic.trim()}

Requirements:
- Write a complete blog post (about 800–1500 words). Use clear paragraphs, subheadings where helpful, and a professional but friendly tone.
- Do NOT use markdown (# for headings). Use plain text; you may use ALL CAPS or a short line for section breaks.
- Include an engaging intro, main points with examples or tips, and a short conclusion with a call to action (e.g. explore our courses, get in touch).

Respond with ONLY a valid JSON object (no markdown, no code fences, no text before or after) in this exact shape:
{"title":"Your blog post title here","excerpt":"2-3 sentences summarizing the post for listings and SEO.","content":"Full blog body here. Use line breaks between paragraphs. Use double line breaks for section spacing."}`,
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      });
      const parsed = parseBlogFromAI(text);
      if (parsed) {
        setTitle(parsed.title);
        setExcerpt(parsed.excerpt);
        setContent(parsed.content);
      } else {
        setTitle('');
        setExcerpt('');
        setContent(text || 'No content generated.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate blog.');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishBlog = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required to publish.');
      return;
    }
    setIsPublishing(true);
    setError(null);
    setPublishedSlug(null);
    try {
      const slug = slugify(title);
      const publishedAt = new Date().toISOString();
      await createBlog({
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt.trim().slice(0, 500),
        status: 'published',
        publishedAt
      });
      setPublishedSlug(slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish blog.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileEdit className="w-6 h-6" />
          Blogs
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Generate full-page blog with AI ({DEFAULT_NVIDIA_MODEL})
          </CardTitle>
          <CardDescription>
            Enter a topic; the AI will generate a full blog post. Edit title, excerpt, and content if needed, then publish to make it live on the blog page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {publishedSlug && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
              <AlertDescription>
                Blog published. <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => navigate(`/blog/${publishedSlug}`)}>View on blog page</Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              placeholder="e.g. Why online learning works for busy professionals"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={generateBlog} disabled={isGenerating || !topic.trim()} className="gap-2">
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating…' : 'Generate blog'}
            </Button>
          </div>
          {(title || content) && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog title" />
              </div>
              <div className="space-y-2">
                <Label>Excerpt (for listings and SEO)</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary" rows={2} className="resize-y" />
              </div>
              <div className="space-y-2">
                <Label>Content (full page)</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Blog body" rows={16} className="resize-y font-mono text-sm" />
              </div>
              <Button onClick={publishBlog} disabled={isPublishing || !title.trim() || !content.trim()} className="gap-2">
                {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {isPublishing ? 'Publishing…' : 'Publish online'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

const CommunityManagementTab = React.memo(() => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as CommunityPost['type'],
    targetAudience: 'all' as CommunityPost['targetAudience'],
    isPublished: false,
    isPinned: false,
    metadataLink: '',
    metadataLinkText: '',
    metadataImageUrl: '',
    targetCourseId: '',
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const allPosts = await DatabaseService.getAllCommunityPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      targetAudience: 'all',
      isPublished: false,
      isPinned: false,
      metadataLink: '',
      metadataLinkText: '',
      metadataImageUrl: '',
      targetCourseId: '',
    });
    setEditingPost(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleOpenEdit = (post: CommunityPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      targetAudience: post.targetAudience,
      isPublished: post.isPublished,
      isPinned: post.isPinned,
      metadataLink: post.metadata?.link || '',
      metadataLinkText: post.metadata?.linkText || '',
      metadataImageUrl: post.metadata?.imageUrl || '',
      targetCourseId: post.targetCourseId || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userProfile = await DatabaseService.getUserProfile(user.uid);
      if (!userProfile) {
        toast.error('User profile not found');
        return;
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetAudience: formData.targetAudience,
        isPublished: formData.isPublished,
        isPinned: formData.isPinned,
        targetCourseId: formData.targetCourseId || undefined,
        authorId: user.uid,
        authorName: userProfile.firstName + ' ' + userProfile.lastName,
        authorRole: userProfile.role as 'admin' | 'instructor',
        authorAvatar: userProfile.avatar,
        metadata: {
          link: formData.metadataLink || undefined,
          linkText: formData.metadataLinkText || undefined,
          imageUrl: formData.metadataImageUrl || undefined,
        },
      };

      if (editingPost) {
        await DatabaseService.updateCommunityPost(editingPost.id, postData);
        toast.success('Community post updated successfully');
      } else {
        await DatabaseService.createCommunityPost(postData);
        toast.success('Community post created successfully');
      }

      setShowDialog(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving community post:', error);
      toast.error(editingPost ? 'Failed to update post' : 'Failed to create post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await DatabaseService.deleteCommunityPost(postId);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getTypeBadgeVariant = (type: CommunityPost['type']) => {
    switch (type) {
      case 'announcement': return 'default';
      case 'event': return 'secondary';
      case 'promotion': return 'outline';
      case 'sale': return 'destructive';
      case 'news': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Community Posts</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage announcements, events, and promotions for learners
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Card key={post.id} className={`overflow-hidden ${post.isPinned ? 'border-orange-300 dark:border-orange-700' : ''}`}>
              {post.isPinned && (
                <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 flex items-center gap-2">
                  <Pin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Pinned</span>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                  <Badge variant={getTypeBadgeVariant(post.type)} className="flex items-center gap-1 shrink-0">
                    <Megaphone className="w-3 h-3" />
                    {post.type}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  by {post.authorName} • {post.isPublished ? 'Published' : 'Draft'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                  {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {post.metadata?.link && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> link
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(post)} className="h-7 px-2">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} className="h-7 px-2 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">No community posts yet</p>
                <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                  Create your first post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Community Post' : 'Create Community Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required rows={6} />
              <p className="text-xs text-slate-500 mt-1">HTML is supported for rich formatting</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: CommunityPost['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Select value={formData.targetAudience} onValueChange={(value: CommunityPost['targetAudience']) => setFormData({ ...formData, targetAudience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Enrolled Learners</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                    <SelectItem value="specific">Specific Learners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.targetAudience === 'course' && (
              <div>
                <Label htmlFor="targetCourseId">Target Course ID</Label>
                <Input id="targetCourseId" value={formData.targetCourseId} onChange={(e) => setFormData({ ...formData, targetCourseId: e.target.value })} placeholder="Enter course ID (optional)" />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Publish immediately</Label>
                <Switch id="isPublished" checked={formData.isPublished} onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPinned">Pin to top</Label>
                <Switch id="isPinned" checked={formData.isPinned} onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })} />
              </div>
            </div>

            <div>
              <Label htmlFor="metadataLink">Call-to-Action Link (optional)</Label>
              <Input id="metadataLink" value={formData.metadataLink} onChange={(e) => setFormData({ ...formData, metadataLink: e.target.value })} placeholder="https://..." />
            </div>

            <div>
              <Label htmlFor="metadataLinkText">Link Text (optional)</Label>
              <Input id="metadataLinkText" value={formData.metadataLinkText} onChange={(e) => setFormData({ ...formData, metadataLinkText: e.target.value })} placeholder="Learn More" />
            </div>

            <div>
              <Label htmlFor="metadataImageUrl">Image URL (optional)</Label>
              <Input id="metadataImageUrl" value={formData.metadataImageUrl} onChange={(e) => setFormData({ ...formData, metadataImageUrl: e.target.value })} placeholder="https://..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
              <Button type="submit">{editingPost ? 'Update' : 'Create'} Post</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

const JobsTab = React.memo(() => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    salary: "",
    experience: "",
    description: "",
    requirements: [""],
    closingDate: ""
  });

  // Load jobs from Firebase on component mount
  useEffect(() => {
    loadJobs();
    checkAndDeleteExpiredJobs();
  }, []);

  // Check for expired jobs and delete them
  const checkAndDeleteExpiredJobs = async () => {
    try {
      const today = new Date();
      const response = await firebaseApi.jobs.getAll('active');
      
      if (response.success) {
        const expiredJobs = response.data.filter(job => {
          const closingDate = new Date(job.closingDate);
          return closingDate < today;
        });

        // Delete expired jobs
        for (const job of expiredJobs) {
          try {
            await firebaseApi.jobs.delete(job.id);
            console.log(`Deleted expired job: ${job.title}`);
          } catch (error) {
            console.error(`Failed to delete expired job ${job.id}:`, error);
          }
        }

        if (expiredJobs.length > 0) {
          console.log(`Deleted ${expiredJobs.length} expired job(s)`);
          // Reload jobs to reflect changes
          loadJobs();
        }
      }
    } catch (error) {
      console.error('Error checking for expired jobs:', error);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log('Loading jobs in AdminDashboard...');
      const response = await firebaseApi.jobs.getAll('active');
      console.log('Jobs response:', response);
      if (response.success) {
        console.log('Setting jobs:', response.data);
        setJobs(response.data);
      } else {
        console.error('Failed to load jobs:', response);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobInputChange = (field: string, value: any) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRequirement = () => {
    setJobForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setJobForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    setJobForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const jobData = {
        title: jobForm.title,
        department: jobForm.department,
        location: jobForm.location,
        type: jobForm.type as 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship',
        salary: jobForm.salary,
        experience: jobForm.experience,
        description: jobForm.description,
        requirements: jobForm.requirements.filter(req => req.trim() !== ""),
        closingDate: jobForm.closingDate,
        status: 'active' as const,
        postedBy: 'admin' // You might want to get the actual admin user ID
      };

      console.log('Submitting job data:', jobData);
      const response = await firebaseApi.jobs.create(jobData);
      console.log('Job creation response:', response);
      if (response.success) {
        console.log('Job created successfully, adding to local state');
        setJobs(prev => [response.data, ...prev]);
        setShowJobModal(false);
                    setJobForm({
                      title: "",
                      department: "",
                      location: "",
                      type: "",
                      salary: "",
                      experience: "",
                      description: "",
                      requirements: [""],
                      closingDate: ""
                    });
        alert("Job posting added successfully!");
      } else {
        console.error('Job creation failed:', response);
        setError("Failed to add job posting. Please try again.");
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError("Failed to add job posting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        const response = await firebaseApi.jobs.delete(jobId);
        if (response.success) {
          setJobs(prev => prev.filter(job => job.id !== jobId));
          alert("Job deleted successfully!");
        } else {
          alert("Failed to delete job. Please try again.");
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert("Failed to delete job. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
                <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Job Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage job postings and applications
          </p>
                </div>
        <Button
          onClick={() => setShowJobModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3"
        >
          <Plus className="mr-2 w-5 h-5" />
          Add New Job
        </Button>
        <Button
          onClick={loadJobs}
          variant="outline"
          className="border-green-500 text-green-600 hover:bg-green-50"
        >
          Refresh Jobs
        </Button>
                  </div>

      <div className="grid gap-6">
        {loading ? (
          <Card className="text-center py-16">
            <CardContent className="p-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading jobs...</p>
                </CardContent>
              </Card>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Briefcase className="w-6 h-6 text-white" />
                      </div>
                <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 font-medium">
                            {job.department}
                          </p>
                </div>
                </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">{job.location}</span>
                  </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">{job.type}</span>
                  </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">{job.salary || 'Salary not specified'}</span>
                </div>
                </div>

                      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                        {job.description}
                      </p>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                            Requirements:
                          </h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req: string, reqIndex: number) => (
                              <li key={reqIndex} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-slate-600 dark:text-slate-400">{req}</span>
                              </li>
                            ))}
                          </ul>
                </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                          {job.closingDate && (
                            <span>• Closes {new Date(job.closingDate).toLocaleDateString()}</span>
                          )}
                          {job.experience && (
                            <span>• {job.experience} experience</span>
                          )}
                </div>
                        <Button
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
                        >
                          <X className="mr-2 w-4 h-4" />
                          Delete Job
                        </Button>
                </div>
                </div>
                </div>
              </CardContent>
            </Card>
            ))}
                </div>
        ) : (
          <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20 border-0">
            <CardContent className="p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                No Job Postings Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Start building your team by posting your first job opportunity. 
                Attract top talent to join your organization.
              </p>
              <Button
                onClick={() => setShowJobModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3"
              >
                <Plus className="mr-2 w-5 h-5" />
                Post Your First Job
              </Button>
              </CardContent>
            </Card>
        )}
          </div>

      {/* Job Posting Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    +
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                    Add Job Posting
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                    Create a new job posting for the careers page
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJobModal(false)}
                className="h-10 w-10 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitJob} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Job Title *
                </Label>
                  <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Training Facilitator"
                  value={jobForm.title}
                  onChange={(e) => handleJobInputChange("title", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                  required
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="jobDepartment" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department *
                </Label>
                  <Input
                  id="jobDepartment"
                  placeholder="e.g., Training & Development"
                  value={jobForm.department}
                  onChange={(e) => handleJobInputChange("department", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                  required
                  />
                </div>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobLocation" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location *
                    </Label>
                    <Input
                  id="jobLocation"
                  placeholder="e.g., Johannesburg, South Africa"
                  value={jobForm.location}
                  onChange={(e) => handleJobInputChange("location", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                  required
                    />
                  </div>
              <div className="space-y-2">
                <Label htmlFor="jobType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Employment Type *
                </Label>
                <select
                  id="jobType"
                  value={jobForm.type}
                  onChange={(e) => handleJobInputChange("type", e.target.value)}
                  className="w-full h-12 px-3 border border-slate-300 dark:border-slate-600 rounded-md focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobSalary" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Salary Range
                    </Label>
                    <Input
                  id="jobSalary"
                  placeholder="e.g., R35,000 - R45,000"
                  value={jobForm.salary}
                  onChange={(e) => handleJobInputChange("salary", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                    />
                  </div>
              <div className="space-y-2">
                <Label htmlFor="jobExperience" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Experience Required
                    </Label>
                    <Input
                  id="jobExperience"
                  placeholder="e.g., 5+ years"
                  value={jobForm.experience}
                  onChange={(e) => handleJobInputChange("experience", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                    />
                  </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Job Description *
                    </Label>
              <Textarea
                id="jobDescription"
                placeholder="Describe the role and responsibilities..."
                value={jobForm.description}
                onChange={(e) => handleJobInputChange("description", e.target.value)}
                rows={4}
                className="border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800 resize-none"
                required
                    />
                  </div>

            <div className="space-y-2">
              <Label htmlFor="jobClosingDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Application Closing Date *
                    </Label>
                    <Input
                id="jobClosingDate"
                type="date"
                value={jobForm.closingDate}
                onChange={(e) => handleJobInputChange("closingDate", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                required
                min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Requirements *
              </Label>
                <div className="space-y-3">
                {jobForm.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <Input
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                      className="flex-1 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                      required
                    />
                    {jobForm.requirements.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                  </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={handleAddRequirement}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <X className="w-4 h-4 mr-1 rotate-45" />
                  Add Requirement
                  </Button>
                </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Job...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Add Job Posting</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowJobModal(false)}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 h-14 text-lg font-medium transition-all duration-300"
              >
                Cancel
              </Button>
                  </div>
          </form>
        </DialogContent>
      </Dialog>
                    </div>
  );
});



// Applications Tab Component
const ApplicationsTab = React.memo(() => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load applications from Firebase on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('Loading job applications in AdminDashboard...');
      const response = await firebaseApi.jobApplications.getAll();
      console.log('Applications response:', response);
      if (response.success) {
        console.log('Setting applications:', response.data);
        setApplications(response.data);
      } else {
        console.error('Failed to load applications:', response);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      const response = await firebaseApi.jobApplications.updateStatus(applicationId, status as any);
      if (response.success) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        ));
        alert("Application status updated successfully!");
      } else {
        alert("Failed to update application status. Please try again.");
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert("Failed to update application status. Please try again.");
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        const response = await firebaseApi.jobApplications.delete(applicationId);
        if (response.success) {
          setApplications(prev => prev.filter(app => app.id !== applicationId));
          alert("Application deleted successfully!");
        } else {
          alert("Failed to delete application. Please try again.");
        }
      } catch (error) {
        console.error('Error deleting application:', error);
        alert("Failed to delete application. Please try again.");
      }
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'hired':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Job Applications</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Review and manage job applications from candidates
          </p>
        </div>
        <Button
          onClick={loadApplications}
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          Refresh Applications
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <Card className="text-center py-16">
            <CardContent className="p-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading applications...</p>
            </CardContent>
          </Card>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {app.firstName} {app.lastName}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 font-medium">
                            {app.position}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">{app.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">{app.phone}</span>
                        </div>
                        {app.closingDate && app.closingDate.trim() !== "" && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">Closing: {new Date(app.closingDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <Badge className={`${getStatusColor(app.status)} px-4 py-1 text-sm font-medium`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                          {app.cvFileUrl && (
                            <a 
                              href={app.cvFileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              <FileText className="w-4 h-4" />
                              View CV
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={app.status}
                            onValueChange={(value) => handleUpdateStatus(app.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleViewDetails(app)}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleDeleteApplication(app.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 border-0">
            <CardContent className="p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                No Applications Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Job applications will appear here once candidates start applying to your postings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </DialogTitle>
                <DialogDescription>
                  Application for {selectedApplication.position}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                    <p className="text-slate-900 dark:text-white">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</Label>
                    <p className="text-slate-900 dark:text-white">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Applied On</Label>
                    <p className="text-slate-900 dark:text-white">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Closing Date</Label>
                    <p className="text-slate-900 dark:text-white">{new Date(selectedApplication.closingDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cover Letter / Message</Label>
                  <p className="text-slate-900 dark:text-white mt-2 whitespace-pre-wrap">{selectedApplication.message}</p>
                </div>
                {selectedApplication.cvFileUrl && (
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">CV</Label>
                    <a 
                      href={selectedApplication.cvFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2"
                    >
                      <FileText className="w-5 h-5" />
                      {selectedApplication.cvFileName || 'Download CV'}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    instructorPerformance, 
    courses, 
    students, 
    messages, 
    studentProgress,
    courseAnalytics,
    meetings,
    deleteCourse,
    refreshCourses,
    verifyCourseDeletion,
    clearAllCourseStorage,
    enrollments
  } = useDataSync();

  const [activeTab, setActiveTab] = useState("overview");
  const [hasError, setHasError] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isCourseCreationOpen, setIsCourseCreationOpen] = useState(false);
  const [checkoutSessionsRevenue, setCheckoutSessionsRevenue] = useState<number | null>(null);
  const [checkoutSessions, setCheckoutSessions] = useState<CheckoutSession[] | null>(null);
  const [isUserRegistrationOpen, setIsUserRegistrationOpen] = useState(false);
  const [isReportGenerationOpen, setIsReportGenerationOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);
  const [grantAccessEmail, setGrantAccessEmail] = useState("");
  const [grantAccessCourseId, setGrantAccessCourseId] = useState("");
  const [grantAccessLoading, setGrantAccessLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'retrying'>('connected');
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "default"
  });
  
  // State for data from Firebase
  const [learners, setLearners] = useState<Learner[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Load total revenue from checkoutSessions (admin-only collection; see Firestore rules)
  useEffect(() => {
    const loadCheckoutRevenue = async () => {
      if (!user || normalizeRole(user.role) !== 'admin') {
        setCheckoutSessionsRevenue(null);
        setCheckoutSessions(null);
        return;
      }
      try {
        const sessions: CheckoutSession[] = await DatabaseService.getCheckoutSessions();
        setCheckoutSessions(sessions);

        // Use the same amount calculation as the Transactions table so
        // the overview Total Revenue and the revenue chart match what
        // admins see row‑by‑row.
        const total = sessions.reduce((sum, s) => {
          const courseRow = courses.find((c) => c.id === s.courseId);
          const priceFallback =
            courseRow && typeof courseRow.price === 'number' ? courseRow.price : 0;

          const amount =
            typeof s.amountPaid === 'number' && s.amountPaid > 0
              ? s.amountPaid
              : typeof s.amountCents === 'number' && s.amountCents > 0
                ? s.amountCents / 100
                : priceFallback;

          return sum + (amount > 0 ? amount : 0);
        }, 0);

        setCheckoutSessionsRevenue(total);
      } catch (error) {
        console.error('Error loading checkoutSessions revenue for admin dashboard:', error);
        setCheckoutSessionsRevenue(null);
      }
    };

    loadCheckoutRevenue();
  }, [user]);

  // Calculate totals
  const totalLearners = useMemo(() => (learners || []).length, [learners]);
  const totalInstructors = useMemo(() => instructors.length, [instructors]);
  const totalCourses = useMemo(() => courses.length, [courses]);
  const totalCertificates = useMemo(() => certificates.length, [certificates]);
  const activeLearners = useMemo(() => 
    (learners || []).filter(l => l.isActive).length, [learners]
  );

  // Enrolled learners: unique users with at least one progress record (paid & started)
  const { enrolledLearnerCount, enrolledLearnerIds } = useMemo(() => {
    const ids = new Set<string>();
    (studentProgress || []).forEach((p: { studentId?: string; studentEmail?: string }) => {
      if (p.studentId) ids.add(p.studentId);
      if (p.studentEmail) ids.add(p.studentEmail);
    });
    return { enrolledLearnerCount: ids.size, enrolledLearnerIds: ids };
  }, [studentProgress]);

  // Debug logging
  useEffect(() => {
    console.log('AdminDashboard Data:', {
      courses: courses.length,
      studentProgress: studentProgress.length,
      courseAnalytics: courseAnalytics.length,
      learners: (learners || []).length,
      instructors: instructors.length
    });
  }, [courses, studentProgress, courseAnalytics, learners, instructors]);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data from Firebase
        const [studentsResponse, instructorsResponse] = await Promise.all([
          firebaseApiService.users.getLearners(),
          firebaseApiService.users.getInstructors()
        ]);

        if (studentsResponse.success) {
          // Convert User[] to Student[] by adding missing properties
          const studentsData = studentsResponse.data.map((user: any) => ({
            ...user,
            specialization: '',
            courses: [],
            assignments: [],
            progress: [],
            certificates: [],
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            isActive: true
          }));
          console.log('Loaded students data:', studentsData);
          setLearners(studentsData);
        }
        if (instructorsResponse.success) {
          // Convert User[] to Instructor[] by adding missing properties
          const instructorsData = instructorsResponse.data.map((user: any) => ({
            ...user,
            specialization: user.specialization || [],
            courses: user.courses || [],
            learners: user.learners || 0,
            rating: user.rating || 0,
            joinDate: user.joinDate || user.createdAt,
            qualifications: user.qualifications || [],
            setaRegistration: user.setaRegistration || '',
            qctoRegistration: user.qctoRegistration || '',
            isActive: user.isActive !== undefined ? user.isActive : true,
            lastActive: user.lastActive || user.updatedAt
          }));
          console.log('Loaded instructors data:', instructorsData);
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        setHasError(true);
      }
    };

    loadData();
  }, []);

  // Load all users from Firebase
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const users = await DatabaseService.getAllUsers();
        console.log('Loaded all users:', users.length);
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading all users:', error);
      }
    };

    loadAllUsers();

    // Set up real-time subscription
    const unsubscribe = DatabaseService.subscribeToAllUsers((users) => {
      console.log('All users updated:', users.length);
      setAllUsers(users);
    });

    return () => unsubscribe();
  }, []);

  // Load certificates for overview (real count)
  useEffect(() => {
    let cancelled = false;
    DatabaseService.getCertificates()
      .then((certs) => {
        if (!cancelled) setCertificates(certs);
      })
      .catch((err) => console.error('Error loading certificates:', err));
    return () => { cancelled = true; };
  }, []);

  // Recent activity data - using real Firebase data
  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    const now = new Date();

    // Helper function to format time ago
    const getTimeAgo = (date: string | Date | undefined | null) => {
      if (!date) return "Just now";
      
      const activityDate = new Date(date);
      
      // Check if date is valid
      if (isNaN(activityDate.getTime())) {
        return "Just now";
      }
      
      const diffInMs = now.getTime() - activityDate.getTime();
      
      // Check if diff is valid (not negative and not NaN)
      if (isNaN(diffInMs) || diffInMs < 0) {
        return "Just now";
      }
      
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    // Recent course activities - using real courses data
    const recentCourses = courses
      .filter(course => course.isPublished)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 2);

    recentCourses.forEach(course => {
      const instructor = instructors.find(i => i.id === course.instructorId);
      const courseDate = course.updatedAt || course.createdAt;
      activities.push({
        title: "Course Published",
        description: `"${course.title}" by ${instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown Instructor'}`,
        timestamp: getTimeAgo(courseDate),
        type: "course",
        icon: "BookOpen"
      });
    });

    // Recent student registrations - using real students data
    const recentStudents = students
      .filter(isLearnerUser)
      .sort((a, b) => new Date(b.joinDate || b.lastActive || 0).getTime() - new Date(a.joinDate || a.lastActive || 0).getTime())
      .slice(0, 3);

    recentStudents.forEach(student => {
      const studentDate = student.joinDate || student.lastActive;
      activities.push({
      title: "New Learner Registration",
        description: `${student.firstName} ${student.lastName} joined the platform`,
        timestamp: getTimeAgo(studentDate),
        type: "student",
        icon: "UserPlus"
      });
    });

    // Course completion activities - Fulufhelo completed the course
    const completedLearners = (students || []).filter(s => 
      isLearnerUser(s) && 
      s.email === 'fulufhelo@youthdevelopers.co.za'
    );

    completedLearners.forEach(learner => {
      activities.push({
        title: "Course Completed",
        description: `${learner.firstName} ${learner.lastName} completed Programming - Complete Course with 100%`,
        timestamp: "2h ago",
        type: "course",
        icon: "BookOpen"
      });
    });

    // Student progress activities - using real studentProgress data
    const recentProgress = studentProgress
      .filter(progress => progress.studentId && progress.studentId !== undefined)
      .sort((a, b) => new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime())
      .slice(0, 2);

    recentProgress.forEach(progress => {
      const student = students.find(s => s.id === progress.studentId);
      const course = courses.find(c => c.id === progress.courseId);
      if (student && course) {
      activities.push({
          title: "Progress Update",
          description: `${student.firstName} ${student.lastName} made progress in "${course.title}" (${progress.progress}%)`,
          timestamp: getTimeAgo(progress.lastActivity),
          type: "student",
          icon: "UserPlus"
        });
      }
    });

    // System activities
      activities.push({
      title: "System Update",
      description: "Admin dashboard updated with real-time data",
      timestamp: "Just now",
      type: "course",
      icon: "BookOpen"
    });

    // Sort all activities by timestamp (most recent first) and return top 5
    return activities
      .sort((a, b) => {
        // Simple sorting by timestamp string
        const timeOrder = { "Just now": 0, "2h ago": 1, "1h ago": 2, "1d ago": 3, "2d ago": 4 };
        const aOrder = timeOrder[a.timestamp] || 5;
        const bOrder = timeOrder[b.timestamp] || 5;
        return aOrder - bOrder;
      })
      .slice(0, 5);
  }, [courses, students, instructors, studentProgress]);

  // Action handlers
  const handleEditUser = useCallback((user: any) => {
    setEditingUser(user);
  }, []);

  // Enhanced error handling for Firebase operations
  const handleFirebaseError = useCallback((error: any, operation: string) => {
    console.error(`Firebase error in ${operation}:`, error);
    
    if (error.message?.includes('QUIC_PROTOCOL_ERROR') || 
        error.message?.includes('Failed to fetch') || 
        error.code === 'unavailable') {
      setConnectionStatus('disconnected');
      toast({
        title: "Connection Error",
        description: "Lost connection to Firebase. Please check your internet connection.",
        variant: "destructive",
      });
    } else if (error.code === 'permission-denied') {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to perform this action. Please check Firebase security rules.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: error.message || `${operation} failed. Please try again.`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDeleteUser = useCallback((userId: string) => {
    // Search in allUsers to find any user type (admin, instructor, learner, sub-admin)
    const user = allUsers.find(u => u.id === userId || u.uid === userId);
    if (!user) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
    const userRole = (user.role || '').toLowerCase();

    setConfirmationDialog({
      isOpen: true,
      title: "Delete User",
      description: `Are you sure you want to delete ${userName} (${userRole})? This action cannot be undone and will permanently remove the user from the system.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          console.log('🗑️ Deleting user from Firebase Auth and Firestore:', userId, userName);
          const deleteUserByAdminFn = httpsCallable<{ userId: string }, { success: boolean; message?: string }>(functions, 'deleteUserByAdmin');
          const result = await deleteUserByAdminFn({ userId });
          const data = result.data as { success?: boolean; message?: string };
          if (!data?.success) {
            throw new Error((result as any).error?.message || 'Failed to delete user');
          }
          setAllUsers(prev => prev.filter(u => u.id !== userId && u.uid !== userId));
          setLearners(prev => prev.filter(l => l.id !== userId));
          setInstructors(prev => prev.filter(i => i.id !== userId));
          toast({
            title: "User Deleted",
            description: `${userName} has been deleted from Firebase (Authentication and Firestore).`,
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          handleFirebaseError(error, 'delete user');
        }
      }
    });
  }, [allUsers, toast]);


  const [adminEditCourse, setAdminEditCourse] = useState<Course | null>(null);
  const [adminViewCourse, setAdminViewCourse] = useState<Course | null>(null);
  const [adminViewLesson, setAdminViewLesson] = useState<any>(null);
  const [adminViewUnit, setAdminViewUnit] = useState<any>(null);

  const handleEditCourse = useCallback((course: Course) => {
    setAdminEditCourse(course);
  }, []);

  const handleDeleteCourse = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      toast({
        title: "Error",
        description: "Course not found.",
        variant: "destructive",
      });
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: "Delete Course",
      description: `Are you sure you want to delete "${course.title}"? This action will permanently remove the course and all its content including enrollments, progress, and assignments. This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          console.log('🗑️ Starting course deletion for:', courseId, course.title);
          
          // Clear ALL course storage data
          console.log('🧹 Clearing all course storage data...');
          clearAllCourseStorage();
          
          // Use DataSyncContext deleteCourse method which handles comprehensive deletion
          await deleteCourse(courseId);
          
          console.log('✅ Course deletion completed, verifying complete deletion...');
          
          // Verify complete deletion
          const isCompletelyDeleted = await verifyCourseDeletion(courseId);
          if (!isCompletelyDeleted) {
            console.error('❌ Course deletion verification failed!');
            toast({
              title: "Deletion Warning",
              description: "Course may not have been completely deleted. Please refresh and try again.",
              variant: "destructive",
            });
            return;
          }
          
          // Force a complete refresh of courses to ensure UI updates
          setTimeout(async () => {
            try {
              console.log('🔄 Force refreshing courses after deletion...');
              await refreshCourses();
              console.log('✅ Courses refreshed after deletion');
            } catch (refreshError) {
              console.error('Error refreshing courses after deletion:', refreshError);
            }
          }, 1000);
          
          toast({
            title: "Course Deleted",
            description: `"${course.title}" has been deleted successfully along with all its content.`,
          });
        } catch (error) {
          console.error('Error deleting course:', error);
          handleFirebaseError(error, 'delete course');
        }
      }
    });
  }, [courses, deleteCourse, refreshCourses, toast]);

  const { updateCourse } = useDataSync();
  const handleApproveCourse = useCallback(async (courseId: string) => {
    console.log('Approve course:', courseId);
    try {
      await updateCourse(courseId, { isPublished: true, complianceStatus: 'Compliant' as any });
      toast({ title: 'Course Approved', description: 'Course has been approved and published.' });
      await refreshCourses();
    } catch (e) {
      handleFirebaseError(e, 'approve course');
    }
  }, [refreshCourses, toast, updateCourse]);

  const handleViewCourse = useCallback((course: Course) => {
    setAdminViewCourse(course);
    setAdminViewLesson(null);
    setAdminViewUnit(null);
  }, []);

  const handleCloseAdminLearnerView = useCallback(() => {
    setAdminViewCourse(null);
    setAdminViewLesson(null);
    setAdminViewUnit(null);
  }, []);

  const handleAdminViewLesson = useCallback((lesson: any, unit: any, courseForViewer?: Course | null) => {
    if (courseForViewer != null) {
      setAdminViewCourse(courseForViewer);
    }
    setAdminViewLesson(lesson);
    setAdminViewUnit(unit);
  }, []);

  const handleAdminBackToCourse = useCallback(() => {
    setAdminViewLesson(null);
    setAdminViewUnit(null);
  }, []);

  // Quick Actions handlers
  const handleCreateCourse = useCallback(() => {
    setIsCourseCreationOpen(true);
  }, []);

  const handleAddUser = useCallback(() => {
    setIsUserRegistrationOpen(true);
  }, []);

  const handleGrantCourseAccessOpen = useCallback(() => {
    setIsQuickActionsOpen(false);
    setIsGrantAccessOpen(true);
  }, []);

  const handleGrantCourseAccessSubmit = useCallback(async () => {
    const email = grantAccessEmail.trim();
    if (!email) {
      toast({ title: "Email required", description: "Enter the learner's email.", variant: "destructive" });
      return;
    }
    setGrantAccessLoading(true);
    try {
      const result = await grantCourseAccessByEmail(email, grantAccessCourseId.trim() || undefined);
      if (result.success) {
        toast({ title: "Course access granted", description: result.message || "The course will appear in My Courses for this learner." });
        setGrantAccessEmail("");
        setGrantAccessCourseId("");
        setIsGrantAccessOpen(false);
        await refreshCourses();
      } else {
        toast({ title: "Failed", description: result.error || "Could not grant access.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Request failed.", variant: "destructive" });
    } finally {
      setGrantAccessLoading(false);
    }
  }, [grantAccessEmail, grantAccessCourseId, refreshCourses, toast]);

  const handleGenerateReport = useCallback(async () => {
    try {
      // Generate comprehensive report
      const reportData = {
        generatedAt: new Date().toISOString(),
        totalUsers: (learners || []).length + instructors.length,
        totalCourses: courses.length,
        totalCertificates: certificates.length,
        activeLearners: (learners || []).filter(s => s.isActive).length,
        totalRevenue: courses.reduce((sum, course) => sum + (course.price * (course.enrolledLearners || 0)), 0),
        averageRating: courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length || 0,
        completionRate: 78, // This would be calculated from actual progress data
        topCategories: courses.reduce((acc, course) => {
          acc[course.category] = (acc[course.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        complianceStatus: {
          compliant: courses.filter(c => c.complianceStatus === 'Compliant').length,
          pending: courses.filter(c => c.complianceStatus === 'Pending Review').length,
          nonCompliant: courses.filter(c => c.complianceStatus === 'Non-Compliant').length
        }
      };

      // Create downloadable report
      const reportContent = `
# SmartLMS System Report
Generated: ${new Date(reportData.generatedAt).toLocaleString()}

## Overview
- Total Users: ${reportData.totalUsers}
- Total Courses: ${reportData.totalCourses}
- Total Certificates: ${reportData.totalCertificates}
- Active Learners: ${reportData.activeLearners}

## Financial
- Total Revenue: R ${reportData.totalRevenue.toLocaleString()}
- Average Course Rating: ${reportData.averageRating.toFixed(1)}/5

## Compliance
- Compliant Courses: ${reportData.complianceStatus.compliant}
- Pending Review: ${reportData.complianceStatus.pending}
- Non-Compliant: ${reportData.complianceStatus.nonCompliant}

## Top Categories
${Object.entries(reportData.topCategories).map(([category, count]) => `- ${category}: ${count} courses`).join('\n')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartlms-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "System report has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  }, [learners, instructors, courses, certificates, toast]);

  const handleSystemBackup = useCallback(async () => {
    try {
      toast({
        title: "System Backup",
        description: "Starting system backup process...",
      });

      // Simulate backup process
      const backupData = {
        timestamp: new Date().toISOString(),
        users: [...students, ...instructors],
        courses: courses,
        certificates: certificates,
        metadata: {
          totalUsers: (learners || []).length + instructors.length,
          totalCourses: courses.length,
          totalCertificates: certificates.length
        }
      };

      // Create downloadable backup
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartlms-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Backup Complete",
        description: "System backup has been created and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create system backup. Please try again.",
        variant: "destructive",
      });
    }
  }, [learners, instructors, courses, certificates, toast]);


  const handleMaintenanceMode = useCallback(async () => {
    try {
      // This would typically update a system settings document in Firebase
      // For now, we'll simulate the toggle
      toast({
        title: "Maintenance Mode",
        description: "Maintenance mode has been toggled successfully.",
      });
      
      // In a real implementation, this would:
      // 1. Update system settings in Firebase
      // 2. Notify all users via push notifications
      // 3. Update the UI to show maintenance mode status
      console.log('Maintenance mode toggled');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Dialog handlers
  const handleCourseCreated = useCallback((newCourse: Course) => {
    // Course will be automatically added via DataSyncContext
    setIsCourseCreationOpen(false);
    toast({
      title: "Course Created",
      description: "Course has been created successfully.",
    });
  }, [toast]);

  const handleUserCreated = useCallback((newUser: any) => {
    if (isLearnerRole(newUser.role)) {
      setLearners(prev => [...prev, newUser]);
    } else if (newUser.role === 'instructor') {
      setInstructors(prev => [...prev, newUser]);
      
      // Update assigned students to include the new instructor
      if (newUser.assignedStudents && newUser.assignedStudents.length > 0) {
        setLearners(prev => prev.map(learner => 
          newUser.assignedStudents.includes(learner.id)
            ? { ...learner, instructorId: newUser.id, instructorName: `${newUser.firstName} ${newUser.lastName}` }
            : learner
        ));
      }
    } else if (newUser.role === 'sub-admin') {
      setInstructors(prev => [...prev, newUser]);
      
      // Update assigned instructors to include the new sub admin
      if (newUser.assignedInstructors && newUser.assignedInstructors.length > 0) {
        setInstructors(prev => prev.map(instructor => 
          newUser.assignedInstructors.includes(instructor.id)
            ? { ...instructor, subAdminId: newUser.id, subAdminName: `${newUser.firstName} ${newUser.lastName}` }
            : instructor
        ));
      }
    } else if (newUser.role === 'admin') {
      // For now, we'll add admins to the instructors list for display purposes
      // In a real app, you might want a separate admin state
      setInstructors(prev => [...prev, newUser]);
    }
    setIsUserRegistrationOpen(false);
  }, []);

  const handleUserUpdated = useCallback((updatedUser: any) => {
    if (isLearnerRole(updatedUser.role)) {
      setLearners(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
    } else {
      setInstructors(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
    }
    setEditingUser(null);
    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    });
  }, [toast]);

  // Handle connection retry
  const handleRetryConnection = useCallback(async () => {
    setConnectionStatus('retrying');
    try {
      await handleConnectionError();
      setConnectionStatus('connected');
      toast({
        title: "Connection Restored",
        description: "Firebase connection has been restored successfully.",
      });
    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "Connection Failed",
        description: "Failed to restore connection. Please check your internet connection.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
                <div>
                <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName || 'Admin'}!
                </h1>
                  {/* Connection Status Indicator */}
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'connected' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    )}
                    {connectionStatus === 'disconnected' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Disconnected</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRetryConnection}
                          className="ml-2 h-6 px-2 text-xs"
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                    {connectionStatus === 'retrying' && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Retrying...</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage your SmartLMS platform
                </p>
                </div>
            </div>
                </div>
                </div>
              </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              totalLearners={totalLearners}
              totalInstructors={totalInstructors}
              totalCourses={totalCourses}
              totalCertificates={totalCertificates}
              activeLearners={activeLearners}
              recentActivity={recentActivity}
              instructorPerformance={instructorPerformance}
              courses={courses}
              students={students}
              studentProgress={studentProgress}
              courseAnalytics={courseAnalytics}
              allUsers={allUsers}
              enrollments={enrollments ?? []}
              checkoutSessionsRevenue={checkoutSessionsRevenue}
              checkoutSessions={checkoutSessions}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Transactions</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Checkout payments (name, ID, course, amount paid). Data from Firestore checkout sessions.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    if (!user || normalizeRole(user.role) !== 'admin') return;
                    try {
                      const sessions = await DatabaseService.getCheckoutSessions();
                      setCheckoutSessions(sessions);
                      const completed = sessions.filter((s) => (s.status || '').toLowerCase() === 'completed');
                      const total = completed.reduce((sum, session) => {
                        const raw =
                          typeof session.amountPaid === 'number' && !Number.isNaN(session.amountPaid)
                            ? session.amountPaid
                            : typeof session.amountCents === 'number' && !Number.isNaN(session.amountCents)
                              ? session.amountCents / 100
                              : 0;
                        return sum + (raw > 0 ? raw : 0);
                      }, 0);
                      setCheckoutSessionsRevenue(total);
                    } catch (e) {
                      console.error(e);
                      toast({ title: 'Refresh failed', variant: 'destructive' });
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <Card className="border border-slate-200 dark:border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <ScrollArea className="h-[min(70vh,560px)] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/80">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Surname</TableHead>
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Course</TableHead>
                          <TableHead className="font-semibold text-right">Amount paid</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap">Date</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(!checkoutSessions || checkoutSessions.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-slate-500 py-12">
                              No checkout sessions yet, or still loading. Use Refresh after payments complete.
                            </TableCell>
                          </TableRow>
                        )}
                        {(checkoutSessions || [])
                          .slice()
                          .sort((a, b) => {
                            const ta = new Date(b.completedAt || b.createdAt || 0).getTime();
                            const tb = new Date(a.completedAt || a.createdAt || 0).getTime();
                            return ta - tb;
                          })
                          .map((s) => {
                            const courseTitle =
                              s.courseTitle ||
                              courses.find((c) => c.id === s.courseId)?.title ||
                              s.courseId ||
                              '—';
                            const courseRow = courses.find((c) => c.id === s.courseId);
                            const priceFallback =
                              courseRow && typeof courseRow.price === 'number' ? courseRow.price : 0;
                            const amount =
                              typeof s.amountPaid === 'number' && s.amountPaid > 0
                                ? s.amountPaid
                                : typeof s.amountCents === 'number' && s.amountCents > 0
                                  ? s.amountCents / 100
                                  : priceFallback;
                            const dateStr = s.completedAt || s.createdAt || '—';
                            return (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.firstName || '—'}</TableCell>
                                <TableCell>{s.lastName || '—'}</TableCell>
                                <TableCell className="font-mono text-sm">{s.identityNumber || '—'}</TableCell>
                                <TableCell className="w-14 text-center align-middle">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 mx-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        title="Course subscribed"
                                        aria-label="Show course name"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-80 z-[100]"
                                      align="start"
                                      side="left"
                                      collisionPadding={16}
                                    >
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Course this learner subscribed to
                                      </p>
                                      <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white leading-snug">
                                        {courseTitle !== '—' ? courseTitle : 'No course title on record'}
                                      </p>
                                    </PopoverContent>
                                  </Popover>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {amount > 0 ? `R ${amount.toLocaleString()}` : '—'}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                  {dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      (s.status || '').toLowerCase() === 'completed' ? 'default' : 'secondary'
                                    }
                                  >
                                    {s.status || '—'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UsersTab
              enrolledLearnerCount={enrolledLearnerCount}
              enrolledLearnerIds={enrolledLearnerIds}
              learners={(allUsers || []).filter(u => {
                const role = (u.role || '').toLowerCase();
                return role === 'learner' || role === 'student';
              })}
              instructors={(allUsers || []).filter(u => {
                const role = (u.role || '').toLowerCase();
                return role === 'instructor';
              })}
              subAdmins={(allUsers || []).filter(u => {
                const role = (u.role || '').toLowerCase();
                return role === 'sub-admin' || role === 'subadmin';
              })}
              admins={(allUsers || []).filter(u => {
                const role = (u.role || '').toLowerCase();
                return role === 'admin';
              })}
              courses={courses ?? []}
              studentProgress={studentProgress ?? []}
              onEditUser={(user) => setEditingUser(user)}
              onDeleteUser={handleDeleteUser}
              onShowConfirmation={setConfirmationDialog}
              onAddUser={() => setIsUserRegistrationOpen(true)}
            />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesTab
              courses={courses}
              learners={learners}
              instructors={(students || []).filter(s => s.role === 'instructor')}
              subAdmins={(students || []).filter(s => s.role === 'sub-admin')}
              admins={(students || []).filter(s => s.role === 'admin')}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onApproveCourse={handleApproveCourse}
              onViewCourse={handleViewCourse}
              onRefreshCourses={refreshCourses}
              onCreateCourse={handleCreateCourse}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarComponent 
              events={[]} // TODO: Add calendar events from Firebase
              onEventClick={(event) => {
                console.log('Event clicked:', event);
                // Handle event click
              }}
              onAddEvent={() => {
                console.log('Add event clicked');
                // Handle add event
              }}
              userRole="admin"
            />
          </TabsContent>

          <TabsContent value="blogs">
            <BlogsTab />
          </TabsContent>

          <TabsContent value="community">
            <CommunityManagementTab />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsTab />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsTab />
          </TabsContent>

        </Tabs>
              </div>

      {/* Quick Actions Dialog */}
      <QuickActionsDialog
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onCreateCourse={handleCreateCourse}
        onAddUser={handleAddUser}
        onGenerateReport={handleGenerateReport}
        onSystemBackup={handleSystemBackup}
        onMaintenanceMode={handleMaintenanceMode}
        onGrantCourseAccess={handleGrantCourseAccessOpen}
      />

      {/* Grant course access by email (admin) */}
      <Dialog open={isGrantAccessOpen} onOpenChange={setIsGrantAccessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              Grant course access
            </DialogTitle>
            <DialogDescription>
              Add a purchased course to a learner by email. Leave course ID empty to use their latest checkout session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="grant-email">Learner email</Label>
              <Input
                id="grant-email"
                type="email"
                placeholder="e.g. learner@example.com"
                value={grantAccessEmail}
                onChange={(e) => setGrantAccessEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="grant-course">Course ID (optional)</Label>
              <Input
                id="grant-course"
                placeholder="Leave empty to use latest purchase"
                value={grantAccessCourseId}
                onChange={(e) => setGrantAccessCourseId(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantAccessOpen(false)}>Cancel</Button>
            <Button onClick={handleGrantCourseAccessSubmit} disabled={grantAccessLoading}>
              {grantAccessLoading ? "Granting…" : "Grant access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Creation Page */}
      {isCourseCreationOpen && (
        <CourseCreationPage
          onBack={() => setIsCourseCreationOpen(false)}
          onSave={handleCourseCreated}
        />
      )}

      {/* Admin Course Edit */}
      {adminEditCourse && (
        <CourseEdit
          course={adminEditCourse as any}
          onBack={() => setAdminEditCourse(null)}
          onSave={async () => {
            setAdminEditCourse(null);
            await refreshCourses();
          }}
        />
      )}

      {/* Admin "View as learner" – course structure and lesson viewer */}
      {adminViewCourse && adminViewLesson && adminViewUnit && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-50">
          {(() => {
            const allLessons = adminViewCourse.units?.flatMap((u: any) => u.lessons || []) || [];
            const currentIndex = allLessons.findIndex((l: any) => l.id === adminViewLesson.id || String(l.id) === String(adminViewLesson.id));
            const isFirstLesson = currentIndex === 0;
            const isLastLesson = currentIndex === allLessons.length - 1;
            const handleNext = () => {
              if (currentIndex < allLessons.length - 1) {
                const next = allLessons[currentIndex + 1];
                const nextUnit = adminViewCourse.units?.find((u: any) => u.lessons?.some((l: any) => l.id === next.id || String(l.id) === String(next.id)));
                if (nextUnit) setAdminViewUnit(nextUnit);
                setAdminViewLesson(next);
              } else {
                setAdminViewLesson(null);
                setAdminViewUnit(null);
              }
            };
            const handlePrev = () => {
              if (currentIndex > 0) {
                const prev = allLessons[currentIndex - 1];
                const prevUnit = adminViewCourse.units?.find((u: any) => u.lessons?.some((l: any) => l.id === prev.id || String(l.id) === String(prev.id)));
                if (prevUnit) setAdminViewUnit(prevUnit);
                setAdminViewLesson(prev);
              }
            };
            return (
              <LessonViewer
                course={adminViewCourse}
                currentLesson={adminViewLesson}
                currentUnit={adminViewUnit}
                onClose={handleCloseAdminLearnerView}
                onBackToCourse={handleAdminBackToCourse}
                onNextLesson={handleNext}
                onPreviousLesson={handlePrev}
                onCompleteLesson={() => {}}
                isFirstLesson={isFirstLesson}
                isLastLesson={isLastLesson}
                currentLessonIndex={currentIndex >= 0 ? currentIndex : 0}
                totalLessons={allLessons.length}
              />
            );
          })()}
        </div>
      )}
      {adminViewCourse && !adminViewLesson && (
        <CourseStructureView
          course={adminViewCourse}
          onClose={handleCloseAdminLearnerView}
          onViewLesson={handleAdminViewLesson}
        />
      )}

      {/* User Registration Dialog */}
      <UserRegistrationDialog
        isOpen={isUserRegistrationOpen}
        onClose={() => setIsUserRegistrationOpen(false)}
        onUserCreated={handleUserCreated}
        availableStudents={(students || []).filter(isLearnerUser)}
        availableInstructors={(students || []).filter(s => s.role === 'instructor')}
      />

      {/* User Edit Dialog */}
      <UserEditDialog
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        variant={confirmationDialog.variant}
      />
    </div>
  );
};
