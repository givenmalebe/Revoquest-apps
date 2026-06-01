import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  MapPin, 
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from "lucide-react";

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

interface TimetableProps {
  events?: TimetableEvent[];
  onAddEvent?: () => void;
  onEditEvent?: (event: TimetableEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  startHour?: number;
  endHour?: number;
  timeSlotDuration?: number; // in minutes
}

export const Timetable: React.FC<TimetableProps> = ({
  events = [],
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  startHour = 8,
  endHour = 18,
  timeSlotDuration = 30
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Days of the week
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Format time helper function
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += timeSlotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const displayTime = formatTime(time);
        slots.push({ time, displayTime, hour, minutes });
      }
    }
    return slots;
  }, [startHour, endHour, timeSlotDuration]);

  // Get events for a specific day
  const getEventsForDay = (day: string) => {
    return events.filter(event => event.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get events for a specific time slot
  const getEventsForTimeSlot = (day: string, timeSlot: string) => {
    return events.filter(event => {
      if (event.day !== day) return false;
      
      const eventStart = event.startTime;
      const eventEnd = event.endTime;
      const slotTime = timeSlot;
      
      // Check if the time slot falls within the event time range
      return slotTime >= eventStart && slotTime < eventEnd;
    });
  };

  // Check if a time slot is the start of an event
  const isEventStart = (day: string, timeSlot: string) => {
    return events.some(event => event.day === day && event.startTime === timeSlot);
  };

  // Get event that starts at this time slot
  const getEventAtTimeSlot = (day: string, timeSlot: string) => {
    return events.find(event => event.day === day && event.startTime === timeSlot);
  };

  // Calculate event height based on duration
  const getEventHeight = (startTime: string, endTime: string) => {
    const start = startTime.split(':');
    const end = endTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    const duration = endMinutes - startMinutes;
    return (duration / timeSlotDuration) * 40; // 40px per time slot
  };

  const getEventTypeColor = (type: string, customColor?: string) => {
    if (customColor) {
      return `bg-${customColor}-100 text-${customColor}-800 border-${customColor}-200`;
    }
    
    const colors = {
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      assignment: 'bg-orange-100 text-orange-800 border-orange-200',
      exam: 'bg-red-100 text-red-800 border-red-200',
      meeting: 'bg-green-100 text-green-800 border-green-200',
      personal: 'bg-purple-100 text-purple-800 border-purple-200',
      break: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      study: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventTypeIcon = (type: string) => {
    const icons = {
      class: BookOpen,
      assignment: Edit3,
      exam: Clock,
      meeting: Users,
      personal: Calendar,
      break: Clock,
      study: BookOpen
    };
    const IconComponent = icons[type as keyof typeof icons] || Calendar;
    return <IconComponent className="w-3 h-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Timetable
            </CardTitle>
            <CardDescription>
              Weekly schedule with time slots
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
            {onAddEvent && (
              <Button size="sm" onClick={onAddEvent}>
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'grid' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[800px] max-h-[600px] overflow-y-auto">
              {/* Timetable Grid */}
              <div className="grid grid-cols-8 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Time column header */}
                <div className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200">
                  Time
                </div>
                
                {/* Day headers */}
                {dayLabels.map((day, index) => (
                  <div key={index} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
                
                {/* Time slots and events */}
                {timeSlots.map((timeSlot, slotIndex) => (
                  <React.Fragment key={slotIndex}>
                    {/* Time label */}
                    <div className="bg-gray-50 p-2 text-xs text-gray-600 border-r border-gray-200 border-t border-gray-200 text-center">
                      {timeSlot.displayTime}
                    </div>
                    
                    {/* Day columns */}
                    {days.map((day, dayIndex) => {
                      const event = getEventAtTimeSlot(day, timeSlot.time);
                      const isEventStart = event && event.startTime === timeSlot.time;
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`border-r border-gray-200 border-t border-gray-200 last:border-r-0 min-h-[40px] relative ${
                            slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                        >
                          {isEventStart && event && (
                            <div
                              className={`absolute inset-0 m-1 rounded border cursor-pointer hover:shadow-md transition-shadow ${getEventTypeColor(event.type, event.color)}`}
                              style={{ height: `${getEventHeight(event.startTime, event.endTime)}px` }}
                              onClick={() => onEditEvent?.(event)}
                            >
                              <div className="p-2 h-full flex flex-col">
                                <div className="flex items-center gap-1 mb-1">
                                  {getEventTypeIcon(event.type)}
                                  <span className="font-medium text-xs truncate">{event.title}</span>
                                </div>
                                <div className="text-xs opacity-75 truncate">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                                    <MapPin className="w-2 h-2" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                                {event.instructor && (
                                  <div className="text-xs opacity-75 truncate mt-1">
                                    {event.instructor}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {/* List View */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day} className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {day}
                  </h3>
                  {dayEvents.length > 0 ? (
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getEventTypeColor(event.type, event.color)}`}
                          onClick={() => onEditEvent?.(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getEventTypeIcon(event.type)}
                                <h4 className="font-semibold">{event.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                                </div>
                                
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                
                                {event.course && (
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{event.course}</span>
                                  </div>
                                )}

                                {event.instructor && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{event.instructor}</span>
                                  </div>
                                )}
                                
                                {event.description && (
                                  <p className="text-sm opacity-75 mt-2">{event.description}</p>
                                )}
                              </div>
                            </div>
                            
                            {onEditEvent && onDeleteEvent && (
                              <div className="flex gap-1 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEvent(event);
                                  }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEvent(event.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events scheduled for {day}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Timetable;
