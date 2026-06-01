import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search,
  GraduationCap,
  User,
  Mail,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";

interface InstructorAssignmentManagerProps {
  userRole: 'instructor' | 'admin';
}

export const InstructorAssignmentManager: React.FC<InstructorAssignmentManagerProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { 
    instructorAssignments,
    users,
    courses,
    students,
    assignStudentToInstructor,
    removeStudentFromInstructor,
    getStudentsByInstructor,
    subscribeToUpdates
  } = useDataSync();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Get instructors (users with instructor role)
  const instructors = users.filter(u => u.role === 'instructor');
  
  // Get unassigned students
  const assignedStudentIds = instructorAssignments
    .filter(a => a.status === 'active')
    .map(a => a.studentId);
  const unassignedStudents = students.filter(s => !assignedStudentIds.includes(s.id));

  // Get assignments for selected instructor
  const instructorAssignments_filtered = selectedInstructor 
    ? instructorAssignments.filter(a => a.instructorId === selectedInstructor)
    : instructorAssignments;

  // Filter assignments based on search
  const filteredAssignments = instructorAssignments_filtered.filter(assignment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      assignment.studentName.toLowerCase().includes(query) ||
      assignment.instructorName.toLowerCase().includes(query) ||
      assignment.courseName.toLowerCase().includes(query)
    );
  });

  // Subscribe to assignment updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((updateType, data) => {
      if (updateType.startsWith('assignment_')) {
        console.log('📡 Assignment update received:', updateType, data);
      }
    });

    return unsubscribe;
  }, [subscribeToUpdates]);

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedInstructor || !selectedCourse) {
      alert('Please select a student, instructor, and course');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    const instructor = instructors.find(i => i.id === selectedInstructor);
    const course = courses.find(c => c.id === selectedCourse);

    if (!student || !instructor || !course) {
      alert('Invalid selection');
      return;
    }

    try {
      await assignStudentToInstructor({
        instructorId: instructor.id,
        instructorName: instructor.name,
        instructorEmail: instructor.email,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        courseId: course.id,
        courseName: course.title,
        status: 'active'
      });

      // Reset form
      setSelectedStudent('');
      setSelectedCourse('');
      setShowAssignDialog(false);
      
      console.log('Student assigned successfully');
    } catch (error) {
      console.error('Error assigning student:', error);
      alert('Failed to assign student. Please try again.');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      try {
        await removeStudentFromInstructor(assignmentId);
        console.log('Assignment removed successfully');
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment. Please try again.');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'learner':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Instructor Assignments
          </h2>
          <p className="text-muted-foreground">
            Manage student-instructor assignments for messaging groups
          </p>
        </div>
        
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Assign Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Student to Instructor</DialogTitle>
              <DialogDescription>
                Create a new instructor-student assignment for messaging
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map(instructor => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={instructor.avatar} />
                            <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{instructor.name}</span>
                          <Badge className={getRoleColor(instructor.role)}>
                            {instructor.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="student">Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                          <Badge className={getRoleColor('learner')}>
                            Student
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignStudent}
                disabled={!selectedStudent || !selectedInstructor || !selectedCourse}
              >
                Assign Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-64">
          <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Instructors</SelectItem>
              {instructors.map(instructor => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedInstructor 
                    ? 'Try adjusting your search criteria'
                    : 'Create your first instructor-student assignment'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/avatars/instructor.jpg" />
                        <AvatarFallback>
                          {assignment.instructorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{assignment.instructorName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {assignment.instructorEmail}
                        </p>
                        <Badge className={getRoleColor('instructor')}>
                          Instructor
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-gray-400">→</div>
                    
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {assignment.studentName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{assignment.studentName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {assignment.studentEmail}
                        </p>
                        <Badge className={getRoleColor('learner')}>
                          Student
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{assignment.courseName}</span>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {userRole === 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{instructorAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
                <p className="text-2xl font-bold">
                  {instructorAssignments.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unassigned Students</p>
                <p className="text-2xl font-bold">{unassignedStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

