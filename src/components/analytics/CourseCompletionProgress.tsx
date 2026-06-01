import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Award,
  BarChart3,
  Download
} from "lucide-react";

interface CourseCompletionData {
  courseId: string;
  courseTitle: string;
  totalEnrolled: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  averageTimeToComplete: number;
  lastActivity: string;
  milestones: {
    id: string;
    title: string;
    completed: number;
    total: number;
    percentage: number;
  }[];
  monthlyCompletions: {
    month: string;
    completions: number;
    enrollments: number;
  }[];
}

interface CourseCompletionProgressProps {
  courses: CourseCompletionData[];
  selectedTimeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export const CourseCompletionProgress: React.FC<CourseCompletionProgressProps> = ({ 
  courses, 
  selectedTimeframe = 'month' 
}) => {
  const getCompletionStatus = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', color: 'text-green-600 bg-green-50 border-green-200' };
    if (rate >= 60) return { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (rate >= 40) return { label: 'Average', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { label: 'Needs Attention', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const overallStats = courses.reduce((acc, course) => ({
    totalEnrolled: acc.totalEnrolled + course.totalEnrolled,
    totalCompleted: acc.totalCompleted + course.completed,
    totalInProgress: acc.totalInProgress + course.inProgress,
    totalNotStarted: acc.totalNotStarted + course.notStarted,
  }), { totalEnrolled: 0, totalCompleted: 0, totalInProgress: 0, totalNotStarted: 0 });

  const overallCompletionRate = overallStats.totalEnrolled > 0 
    ? (overallStats.totalCompleted / overallStats.totalEnrolled) * 100 
    : 0;

  const topPerformingCourses = courses
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.totalEnrolled}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.totalCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{overallStats.totalInProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{overallCompletionRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Courses
          </CardTitle>
          <CardDescription>
            Courses with the highest completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingCourses.map((course, index) => {
              const status = getCompletionStatus(course.completionRate);
              return (
                <div key={course.courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{course.courseTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {course.completed} of {course.totalEnrolled} completed
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Avg. {course.averageTimeToComplete} days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{course.completionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Course Completion Details
          </CardTitle>
          <CardDescription>
            Detailed breakdown of completion progress for each course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courses.map((course) => {
              const status = getCompletionStatus(course.completionRate);
              return (
                <div key={course.courseId} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{course.courseTitle}</h4>
                      <p className="text-sm text-gray-600">Last activity: {course.lastActivity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{course.totalEnrolled}</p>
                      <p className="text-sm text-gray-600">Total Enrolled</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{course.completed}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{course.inProgress}</p>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{course.notStarted}</p>
                      <p className="text-sm text-gray-600">Not Started</p>
                    </div>
                  </div>

                  {/* Completion Rate Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion Rate</span>
                      <span className="text-sm font-bold text-blue-600">{course.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={course.completionRate} className="h-3" />
                  </div>

                  {/* Milestones Progress */}
                  {course.milestones.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium mb-3">Course Milestones</h5>
                      <div className="space-y-3">
                        {course.milestones.map((milestone) => (
                          <div key={milestone.id}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{milestone.title}</span>
                              <span className="text-sm text-gray-600">
                                {milestone.completed}/{milestone.total} ({milestone.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={milestone.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Trends */}
                  {course.monthlyCompletions.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3">Monthly Completion Trends</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {course.monthlyCompletions.slice(-4).map((month) => (
                          <div key={month.month} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium">{month.month}</p>
                            <p className="text-lg font-bold text-green-600">{month.completions}</p>
                            <p className="text-xs text-gray-600">completions</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
