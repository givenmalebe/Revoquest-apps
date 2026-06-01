import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Award, 
  Trophy, 
  Medal, 
  Star,
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  MessageCircle,
  Download,
  Eye
} from "lucide-react";

interface BestPerformingStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rank: number;
  overallGrade: number;
  courseProgress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  certificatesEarned: number;
  badgesEarned: number;
  lastActive: string;
  joinDate: string;
  performance: 'Excellent' | 'Outstanding' | 'Good' | 'Average';
  achievements: {
    id: string;
    title: string;
    description: string;
    earnedDate: string;
    type: 'certificate' | 'badge' | 'milestone';
  }[];
  courses: {
    id: string;
    title: string;
    grade: number;
    progress: number;
    completed: boolean;
  }[];
  strengths: string[];
  areasForImprovement: string[];
}

interface BestPerformingStudentsProps {
  students: BestPerformingStudent[];
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  showDetails?: boolean;
}

export const BestPerformingStudents: React.FC<BestPerformingStudentsProps> = ({ 
  students, 
  timeframe = 'month',
  showDetails = true 
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{rank}</div>;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Outstanding': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Award className="h-4 w-4 text-green-500" />;
      case 'badge': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'milestone': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  const topStudents = students.slice(0, 10);
  const podiumStudents = students.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Podium Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performers Podium
          </CardTitle>
          <CardDescription>
            Celebrating the highest achieving students this {timeframe}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-4 mb-6">
            {/* Second Place */}
            {podiumStudents[1] && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={podiumStudents[1].avatar} />
                  <AvatarFallback>
                    {podiumStudents[1].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-sm">{podiumStudents[1].name}</h4>
                <p className="text-xs text-gray-600">{podiumStudents[1].overallGrade}%</p>
              </div>
            )}

            {/* First Place */}
            {podiumStudents[0] && (
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                  <Trophy className="h-10 w-10 text-yellow-500" />
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={podiumStudents[0].avatar} />
                  <AvatarFallback>
                    {podiumStudents[0].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold">{podiumStudents[0].name}</h4>
                <p className="text-sm text-gray-600">{podiumStudents[0].overallGrade}%</p>
                <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                  #1
                </Badge>
              </div>
            )}

            {/* Third Place */}
            {podiumStudents[2] && (
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={podiumStudents[2].avatar} />
                  <AvatarFallback>
                    {podiumStudents[2].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-sm">{podiumStudents[2].name}</h4>
                <p className="text-xs text-gray-600">{podiumStudents[2].overallGrade}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top 10 Leaderboard
          </CardTitle>
          <CardDescription>
            Complete ranking of best performing students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(student.rank)}
                    <span className="font-bold text-lg">#{student.rank}</span>
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPerformanceColor(student.performance)}>
                        {student.performance}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {student.certificatesEarned} certificates, {student.badgesEarned} badges
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{student.overallGrade}%</p>
                    <p className="text-xs text-gray-600">Overall Grade</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{student.courseProgress}%</p>
                    <p className="text-xs text-gray-600">Progress</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Analysis */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detailed Performance Analysis
            </CardTitle>
            <CardDescription>
              In-depth analysis of top performing students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topStudents.slice(0, 5).map((student) => (
                <div key={student.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(student.rank)}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{student.name}</h4>
                        <p className="text-sm text-gray-600">Member since {student.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getPerformanceColor(student.performance)}>
                        {student.performance}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{student.overallGrade}%</p>
                      <p className="text-sm text-gray-600">Overall Grade</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{student.courseProgress}%</p>
                      <p className="text-sm text-gray-600">Course Progress</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{student.certificatesEarned}</p>
                      <p className="text-sm text-gray-600">Certificates</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{student.badgesEarned}</p>
                      <p className="text-sm text-gray-600">Badges</p>
                    </div>
                  </div>

                  {/* Course Performance */}
                  <div className="mb-6">
                    <h5 className="font-medium mb-3">Course Performance</h5>
                    <div className="space-y-2">
                      {student.courses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${course.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="font-medium">{course.title}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{course.progress}% complete</span>
                            <span className="font-semibold text-blue-600">{course.grade}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Achievements */}
                  {student.achievements.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium mb-3">Recent Achievements</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {student.achievements.slice(0, 4).map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                            {getAchievementIcon(achievement.type)}
                            <div>
                              <p className="font-medium text-sm">{achievement.title}</p>
                              <p className="text-xs text-gray-600">{achievement.earnedDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths and Areas for Improvement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2 text-green-600">Strengths</h5>
                      <div className="space-y-1">
                        {student.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2 text-orange-600">Areas for Improvement</h5>
                      <div className="space-y-1">
                        {student.areasForImprovement.map((area, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span>{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
