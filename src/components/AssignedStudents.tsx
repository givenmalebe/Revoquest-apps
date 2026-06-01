import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Mail, 
  BookOpen, 
  MessageCircle,
  User,
  Clock,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";

interface AssignedStudentsProps {
  instructorId: string;
}

export const AssignedStudents: React.FC<AssignedStudentsProps> = ({ instructorId }) => {
  const { user } = useAuth();
  const { 
    getStudentsByInstructor,
    instructorAssignments,
    courses
  } = useDataSync();

  const assignedStudents = getStudentsByInstructor(instructorId);
  const assignments = instructorAssignments.filter(a => 
    a.instructorId === instructorId && a.status === 'active'
  );

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

  if (assignedStudents.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No assigned students</h3>
            <p className="text-muted-foreground">
              You don't have any students assigned to you yet. Contact the admin to get students assigned.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            My Assigned Students
          </h2>
          <p className="text-muted-foreground">
            Students assigned to you for messaging and communication
          </p>
        </div>
        
        <Badge className="bg-blue-100 text-blue-800">
          {assignedStudents.length} Student{assignedStudents.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignedStudents.map((student) => {
          const assignment = assignments.find(a => a.studentId === student.id);
          const course = courses.find(c => c.id === assignment?.courseId);
          
          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-lg truncate">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {student.isOnline ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      
                      {course && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">{course.title}</span>
                        </div>
                      )}
                      
                      {assignment && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {!student.isOnline && student.lastSeen && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Last seen {student.lastSeen}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{assignedStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold">
                  {assignedStudents.filter(s => s.isOnline).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">
                  {new Set(assignments.map(a => a.courseId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

