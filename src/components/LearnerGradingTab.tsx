import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Award, CheckCircle, FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { GradingService, CourseAssessmentGrade } from '@/services/gradingService';
import { useAuth } from '@/contexts/AuthContext';
import { persistentProgressService } from '@/services/persistentProgressService';
import { DatabaseService, Course } from '@/firebase/database';
import {
  buildCourseTitleMap,
  getCourseDisplayName,
  resolveLessonDisplayName,
} from '@/utils/courseDisplayName';
import {
  getFinalExamDisplayDate,
  getFinalExamDisplayScore,
  hasPassedFinalExam,
} from '@/utils/finalExamProgress';

export const LearnerGradingTab: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<CourseAssessmentGrade[]>([]);
  const [finalExamResults, setFinalExamResults] = useState<{
    courseId: string;
    courseName: string;
    score: number;
    submittedAt: string;
    passed: boolean;
  }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  // Load grades (quiz results only — no summative assessment results)
  useEffect(() => {
    loadGrades();
  }, [user]);

  const loadGrades = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get all progress documents for this learner (each doc = a course)
      const allProgress = await persistentProgressService.getAllStudentProgress(user.id);
      const courseIds = Object.keys(allProgress);
      const titleMap = await buildCourseTitleMap(user.id, courseIds);

      const allGrades: CourseAssessmentGrade[] = [];

      const finalExams: {
        courseId: string;
        courseName: string;
        score: number;
        submittedAt: string;
        passed: boolean;
      }[] = [];

      for (const courseId of courseIds) {
        const [course, progress] = await Promise.all([
          DatabaseService.getCourse(courseId),
          persistentProgressService.getStudentProgress(user.id, courseId),
        ]);

        const courseName = getCourseDisplayName(courseId, titleMap, course);
        const displayScore = getFinalExamDisplayScore(progress ?? undefined);
        const submittedAt = getFinalExamDisplayDate(progress ?? undefined);
        if (typeof displayScore === 'number' && submittedAt) {
          finalExams.push({
            courseId,
            courseName,
            score: displayScore,
            submittedAt,
            passed: hasPassedFinalExam(progress ?? undefined),
          });
        }

        const lessonProgressList = (progress?.lessonProgress || []) as any[];

        lessonProgressList
          .filter((lp) => typeof lp.score === 'number')
          .forEach((lp) => {
            const { unitTitle, lessonTitle } = resolveLessonDisplayName(lp.lessonId, course);
            const assessmentTitle = unitTitle ? `${unitTitle} – ${lessonTitle}` : lessonTitle;
            const percentage = lp.score as number;
            const letterGrade = GradingService.calculateLetterGrade(percentage);
            const timestamp = lp.completedAt || lp.lastAccessedAt || new Date().toISOString();

            allGrades.push({
              id: `${courseId}_${lp.lessonId}`,
              studentId: user.id,
              studentName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || user.id,
              courseId,
              courseName,
              assessmentId: lp.lessonId,
              assessmentTitle,
              assessmentType: 'formative',
              marks: percentage,
              maxMarks: 100,
              percentage,
              letterGrade,
              instructorId: (course as any)?.instructorId || '',
              instructorName: (course as any)?.instructor || '',
              feedback: '',
              detailedFeedback: '',
              status: 'graded',
              submittedAt: timestamp,
              gradedAt: timestamp,
              gradedBy: '',
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          });
      }

      // Sort newest first
      allGrades.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      setGrades(allGrades);
      setFinalExamResults(finalExams);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique courses from grades
  const courses = useMemo(() => {
    const uniqueCourses = new Map<string, string>();
    grades.forEach((grade) => {
      if (!uniqueCourses.has(grade.courseId)) {
        uniqueCourses.set(grade.courseId, grade.courseName);
      }
    });
    finalExamResults.forEach((exam) => {
      if (!uniqueCourses.has(exam.courseId)) {
        uniqueCourses.set(exam.courseId, exam.courseName);
      }
    });
    return Array.from(uniqueCourses.entries()).map(([id, name]) => ({ id, name }));
  }, [grades, finalExamResults]);

  // Filter grades by selected course
  const filteredGrades = useMemo(() => {
    if (selectedCourse === 'all') return grades;
    return grades.filter(g => g.courseId === selectedCourse);
  }, [grades, selectedCourse]);

  // Only quiz results done by the learner (exclude summative/final exam from this tab)
  const quizGrades = useMemo(
    () => filteredGrades.filter(g => g.assessmentType === 'formative'),
    [filteredGrades]
  );

  const quizStats = useMemo(() => {
    if (quizGrades.length === 0) {
      return { count: 0, averagePercentage: 0, averageGrade: '—' };
    }
    const avg = quizGrades.reduce((s, g) => s + g.percentage, 0) / quizGrades.length;
    const letter = avg >= 90 ? 'A+' : avg >= 85 ? 'A' : avg >= 80 ? 'B+' : avg >= 75 ? 'B' : avg >= 70 ? 'C+' : avg >= 65 ? 'C' : avg >= 50 ? 'D' : 'F';
    return { count: quizGrades.length, averagePercentage: avg, averageGrade: letter };
  }, [quizGrades]);

  const getUnitAndLessonTitles = (course: Course | null, lessonId: string) => {
    const resolved = resolveLessonDisplayName(lessonId, course);
    return { unitTitle: resolved.unitTitle, lessonTitle: resolved.lessonTitle };
  };

  const extractUnitAndLesson = (title: string) => {
    const unitMatch = title.match(/Unit\s+([0-9A-Za-z]+)/i);
    const lessonMatch = title.match(/Lesson\s+([0-9A-Za-z]+)/i);

    return {
      unitLabel: unitMatch ? `Unit ${unitMatch[1]}` : null,
      lessonLabel: lessonMatch ? `Lesson ${lessonMatch[1]}` : null,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'redo_required':
        return 'bg-red-100 text-red-800';
      case 'resubmitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Quiz Results</h2>
        <p className="text-muted-foreground">
          Results for quizzes you’ve completed, by course, unit and lesson
        </p>
      </div>

      {/* Quiz-only stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.count}</div>
            <p className="text-xs text-muted-foreground">
              Quiz results recorded
            </p>
            <Progress
              value={quizStats.count > 0 ? Math.min(100, quizStats.count * 20) : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average quiz grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.averageGrade}</div>
            <p className="text-xs text-muted-foreground">
              {quizStats.averagePercentage.toFixed(1)}% average score
            </p>
            <Progress value={quizStats.averagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Quiz average</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {quizStats.count > 0 ? quizStats.averagePercentage.toFixed(1) : '—'}%
            </div>
            <p className="text-xs text-blue-600">
              Across all your quiz attempts
            </p>
            <Progress
              value={quizStats.averagePercentage}
              className="mt-2 bg-blue-200"
            />
          </CardContent>
        </Card>
      </div>

      {/* Course Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quiz results</CardTitle>
              <CardDescription>Course, unit, lesson and score for each quiz you’ve done</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadGrades}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const filteredFinalExams = selectedCourse === 'all'
              ? finalExamResults
              : finalExamResults.filter((r) => r.courseId === selectedCourse);
            const hasQuizzes = quizGrades.length > 0;
            const hasFinalExams = filteredFinalExams.length > 0;
            if (!hasQuizzes && !hasFinalExams) {
              return (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quiz or final exam results yet</h3>
                  <p className="text-muted-foreground">
                    Complete lesson quizzes and the course final exam to see your results here.
                  </p>
                </div>
              );
            }
            return (
            <div className="space-y-6">
              {hasQuizzes && (
                <>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Your quiz results</h3>
                    <p className="text-sm text-muted-foreground">
                      Course, unit, lesson and score for each quiz you’ve completed.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {quizGrades.map((grade) => {
                    const { unitLabel, lessonLabel } = extractUnitAndLesson(grade.assessmentTitle);
                    return (
                      <Card
                        key={grade.id}
                        className="border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-b from-white to-slate-50"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                                Quiz
                              </p>
                              <CardTitle className="text-base font-semibold leading-snug">
                                {grade.assessmentTitle}
                              </CardTitle>
                              <p className="mt-1 text-xs text-slate-500">
                                {grade.courseName}
                              </p>
                            </div>
                            <Badge
                              className={`text-sm px-2.5 py-1 font-semibold ${getGradeColor(
                                grade.percentage
                              )}`}
                            >
                              {grade.letterGrade}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="flex flex-wrap gap-1.5">
                            {unitLabel && (
                              <Badge variant="outline" className="text-xs">
                                {unitLabel}
                              </Badge>
                            )}
                            {lessonLabel && (
                              <Badge variant="outline" className="text-xs">
                                {lessonLabel}
                              </Badge>
                            )}
                            {!unitLabel && !lessonLabel && (
                              <Badge variant="outline" className="text-xs">
                                Lesson quiz
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <div className="text-sm text-slate-600">
                                Score{' '}
                                <span className="font-semibold">
                                  {grade.marks}/{grade.maxMarks}
                                </span>
                              </div>
                              <div className={`text-sm font-semibold ${getGradeColor(grade.percentage)}`}>
                                {grade.percentage.toFixed(1)}%
                              </div>
                            </div>
                            <Progress value={grade.percentage} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(grade.status)}>
                                {grade.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <span>
                                {grade.gradedAt
                                  ? new Date(grade.gradedAt).toLocaleDateString()
                                  : 'Not graded'}
                              </span>
                            </div>
                            <div className="text-[0.7rem] text-slate-500">
                              Latest attempt
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  </div>
                </>
              )}

              {hasFinalExams && (
                  <div className={hasQuizzes ? 'border-t pt-6 mt-6 space-y-3' : 'space-y-3'}>
                    <h3 className="text-xl font-semibold">Final exam results</h3>
                    <div className="space-y-2">
                      {filteredFinalExams.map((r) => (
                        <div
                          key={r.courseId}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-violet-50 border border-violet-100"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-wide text-violet-600 font-medium">Final exam</p>
                            <p className="text-sm font-semibold text-violet-900">{r.courseName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${getGradeColor(r.score)}`}>
                              {r.score}%
                            </span>
                            <Badge className={getGradeColor(r.score)}>
                              {GradingService.calculateLetterGrade(r.score)}
                            </Badge>
                            <Badge className={r.passed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {r.passed ? 'PASSED' : 'NOT PASSED'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(r.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnerGradingTab;

