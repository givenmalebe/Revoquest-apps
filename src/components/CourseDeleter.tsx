import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { useDataSync } from '../contexts/DataSyncContext';

const CourseDeleter: React.FC = () => {
  const { user } = useAuth();
  const { courses, forceDeleteCourseByTitle, forceDeleteCourseById } = useDataSync();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('📋 Courses from context:', courses.length);
    courses.forEach(course => {
      console.log(`- ID: ${course.id}, Title: "${course.title}"`);
    });
  }, [courses]);

  const deleteCourseById = async (courseId: string) => {
    try {
      setLoading(true);
      console.log(`🗑️ Deleting course with ID: ${courseId}`);
      await DatabaseService.deleteCourse(courseId);
      setMessage(`✅ Course deleted successfully: ${courseId}`);
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage(`❌ Error deleting course: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourseByTitle = async (title: string) => {
    try {
      setLoading(true);
      setMessage('🗑️ Deleting courses...');
      
      await forceDeleteCourseByTitle(title);
      setMessage(`✅ Successfully deleted courses containing "${title}"`);
    } catch (error) {
      console.error('Error deleting courses:', error);
      setMessage(`❌ Error deleting courses: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllCourses = async () => {
    if (!window.confirm('Are you sure you want to delete ALL courses? This cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting ALL courses...');
      
      for (const course of courses) {
        await DatabaseService.deleteCourse(course.id);
        console.log(`✅ Deleted course: ${course.title}`);
      }

      setMessage(`✅ Successfully deleted ALL ${courses.length} courses`);
    } catch (error) {
      console.error('Error deleting all courses:', error);
      setMessage(`❌ Error deleting all courses: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to use this tool</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Course Deleter Tool</h1>
      
      {message && (
        <div className={`p-4 rounded mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          
          <button
            onClick={() => deleteCourseByTitle('Digital Marketing for Entrepreneurs: Lead with Impact')}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Delete "Digital Marketing" Course
          </button>
          
          <button
            onClick={() => forceDeleteCourseById('course-1759185197518')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete Course-1759185197518
          </button>
          
          <button
            onClick={clearAllCourses}
            disabled={loading}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
          >
            Delete ALL Courses
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">All Courses ({courses.length})</h2>
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-gray-500">ID: {course.id}</div>
                  <div className="text-sm text-gray-500">Instructor: {course.instructorId}</div>
                </div>
                <button
                  onClick={() => deleteCourseById(course.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDeleter;
