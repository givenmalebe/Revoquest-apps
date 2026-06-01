import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Award, 
  BookOpen,
  TrendingUp,
  Clock
} from "lucide-react";

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

interface Course {
  id: string;
  title: string;
  enrolledStudents: number;
}

interface SimpleStudentPerformanceProps {
  students: Student[];
  courses: Course[];
}

export const SimpleStudentPerformance: React.FC<SimpleStudentPerformanceProps> = ({ 
  students, 
  courses 
}) => {
  // Calculate real student performance data
  const studentPerformanceData = students.map(student => {
    const enrolledCount = student.enrolledCourses.length;
    const completedCount = student.completedCourses.length;
    const completionRate = enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0;
    
    // Calculate performance level based on progress and completion
    let performanceLevel = 'Needs Improvement';
    if (student.progress >= 90 && completionRate >= 80) {
      performanceLevel = 'Excellent';
    } else if (student.progress >= 75 && completionRate >= 60) {
      performanceLevel = 'Good';
    } else if (student.progress >= 60 && completionRate >= 40) {
      performanceLevel = 'Average';
    }

    return {
      ...student,
      enrolledCount,
      completedCount,
      completionRate,
      performanceLevel
    };
  });

  // Sort by performance (progress + completion rate)
  const sortedStudents = studentPerformanceData.sort((a, b) => {
    const aScore = a.progress + a.completionRate;
    const bScore = b.progress + b.completionRate;
    return bScore - aScore;
  });

  const topPerformers = sortedStudents.slice(0, 5);
  const totalStudents = students.length;
  const averageProgress = students.length > 0 
    ? students.reduce((sum, student) => sum + student.progress, 0) / students.length 
    : 0;
  const totalEnrollments = students.reduce((sum, student) => sum + student.enrolledCourses.length, 0);
  const totalCompletions = students.reduce((sum, student) => sum + student.completedCourses.length, 0);

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-green-600">{averageProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-purple-600">{totalEnrollments}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Completions</p>
                <p className="text-2xl font-bold text-orange-600">{totalCompletions}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Students
          </CardTitle>
          <CardDescription>
            Students with the highest progress and completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPerformanceColor(student.performanceLevel)}>
                        {student.performanceLevel}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {student.completedCount}/{student.enrolledCount} courses completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{student.progress.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Progress</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Students Performance */}
      <Card>
        <CardHeader>
          <CardTitle>All Students Performance</CardTitle>
          <CardDescription>
            Complete overview of all student progress and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedStudents.map((student) => (
              <div key={student.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPerformanceColor(student.performanceLevel)}>
                          {student.performanceLevel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Last active: {student.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{student.progress.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Overall Progress</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Course Progress</span>
                      <span>{student.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Course Completion Rate</span>
                      <span>{student.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={student.completionRate} className="h-2" />
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{student.enrolledCount}</p>
                    <p className="text-xs text-gray-600">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{student.completedCount}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-600">{student.enrolledCount - student.completedCount}</p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No students found</h3>
              <p className="text-sm text-gray-400">Students will appear here once they enroll in courses</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
