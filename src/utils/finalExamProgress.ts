/** Pass mark for the course final exam (percent). */
export const FINAL_EXAM_PASS_PERCENT = 80;

export type FinalExamProgressFields = {
  finalExamScore?: number;
  finalExamLatestScore?: number;
  finalExamPassedScore?: number;
  finalExamPassed?: boolean;
  finalExamPassedAt?: string;
  finalExamSubmittedAt?: string;
  certificateIssuedAt?: string;
  courseProgress?: { status?: string; progressPercentage?: number };
  finalExamReview?: { score?: number };
  lessonProgress?: Array<{ lessonId?: string; completed?: boolean }>;
};

export type LearnerCourseProgressStats = {
  totalLessons: number;
  completedLessons: number;
  totalUnits: number;
  completedUnits: number;
  progressPercentage: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  allLessonsDone: boolean;
  examPassed: boolean;
};

/** True if the learner has passed the final exam for this course. */
export function hasPassedFinalExam(progress: FinalExamProgressFields | null | undefined): boolean {
  if (!progress) return false;
  if (progress.finalExamPassed === true) return true;
  if (progress.certificateIssuedAt) return true;
  if (
    typeof progress.finalExamPassedScore === 'number' &&
    progress.finalExamPassedScore >= FINAL_EXAM_PASS_PERCENT
  ) {
    return true;
  }
  if (
    typeof progress.finalExamScore === 'number' &&
    progress.finalExamScore >= FINAL_EXAM_PASS_PERCENT
  ) {
    return true;
  }
  return false;
}

/**
 * Progress shown to learners. Passing the final exam always counts as 100% complete,
 * even if a few lesson IDs no longer match after a course edit.
 */
export function computeLearnerCourseProgress(
  course: {
    units?: { id?: string | number; lessons?: { id?: string | number }[] }[];
  } | null | undefined,
  progress: FinalExamProgressFields | null | undefined
): LearnerCourseProgressStats {
  const units = course?.units || [];
  const allLessonIds = units.flatMap((unit) =>
    (unit.lessons || [])
      .map((lesson) => String(lesson.id ?? '').trim())
      .filter(Boolean)
  );
  const totalLessons = allLessonIds.length;
  const totalUnits = units.length;
  const completedSet = new Set(
    (progress?.lessonProgress || [])
      .filter((lp) => lp.completed && lp.lessonId && !String(lp.lessonId).startsWith('unit-quiz-'))
      .map((lp) => String(lp.lessonId))
  );
  let completedLessons = allLessonIds.filter((id) => completedSet.has(id)).length;
  let completedUnits = units.filter((unit) => {
    const lessons = unit.lessons || [];
    if (lessons.length === 0) return false;
    return lessons.every((lesson) => completedSet.has(String(lesson.id ?? '').trim()));
  }).length;

  const examPassed = hasPassedFinalExam(progress);
  const allLessonsDone = totalLessons > 0 && completedLessons >= totalLessons;

  if (examPassed) {
    return {
      totalLessons,
      completedLessons: totalLessons,
      totalUnits,
      completedUnits: totalUnits,
      progressPercentage: 100,
      status: 'Completed',
      allLessonsDone: true,
      examPassed: true,
    };
  }

  const progressPercentage =
    totalLessons > 0
      ? allLessonsDone
        ? 99
        : Math.round((completedLessons / totalLessons) * 100)
      : 0;

  return {
    totalLessons,
    completedLessons,
    totalUnits,
    completedUnits,
    progressPercentage,
    status: progressPercentage > 0 ? 'In Progress' : 'Not Started',
    allLessonsDone,
    examPassed: false,
  };
}

/** Score shown in grades and completion UI (preserves pass after a later failed attempt). */
export function getFinalExamDisplayScore(
  progress: FinalExamProgressFields | null | undefined
): number | undefined {
  if (!progress) return undefined;
  if (hasPassedFinalExam(progress)) {
    if (typeof progress.finalExamPassedScore === 'number') return progress.finalExamPassedScore;
    if (typeof progress.finalExamScore === 'number' && progress.finalExamScore >= FINAL_EXAM_PASS_PERCENT) {
      return progress.finalExamScore;
    }
    if (
      typeof progress.finalExamReview?.score === 'number' &&
      progress.finalExamReview.score >= FINAL_EXAM_PASS_PERCENT
    ) {
      return progress.finalExamReview.score;
    }
  }
  if (typeof progress.finalExamLatestScore === 'number') return progress.finalExamLatestScore;
  if (typeof progress.finalExamScore === 'number') return progress.finalExamScore;
  return undefined;
}

/** Date shown for final exam result (pass date if passed, else latest attempt). */
export function getFinalExamDisplayDate(
  progress: FinalExamProgressFields | null | undefined
): string | undefined {
  if (!progress) return undefined;
  if (hasPassedFinalExam(progress)) {
    return progress.finalExamPassedAt || progress.finalExamSubmittedAt || progress.certificateIssuedAt;
  }
  return progress.finalExamSubmittedAt;
}
