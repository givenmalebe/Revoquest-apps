import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataSync } from '@/contexts/DataSyncContext';

export const EnrollmentChecker: React.FC = () => {
  const { user } = useAuth();
  const { courses, students } = useDataSync();
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user && courses.length > 0) {
      // Filter courses for current instructor
      const instructorCourses = courses.filter(course => 
        course.instructorId === user.uid
      );
      setInstructorCourses(instructorCourses);
    }
  }, [user, courses]);

  const totalEnrollments = instructorCourses.reduce((sum, course) => 
    sum + (course.enrolledLearners || 0), 0
  );

  const enrolledStudents = students.filter(student =>
    student.enrolledCourses && student.enrolledCourses.some(courseId => 
      instructorCourses.some(course => course.id === courseId)
    )
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enrollment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{instructorCourses.length}</div>
              <div className="text-sm text-blue-600">Total Courses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{totalEnrollments}</div>
              <div className="text-sm text-green-600">Total Enrollments</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{enrolledStudents.length}</div>
              <div className="text-sm text-purple-600">Unique Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Course Enrollment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {instructorCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No courses found for this instructor.
              </div>
            ) : (
              instructorCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {course.enrolledLearners || 0}
                    </div>
                    <div className="text-sm text-gray-600">Enrolled</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {enrolledStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Enrolled Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enrolledStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.enrolledCourses?.length || 0} courses
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnrollmentChecker;
