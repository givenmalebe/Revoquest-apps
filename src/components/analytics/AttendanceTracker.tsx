import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Upload,
  Plus,
  Edit,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Award,
  Target
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatar?: string;
  date: string;
  time: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  reason?: string;
  notes?: string;
  sessionId: string;
  sessionTitle: string;
  instructor: string;
}

interface AttendanceSession {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  instructor: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
}

interface AttendanceTrackerProps {
  records: AttendanceRecord[];
  sessions: AttendanceSession[];
  onMarkAttendance?: (studentId: string, sessionId: string, status: string, notes?: string) => void;
  onBulkMarkAttendance?: (sessionId: string, attendanceData: { studentId: string; status: string }[]) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  records,
  sessions,
  onMarkAttendance,
  onBulkMarkAttendance,
  onExport,
  onImport
}) => {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showBulkMark, setShowBulkMark] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'text-green-600 bg-green-50 border-green-200';
      case 'Absent': return 'text-red-600 bg-red-50 border-red-200';
      case 'Late': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Excused': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Late': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Excused': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSession = !selectedSession || record.sessionId === selectedSession;
    const matchesDate = !selectedDate || record.date === selectedDate;
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    
    return matchesSession && matchesDate && matchesSearch && matchesStatus;
  });

  const currentSession = sessions.find(s => s.id === selectedSession);
  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]);

  // Calculate overall statistics
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const excusedCount = records.filter(r => r.status === 'Excused').length;
  const attendanceRate = totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{attendanceRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Sessions
            </CardTitle>
            <CardDescription>
              Sessions scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{session.title}</h4>
                    <Badge variant="outline">{session.time}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Instructor: {session.instructor}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{session.presentCount} present</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span>{session.absentCount} absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      <span>{session.lateCount} late</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-blue-500" />
                      <span>{session.excusedCount} excused</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => setSelectedSession(session.id)}
                  >
                    Mark Attendance
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View and manage student attendance</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowBulkMark(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Bulk Mark
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Sessions</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.title} - {session.date}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={record.avatar} />
                      <AvatarFallback>
                        {record.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{record.studentName}</h4>
                      <p className="text-sm text-gray-600">{record.studentEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{record.sessionTitle}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{record.date} at {record.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    
                    {record.reason && (
                      <div className="text-sm text-gray-600 max-w-xs">
                        <p className="truncate">{record.reason}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {record.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No attendance records found</h3>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm || selectedSession || selectedDate || statusFilter !== 'All'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by marking attendance for a session'
                }
              </p>
              <Button onClick={() => setShowBulkMark(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Statistics */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Session Statistics: {currentSession.title}
            </CardTitle>
            <CardDescription>
              Detailed attendance breakdown for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{currentSession.presentCount}</p>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-xs text-gray-500">
                  {((currentSession.presentCount / currentSession.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{currentSession.absentCount}</p>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-xs text-gray-500">
                  {((currentSession.absentCount / currentSession.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{currentSession.lateCount}</p>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-xs text-gray-500">
                  {((currentSession.lateCount / currentSession.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{currentSession.excusedCount}</p>
                <p className="text-sm text-gray-600">Excused</p>
                <p className="text-xs text-gray-500">
                  {((currentSession.excusedCount / currentSession.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
