import { persistentProgressService } from './persistentProgressService';
import { DatabaseService } from '@/firebase/database';
import type { LessonProgress, StudentProgressData } from './persistentProgressService';
import {
  FINAL_EXAM_PASS_PERCENT,
  getFinalExamDisplayScore,
  hasPassedFinalExam,
} from '@/utils/finalExamProgress';
import {
  buildCourseTitleMap,
  getCourseDisplayName,
  resolveLessonDisplayName,
} from '@/utils/courseDisplayName';
const MAX_FINAL_EXAM_ATTEMPTS = 5;
const MAX_FAILED_QUESTIONS_IN_AI_CONTEXT = 8;

export interface LearnerProgressSummary {
  /** Human-readable summary for the AI tutor (e.g. for system prompt) */
  summaryForAI: string;
  /** Short one-line for greeting (e.g. "45% through your courses") */
  greetingLine: string;
  /** Average progress 0–100 across enrolled courses (lessons + exam completion) */
  overallPercent: number;
  /** Number of enrolled courses included in the summary */
  courseCount: number;
  /** Courses where the learner passed the final exam (or has a certificate) */
  coursesCompleted: number;
  /** Average quiz score % across all quizzes taken (null if none) */
  avgQuizScorePercent: number | null;
  /** Per-course progress for UI or detailed context */
  byCourse: {
    courseId: string;
    title: string;
    percent: number;
    status: string;
    lessonsCompleted: number;
    totalLessons: number;
    finalExamPassed: boolean;
    finalExamScore: number | null;
    certificateIssued: boolean;
    avgQuizScore: number | null;
  }[];
}

const GREETING_SESSION_KEY = 'learner_ai_greeting_shown';

function getLessonTitle(
  course: { units?: { lessons?: { id: string; title?: string }[] }[] } | null,
  lessonId: string
): string {
  return resolveLessonDisplayName(lessonId, course).lessonTitle;
}

/** Readable final-exam snapshot for AI tutor (pass/fail, attempts, what happened). */
export function formatFinalExamDetailsForChat(
  progress: StudentProgressData | null,
  courseTitle: string
): string {
  if (!progress) {
    return `Course "${courseTitle}": no progress record yet — final exam not taken.`;
  }

  const attempts = progress.finalExamAttempts ?? 0;
  const score = getFinalExamDisplayScore(progress);
  const latestScore = progress.finalExamLatestScore ?? progress.finalExamScore;
  const submittedAt = progress.finalExamSubmittedAt;
  const certIssued = !!progress.certificateIssuedAt;
  const coursePct = progress.courseProgress?.progressPercentage ?? 0;
  const totalLessons = progress.courseProgress?.totalLessons ?? 0;
  const completedLessons = progress.courseProgress?.completedLessons ?? 0;
  const lessonsDone =
    totalLessons > 0 && completedLessons >= totalLessons;
  const examPendingFromLessons = lessonsDone || coursePct >= 99;

  if (attempts === 0 && typeof score !== 'number') {
    if (examPendingFromLessons) {
      return [
        `Course "${courseTitle}": FINAL EXAM NOT STARTED.`,
        `All lessons are complete (${completedLessons}/${totalLessons}, ${coursePct}% course progress).`,
        `The learner must take the 30-question final exam (pass mark ${FINAL_EXAM_PASS_PERCENT}%) to finish the course and earn a certificate.`,
      ].join(' ');
    }
    return `Course "${courseTitle}": final exam not taken yet (${coursePct}% through lessons).`;
  }

  const passed = hasPassedFinalExam(progress);
  const attemptsLeft = Math.max(0, MAX_FINAL_EXAM_ATTEMPTS - attempts);
  const noAttemptsLeft = attempts >= MAX_FINAL_EXAM_ATTEMPTS && !passed;

  let resultLabel: string;
  if (certIssued || (passed && submittedAt)) {
    resultLabel = 'PASSED — certificate issued or available';
  } else if (passed) {
    resultLabel = 'PASSED';
  } else if (noAttemptsLeft) {
    resultLabel = 'NOT PASSED — all exam attempts used';
  } else {
    resultLabel = 'NOT PASSED — can retry';
  }

  const lines: string[] = [
    `Course "${courseTitle}" final exam: ${resultLabel}.`,
    `Score for pass/grades: ${typeof score === 'number' ? `${score}%` : 'unknown'}${typeof latestScore === 'number' && latestScore !== score ? ` (latest attempt: ${latestScore}%)` : ''} (pass ${FINAL_EXAM_PASS_PERCENT}%).`,
    `Attempts used: ${attempts}/${MAX_FINAL_EXAM_ATTEMPTS}${attemptsLeft > 0 && !passed ? ` (${attemptsLeft} left)` : ''}.`,
  ];
  if (submittedAt) {
    lines.push(`Last submitted: ${new Date(submittedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}.`);
  }

  const review = progress.finalExamReview;
  const allQuestions = review?.allQuestions ?? [];
  const failedQuestions = review?.failedQuestions ?? [];
  if (allQuestions.length > 0) {
    const correct = allQuestions.filter((q) => q.isCorrect).length;
    lines.push(`Last attempt breakdown: ${correct}/${allQuestions.length} questions correct.`);
  }

  const toShow =
    failedQuestions.length > 0
      ? failedQuestions
      : allQuestions.filter((q) => !q.isCorrect);
  if (toShow.length > 0) {
    const capped = toShow.slice(0, MAX_FAILED_QUESTIONS_IN_AI_CONTEXT);
    const missed = capped
      .map(
        (q, i) =>
          `Q${i + 1}: "${q.question}" — learner chose "${q.selectedAnswer}", correct was "${q.correctAnswer}"`
      )
      .join('; ');
    lines.push(`Questions to review: ${missed}${toShow.length > capped.length ? ` (+${toShow.length - capped.length} more)` : ''}.`);
  }

  const topics = review?.suggestedReviewTopics ?? [];
  if (topics.length > 0) {
    lines.push(`Weak topics to revisit: ${topics.join('; ')}.`);
  }

  return lines.join('\n');
}

