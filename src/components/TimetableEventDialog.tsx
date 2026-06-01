import React, { useState, useEffect } from 'react';
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
import { Clock, MapPin, Calendar, BookOpen } from 'lucide-react';

interface TimetableEvent {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'personal' | 'break' | 'study';
  startTime: string;
  endTime: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  location?: string;
  course?: string;
  description?: string;
  instructor?: string;
}

interface TimetableEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: TimetableEvent) => void;
  event?: TimetableEvent | null;
}

export const TimetableEventDialog: React.FC<TimetableEventDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  event
}) => {
  const [formData, setFormData] = useState<Partial<TimetableEvent>>({
    title: '',
    type: 'class',
    startTime: '09:00',
    endTime: '10:00',
    day: 'monday',
    location: '',
    course: '',
    description: '',
    instructor: ''
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        type: 'class',
        startTime: '09:00',
        endTime: '10:00',
        day: 'monday',
        location: '',
        course: '',
        description: '',
        instructor: ''
      });
    }
  }, [event, isOpen]);

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    const eventData: TimetableEvent = {
      id: event?.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      type: formData.type as TimetableEvent['type'],
      startTime: formData.startTime || '09:00',
      endTime: formData.endTime || '10:00',
      day: formData.day as TimetableEvent['day'],
      location: formData.location,
      course: formData.course,
      description: formData.description,
      instructor: formData.instructor
    };

    onSave(eventData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {event ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription>
            {event ? 'Update event details' : 'Add a new event to your timetable'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Mathematics Class, Project Meeting"
            />
          </div>

          {/* Type and Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TimetableEvent['type'] }))}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="study">Study Session</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day">Day of Week *</Label>
              <Select 
                value={formData.day} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, day: value as TimetableEvent['day'] }))}
              >
                <SelectTrigger id="day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Room 101, Building A, Online"
            />
          </div>

          {/* Course and Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course/Subject
              </Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                placeholder="e.g., Mathematics 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor/Organizer</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                placeholder="e.g., Prof. Smith"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes or details about this event..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {event ? 'Update Event' : 'Add Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

