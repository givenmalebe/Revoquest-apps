import React, { useState } from 'react';
import { Timetable } from './Timetable';

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
  isRecurring?: boolean;
  color?: string;
  instructor?: string;
}

const TimetableDemo: React.FC = () => {
  const [events, setEvents] = useState<TimetableEvent[]>([
    {
      id: '1',
      title: 'Mathematics 101',
      type: 'class',
      startTime: '09:00',
      endTime: '10:30',
      day: 'monday',
      location: 'Room 201',
      course: 'Mathematics',
      instructor: 'Dr. Smith',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Physics Lab',
      type: 'class',
      startTime: '11:00',
      endTime: '12:30',
      day: 'monday',
      location: 'Lab 3',
      course: 'Physics',
      instructor: 'Prof. Johnson',
      color: 'green'
    },
    {
      id: '3',
      title: 'Lunch Break',
      type: 'break',
      startTime: '12:30',
      endTime: '13:30',
      day: 'monday',
      location: 'Cafeteria',
      color: 'yellow'
    },
    {
      id: '4',
      title: 'Computer Science',
      type: 'class',
      startTime: '14:00',
      endTime: '15:30',
      day: 'monday',
      location: 'Room 105',
      course: 'Computer Science',
      instructor: 'Dr. Brown',
      color: 'purple'
    },
    {
      id: '5',
      title: 'Study Session',
      type: 'study',
      startTime: '16:00',
      endTime: '17:30',
      day: 'monday',
      location: 'Library',
      course: 'General',
      color: 'indigo'
    },
    {
      id: '6',
      title: 'Mathematics 101',
      type: 'class',
      startTime: '09:00',
      endTime: '10:30',
      day: 'wednesday',
      location: 'Room 201',
      course: 'Mathematics',
      instructor: 'Dr. Smith',
      color: 'blue'
    },
    {
      id: '7',
      title: 'Physics Lecture',
      type: 'class',
      startTime: '11:00',
      endTime: '12:30',
      day: 'wednesday',
      location: 'Auditorium A',
      course: 'Physics',
      instructor: 'Prof. Johnson',
      color: 'green'
    },
    {
      id: '8',
      title: 'Computer Science Lab',
      type: 'class',
      startTime: '14:00',
      endTime: '16:00',
      day: 'wednesday',
      location: 'Lab 1',
      course: 'Computer Science',
      instructor: 'Dr. Brown',
      color: 'purple'
    },
    {
      id: '9',
      title: 'Mathematics 101',
      type: 'class',
      startTime: '09:00',
      endTime: '10:30',
      day: 'friday',
      location: 'Room 201',
      course: 'Mathematics',
      instructor: 'Dr. Smith',
      color: 'blue'
    },
    {
      id: '10',
      title: 'Physics Tutorial',
      type: 'class',
      startTime: '11:00',
      endTime: '12:00',
      day: 'friday',
      location: 'Room 203',
      course: 'Physics',
      instructor: 'Prof. Johnson',
      color: 'green'
    },
    {
      id: '11',
      title: 'Assignment Due',
      type: 'assignment',
      startTime: '23:59',
      endTime: '23:59',
      day: 'friday',
      course: 'Computer Science',
      description: 'Submit final project',
      color: 'orange'
    },
    {
      id: '12',
      title: 'Midterm Exam',
      type: 'exam',
      startTime: '10:00',
      endTime: '12:00',
      day: 'tuesday',
      location: 'Exam Hall',
      course: 'Mathematics',
      description: 'Mathematics 101 Midterm',
      color: 'red'
    },
    {
      id: '13',
      title: 'Group Meeting',
      type: 'meeting',
      startTime: '15:00',
      endTime: '16:00',
      day: 'thursday',
      location: 'Study Room 2',
      course: 'Computer Science',
      description: 'Project discussion',
      color: 'green'
    }
  ]);

  const handleAddEvent = () => {
    // In a real app, this would open a form to add a new event
    console.log('Add event clicked');
  };

  const handleEditEvent = (event: TimetableEvent) => {
    // In a real app, this would open a form to edit the event
    console.log('Edit event:', event);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable Demo</h1>
        <p className="text-gray-600">
          A traditional timetable view with time slots and weekly grid layout. Perfect for academic schedules and course planning.
        </p>
      </div>

      <Timetable
        events={events}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        startHour={8}
        endHour={18}
        timeSlotDuration={30}
      />

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Features Demonstrated:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Grid View:</strong> Traditional timetable layout with time slots and day columns</li>
          <li>• <strong>List View:</strong> Alternative list view organized by day</li>
          <li>• <strong>Time Slots:</strong> Configurable time slots (30-minute intervals by default)</li>
          <li>• <strong>Event Types:</strong> Different event types with color coding (class, assignment, exam, meeting, personal, break, study)</li>
          <li>• <strong>Event Details:</strong> Shows title, time, location, instructor, and course information</li>
          <li>• <strong>Visual Hierarchy:</strong> Clear grid structure with alternating row colors</li>
          <li>• <strong>Responsive Design:</strong> Horizontal scrolling for smaller screens</li>
          <li>• <strong>Interactive:</strong> Click events to edit or delete</li>
          <li>• <strong>Customizable:</strong> Configurable start/end hours and time slot duration</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Event Types & Colors:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Class (Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span>Assignment (Orange)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Exam (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Meeting (Green)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span>Personal (Purple)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Break (Yellow)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
            <span>Study (Indigo)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableDemo;
