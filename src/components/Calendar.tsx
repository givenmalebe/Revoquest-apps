import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Video,
  BookOpen,
  GraduationCap,
  Settings,
  CheckCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { NotificationService } from '@/services/notificationService';
import { CalendarEvent } from '@/services/calendarService';

interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  userRole?: 'admin' | 'instructor' | 'learner';
  currentUserId?: string;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onEventClick,
  onAddEvent,
  userRole = 'learner',
  currentUserId,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Function to create event and send notifications
  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      // Create the event (in a real app, this would save to Firebase)
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('Creating event:', newEvent);

      // Send notifications to relevant users
      if (userRole === 'instructor' || userRole === 'admin') {
        try {
          // Get all learners to notify them about the new event
          // TODO: Implement real API call to get learners
          // For now, we'll skip notifications until the API is implemented
          const learnerIds: string[] = [];
          
          await NotificationService.notifyNewEvent(
            eventData.courseId || 'general',
            eventData.courseTitle || 'General',
            eventData.title,
            eventData.startTime,
            'instructor-001', // TODO: Use actual instructor ID
            'Course Instructor', // TODO: Use actual instructor name
            mockLearnerIds
          );
        } catch (notificationError) {
          console.log('Notification failed, but event was created:', notificationError);
        }
      }

      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty days to fill the calendar grid
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => null);
  const calendarDays = [...emptyDays, ...monthDays];

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="w-3 h-3" />;
      case 'class':
        return <BookOpen className="w-3 h-3" />;
      case 'assignment':
        return <GraduationCap className="w-3 h-3" />;
      case 'exam':
        return <Settings className="w-3 h-3" />;
      case 'deadline':
        return <Clock className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'class':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'assignment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'deadline':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.startTime);
      return isSameDay(eventDate, date);
    });
  };

  const getTodaysEvents = () => {
    return events.filter(event => {
      const eventDate = parseISO(event.startTime);
      return isSameDay(eventDate, new Date());
    });
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return events.filter(event => {
      const eventDate = parseISO(event.startTime);
      return isSameDay(eventDate, selectedDate);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const todaysEvents = getTodaysEvents();
  const selectedDateEvents = getSelectedDateEvents();
  const displayEvents = selectedDateEvents.length > 0 ? selectedDateEvents : todaysEvents;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Calendar
          </h2>
          <Badge variant="outline" className="text-sm">
            {format(currentDate, 'MMMM yyyy')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          {onAddEvent && (userRole === 'instructor' || userRole === 'admin') && (
            <Button size="sm" onClick={onAddEvent}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
          {userRole === 'learner' && (
            <Badge variant="outline" className="text-xs">
              View Only
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly View</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-24" />;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        h-24 p-1 border-2 rounded-lg cursor-pointer transition-colors
                        ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                        ${isSelected ? 'bg-blue-50 border-blue-400' : ''}
                        ${hasEvents && !isSelected ? 'border-green-500' : ''}
                        ${!hasEvents && !isSelected ? 'border-gray-200' : ''}
                        hover:bg-muted/50
                      `}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`
                          text-sm font-medium mb-1
                          ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        `}>
                          {format(day, 'd')}
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map(event => {
                            const isAttending = currentUserId ? event.attendees?.includes(currentUserId) : false;
                            const isInvited = currentUserId ? event.invitedUserIds?.includes(currentUserId) : false;
                            
                            return (
                              <div
                                key={event.id}
                                className={`
                                  text-xs p-1 rounded truncate cursor-pointer
                                  ${getEventTypeColor(event.type)}
                                  ${isAttending ? 'ring-1 ring-green-500' : ''}
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick?.(event);
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  {getEventTypeIcon(event.type)}
                                  <span className="truncate">{event.title}</span>
                                  {isAttending && (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  )}
                                  {isInvited && !isAttending && (
                                    <Clock className="w-3 h-3 text-yellow-600" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {selectedDate && !isSameDay(selectedDate, new Date()) 
                  ? `Events on ${format(selectedDate, 'MMM d, yyyy')}`
                  : "Today's Events"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayEvents.length > 0 ? (
                <div className="space-y-3">
                  {displayEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-1 rounded-full
                          ${getEventTypeColor(event.type)}
                        `}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(event.startTime), 'h:mm a')} - {format(parseISO(event.endTime), 'h:mm a')}
                          </p>
                          {event.courseTitle && (
                            <p className="text-xs text-blue-600">{event.courseTitle}</p>
                          )}
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          {event.isOnline && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Online
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {selectedDate && !isSameDay(selectedDate, new Date())
                      ? `No events on ${format(selectedDate, 'MMM d')}`
                      : "No events today"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Classes</span>
                  <span className="font-medium">
                    {events.filter(e => e.type === 'class').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Meetings</span>
                  <span className="font-medium">
                    {events.filter(e => e.type === 'meeting').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Assignments</span>
                  <span className="font-medium">
                    {events.filter(e => e.type === 'assignment').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Info */}
          {userRole === 'learner' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Calendar Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>You can view all scheduled events and classes.</p>
                  <p>Only instructors and admins can create or modify events.</p>
                  <p>Contact your instructor if you need to schedule something.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
