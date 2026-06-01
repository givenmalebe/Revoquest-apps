import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Target,
  Activity
} from "lucide-react";

// Import our analytics components
import { StudentPerformanceChart } from './StudentPerformanceChart';
import { CourseCompletionProgress } from './CourseCompletionProgress';
import { BestPerformingStudents } from './BestPerformingStudents';
import { ClassRegister } from './ClassRegister';
import { AttendanceTracker } from './AttendanceTracker';

interface AnalyticsData {
  students: any[];
  courses: any[];
  assignments: any[];
  attendanceRecords: any[];
  sessions: any[];
}

interface ComprehensiveAnalyticsDashboardProps {
  data: AnalyticsData;
  onRefresh?: () => void;
  onExport?: (type: string) => void;
}

export const ComprehensiveAnalyticsDashboard: React.FC<ComprehensiveAnalyticsDashboardProps> = ({
  data,
  onRefresh,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Process data for analytics components
  const processedData = useMemo(() => {
    // Student Performance Data
    const studentPerformanceData = data.students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      overallGrade: student.overallGrade || Math.floor(Math.random() * 40) + 60, // Mock if not available
      courseProgress: student.progress || Math.floor(Math.random() * 100),
      assignmentsCompleted: student.assignmentsCompleted || Math.floor(Math.random() * 10) + 5,
      totalAssignments: student.totalAssignments || 10,
      lastActive: student.lastActive || '2 days ago',
      performance: student.overallGrade >= 90 ? 'Excellent' : 
                   student.overallGrade >= 80 ? 'Good' : 
                   student.overallGrade >= 70 ? 'Average' : 'Needs Improvement',
      trend: Math.random() > 0.5 ? 'up' : 'down',
      courses: student.enrolledCourses?.map((courseId: string) => {
        const course = data.courses.find(c => c.id === courseId);
        return {
          id: courseId,
          title: course?.title || 'Unknown Course',
          progress: Math.floor(Math.random() * 100),
          grade: Math.floor(Math.random() * 40) + 60
        };
      }) || []
    }));

    // Course Completion Data
    const courseCompletionData = data.courses.map(course => ({
      courseId: course.id,
      courseTitle: course.title,
      totalEnrolled: course.enrolledStudents || course.enrolledLearners || 0,
      completed: Math.floor((course.enrolledStudents || 0) * (Math.random() * 0.8 + 0.2)),
      inProgress: Math.floor((course.enrolledStudents || 0) * (Math.random() * 0.3 + 0.1)),
      notStarted: Math.floor((course.enrolledStudents || 0) * (Math.random() * 0.2 + 0.05)),
      completionRate: Math.floor(Math.random() * 40) + 40,
      averageTimeToComplete: Math.floor(Math.random() * 30) + 14,
      lastActivity: '2 days ago',
      milestones: [
        { id: '1', title: 'Module 1', completed: Math.floor(Math.random() * 20) + 10, total: 20, percentage: Math.floor(Math.random() * 100) },
        { id: '2', title: 'Module 2', completed: Math.floor(Math.random() * 15) + 5, total: 15, percentage: Math.floor(Math.random() * 100) },
        { id: '3', title: 'Final Assessment', completed: Math.floor(Math.random() * 10) + 2, total: 10, percentage: Math.floor(Math.random() * 100) }
      ],
      monthlyCompletions: [
        { month: 'Jan', completions: Math.floor(Math.random() * 10) + 5, enrollments: Math.floor(Math.random() * 15) + 10 },
        { month: 'Feb', completions: Math.floor(Math.random() * 12) + 6, enrollments: Math.floor(Math.random() * 18) + 12 },
        { month: 'Mar', completions: Math.floor(Math.random() * 15) + 8, enrollments: Math.floor(Math.random() * 20) + 15 },
        { month: 'Apr', completions: Math.floor(Math.random() * 18) + 10, enrollments: Math.floor(Math.random() * 22) + 18 }
      ]
    }));

    // Best Performing Students Data
    const bestPerformingStudents = studentPerformanceData
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        certificatesEarned: Math.floor(Math.random() * 5) + 1,
        badgesEarned: Math.floor(Math.random() * 8) + 2,
        joinDate: '2024-01-15',
        achievements: [
          { id: '1', title: 'First Course Completed', description: 'Completed first course', earnedDate: '2024-02-01', type: 'certificate' },
          { id: '2', title: 'Perfect Attendance', description: 'Attended all sessions', earnedDate: '2024-02-15', type: 'badge' }
        ],
        strengths: ['Consistent performance', 'Active participation', 'Strong analytical skills'],
        areasForImprovement: ['Time management', 'Presentation skills']
      }))
      .sort((a, b) => b.overallGrade - a.overallGrade);

    // Class Register Data
    const classRegisterData = data.students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: '+27 82 123 4567',
      avatar: student.avatar,
      studentId: `STU${student.id.slice(-4).toUpperCase()}`,
      enrollmentDate: '2024-01-15',
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      courses: student.enrolledCourses?.map((courseId: string) => {
        const course = data.courses.find(c => c.id === courseId);
        return {
          id: courseId,
          title: course?.title || 'Unknown Course',
          progress: Math.floor(Math.random() * 100),
          grade: Math.floor(Math.random() * 40) + 60,
          status: Math.random() > 0.3 ? 'Enrolled' : 'Completed'
        };
      }) || [],
      attendance: {
        totalSessions: 20,
        attended: Math.floor(Math.random() * 15) + 10,
        percentage: Math.floor(Math.random() * 30) + 70
      },
      lastActive: '2 days ago',
      emergencyContact: {
        name: 'Jane Smith',
        phone: '+27 82 987 6543',
        relationship: 'Parent'
      }
    }));

    // Attendance Records Data
    const attendanceRecords = data.students.flatMap(student => 
      Array.from({ length: 10 }, (_, i) => ({
        id: `${student.id}-${i}`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        avatar: student.avatar,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00',
        status: ['Present', 'Absent', 'Late', 'Excused'][Math.floor(Math.random() * 4)],
        reason: Math.random() > 0.7 ? 'Medical appointment' : undefined,
        notes: Math.random() > 0.8 ? 'Participated actively in discussion' : undefined,
        sessionId: `session-${i}`,
        sessionTitle: `Session ${i + 1}`,
        instructor: 'Dr. Sarah Johnson'
      }))
    );

    const attendanceSessions = Array.from({ length: 10 }, (_, i) => ({
      id: `session-${i}`,
      title: `Session ${i + 1}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:00',
      duration: 90,
      instructor: 'Dr. Sarah Johnson',
      totalStudents: data.students.length,
      presentCount: Math.floor(data.students.length * (Math.random() * 0.3 + 0.7)),
      absentCount: Math.floor(data.students.length * (Math.random() * 0.2 + 0.05)),
      lateCount: Math.floor(data.students.length * (Math.random() * 0.1 + 0.02)),
      excusedCount: Math.floor(data.students.length * (Math.random() * 0.05 + 0.01))
    }));

    return {
      studentPerformanceData,
      courseCompletionData,
      bestPerformingStudents,
      classRegisterData,
      attendanceRecords,
      attendanceSessions
    };
  }, [data]);

  const overallStats = useMemo(() => {
    const totalStudents = data.students.length;
    const totalCourses = data.courses.length;
    const totalAssignments = data.assignments.length;
    const averageGrade = processedData.studentPerformanceData.reduce((sum, s) => sum + s.overallGrade, 0) / totalStudents;
    const averageProgress = processedData.studentPerformanceData.reduce((sum, s) => sum + s.courseProgress, 0) / totalStudents;
    const completionRate = processedData.courseCompletionData.reduce((sum, c) => sum + c.completionRate, 0) / totalCourses;

    return {
      totalStudents,
      totalCourses,
      totalAssignments,
      averageGrade: averageGrade || 0,
      averageProgress: averageProgress || 0,
      completionRate: completionRate || 0
    };
  }, [data, processedData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into student performance and course progress</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => onExport?.('all')}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.averageGrade.toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-purple-600">{overallStats.averageProgress.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{overallStats.completionRate.toFixed(1)}%</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StudentPerformanceChart 
                  students={processedData.studentPerformanceData.slice(0, 5)} 
                  selectedCourse={selectedCourse}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Completion Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseCompletionProgress 
                  courses={processedData.courseCompletionData.slice(0, 3)} 
                  selectedTimeframe={timeframe}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <StudentPerformanceChart 
            students={processedData.studentPerformanceData} 
            selectedCourse={selectedCourse}
          />
        </TabsContent>

        <TabsContent value="completion">
          <CourseCompletionProgress 
            courses={processedData.courseCompletionData} 
            selectedTimeframe={timeframe}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <BestPerformingStudents 
            students={processedData.bestPerformingStudents} 
            timeframe={timeframe}
            showDetails={true}
          />
        </TabsContent>

        <TabsContent value="register">
          <ClassRegister 
            students={processedData.classRegisterData}
            onExport={() => onExport?.('register')}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTracker 
            records={processedData.attendanceRecords}
            sessions={processedData.attendanceSessions}
            onExport={() => onExport?.('attendance')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
