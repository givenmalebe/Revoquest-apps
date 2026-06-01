export type GradableQuestion = {
  type?: string;
  options?: string[];
  correctAnswer?: string | string[] | boolean | number | null;
  points?: number;
};

const LETTER_TO_INDEX: Record<string, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5
};

export const normalizeAnswerText = (value: unknown): string => {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/^[\s"'`]*(?:option\s*)?[a-f](?:[\).:\-\s]+|$)/i, '')
    .replace(/^[\s"'`]*(?:answer\s*[:\-]\s*)/i, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const normalizeBooleanAnswer = (value: unknown): 'true' | 'false' | null => {
  const text = String(value ?? '').trim().toLowerCase();
  if (['true', 't', 'yes', 'y', '1'].includes(text)) return 'true';
  if (['false', 'f', 'no', 'n', '0'].includes(text)) return 'false';
  return null;
};

const optionIndexFromAnswer = (answer: unknown, options: string[] = []): number | null => {
  const raw = String(answer ?? '').trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  if (/^[a-f]$/.test(lower)) return LETTER_TO_INDEX[lower] ?? null;
  if (/^[0-9]+$/.test(lower)) {
    const numericIndex = Number(lower);
    if (numericIndex >= 0 && numericIndex < options.length) return numericIndex;
    if (numericIndex >= 1 && numericIndex <= options.length) return numericIndex - 1;
  }

  const letterPrefix = lower.match(/^(?:option\s*)?([a-f])[\).:\-\s]+/);
  if (letterPrefix?.[1]) {
    const idx = LETTER_TO_INDEX[letterPrefix[1]];
    if (idx !== undefined && idx < options.length) return idx;
  }

  const normalized = normalizeAnswerText(raw);
  const exactIndex = options.findIndex(option => normalizeAnswerText(option) === normalized);
  if (exactIndex !== -1) return exactIndex;

  const containsIndex = options.findIndex(option => {
    const normalizedOption = normalizeAnswerText(option);
    return normalizedOption.length > 0 && (normalized.includes(normalizedOption) || normalizedOption.includes(normalized));
  });

  return containsIndex === -1 ? null : containsIndex;
};

export const getDisplayCorrectAnswer = (question: GradableQuestion): string => {
  const answer = Array.isArray(question.correctAnswer)
    ? question.correctAnswer[0]
    : question.correctAnswer;
  const optionIndex = optionIndexFromAnswer(answer, question.options || []);
  if (optionIndex !== null && question.options?.[optionIndex]) {
    return question.options[optionIndex];
  }
  return String(answer ?? '').trim();
};

export const isAnswerCorrect = (question: GradableQuestion, userAnswer: unknown): boolean => {
  const answers = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [question.correctAnswer];

  if (question.type === 'true-false') {
    const userBoolean = normalizeBooleanAnswer(userAnswer);
    return answers.some(answer => userBoolean !== null && userBoolean === normalizeBooleanAnswer(answer));
  }

  if (question.type === 'multiple-choice') {
    const userIndex = optionIndexFromAnswer(userAnswer, question.options || []);
    return answers.some(answer => {
      const correctIndex = optionIndexFromAnswer(answer, question.options || []);
      if (userIndex !== null && correctIndex !== null) return userIndex === correctIndex;
      return normalizeAnswerText(userAnswer) === normalizeAnswerText(answer);
    });
  }

  if (question.type === 'short-answer') {
    const normalizedUserAnswer = normalizeAnswerText(userAnswer);
    return answers.some(answer => {
      const normalizedCorrectAnswer = normalizeAnswerText(answer);
      return normalizedCorrectAnswer.length > 0 && normalizedUserAnswer.includes(normalizedCorrectAnswer);
    });
  }

  return answers.some(answer => normalizeAnswerText(userAnswer) === normalizeAnswerText(answer));
};

export const gradeQuestions = <T extends GradableQuestion & { id: string }>(
  questions: T[],
  answers: Record<string, string>
) => {
  let totalPoints = 0;
  let earnedPoints = 0;
  const correctByQuestionId: Record<string, boolean> = {};

  questions.forEach(question => {
    const points = typeof question.points === 'number' ? question.points : 1;
    totalPoints += points;
    const correct = isAnswerCorrect(question, answers[question.id]);
    correctByQuestionId[question.id] = correct;
    if (correct) earnedPoints += points;
  });

  return {
    totalPoints,
    earnedPoints,
    correctByQuestionId,
    percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  };
};
