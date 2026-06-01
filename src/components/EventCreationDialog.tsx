import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Users,
  X,
  Search,
  BookOpen
} from 'lucide-react';
import { CalendarService, CalendarEvent, InvitedUser } from '@/services/calendarService';
import { useDataSync } from '@/contexts/DataSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EventCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CalendarEvent) => void;
  editEvent?: CalendarEvent | null;
}

export const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  editEvent
}) => {
  const { user } = useAuth();
  const { courses, students } = useDataSync();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: editEvent?.title || '',
    description: editEvent?.description || '',
    startDate: editEvent?.startTime ? format(new Date(editEvent.startTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: editEvent?.startTime ? format(new Date(editEvent.startTime), 'HH:mm') : '09:00',
    endDate: editEvent?.endTime ? format(new Date(editEvent.endTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endTime: editEvent?.endTime ? format(new Date(editEvent.endTime), 'HH:mm') : '10:00',
    type: (editEvent?.type || 'event') as CalendarEvent['type'],
    courseId: editEvent?.courseId || 'none',
    location: editEvent?.location || '',
    isOnline: editEvent?.isOnline || false,
    meetingLink: editEvent?.meetingLink || '',
    color: editEvent?.color || '#3b82f6'
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    editEvent?.invitedUserIds || []
  );

  // Get user's courses
  const instructorCourses = useMemo(() => {
    if (!user) return [];
    return courses.filter(c => c.instructorId === user.id);
  }, [courses, user]);

  // Get all available users (students from courses + other instructors/admins)
  const availableUsers = useMemo(() => {
    const users: InvitedUser[] = [];
    
    // Add students
    students.forEach(student => {
      users.push({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        role: 'learner',
        avatar: student.avatar
      });
    });

    return users;
  }, [students]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;
    
    const query = searchQuery.toLowerCase();
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  // Get selected users details
  const selectedUsers = useMemo(() => {
    return availableUsers.filter(user => selectedUserIds.includes(user.id));
  }, [availableUsers, selectedUserIds]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      // Deselect all filtered users
      setSelectedUserIds(prev =>
        prev.filter(id => !filteredUsers.find(u => u.id === id))
      );
    } else {
      // Select all filtered users
      setSelectedUserIds(prev => {
        const newIds = [...prev];
        filteredUsers.forEach(user => {
          if (!newIds.includes(user.id)) {
            newIds.push(user.id);
          }
        });
        return newIds;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create an event',
          variant: 'destructive'
        });
        return;
      }

      // Validation
      if (!formData.title.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter an event title',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      // Get course title if courseId is selected
      const selectedCourse = instructorCourses.find(c => c.id === formData.courseId);
      const hasCourse = formData.courseId && formData.courseId !== 'none';

      const eventData = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime,
        endTime: endDateTime,
        type: formData.type,
        courseId: hasCourse ? formData.courseId : undefined,
        courseTitle: hasCourse ? selectedCourse?.title : undefined,
        creatorId: user.id,
        creatorName: `${user.firstName} ${user.lastName}`,
        creatorRole: user.role as 'admin' | 'instructor' | 'learner',
        location: formData.location || undefined,
        isOnline: formData.isOnline,
        meetingLink: formData.meetingLink || undefined,
        invitedUserIds: selectedUserIds,
        invitedUsers: selectedUsers,
        color: formData.color
      };

      let event: CalendarEvent;
      if (editEvent) {
        // Update existing event
        await CalendarService.updateEvent(editEvent.id, eventData);
        event = { ...editEvent, ...eventData, updatedAt: new Date().toISOString() };
        toast({
          title: 'Event Updated',
          description: `"${formData.title}" has been updated successfully`
        });
      } else {
        // Create new event
        event = await CalendarService.createEvent(eventData);
        toast({
          title: 'Event Created',
          description: `"${formData.title}" has been created and invitations sent`
        });
      }

      onEventCreated(event);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: '10:00',
      type: 'event',
      courseId: 'none',
      location: '',
      isOnline: false,
      meetingLink: '',
      color: '#3b82f6'
    });
    setSelectedUserIds([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {editEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {editEvent
              ? 'Update event details and manage invitations'
              : 'Schedule a new event and invite users'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Team Meeting, Class Session, Assignment Review"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add event details, agenda, or notes..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select value={formData.type} onValueChange={(value: CalendarEvent['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">General Event</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="class">Class Session</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Related Course (Optional)</Label>
                <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course</SelectItem>
                    {instructorCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date & Time
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h4>
            <div className="flex items-center space-x-2">
              <Switch
                id="isOnline"
                checked={formData.isOnline}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnline: checked }))}
              />
              <Label htmlFor="isOnline" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Online Event
              </Label>
            </div>

            {formData.isOnline ? (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location">Physical Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Room 101, Building A"
                />
              </div>
            )}
          </div>

          {/* Invite Users */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Invite Users ({selectedUserIds.length} selected)
              </h4>
              {filteredUsers.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-10"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <Badge key={user.id} variant="secondary" className="px-3 py-1">
                    <span>{user.name}</span>
                    <button
                      onClick={() => handleUserToggle(user.id)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* User List */}
            <ScrollArea className="h-60 rounded-md border p-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : editEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

