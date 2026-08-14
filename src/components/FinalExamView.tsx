import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { lessonContentService, QuizContent } from '@/services/lessonContentService';
import { DatabaseService } from '@/firebase/database';
import { persistentProgressService } from '@/services/persistentProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, RefreshCw, CheckCircle, ArrowLeft, Award, MessageCircle, X } from 'lucide-react';
import {
  downloadCertificateBlob,
  generateCertificateFromTemplate,
} from '@/services/certificateTemplateService';
import { getDisplayCorrectAnswer, gradeQuestions } from '@/utils/quizGrading';

const EXAM_GEN_TIMEOUT_MS = 60000;
const MIN_EXAM_QUESTIONS = 30;
const FINAL_EXAM_PASS_PERCENT = 80;
const MAX_FINAL_EXAM_ATTEMPTS = 5;

interface FinalExamViewProps {
  course: { id: string; title: string; units?: any[]; modules?: any[]; finalExam?: QuizContent };
  onComplete: () => void;
  onBack?: () => void;
}

export const FinalExamView: React.FC<FinalExamViewProps> = ({ course, onComplete, onBack }) => {
  const { user } = useAuth();
  const hasOnlyMultipleChoiceFinalExamTypes = (questions: QuizContent['questions'] = []) =>
    questions.every((q) => q.type === 'multiple-choice' && q.options && q.options.length >= 4);
  const hasUniqueQuestionPrompts = (questions: QuizContent['questions'] = []) => {
    const normalized = questions
      .map((q) => q.question.trim().toLowerCase().replace(/\s+/g, ' '))
      .filter(Boolean);
    return new Set(normalized).size === normalized.length;
  };
  const hasTemplateStyleQuestions = (questions: QuizContent['questions'] = []) => {
    const normalized = questions.map((q) => q.question.trim().toLowerCase().replace(/\s+/g, ' '));
    const repetitiveCount = normalized.filter(
      (q) =>
        q.includes('course concept #') ||
        q.includes('which statement best reflects') ||
        q.includes('unit:') ||
        q.includes('lesson:') ||
        q.includes('objective:')
    ).length;
    return repetitiveCount >= 4;
  };
  const hasLegacyGenericOptions = (questions: QuizContent['questions'] = []) => {
    const normalizedOptions = questions
      .filter((q) => q.type === 'multiple-choice')
      .flatMap((q) => q.options || [])
      .map((opt) => opt.trim().toLowerCase().replace(/\s+/g, ' '));
    const legacyPatterns = [
      'it ignores an important safety step.',
      'it correctly applies',
      'it uses an unrelated method.',
      'it skips required checks.'
    ];
    const matchedCount = normalizedOptions.filter((opt) =>
      legacyPatterns.some((pattern) => opt.includes(pattern))
    ).length;
    return matchedCount >= 4;
  };
  const hasWeakQuestionGrammar = (questions: QuizContent['questions'] = []) => {
    const normalizedQuestions = questions
      .filter((q) => q.type === 'multiple-choice')
      .map((q) => q.question.trim().toLowerCase().replace(/\s+/g, ' '));
    return normalizedQuestions.some(
      (q) =>
        q.includes('which action best demonstrates explain') ||
        q.includes('what best shows outline') ||
        q.includes('which example best shows understand')
    );
  };
  const existingExam =
    course.finalExam?.questions &&
    course.finalExam.questions.length === MIN_EXAM_QUESTIONS &&
    hasOnlyMultipleChoiceFinalExamTypes(course.finalExam.questions) &&
    hasUniqueQuestionPrompts(course.finalExam.questions) &&
    !hasTemplateStyleQuestions(course.finalExam.questions) &&
    !hasLegacyGenericOptions(course.finalExam.questions) &&
    !hasWeakQuestionGrammar(course.finalExam.questions)
      ? course.finalExam
      : null;
  const [exam, setExam] = useState<QuizContent | null>(existingExam);
  const [loading, setLoading] = useState(!existingExam);
  const [genError, setGenError] = useState<string | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [noMoreAttempts, setNoMoreAttempts] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [savedSubmittedAt, setSavedSubmittedAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showAITutorPopout, setShowAITutorPopout] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateNotice, setCertificateNotice] = useState<string | null>(null);

  const buildSummary = useCallback(() => {
    const units = (course.units || course.modules || []) as any[];
    return units
      .map(
        (u) =>
          `Unit: ${u.title || 'Unit'}\n` +
          (u.lessons || [])
            .map((l: any) => {
              const obj = l.objectives?.length ? ` Objectives: ${l.objectives.join('. ')}` : '';
              return `- ${l.title || 'Lesson'}${obj}`;
            })
            .join('\n')
      )
      .join('\n\n');
  }, [course.units, course.modules]);

  const validateExam = useCallback((exam: QuizContent) => {
    return exam.questions.length >= MIN_EXAM_QUESTIONS;
  }, []);

  const generateExam = useCallback(async () => {
    setGenError(null);
    setLoading(true);
    const summary = buildSummary();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Generation timed out. Please try again.')), EXAM_GEN_TIMEOUT_MS)
    );
    try {
      const generated = await Promise.race([
        lessonContentService.generateFinalExam(course.title || 'Course', summary),
        timeoutPromise
      ]);
      if (validateExam(generated)) {
        setExam(generated);
        await DatabaseService.updateCourse(course.id, { finalExam: generated });
      } else {
        throw new Error('Exam validation failed.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate exam.';
      setGenError(msg);
      setExam(null);
    } finally {
      setLoading(false);
    }
  }, [course.id, course.title, buildSummary, validateExam]);

  // Load progress to know attempt count and whether they already passed
  useEffect(() => {
    if (!user?.id || !course.id) return;
    let cancelled = false;
    persistentProgressService.getStudentProgress(user.id, course.id).then((progress) => {
      if (cancelled) return;
      setProgressLoaded(true);
      const attempts = progress?.finalExamAttempts ?? 0;
      const savedScore =
        typeof progress?.finalExamPassedScore === 'number'
          ? progress.finalExamPassedScore
          : progress?.finalExamScore;
      setAttemptsUsed(attempts);
      const passed =
        progress?.finalExamPassed === true ||
        !!progress?.certificateIssuedAt ||
        (typeof savedScore === 'number' && savedScore >= FINAL_EXAM_PASS_PERCENT);
      if (passed && typeof savedScore === 'number') {
        setAlreadyPassed(true);
        setSavedScore(savedScore);
        setSavedSubmittedAt(progress?.finalExamSubmittedAt ?? null);
      } else if (attempts >= MAX_FINAL_EXAM_ATTEMPTS) {
        setNoMoreAttempts(true);
      }
    });
    return () => { cancelled = true; };
  }, [user?.id, course.id]);

  useEffect(() => {
    if (!progressLoaded) return;
    if (alreadyPassed || noMoreAttempts) return;
    if (exam) return;
    generateExam();
  }, [exam, generateExam, progressLoaded, alreadyPassed, noMoreAttempts]);

  const issueAndDownloadCertificate = useCallback(
    async (issuedAtIso: string | null): Promise<boolean> => {
      if (!user) return false;
      setIsGeneratingCertificate(true);
      setCertificateNotice(null);
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      const learnerName = fullName || user.email || 'Learner';
      const learnerId = user.identityNumber || user.id || '';
      const issuedDate = issuedAtIso
        ? new Date(issuedAtIso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
      try {
        const blob = await generateCertificateFromTemplate({
          learnerName,
          learnerId,
          courseTitle: course.title || 'Course',
          issueDate: issuedDate,
        });
        downloadCertificateBlob(blob, course.title || 'Course');
        setCertificateNotice(
          'Your certificate was generated from the official template and downloaded to your device.'
        );
        return true;
      } catch (err) {
        console.error('Failed to generate certificate from template:', err);
        setCertificateNotice(
          'You passed! We could not generate the certificate automatically — use the download button below to try again.'
        );
        return false;
      } finally {
        setIsGeneratingCertificate(false);
      }
    },
    [course.title, user]
  );

  const handleDownloadCertificate = useCallback(
    async (_scoreToUse: number, issuedAtIso: string | null) => {
      await issueAndDownloadCertificate(issuedAtIso);
    },
    [issueAndDownloadCertificate]
  );

  const handleSubmit = async () => {
    if (!exam || !user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { percentage, correctByQuestionId } = gradeQuestions(exam.questions, answers);
      const allQuestions = exam.questions.map((q) => {
        const selectedAnswer = (answers[q.id] || '').trim();
        const correctAnswer = getDisplayCorrectAnswer(q);
        return {
          questionId: q.id,
          question: q.question,
          selectedAnswer: selectedAnswer || 'No answer selected',
          correctAnswer,
          isCorrect: correctByQuestionId[q.id],
          sourceTag: (q as any).sourceTag as string | undefined,
          explanation: q.explanation
        };
      });
      const failedQuestions = allQuestions.filter((q) => !q.isCorrect);
      const suggestedReviewTopics = Array.from(
        new Set(
          failedQuestions
            .map((q) => q.sourceTag)
            .filter((value): value is string => Boolean(value && value.trim().length > 0))
        )
      ).slice(0, 8);

      await persistentProgressService.recordFinalExamAttempt(user.id, course.id, percentage, {
        failedQuestions,
        allQuestions,
        suggestedReviewTopics
      });
      setAttemptsUsed((prev) => prev + 1);
      setScore(percentage);
      setSubmitted(true);
      if (percentage < FINAL_EXAM_PASS_PERCENT) {
        setShowAITutorPopout(true);
      }
      if (percentage >= FINAL_EXAM_PASS_PERCENT) {
        const learnerName =
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          user.displayName ||
          user.email ||
          'Learner';
        const issuedAt = new Date().toISOString();
        await persistentProgressService.recordCertificateIssued(
          user.id,
          course.id,
          course.title || 'Course',
          learnerName,
          percentage
        );
        setAlreadyPassed(true);
        setSavedScore(percentage);
        setSavedSubmittedAt(issuedAt);
        await issueAndDownloadCertificate(issuedAt);
      }
    } catch (err) {
      console.error('Failed to submit final exam:', err);
      setSubmitError(err instanceof Error ? err.message : 'AI grading failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    if (alreadyPassed) return;
    setSubmitted(false);
    setScore(null);
    setAnswers({});
  };

  if (loading && !genError && !alreadyPassed && !noMoreAttempts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-600">Generating your final exam…</p>
        <p className="text-xs text-slate-500">This may take up to a minute.</p>
      </div>
    );
  }

  if (genError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 max-w-md mx-auto p-6">
        <p className="text-slate-700 font-medium">Could not generate the exam</p>
        <p className="text-sm text-slate-600 text-center">{genError}</p>
        <Button onClick={() => { setGenError(null); generateExam(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Button>
        )}
      </div>
    );
  }

  const passingScore = exam?.passingScore ?? FINAL_EXAM_PASS_PERCENT;
  const passed = score !== null && score >= passingScore;

  // Already passed in a previous attempt: show certificate + continue
  if (progressLoaded && alreadyPassed && !submitted) {
    const scoreForCert = savedScore ?? 0;
    const dateStr = savedSubmittedAt
      ? new Date(savedSubmittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const learnerName = user?.displayName || user?.email || 'Learner';
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              You already passed the final exam
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              You scored {scoreForCert}% and completed this course (100%). Download your certificate below, then continue to see your congratulations. You cannot take the exam again.
            </p>
            <Button
              variant="outline"
              className="w-full border-violet-300 text-violet-700 hover:bg-violet-50"
              disabled={isGeneratingCertificate}
              onClick={() => handleDownloadCertificate(scoreForCert, savedSubmittedAt ?? null)}
            >
              {isGeneratingCertificate ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating certificate…
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Download certificate of completion
                </>
              )}
            </Button>
            <Button onClick={onComplete} className="w-full">
              Continue to course completion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Used all attempts without passing: show message + continue
  if (progressLoaded && noMoreAttempts && !submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-amber-600" />
              Final exam attempts used
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              You&apos;ve used all {MAX_FINAL_EXAM_ATTEMPTS} attempts. The pass mark is {FINAL_EXAM_PASS_PERCENT}%.
              You can continue to course completion, but a certificate is not available for this course. You cannot take the exam again.
            </p>
            <Button onClick={onComplete} className="w-full">
              Continue to course completion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted && score !== null) {
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const attemptsLeft = MAX_FINAL_EXAM_ATTEMPTS - attemptsUsed;
    const openAITutorWithExamContext = () => {
      const params = new URLSearchParams();
      params.set('context', 'exam_help');
      params.set('courseId', course.id);
      params.set('courseTitle', course.title || '');
      window.location.assign(`/ai-tutor?${params.toString()}`);
    };
    return (
      <>
        {/* Popout: invite to chat with AI when they failed */}
        {showAITutorPopout && !passed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <Card className="rounded-2xl border-0 bg-white dark:bg-slate-800 shadow-2xl w-full max-w-lg">
              <CardContent className="p-6">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-9 w-9 text-slate-400 hover:text-slate-600 rounded-full -m-1"
                    onClick={() => setShowAITutorPopout(false)}
                    aria-label="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="flex items-start gap-4 pr-8">
                    <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        Get help from your AI tutor
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Your tutor knows your grades, quiz results, and this exam attempt. Chat with the AI to review weak areas and prepare so you deserve your certificate before your next attempt.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          className="bg-violet-600 hover:bg-violet-700 text-white"
                          onClick={openAITutorWithExamContext}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat with AI tutor
                        </Button>
                        <Button variant="outline" onClick={() => setShowAITutorPopout(false)}>
                          Maybe later
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <FileText className="h-6 w-6 text-amber-600" />
                )}
                Final exam submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-slate-700'}`}>{score}%</p>
              <p className="text-slate-600">
                {passed
                  ? isGeneratingCertificate
                    ? 'You passed! Generating your certificate from the official template…'
                    : certificateNotice ||
                      'Congratulations! You passed the final exam. Your course is now 100% complete. You cannot retake the exam. Download your certificate below, then continue for your congratulations.'
                  : attemptsLeft > 0
                    ? `This attempt was recorded (attempt ${attemptsUsed} of ${MAX_FINAL_EXAM_ATTEMPTS}). You need ${FINAL_EXAM_PASS_PERCENT}% to pass. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
                    : `This attempt was recorded. You've used all ${MAX_FINAL_EXAM_ATTEMPTS} attempts. You can continue to course completion, but a certificate is not available. You cannot take the exam again.`}
              </p>
              {passed && (
                <Button
                  variant="outline"
                  className="w-full border-violet-300 text-violet-700 hover:bg-violet-50"
                  disabled={isGeneratingCertificate}
                  onClick={() => handleDownloadCertificate(score, new Date().toISOString())}
                >
                  {isGeneratingCertificate ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating certificate…
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Download certificate again
                    </>
                  )}
                </Button>
              )}
              {!passed && attemptsLeft > 0 && (
                <Button variant="outline" onClick={handleTryAgain} className="w-full">
                  Try again
                </Button>
              )}
              <Button onClick={onComplete} className="w-full" disabled={isGeneratingCertificate}>
                Continue to course completion
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!exam || !exam.questions?.length) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-slate-600">Unable to load the final exam. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const mcCount = exam.questions.filter((q) => q.type === 'multiple-choice').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-violet-600" />
            Final exam: {course.title}
          </h1>
          <p className="text-slate-600 mt-1">
            {mcCount} multiple-choice questions based on this course
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <p className="text-sm text-slate-600">{exam.instructions}</p>
          <Progress value={exam.passingScore ?? FINAL_EXAM_PASS_PERCENT} className="h-2 mt-2" />
          <p className="text-xs text-slate-500 mt-1">
            Pass mark: {exam.passingScore ?? FINAL_EXAM_PASS_PERCENT}% • Attempts left: {Math.max(0, MAX_FINAL_EXAM_ATTEMPTS - attemptsUsed)} of {MAX_FINAL_EXAM_ATTEMPTS}
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-8">
        {exam.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <p className="font-medium text-slate-900">{q.question}</p>
                  <span className="text-xs text-slate-500 capitalize">{q.type}</span>
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={(answers[q.id] || '') === opt}
                            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                            className="rounded-full border-slate-300 text-violet-600"
                          />
                          <span className="text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'true-false' && (
                    <div className="space-y-2">
                      {['True', 'False'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={(answers[q.id] || '') === opt}
                            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                            className="rounded-full border-slate-300 text-violet-600"
                          />
                          <span className="text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end sticky bottom-4">
        {submitError && (
          <div className="mr-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {submitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Submitting…
            </>
          ) : (
            'Submit final exam'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FinalExamView;
