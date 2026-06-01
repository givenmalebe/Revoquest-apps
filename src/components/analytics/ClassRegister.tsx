import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  AlertCircle
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  studentId: string;
  enrollmentDate: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  courses: {
    id: string;
    title: string;
    progress: number;
    grade: number;
    status: 'Enrolled' | 'Completed' | 'Dropped';
  }[];
  attendance: {
    totalSessions: number;
    attended: number;
    percentage: number;
  };
  lastActive: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface ClassRegisterProps {
  students: Student[];
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onEditStudent?: (id: string, student: Partial<Student>) => void;
  onDeleteStudent?: (id: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

export const ClassRegister: React.FC<ClassRegisterProps> = ({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onExport,
  onImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50 border-green-200';
      case 'Inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Suspended': return 'text-red-600 bg-red-50 border-red-200';
      case 'Graduated': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'enrollmentDate':
          aValue = new Date(a.enrollmentDate);
          bValue = new Date(b.enrollmentDate);
          break;
        case 'attendance':
          aValue = a.attendance.percentage;
          bValue = b.attendance.percentage;
          break;
        case 'lastActive':
          aValue = new Date(a.lastActive);
          bValue = new Date(b.lastActive);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const averageAttendance = students.length > 0 
    ? students.reduce((sum, s) => sum + s.attendance.percentage, 0) / students.length 
    : 0;

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
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-purple-600">{averageAttendance.toFixed(1)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graduated</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {students.filter(s => s.status === 'Graduated').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Class Register</CardTitle>
              <CardDescription>Manage and track student enrollment and progress</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="enrollmentDate">Sort by Enrollment</option>
                <option value="attendance">Sort by Attendance</option>
                <option value="lastActive">Sort by Last Active</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">ID: {student.studentId}</span>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Attendance */}
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getAttendanceColor(student.attendance.percentage)}`}>
                        {student.attendance.percentage}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {student.attendance.attended}/{student.attendance.totalSessions} sessions
                      </p>
                    </div>

                    {/* Course Progress */}
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {student.courses.length} courses
                      </p>
                      <p className="text-xs text-gray-600">
                        {student.courses.filter(c => c.status === 'Completed').length} completed
                      </p>
                    </div>

                    {/* Last Active */}
                    <div className="text-center">
                      <p className="text-sm font-medium">{student.lastActive}</p>
                      <p className="text-xs text-gray-600">Last active</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDeleteStudent?.(student.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                {student.courses.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Enrolled Courses</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {student.courses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              course.status === 'Completed' ? 'bg-green-500' :
                              course.status === 'Enrolled' ? 'bg-blue-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium">{course.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{course.progress}%</span>
                            <span className="text-xs font-semibold text-blue-600">{course.grade}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {student.emergencyContact && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Emergency Contact</h5>
                    <div className="text-sm text-gray-600">
                      <p>{student.emergencyContact.name} ({student.emergencyContact.relationship})</p>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No students found</h3>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first student'
                }
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
