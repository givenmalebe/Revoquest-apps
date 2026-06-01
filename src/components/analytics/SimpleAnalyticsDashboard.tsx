import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp,
  RefreshCw,
  Download
} from "lucide-react";

// Import our simplified analytics components
import { SimpleCourseProgress } from './SimpleCourseProgress';
import { SimpleStudentPerformance } from './SimpleStudentPerformance';

interface Course {
  id: string;
  title: string;
  description: string;
  enrolledStudents: number;
  lessons: number;
  duration: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledCourses: string[];
  completedCourses: string[];
  progress: number;
  lastActive: string;
  joinDate: string;
}

interface SimpleAnalyticsDashboardProps {
  courses: Course[];
  students: Student[];
  onRefresh?: () => void;
  onExport?: (type: string) => void;
}

export const SimpleAnalyticsDashboard: React.FC<SimpleAnalyticsDashboardProps> = ({
  courses,
  students,
  onRefresh,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate real statistics from actual data
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = students.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents, 0);
    
    // Calculate completion rate based on actual data
    const totalStudentEnrollments = students.reduce((sum, student) => sum + student.enrolledCourses.length, 0);
    const totalCompletions = students.reduce((sum, student) => sum + student.completedCourses.length, 0);
    const completionRate = totalStudentEnrollments > 0 ? (totalCompletions / totalStudentEnrollments) * 100 : 0;
    
    const averageProgress = students.length > 0 
      ? students.reduce((sum, student) => sum + student.progress, 0) / students.length 
      : 0;

    return {
      totalCourses,
      totalStudents,
      publishedCourses,
      totalEnrollments,
      completionRate,
      averageProgress
    };
  }, [courses, students]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time insights into course progress and student performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => onExport?.('all')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published Courses</p>
                <p className="text-2xl font-bold text-purple-600">{stats.publishedCourses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress Summary</CardTitle>
                <CardDescription>
                  Overview of all course completion rates and student progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Enrollments</span>
                    <span className="text-lg font-bold text-blue-600">{stats.totalEnrollments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Student Progress</span>
                    <span className="text-lg font-bold text-green-600">{stats.averageProgress.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Completion Rate</span>
                    <span className="text-lg font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Key metrics at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Published Courses</span>
                    <span className="text-lg font-bold text-blue-600">{stats.publishedCourses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Draft Courses</span>
                    <span className="text-lg font-bold text-gray-600">{stats.totalCourses - stats.publishedCourses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Students</span>
                    <span className="text-lg font-bold text-green-600">{stats.totalStudents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <SimpleCourseProgress 
            courses={courses} 
            students={students}
          />
        </TabsContent>

        <TabsContent value="students">
          <SimpleStudentPerformance 
            students={students} 
            courses={courses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
