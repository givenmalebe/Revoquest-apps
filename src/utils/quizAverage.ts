/** Minimum average across unit quizzes required to unlock the final exam. */
export const QUIZ_AVERAGE_FOR_EXAM_PERCENT = 75;

export type QuizAverageResult = {
  average: number | null;
  taken: number;
  required: number;
  meetsThreshold: boolean;
};

function unitQuizAttemptId(unitId: unknown): string {
  return `unit-quiz-${unitId}`;
}

function hasUsableQuiz(unit: { quizContent?: { questions?: unknown[] } } | null | undefined): boolean {
  return Boolean(unit?.quizContent?.questions?.length);
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Unit quiz IDs that must be included in the exam-unlock average. */
export function getRequiredUnitQuizIds(course: {
  units?: { id?: unknown; quizContent?: { questions?: unknown[] } }[];
  modules?: { id?: unknown; quizContent?: { questions?: unknown[] } }[];
} | null | undefined): string[] {
  const units = course?.units?.length ? course.units : course?.modules || [];
  return units.filter(hasUsableQuiz).map((unit) => unitQuizAttemptId(unit.id));
}

/**
 * Average of all unit quizzes for a course.
 * Missing quizzes keep the exam locked. Courses with no unit quizzes stay unlocked.
 */
export function getQuizAverageForExam(
  course: {
    units?: { id?: unknown; quizContent?: { questions?: unknown[] } }[];
    modules?: { id?: unknown; quizContent?: { questions?: unknown[] } }[];
  } | null | undefined,
  lessonProgress: { lessonId?: unknown; score?: number }[] | null | undefined
): QuizAverageResult {
  const requiredIds = getRequiredUnitQuizIds(course);
  const progress = lessonProgress || [];

  const scoreById = new Map<string, number>();
  for (const entry of progress) {
    if (typeof entry.score !== 'number' || entry.lessonId == null) continue;
    scoreById.set(String(entry.lessonId), entry.score);
  }

  if (requiredIds.length > 0) {
    const scores = requiredIds.map((id) => {
      if (scoreById.has(id)) return scoreById.get(id) as number;
      const unitId = id.replace(/^unit-quiz-/, '');
      return scoreById.get(`unit-quiz-${unitId}`) ?? null;
    });
    const takenScores = scores.filter((score): score is number => score != null);
    const average =
      takenScores.length > 0
        ? roundOneDecimal(takenScores.reduce((sum, score) => sum + score, 0) / takenScores.length)
        : null;
    return {
      average,
      taken: takenScores.length,
      required: requiredIds.length,
      meetsThreshold:
        takenScores.length >= requiredIds.length &&
        average != null &&
        average >= QUIZ_AVERAGE_FOR_EXAM_PERCENT,
    };
  }

  const fallbackScores = progress
    .filter((entry) => typeof entry.score === 'number')
    .map((entry) => entry.score as number);
  if (fallbackScores.length === 0) {
    return { average: null, taken: 0, required: 0, meetsThreshold: true };
  }
  const average = roundOneDecimal(
    fallbackScores.reduce((sum, score) => sum + score, 0) / fallbackScores.length
  );
  return {
    average,
    taken: fallbackScores.length,
    required: fallbackScores.length,
    meetsThreshold: average >= QUIZ_AVERAGE_FOR_EXAM_PERCENT,
  };
}

export function quizAverageLockMessage(result: QuizAverageResult): string {
  if (result.required > 0 && result.taken < result.required) {
    return `Complete all unit quizzes first (${result.taken}/${result.required}). You need a ${QUIZ_AVERAGE_FOR_EXAM_PERCENT}% average to take the final exam.`;
  }
  const shown = result.average ?? 0;
  return `Your quiz average is ${shown}%. You need ${QUIZ_AVERAGE_FOR_EXAM_PERCENT}% across all unit quizzes to take the final exam. Retake quizzes from the course outline to raise your average.`;
}
