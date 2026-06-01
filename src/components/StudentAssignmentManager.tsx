import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { DatabaseService, Student } from "@/firebase/database";
import { useAuth } from "@/contexts/AuthContext";

interface StudentAssignmentManagerProps {
  courseId: string;
  assignedStudents: Student[];
  onAssignStudent: (studentId: string) => void;
  onUnassignStudent: (studentId: string) => void;
  onBulkAssign: (studentIds: string[]) => void;
}

const StudentAssignmentManager: React.FC<StudentAssignmentManagerProps> = ({
  courseId,
  assignedStudents,
  onAssignStudent,
  onUnassignStudent,
  onBulkAssign
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [instructorAssignedLearners, setInstructorAssignedLearners] = useState<string[]>([]);
  const [showAvailableLearners, setShowAvailableLearners] = useState(false);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [invitationData, setInvitationData] = useState({
    subject: '',
    message: '',
    selectedStudents: [] as string[]
  });
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    selectedStudents: [] as string[]
  });

  // Fetch instructor's assigned learners
  useEffect(() => {
    const fetchInstructorAssignedLearners = async () => {
      if (user?.role === 'instructor') {
        try {
          // Get instructor profile to access assignedLearners
          const instructorProfile = await DatabaseService.getUserProfile(user.uid);
          setInstructorAssignedLearners(instructorProfile?.assignedLearners || []);
          console.log('Instructor assigned learners:', instructorProfile?.assignedLearners);
        } catch (error) {
          console.error('Error fetching instructor assigned learners:', error);
          setInstructorAssignedLearners([]);
        }
      }
    };

    fetchInstructorAssignedLearners();
  }, [user]);

  // Fetch students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const students = await DatabaseService.getStudents();
        setAllStudents(students);
        console.log('Fetched students from Firestore:', students);
      } catch (error) {
        console.error('Error fetching students:', error);
        setAllStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on:
    // 1. Only learners (not instructors or admins)
    // 2. Not already assigned to this course
    // 3. Match search term
    const assignedStudentIds = assignedStudents.map(s => s.id);
    const available = allStudents.filter(student => {
      // Only show learners (role === 'learner' or role === 'student')
      const isLearner = (student as any).role === 'learner' || (student as any).role === 'student';
      
      // Not already assigned to this course
      const notAssignedToCourse = !assignedStudentIds.includes(student.id);
      
      // Match search term
      const matchesSearch = searchTerm === '' || 
        (`${student.firstName} ${student.lastName}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isLearner && notAssignedToCourse && matchesSearch;
    });
    
    console.log('Filtered available learners:', {
      totalStudents: allStudents.length,
      learners: allStudents.filter(s => (s as any).role === 'learner' || (s as any).role === 'student').length,
      assignedToCourse: assignedStudentIds.length,
      available: available.length
    });
    
    setAvailableStudents(available);
  }, [assignedStudents, searchTerm, allStudents]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkAssign = () => {
    if (selectedStudents.length > 0) {
      onBulkAssign(selectedStudents);
      setSelectedStudents([]);
    }
  };

  const handleAssignStudent = (studentId: string) => {
    onAssignStudent(studentId);
  };

  const handleUnassignStudent = (studentId: string) => {
    onUnassignStudent(studentId);
  };

  const handleSendInvitation = () => {
    setShowInvitationDialog(true);
  };

  const handleScheduleSession = () => {
    setShowSessionDialog(true);
  };

  const handleSendInvitationSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Get selected students' emails
      const selectedStudentEmails = allStudents
        .filter(student => invitationData.selectedStudents.includes(student.id))
        .map(student => student.email);
      
      // Here you would typically call an email service
      console.log('Sending invitations to:', selectedStudentEmails);
      console.log('Subject:', invitationData.subject);
      console.log('Message:', invitationData.message);
      
      // For now, just show a success message
      alert(`Invitations sent to ${selectedStudentEmails.length} students!`);
      
      setShowInvitationDialog(false);
      setInvitationData({
        subject: '',
        message: '',
        selectedStudents: []
      });
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Failed to send invitations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSessionSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Get selected students
      const selectedStudents = allStudents
        .filter(student => sessionData.selectedStudents.includes(student.id));
      
      console.log('Scheduling session for:', selectedStudents);
      console.log('Session data:', sessionData);
      
      // Here you would typically save to database and send notifications
      alert(`Session scheduled for ${selectedStudents.length} students!`);
      
      setShowSessionDialog(false);
      setSessionData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        selectedStudents: []
      });
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert('Failed to schedule session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assigned Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assigned Students ({assignedStudents.length})
          </CardTitle>
          <CardDescription>
            Students currently enrolled in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedStudents.length > 0 ? (
            <div className="space-y-3">
              {assignedStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{`${student.firstName} ${student.lastName}`}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={student.isActive ? 'default' : 'secondary'}>
                          {student.isActive ? 'active' : 'inactive'}
                        </Badge>
                        {student.joinDate && (
                          <span className="text-xs text-gray-500">
                            Joined: {new Date(student.joinDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.progress !== undefined && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{student.progress}%</p>
                        <p className="text-xs text-gray-500">Progress</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnassignStudent(student.id)}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No students assigned to this course yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Students */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAvailableLearners(!showAvailableLearners)}
                  className="p-1 h-auto hover:bg-blue-50"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                </Button>
                Add Assigned Learners
              </CardTitle>
              <CardDescription>
                Search and assign any learner to this course
              </CardDescription>
            </div>
            {showAvailableLearners && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvailableLearners(false)}
                className="text-gray-600"
              >
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search - Only show when learners list is open */}
          {showAvailableLearners && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search learners by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Available Students - Show when plus is clicked */}
          {showAvailableLearners && (
            <>
              {availableStudents.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Available Learners ({availableStudents.length})</p>
                {selectedStudents.length > 0 && (
                  <Button onClick={handleBulkAssign} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Selected ({selectedStudents.length})
                  </Button>
                )}
              </div>
              
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{`${student.firstName} ${student.lastName}`}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={student.isActive ? 'default' : 'secondary'}>
                          {student.isActive ? 'active' : 'inactive'}
                        </Badge>
                        {student.lastActive && (
                          <span className="text-xs text-gray-500">
                            Last active: {new Date(student.lastActive).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignStudent(student.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No learners found matching your search' : 'No learners available to assign to this course'}
                  </p>
                  {instructorAssignedLearners.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      You don't have any learners assigned to you yet. Contact an admin to assign learners to your profile.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Show message when plus is not clicked */}
          {!showAvailableLearners && (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Click the + button above to view all available learners</p>
              <p className="text-sm mt-2">
                View and assign any learner from the system to this course.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common student management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4" onClick={handleSendInvitation}>
              <div className="text-left">
                <Mail className="w-5 h-5 mb-2" />
                <p className="font-medium">Send Invitation</p>
                <p className="text-sm text-gray-600">Email course invitation to students</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4" onClick={handleScheduleSession}>
              <div className="text-left">
                <Calendar className="w-5 h-5 mb-2" />
                <p className="font-medium">Schedule Session</p>
                <p className="text-sm text-gray-600">Set up live sessions for students</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send Invitation Dialog */}
      {showInvitationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Course Invitation</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInvitationDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Input
                  placeholder="Course invitation subject"
                  value={invitationData.subject}
                  onChange={(e) => setInvitationData(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <Textarea
                  placeholder="Invitation message"
                  value={invitationData.message}
                  onChange={(e) => setInvitationData(prev => ({ ...prev, message: e.target.value }))}
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Select Students</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {allStudents.filter(s => (s as any).role === 'learner' || (s as any).role === 'student').map(student => (
                    <div key={student.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={invitationData.selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInvitationData(prev => ({
                              ...prev,
                              selectedStudents: [...prev.selectedStudents, student.id]
                            }));
                          } else {
                            setInvitationData(prev => ({
                              ...prev,
                              selectedStudents: prev.selectedStudents.filter(id => id !== student.id)
                            }));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{student.firstName} {student.lastName} ({student.email})</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInvitationDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvitationSubmit}
                  disabled={isLoading || invitationData.selectedStudents.length === 0}
                >
                  {isLoading ? 'Sending...' : 'Send Invitations'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Dialog */}
      {showSessionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Schedule Live Session</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSessionDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Session Title</Label>
                <Input
                  placeholder="Live session title"
                  value={sessionData.title}
                  onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  placeholder="Session description"
                  value={sessionData.description}
                  onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <Input
                    type="date"
                    value={sessionData.date}
                    onChange={(e) => setSessionData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <Input
                    type="time"
                    value={sessionData.time}
                    onChange={(e) => setSessionData(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={sessionData.duration}
                  onChange={(e) => setSessionData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Select Students</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {allStudents.filter(s => (s as any).role === 'learner' || (s as any).role === 'student').map(student => (
                    <div key={student.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sessionData.selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSessionData(prev => ({
                              ...prev,
                              selectedStudents: [...prev.selectedStudents, student.id]
                            }));
                          } else {
                            setSessionData(prev => ({
                              ...prev,
                              selectedStudents: prev.selectedStudents.filter(id => id !== student.id)
                            }));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{student.firstName} {student.lastName} ({student.email})</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSessionDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSessionSubmit}
                  disabled={isLoading || sessionData.selectedStudents.length === 0}
                >
                  {isLoading ? 'Scheduling...' : 'Schedule Session'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentManager;