function buildFinalExamLinesForSummary(
  title: string,
  fullProgress: StudentProgressData,
  coursePercent: number
): string[] {
  const lines: string[] = [];
  const examAttempts = fullProgress.finalExamAttempts ?? 0;
  const examScore = getFinalExamDisplayScore(fullProgress);
  const certIssued = !!fullProgress.certificateIssuedAt;
  const submittedAt = fullProgress.finalExamSubmittedAt;
  const totalLessons = fullProgress.courseProgress?.totalLessons ?? 0;
  const completedLessons = fullProgress.courseProgress?.completedLessons ?? 0;
  const lessonsDone = totalLessons > 0 && completedLessons >= totalLessons;
  const examPending = lessonsDone || coursePercent >= 99;

  if (examAttempts === 0 && typeof examScore !== 'number') {
    if (examPending) {
      lines.push(
        `"${title}": FINAL EXAM NOT STARTED (lessons complete, ${coursePercent}% progress). Learner still needs to take the final exam (pass ${FINAL_EXAM_PASS_PERCENT}%).`
      );
    }
    return lines;
  }

  const passed = hasPassedFinalExam(fullProgress);
  const attemptsLeft = Math.max(0, MAX_FINAL_EXAM_ATTEMPTS - examAttempts);
  const exhausted = examAttempts >= MAX_FINAL_EXAM_ATTEMPTS && !passed;

  if (certIssued) {
    lines.push(
      `"${title}": FINAL EXAM PASSED (${examScore}%), certificate issued${submittedAt ? ` on ${submittedAt.split('T')[0]}` : ''}.`
    );
  } else if (passed) {
    lines.push(`"${title}": FINAL EXAM PASSED (${examScore}%). Certificate can be issued.`);
  } else if (exhausted) {
    lines.push(
      `"${title}": FINAL EXAM NOT PASSED — used all ${MAX_FINAL_EXAM_ATTEMPTS} attempts. Latest score ${examScore ?? '—'}% (need ${FINAL_EXAM_PASS_PERCENT}%). No more attempts; certificate not available.`
    );
  } else {
    lines.push(
      `"${title}": FINAL EXAM NOT PASSED — ${examAttempts} attempt(s), latest score ${examScore ?? '—'}% (need ${FINAL_EXAM_PASS_PERCENT}%). ${attemptsLeft} attempt(s) remaining. Help them review before the next try.`
    );
  }

  const reviewTopics = fullProgress.finalExamReview?.suggestedReviewTopics || [];
  const failedQuestions = fullProgress.finalExamReview?.failedQuestions || [];
  const allQuestions = fullProgress.finalExamReview?.allQuestions || [];

  if (allQuestions.length > 0) {
    const correct = allQuestions.filter((q) => q.isCorrect).length;
    lines.push(`"${title}" last exam: ${correct}/${allQuestions.length} correct.`);
  }

  const missed = (failedQuestions.length > 0 ? failedQuestions : allQuestions.filter((q) => !q.isCorrect)).slice(
    0,
    MAX_FAILED_QUESTIONS_IN_AI_CONTEXT
  );
  if (missed.length > 0) {
    const failedDetails = missed
      .map((f) => `"${f.question}" (chose: ${f.selectedAnswer}; correct: ${f.correctAnswer})`)
      .join('; ');
    lines.push(`"${title}" missed questions: ${failedDetails}.`);
  }

  if (reviewTopics.length > 0) {
    lines.push(`"${title}": revise — ${reviewTopics.join('; ')}.`);
  }

  return lines;
}

