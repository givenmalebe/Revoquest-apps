import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  BookOpen, 
  GraduationCap, 
  Settings,
  User,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { CalendarEvent } from '@/services/calendarService';
import { format, parseISO } from 'date-fns';

interface EventDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onAccept?: (eventId: string) => void;
  onDecline?: (eventId: string) => void;
  currentUserId?: string;
  isProcessing?: boolean;
}

export const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  isOpen,
  onClose,
  event,
  onAccept,
  onDecline,
  currentUserId,
  isProcessing = false
}) => {
  if (!event) return null;

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="w-5 h-5" />;
      case 'class':
        return <BookOpen className="w-5 h-5" />;
      case 'assignment':
        return <GraduationCap className="w-5 h-5" />;
      case 'exam':
        return <Settings className="w-5 h-5" />;
      case 'deadline':
        return <Clock className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
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

  const isAttending = currentUserId ? event.attendees?.includes(currentUserId) : false;
  const isInvited = currentUserId ? event.invitedUserIds?.includes(currentUserId) : false;

  const startTime = parseISO(event.startTime);
  const endTime = parseISO(event.endTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getEventTypeIcon(event.type)}
              <div>
                <DialogTitle className="text-xl">{event.title}</DialogTitle>
                <DialogDescription>
                  {event.courseTitle || 'General Event'}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Type and Status */}
          <div className="flex items-center gap-3">
            <Badge className={getEventTypeColor(event.type)}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
            {isAttending && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Attending
              </Badge>
            )}
            {isInvited && !isAttending && (
              <Badge variant="outline">
                Invited
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(startTime, 'EEEE, MMMM do, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.isOnline && event.meetingLink && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Online Meeting</p>
                      <a 
                        href={event.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {event.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Event Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{event.creatorName}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {event.creatorRole}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          {event.invitedUsers && event.invitedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Attendees ({event.attendees?.length || 0}/{event.invitedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.invitedUsers.map((user) => {
                    const isUserAttending = event.attendees?.includes(user.id);
                    return (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUserAttending ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Attending
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Invited
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons for Invited Users */}
          {isInvited && !isAttending && onAccept && onDecline && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => onAccept(event.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isProcessing ? 'Processing...' : 'Accept Invitation'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onDecline(event.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {isProcessing ? 'Processing...' : 'Decline'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
