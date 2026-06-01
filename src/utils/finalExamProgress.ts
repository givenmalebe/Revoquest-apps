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
  courseProgress?: { status?: string };
  finalExamReview?: { score?: number };
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
    progress.finalExamScore >= FINAL_EXAM_PASS_PERCENT &&
    progress.courseProgress?.status === 'Completed'
  ) {
    return true;
  }
  return false;
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
    if (typeof progress.finalExamReview?.score === 'number' && progress.finalExamReview.score >= FINAL_EXAM_PASS_PERCENT) {
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