type CourseLike = {
  title?: string;
  units?: { lessons?: { id: string; title?: string }[] }[];
};

function countLessons(course: CourseLike | null): number {
  return course?.units?.flatMap((u) => u.lessons || []).length ?? 0;
}

function countCompletedLessons(
  course: CourseLike | null,
  lessonProgressList: LessonProgress[]
): number {
  const allLessons = course?.units?.flatMap((u) => u.lessons || []) ?? [];
  if (allLessons.length === 0) {
    return lessonProgressList.filter((lp) => lp.completed).length;
  }
  const completedIds = new Set(
    lessonProgressList.filter((lp) => lp.completed).map((lp) => lp.lessonId)
  );
  return allLessons.filter((l) => completedIds.has(l.id)).length;
}

function averageQuizScore(lessonProgressList: LessonProgress[]): number | null {
  const scores = lessonProgressList
    .filter((lp) => typeof lp.score === 'number')
    .map((lp) => lp.score as number);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function getEffectiveCourseSnapshot(
  courseId: string,
  course: CourseLike | null,
  fullProgress: StudentProgressData | null,
  titleMap: Map<string, string>
): LearnerProgressSummary['byCourse'][number] {
  const title = getCourseDisplayName(courseId, titleMap, course);
  const totalLessons = countLessons(course);
  const lessonsCompleted = countCompletedLessons(course, fullProgress?.lessonProgress ?? []);
  const passed = hasPassedFinalExam(fullProgress ?? undefined);
  const certificateIssued = !!fullProgress?.certificateIssuedAt;
  const finalExamScore = getFinalExamDisplayScore(fullProgress ?? undefined) ?? null;
  const avgQuizScore = averageQuizScore(fullProgress?.lessonProgress ?? []);

  let percent: number;
  let status: string;

  if (passed || certificateIssued) {
    percent = 100;
    status = 'Completed';
  } else if (totalLessons > 0) {
    if (lessonsCompleted >= totalLessons) {
      percent = 99;
      status = 'Awaiting final exam';
    } else {
      percent = Math.round((lessonsCompleted / totalLessons) * 100);
      status = fullProgress?.courseProgress?.status ?? 'In Progress';
    }
  } else {
    percent = fullProgress?.courseProgress?.progressPercentage ?? 0;
    status = fullProgress?.courseProgress?.status ?? (percent > 0 ? 'In Progress' : 'Not started');
  }

  return {
    courseId,
    title,
    percent,
    status,
    lessonsCompleted,
    totalLessons,
    finalExamPassed: passed,
    finalExamScore,
    certificateIssued,
    avgQuizScore,
  };
}

/**
 * Fetches learner progress and builds a summary string for the GenAI agent.
 * Uses enrollments + repaired studentProgress (same source as the dashboard and grades tab).
 */
export async function getLearnerProgressSummary(studentId: string): Promise<LearnerProgressSummary> {
  const [enrollments, allProgressMap] = await Promise.all([
    DatabaseService.getEnrollments({ studentId }).catch(() => []),
    persistentProgressService.getAllStudentProgress(studentId),
  ]);

  const activeEnrollments = enrollments.filter(
    (e) => e.status !== 'Dropped' && e.status !== 'Suspended'
  );
  const courseIds = [
    ...new Set([
      ...activeEnrollments.map((e) => e.courseId),
      ...Object.keys(allProgressMap),
    ]),
  ];

  const titleMap = await buildCourseTitleMap(studentId, courseIds);

  const byCourse: LearnerProgressSummary['byCourse'] = [];
  const quizLines: string[] = [];
  const finalExamLines: string[] = [];
  const struggling: string[] = [];
  let totalPercent = 0;
  let coursesCompleted = 0;
  const allQuizScores: number[] = [];

  for (const courseId of courseIds) {
    const [course, fullProgress] = await Promise.all([
      DatabaseService.getCourse(courseId).catch(() => null),
      persistentProgressService.getStudentProgress(studentId, courseId),
    ]);

    const snapshot = getEffectiveCourseSnapshot(courseId, course, fullProgress, titleMap);
    byCourse.push(snapshot);
    totalPercent += snapshot.percent;
    if (snapshot.finalExamPassed || snapshot.certificateIssued) {
      coursesCompleted += 1;
    }

    finalExamLines.push(
      ...buildFinalExamLinesForSummary(snapshot.title, fullProgress ?? {
        studentId,
        courseId,
        courseProgress: {
          courseId,
          studentId,
          totalLessons: snapshot.totalLessons,
          completedLessons: snapshot.lessonsCompleted,
          totalUnits: 0,
          completedUnits: 0,
          currentUnitIndex: 0,
          progressPercentage: snapshot.percent,
          lastAccessedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          status: snapshot.status,
          timeSpent: 0,
        },
        lessonProgress: [],
      }, snapshot.percent)
    );

    const lessonProgressList = (fullProgress?.lessonProgress || []) as LessonProgress[];
    const withScores = lessonProgressList.filter((lp) => typeof lp.score === 'number');
    for (const lp of withScores) {
      allQuizScores.push(lp.score as number);
      const lessonTitle = getLessonTitle(course, lp.lessonId);
      const attempts = lp.attempts ?? 1;
      const quizPassed = Boolean(lp.completed);
      if (quizPassed) {
        quizLines.push(
          `"${snapshot.title}" – ${lessonTitle}: quiz ${lp.score}% (passed${attempts > 1 ? ` on attempt ${attempts}` : ''})`
        );
      } else {
        quizLines.push(
          `"${snapshot.title}" – ${lessonTitle}: quiz ${lp.score}% (attempt ${attempts}, not yet passed)`
        );
      }
      const score = typeof lp.score === 'number' ? lp.score : null;
      if (!quizPassed && score !== null && score < 70) {
        struggling.push(
          `"${snapshot.title}" – ${lessonTitle} (quiz ${score}%, attempt ${attempts}, not yet passed)`
        );
      } else if (attempts > 1 && !quizPassed) {
        struggling.push(
          `"${snapshot.title}" – ${lessonTitle} (attempt ${attempts}, not yet passed)`
        );
      }
    }
  }

  const courseCount = byCourse.length;
  const overallPercent = courseCount > 0 ? Math.round(totalPercent / courseCount) : 0;
  const avgQuizScorePercent =
    allQuizScores.length > 0
      ? Math.round(allQuizScores.reduce((sum, s) => sum + s, 0) / allQuizScores.length)
      : null;

  const perCourseLines = byCourse.map((c) => {
    const lessonPart =
      c.totalLessons > 0 ? `Lessons ${c.lessonsCompleted}/${c.totalLessons}.` : '';
    const quizPart =
      c.avgQuizScore != null ? `Quiz average ${c.avgQuizScore}%.` : 'No quizzes taken yet.';
    const examPart = c.finalExamPassed
      ? `Final exam PASSED${c.finalExamScore != null ? ` (${c.finalExamScore}%)` : ''}${c.certificateIssued ? ', certificate issued' : ''}.`
      : c.percent >= 99
        ? 'All lessons done — final exam not passed yet.'
        : 'Final exam not started or not passed.';
    return `"${c.title}": ${c.percent}% (${c.status}). ${lessonPart} ${quizPart} ${examPart}`.trim();
  });

  let summaryForAI =
    courseCount === 0
      ? 'The learner has not enrolled in any courses yet.'
      : [
          `AUTHORITATIVE learner progress (trust these numbers exactly — do not guess or contradict them):`,
          `Enrolled in ${courseCount} course(s). ${coursesCompleted} fully completed (passed final exam). Average progress across courses: ${overallPercent}%.`,
          avgQuizScorePercent != null ? `Average quiz score across all quizzes: ${avgQuizScorePercent}%.` : '',
          `Per course (always use these course titles — never internal ids): ${perCourseLines.join(' | ')}`,
        ]
          .filter(Boolean)
          .join(' ');

  if (quizLines.length > 0) {
    summaryForAI += ` Quiz results: ${quizLines.join('; ')}.`;
  }

  if (finalExamLines.length > 0) {
    summaryForAI += ` Final exam details: ${finalExamLines.join(' ')}.`;
  }

  if (struggling.length > 0) {
    summaryForAI += ` Areas that may benefit from one-on-one tutoring: ${struggling.join('; ')}.`;
  }

  let greetingLine: string;
  if (courseCount === 0) {
    greetingLine = 'ready to start your first course when you are.';
  } else if (coursesCompleted === courseCount && courseCount > 0) {
    greetingLine = 'all caught up on your courses. Great work!';
  } else if (coursesCompleted > 0) {
    greetingLine = `${coursesCompleted} of ${courseCount} courses complete (${overallPercent}% average progress).`;
  } else {
    greetingLine = `${overallPercent}% through your courses.`;
  }

  return {
    summaryForAI,
    greetingLine,
    overallPercent,
    courseCount,
    coursesCompleted,
    avgQuizScorePercent,
    byCourse,
  };
}

/**
 * Whether we should show the AI greeting popout this session (once per session).
 */
export function shouldShowLearnerGreeting(): boolean {
  try {
    return sessionStorage.getItem(GREETING_SESSION_KEY) !== 'true';
  } catch {
    return true;
  }
}

/**
 * Mark that the learner has seen the AI greeting this session.
 */
export function markLearnerGreetingShown(): void {
  try {
    sessionStorage.setItem(GREETING_SESSION_KEY, 'true');
  } catch {
    // ignore
  }
}
