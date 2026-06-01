import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target,
  BarChart3,
  Users,
  BookOpen,
  Clock
} from "lucide-react";

interface StudentPerformance {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  overallGrade: number;
  courseProgress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastActive: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  trend: 'up' | 'down' | 'stable';
  courses: {
    id: string;
    title: string;
    progress: number;
    grade: number;
  }[];
}

interface StudentPerformanceChartProps {
  students: StudentPerformance[];
  selectedCourse?: string;
}

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({ 
  students, 
  selectedCourse 
}) => {
  const filteredStudents = selectedCourse 
    ? students.filter(student => 
        student.courses.some(course => course.id === selectedCourse)
      )
    : students;

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Needs Improvement': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const averageGrade = filteredStudents.length > 0 
    ? filteredStudents.reduce((sum, student) => sum + student.overallGrade, 0) / filteredStudents.length
    : 0;

  const averageProgress = filteredStudents.length > 0
    ? filteredStudents.reduce((sum, student) => sum + student.courseProgress, 0) / filteredStudents.length
    : 0;

  const topPerformers = filteredStudents
    .sort((a, b) => b.overallGrade - a.overallGrade)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-blue-600">{averageGrade.toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
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
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-purple-600">{filteredStudents.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Students with the highest overall performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPerformanceColor(student.performance)}>
                        {student.performance}
                      </Badge>
                      {getTrendIcon(student.trend)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{student.overallGrade}%</p>
                  <p className="text-sm text-gray-600">Overall Grade</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Performance Details
          </CardTitle>
          <CardDescription>
            Comprehensive view of all student performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
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
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{student.overallGrade}%</p>
                      <p className="text-xs text-gray-600">Grade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{student.courseProgress}%</p>
                      <p className="text-xs text-gray-600">Progress</p>
                    </div>
                    <Badge className={getPerformanceColor(student.performance)}>
                      {student.performance}
                    </Badge>
                  </div>
                </div>

                {/* Course Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Course Progress
                    </span>
                    <span>{student.courseProgress}%</span>
                  </div>
                  <Progress value={student.courseProgress} className="h-2" />

                  {/* Assignment Progress */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Assignments ({student.assignmentsCompleted}/{student.totalAssignments})
                    </span>
                    <span>{Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(student.assignmentsCompleted / student.totalAssignments) * 100} 
                    className="h-2" 
                  />

                  {/* Last Active */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Last active: {student.lastActive}
                  </div>
                </div>

                {/* Course Breakdown */}
                {student.courses.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Course Breakdown</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {student.courses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium truncate">{course.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{course.progress}%</span>
                            <span className="text-sm font-semibold text-blue-600">{course.grade}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
