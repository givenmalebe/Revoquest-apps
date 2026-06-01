import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award
} from "lucide-react";

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
  enrolledCourses: string[];
  completedCourses: string[];
  progress: number;
  lastActive: string;
}

interface SimpleCourseProgressProps {
  courses: Course[];
  students: Student[];
}

export const SimpleCourseProgress: React.FC<SimpleCourseProgressProps> = ({ 
  courses, 
  students 
}) => {
  // Calculate real progress data
  const courseProgressData = courses.map(course => {
    const enrolledStudents = students.filter(student => 
      student.enrolledCourses.includes(course.id)
    );
    
    const completedStudents = students.filter(student => 
      student.completedCourses.includes(course.id)
    );
    
    const completionRate = enrolledStudents.length > 0 
      ? (completedStudents.length / enrolledStudents.length) * 100 
      : 0;
    
    const averageProgress = enrolledStudents.length > 0
      ? enrolledStudents.reduce((sum, student) => sum + student.progress, 0) / enrolledStudents.length
      : 0;

    return {
      ...course,
      enrolledCount: enrolledStudents.length,
      completedCount: completedStudents.length,
      completionRate,
      averageProgress
    };
  });

  const totalStudents = students.length;
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const overallCompletionRate = courseProgressData.length > 0
    ? courseProgressData.reduce((sum, course) => sum + course.completionRate, 0) / courseProgressData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-600">{totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-purple-600">{publishedCourses}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{overallCompletionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress Overview</CardTitle>
          <CardDescription>
            Real-time progress tracking for all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseProgressData.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {course.lessons} lessons • {course.duration}
                      </span>
                      <span className="text-sm text-gray-500">
                        Rating: {course.rating || 0} ⭐
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{course.completionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Course Completion</span>
                      <span>{course.completedCount} of {course.enrolledCount} students</span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Student Progress</span>
                      <span>{course.averageProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={course.averageProgress} className="h-2" />
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{course.enrolledCount}</p>
                    <p className="text-xs text-gray-600">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{course.completedCount}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-600">{course.enrolledCount - course.completedCount}</p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courseProgressData.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No courses found</h3>
              <p className="text-sm text-gray-400">Create your first course to start tracking progress</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
