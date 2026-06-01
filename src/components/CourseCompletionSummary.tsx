import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle,
  Clock,
  Star,
  Trophy,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Download,
  Share2,
  X,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";

interface CourseCompletionSummaryProps {
  course: any;
  progressData: any;
  lessonProgress: any[];
  isOpen: boolean;
  onClose: () => void;
  onViewCertificate?: () => void;
  onShareAchievement?: () => void;
}

const CourseCompletionSummary: React.FC<CourseCompletionSummaryProps> = ({
  course,
  progressData,
  lessonProgress,
  isOpen,
  onClose,
  onViewCertificate,
  onShareAchievement
}) => {
  if (!isOpen) return null;

  // Calculate course statistics
  const totalTimeSpent = lessonProgress.reduce((total, lp) => total + (lp.timeSpent || 0), 0);
  const averageScore = lessonProgress
    .filter(lp => lp.completed && lp.score !== undefined)
    .reduce((sum, lp, _, arr) => sum + (lp.score || 0) / arr.length, 0);
  
  const completedLessons = lessonProgress.filter(lp => lp.completed);
  const quizLessons = completedLessons.filter(lp => {
    const lesson = course.units?.flatMap((u: any) => u.lessons || [])
      .find((l: any) => l.id === lp.lessonId);
    return lesson?.type === 'quiz';
  });

  // Calculate unit completion - more flexible approach
  const units = course.units || course.modules || [];
  const completedUnits = units.filter((unit: any) => {
    const unitLessons = unit.lessons || [];
    if (unitLessons.length === 0) return false;
    
    // A unit is considered completed if at least one lesson is completed
    const completedLessonsInUnit = unitLessons.filter((lesson: any) => 
      lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
    ).length;
    
    return completedLessonsInUnit > 0;
  }).length;

  // Get course achievements
  const achievements = [
    {
      id: 'course-complete',
      title: 'Course Master',
      description: 'Completed the entire course',
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      earned: true
    },
    {
      id: 'time-dedication',
      title: 'Time Dedication',
      description: `Spent ${Math.round(totalTimeSpent)} minutes learning`,
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      earned: totalTimeSpent > 60
    },
    {
      id: 'quiz-master',
      title: 'Quiz Master',
      description: `Completed ${quizLessons.length} quizzes`,
      icon: <Target className="w-6 h-6 text-green-500" />,
      earned: quizLessons.length > 0
    },
    {
      id: 'high-achiever',
      title: 'High Achiever',
      description: `Average score: ${Math.round(averageScore)}%`,
      icon: <Star className="w-6 h-6 text-purple-500" />,
      earned: averageScore >= 80
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Congratulations!</h1>
            <p className="text-xl text-white/90">You've successfully completed</p>
            <h2 className="text-2xl font-semibold mt-2">{course.title}</h2>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-2xl font-bold text-green-600">100%</span>
                  </div>
                  <Progress value={100} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{completedLessons.length}</div>
                      <div className="text-sm text-gray-600">Lessons Completed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{completedUnits}</div>
                      <div className="text-sm text-gray-600">Units Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">Total Time Spent</div>
                      <div className="text-sm text-gray-600">{Math.round(totalTimeSpent)} minutes</div>
                    </div>
                  </div>
                  
                  {averageScore > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Star className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Average Score</div>
                        <div className="text-sm text-gray-600">{Math.round(averageScore)}%</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-semibold">Completed On</div>
                      <div className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      achievement.earned
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className={`${achievement.earned ? 'text-green-600' : 'text-gray-400'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-500'}`}>
                        {achievement.title}
                      </div>
                      <div className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`}>
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Learning Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{completedLessons.length}</div>
                  <div className="text-sm text-gray-600">Lessons Mastered</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(totalTimeSpent)}</div>
                  <div className="text-sm text-gray-600">Minutes Invested</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageScore > 0 ? `${Math.round(averageScore)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Widget */}
          <CourseRating course={course} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default CourseCompletionSummary;

// Inline rating component to submit course rating
import { useMemo, useState } from 'react';
import { useDataSync } from '@/contexts/DataSyncContext';
import NotificationService from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const CourseRating: React.FC<{ course: any; onClose: () => void }> = ({ course, onClose }) => {
  const { updateCourse, students } = useDataSync();
  const { user } = useAuth();
  const existing = useMemo(() => (course?.rating ? Number(course.rating) : 0), [course]);
  const [rating, setRating] = useState<number>(existing || 0);
  const [hover, setHover] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const stars = [1, 2, 3, 4, 5];

  const handleSave = async () => {
    if (!course?.id || rating <= 0) return;
    setSaving(true);
    try {
      await updateCourse(course.id, { rating });
      // Notify the instructor about new rating
      if (course.instructorId) {
        await NotificationService.createNotification({
          recipientId: course.instructorId,
          senderId: user?.id || 'system',
          senderName: `${user?.firstName || 'Learner'} ${user?.lastName || ''}`.trim() || 'Learner',
          type: 'course',
          title: 'New Course Rating',
          content: `Your course "${course.title}" received a new rating: ${rating}/5`,
          metadata: { courseId: course.id },
          priority: 'low'
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded-xl bg-white">
      <h3 className="text-lg font-semibold mb-2 text-center">Rate this course</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">Your rating helps instructors improve quality.</p>
      <div className="flex items-center justify-center gap-2 mb-4">
        {stars.map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
            className="p-2"
            aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-8 h-8 ${((hover || rating) >= s) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
      <div className="text-center text-sm text-gray-700 mb-4">Selected: {rating || existing}/5</div>
      <div className="flex items-center justify-center gap-3">
        <Button disabled={saving || rating === 0} onClick={handleSave} className="px-6">
          {saving ? 'Saving...' : (saved ? 'Saved' : 'Submit Rating')}
        </Button>
      </div>
    </div>
  );
};
