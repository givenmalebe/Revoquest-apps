import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award,
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  Star
} from 'lucide-react';
import { progressService, CourseProgress, StudentProgressData } from '../services/progressService';
import { persistentProgressService } from '../services/persistentProgressService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ProgressDashboardProps {
  courseId: string;
  courseTitle: string;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ courseId, courseTitle }) => {
  const [studentsProgress, setStudentsProgress] = useState<StudentProgressData[]>([]);
  const [studentNames, setStudentNames] = useState<{ [studentId: string]: string }>({});
  const [courseStats, setCourseStats] = useState({
    totalStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
    averageTimeSpent: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressData | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [courseId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Get all students' progress for this course using persistent service
      const progress = await persistentProgressService.getCourseStudentsProgress(courseId);
      setStudentsProgress(progress);
      
      // Get course statistics using persistent service
      const stats = await persistentProgressService.getCourseProgressStats(courseId);
      setCourseStats(stats);
      
      // Fetch student names from Firebase
      await fetchStudentNames(progress);
      
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentNames = async (progress: StudentProgressData[]) => {
    try {
      const studentIds = progress.map(p => p.studentId);
      const names: { [studentId: string]: string } = {};
      
      // Fetch student data from Firebase users collection (learners)
      const usersCollection = collection(db, 'users');
      const studentQueries = studentIds.map(studentId => 
        query(usersCollection, where('id', '==', studentId), where('role', '==', 'learner'))
      );
      
      const studentSnapshots = await Promise.all(
        studentQueries.map(q => getDocs(q))
      );
      
      studentSnapshots.forEach((snapshot, index) => {
        const studentId = studentIds[index];
        console.log(`📊 Fetching name for student ${studentId}:`, snapshot.empty ? 'No data found' : 'Data found');
        
        if (!snapshot.empty) {
          const studentData = snapshot.docs[0].data();
          console.log(`📊 Student data for ${studentId}:`, {
            name: studentData.name,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            role: studentData.role
          });
          
          // Create display name from available fields (same pattern as learner UI)
          const displayName = studentData.name || 
            (studentData.firstName && studentData.lastName ? `${studentData.firstName} ${studentData.lastName}` : 
             studentData.firstName || 
             studentData.lastName || 
             (studentData.email ? studentData.email.split('@')[0] : '') || 
             `Student ${studentId.slice(-4)}`) || 'Unknown Student';
          
          names[studentId] = displayName;
          console.log(`📊 Resolved name for ${studentId}: ${displayName}`);
        } else {
          // Fallback if student not found
          names[studentId] = `Student ${studentId.slice(-4)}`;
          console.log(`📊 Using fallback name for ${studentId}: Student ${studentId.slice(-4)}`);
        }
      });
      
      setStudentNames(names);
      console.log('📊 Student names loaded:', names);
    } catch (error) {
      console.error('Error fetching student names:', error);
      // Set fallback names
      const fallbackNames: { [studentId: string]: string } = {};
      progress.forEach(p => {
        fallbackNames[p.studentId] = `Student ${p.studentId.slice(-4)}`;
      });
      setStudentNames(fallbackNames);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Not Started</Badge>;
    }
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading progress data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{courseStats.totalStudents}</div>
          <div className="text-xs text-muted-foreground">Students</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">{courseStats.completedStudents}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">{courseStats.averageProgress}%</div>
          <div className="text-xs text-muted-foreground">Avg Progress</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{formatTimeSpent(courseStats.averageTimeSpent)}</div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
        </div>
      </div>

      {/* Students List */}
      {studentsProgress.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No students enrolled yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {studentsProgress.map((student) => (
            <div 
              key={student.studentId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {studentNames[student.studentId]?.charAt(0).toUpperCase() || student.studentId.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {studentNames[student.studentId] || `Student ${student.studentId.slice(-4)}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {student.courseProgress.completedLessons} of {student.courseProgress.totalLessons} lessons
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`font-medium ${getProgressColor(student.courseProgress.progressPercentage)}`}>
                    {student.courseProgress.progressPercentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeSpent(student.courseProgress.timeSpent)}
                  </div>
                </div>
                {getStatusBadge(student.courseProgress.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Student Progress Details</span>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student Name</label>
                    <p className="text-lg">{studentNames[selectedStudent.studentId] || `Student ${selectedStudent.studentId.slice(-4)}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedStudent.courseProgress.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Progress</label>
                    <p className="text-lg">{selectedStudent.courseProgress.progressPercentage}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time Spent</label>
                    <p className="text-lg">{formatTimeSpent(selectedStudent.courseProgress.timeSpent)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Lesson Progress</label>
                  <div className="space-y-2">
                    {selectedStudent.lessonProgress.map((lesson, index) => (
                      <div key={lesson.lessonId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Lesson {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          {lesson.score && (
                            <span className="text-sm text-muted-foreground">
                              Score: {lesson.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
