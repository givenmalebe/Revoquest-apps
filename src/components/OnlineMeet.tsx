import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Share2,
  Download,
  MessageSquare
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDataSync } from '@/contexts/DataSyncContext';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  instructorId: string;
  instructorName: string;
  courseId?: string;
  courseName?: string;
  platform: 'google-meet' | 'microsoft-teams' | 'zoom' | 'custom';
  meetingLink: string;
  meetingId?: string;
  password?: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  maxParticipants?: number;
  isRecording?: boolean;
  recordingLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface OnlineMeetProps {
  userRole: 'instructor' | 'student';
  courses?: Array<{ id: string; title: string; instructor: string }>;
}

export const OnlineMeet: React.FC<OnlineMeetProps> = ({ userRole, courses = [] }) => {
  const { user } = useAuth();
  const { 
    meetings, 
    createMeeting, 
    updateMeeting, 
    deleteMeeting, 
    getMeetings, 
    startMeeting, 
    endMeeting,
    subscribeToUpdates 
  } = useDataSync();
  
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [showJoinMeeting, setShowJoinMeeting] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Subscribe to meeting updates for real-time synchronization
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((updateType, data) => {
      if (updateType.startsWith('meeting_')) {
        console.log('📡 Meeting update received:', updateType, data);
        // The meetings state will be automatically updated by DataSyncContext
      }
    });

    return unsubscribe;
  }, [subscribeToUpdates]);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    courseId: '',
    platform: 'google-meet' as Meeting['platform'],
    meetingLink: '',
    meetingId: '',
    password: '',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 30,
    isRecording: false
  });

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.meetingLink) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingMeeting) {
        // Update existing meeting
        const meetingData = {
          ...newMeeting,
          courseName: courses.find(c => c.id === newMeeting.courseId)?.title || 'General Meeting',
        };

        await updateMeeting(editingMeeting.id, meetingData);
        console.log('Meeting updated successfully');
      } else {
        // Create new meeting
        const meetingData = {
          ...newMeeting,
          instructorId: user?.id || 'current-user',
          instructorName: (user as any)?.name || user?.email || 'Current User',
          courseName: courses.find(c => c.id === newMeeting.courseId)?.title || 'General Meeting',
          status: 'scheduled' as const
        };

        await createMeeting(meetingData);
        console.log('Meeting created successfully');
      }
      
      // Reset form
      setNewMeeting({
        title: '',
        description: '',
        courseId: '',
        platform: 'google-meet',
        meetingLink: '',
        meetingId: '',
        password: '',
        scheduledAt: '',
        duration: 60,
        maxParticipants: 30,
        isRecording: false
      });
      setEditingMeeting(null);
      setShowCreateMeeting(false);
      
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert(`Failed to ${editingMeeting ? 'update' : 'create'} meeting. Please try again.`);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingLink(meeting.meetingLink);
    setShowJoinMeeting(true);
  };

  const handleStartMeeting = async (meeting: Meeting) => {
    try {
      await startMeeting(meeting.id);
      // Open meeting link
      window.open(meeting.meetingLink, '_blank');
      console.log('Meeting started:', meeting.title);
    } catch (error) {
      console.error('Error starting meeting:', error);
      alert('Failed to start meeting. Please try again.');
    }
  };

  const handleEndMeeting = async (meeting: Meeting) => {
    try {
      await endMeeting(meeting.id);
      console.log('Meeting ended:', meeting.title);
    } catch (error) {
      console.error('Error ending meeting:', error);
      alert('Failed to end meeting. Please try again.');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
    console.log('Meeting link copied to clipboard');
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setNewMeeting({
      title: meeting.title,
      description: meeting.description || '',
      courseId: meeting.courseId || '',
      platform: meeting.platform,
      meetingLink: meeting.meetingLink,
      meetingId: meeting.meetingId || '',
      password: meeting.password || '',
      scheduledAt: meeting.scheduledAt ? new Date(meeting.scheduledAt).toISOString().slice(0, 16) : '',
      duration: meeting.duration,
      maxParticipants: meeting.maxParticipants || 30,
      isRecording: meeting.isRecording || false
    });
    setShowCreateMeeting(true);
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    if (confirm(`Are you sure you want to delete "${meeting.title}"? This action cannot be undone.`)) {
      try {
        await deleteMeeting(meeting.id);
        console.log('Meeting deleted:', meeting.title);
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const getPlatformIcon = (platform: Meeting['platform']) => {
    switch (platform) {
      case 'google-meet':
        return '🎥';
      case 'microsoft-teams':
        return '👥';
      case 'zoom':
        return '🔍';
      default:
        return '📹';
    }
  };

  const getPlatformName = (platform: Meeting['platform']) => {
    switch (platform) {
      case 'google-meet':
        return 'Google Meet';
      case 'microsoft-teams':
        return 'Microsoft Teams';
      case 'zoom':
        return 'Zoom';
      default:
        return 'Custom';
    }
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Filter meetings based on user role
  const currentMeetings = userRole === 'instructor' 
    ? getMeetings(user?.id)
    : getMeetings();

  const upcomingMeetings = currentMeetings.filter(m => 
    new Date(m.scheduledAt) > new Date() && m.status === 'scheduled'
  );
  const liveMeetings = currentMeetings.filter(m => m.status === 'live');
  const pastMeetings = currentMeetings.filter(m => 
    new Date(m.scheduledAt) <= new Date() || m.status === 'ended'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6" />
            Online Meet
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'instructor' 
              ? 'Schedule and manage online meetings with your students'
              : 'Join live sessions and access meeting recordings'
            }
          </p>
        </div>
        
        {userRole === 'instructor' && (
          <Dialog open={showCreateMeeting} onOpenChange={setShowCreateMeeting}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                </DialogTitle>
                <DialogDescription>
                  {editingMeeting 
                    ? 'Update the meeting details below'
                    : 'Create a new online meeting for your students'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter meeting title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform">Platform *</Label>
                    <Select
                      value={newMeeting.platform}
                      onValueChange={(value: Meeting['platform']) => 
                        setNewMeeting(prev => ({ ...prev, platform: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google-meet">Google Meet</SelectItem>
                        <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="custom">Custom Platform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter meeting description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course (Optional)</Label>
                    <Select
                      value={newMeeting.courseId}
                      onValueChange={(value) => setNewMeeting(prev => ({ ...prev, courseId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      min="15"
                      max="480"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingLink">Meeting Link *</Label>
                    <Input
                      id="meetingLink"
                      value={newMeeting.meetingLink}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meetingId">Meeting ID</Label>
                    <Input
                      id="meetingId"
                      value={newMeeting.meetingId}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingId: e.target.value }))}
                      placeholder="abc-defg-hij"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password (Optional)</Label>
                    <Input
                      id="password"
                      value={newMeeting.password}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Meeting password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={newMeeting.scheduledAt}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecording"
                    checked={newMeeting.isRecording}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, isRecording: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isRecording">Enable recording for this meeting</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowCreateMeeting(false);
                  setEditingMeeting(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMeeting}>
                  {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Meeting Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="live">
            Live ({liveMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Meetings</h3>
                <p className="text-muted-foreground">
                  {userRole === 'instructor' 
                    ? 'Schedule a meeting to get started'
                    : 'No upcoming meetings scheduled'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting) => {
                const { date, time } = formatDateTime(meeting.scheduledAt);
                return (
                  <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getPlatformIcon(meeting.platform)}</span>
                            <CardTitle className="text-lg">{meeting.title}</CardTitle>
                            <Badge className={getStatusColor(meeting.status)}>
                              {meeting.status}
                            </Badge>
                          </div>
                          <CardDescription className="mb-2">
                            {meeting.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {meeting.instructorName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {date} at {time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {meeting.duration} minutes
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              {getPlatformName(meeting.platform)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleJoinMeeting(meeting)}
                            className="flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Join Meeting
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(meeting.meetingLink)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Link
                          </Button>
                        </div>
                        {userRole === 'instructor' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMeeting(meeting)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartMeeting(meeting)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMeeting(meeting)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Live Meetings */}
        <TabsContent value="live" className="space-y-4">
          {liveMeetings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Live Meetings</h3>
                <p className="text-muted-foreground">
                  No meetings are currently in progress
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {liveMeetings.map((meeting) => (
                <Card key={meeting.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getPlatformIcon(meeting.platform)}</span>
                          <CardTitle className="text-lg">{meeting.title}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 animate-pulse">
                            LIVE
                          </Badge>
                        </div>
                        <CardDescription className="mb-2">
                          {meeting.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meeting.instructorName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {getPlatformName(meeting.platform)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        onClick={() => handleJoinMeeting(meeting)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4" />
                        Join Live Meeting
                      </Button>
                      {userRole === 'instructor' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMeeting(meeting)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEndMeeting(meeting)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            End Meeting
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMeeting(meeting)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Meetings */}
        <TabsContent value="past" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Past Meetings</h3>
                <p className="text-muted-foreground">
                  Past meetings and recordings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map((meeting) => {
                const { date, time } = formatDateTime(meeting.scheduledAt);
                return (
                  <Card key={meeting.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getPlatformIcon(meeting.platform)}</span>
                            <CardTitle className="text-lg">{meeting.title}</CardTitle>
                            <Badge className={getStatusColor(meeting.status)}>
                              {meeting.status}
                            </Badge>
                          </div>
                          <CardDescription className="mb-2">
                            {meeting.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {meeting.instructorName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {date} at {time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              {getPlatformName(meeting.platform)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {meeting.recordingLink && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(meeting.recordingLink, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              View Recording
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(meeting.meetingLink)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Link
                          </Button>
                        </div>
                        {userRole === 'instructor' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMeeting(meeting)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMeeting(meeting)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                        {meeting.isRecording && !meeting.recordingLink && (
                          <Badge variant="outline" className="text-orange-600">
                            Processing Recording...
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Join Meeting Dialog */}
      <Dialog open={showJoinMeeting} onOpenChange={setShowJoinMeeting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Meeting</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Meeting Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={meetingLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink(meetingLink)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {selectedMeeting?.password && (
              <div>
                <Label>Meeting Password</Label>
                <Input
                  value={selectedMeeting.password}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            )}
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Before joining:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make sure your camera and microphone are working</li>
                <li>• Test your internet connection</li>
                <li>• Join a few minutes early to test audio/video</li>
                <li>• Have the meeting password ready if required</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinMeeting(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                window.open(meetingLink, '_blank');
                setShowJoinMeeting(false);
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
