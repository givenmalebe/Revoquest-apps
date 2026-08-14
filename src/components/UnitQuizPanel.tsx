import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Trash2, Wand2, Plus, Save, CheckCircle } from 'lucide-react';
import type { QuizContent, QuizQuestion } from '@/services/lessonContentService';

export type UnitQuizLessonSource = {
  title: string;
  description?: string;
  content?: string;
  richTextContent?: string;
  objectives?: string[];
};

interface UnitQuizPanelProps {
  unitTitle: string;
  unitDescription?: string;
  lessons: UnitQuizLessonSource[];
  quizContent?: QuizContent | null;
  onChange: (quiz: QuizContent | null) => void;
}

export function UnitQuizPanel({
  unitTitle,
  unitDescription = '',
  lessons,
  quizContent,
  onChange,
}: UnitQuizPanelProps) {
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [questionCount, setQuestionCount] = useState(8);
  const [refineInstructions, setRefineInstructions] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const questions = quizContent?.questions || [];

  const flash = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(null), 3000);
  };

  const generateUnitQuiz = async () => {
    setGenerating(true);
    setError(null);
    try {
      const { lessonContentService } = await import('@/services/lessonContentService');
      const quiz = await lessonContentService.generateQuizFromUnitContent(
        unitTitle || 'Unit',
        unitDescription,
        lessons,
        questionCount
      );
      onChange(quiz);
      flash('Unit quiz generated');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate unit quiz');
    } finally {
      setGenerating(false);
    }
  };

  const refineUnitQuiz = async () => {
    if (!quizContent?.questions?.length) return;
    setRefining(true);
    setError(null);
    try {
      const { lessonContentService } = await import('@/services/lessonContentService');
      const quiz = await lessonContentService.refineQuizContent(
        unitTitle || 'Unit',
        quizContent,
        refineInstructions
      );
      onChange(quiz);
      flash('Unit quiz refined');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to refine unit quiz');
    } finally {
      setRefining(false);
    }
  };

  const updateQuestion = (questionId: string, patch: Partial<QuizQuestion>) => {
    if (!quizContent) return;
    const nextQuestions = quizContent.questions.map((q) =>
      q.id === questionId ? { ...q, ...patch } : q
    );
    const totalPoints = nextQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
    onChange({ ...quizContent, questions: nextQuestions, totalPoints });
  };

  const deleteQuestion = (questionId: string) => {
    if (!quizContent) return;
    if (!confirm('Delete this question?')) return;
    const nextQuestions = quizContent.questions.filter((q) => q.id !== questionId);
    if (nextQuestions.length === 0) {
      onChange(null);
      return;
    }
    const totalPoints = nextQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
    onChange({ ...quizContent, questions: nextQuestions, totalPoints });
  };

  const addBlankQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `uq${Date.now()}`,
      question: '',
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: '',
      points: 10,
    };
    if (!quizContent) {
      onChange({
        questions: [newQuestion],
        passingScore: 70,
        timeLimit: 20,
        totalPoints: 10,
        instructions: `Complete this unit quiz to verify your understanding of "${unitTitle}".`,
      });
    } else {
      const nextQuestions = [...quizContent.questions, newQuestion];
      onChange({
        ...quizContent,
        questions: nextQuestions,
        totalPoints: nextQuestions.reduce((sum, q) => sum + (q.points || 0), 0),
      });
    }
    setEditingQuestionId(newQuestion.id);
  };

  const deleteWholeQuiz = () => {
    if (!confirm('Delete the entire unit quiz?')) return;
    onChange(null);
    setEditingQuestionId(null);
  };

  return (
    <Card className="border-orange-200/80 bg-orange-50/40 dark:bg-orange-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TargetIcon />
          Unit Quiz
        </CardTitle>
        <CardDescription>
          One AI quiz for the whole unit. Generate, edit questions, delete, or refine with instructions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {status && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" />
            {status}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <Label className="text-xs">Questions</Label>
            <Input
              type="number"
              min={5}
              max={15}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(5, Math.min(15, Number(e.target.value) || 8)))}
              className="h-9"
            />
          </div>
          <Button
            type="button"
            onClick={generateUnitQuiz}
            disabled={generating || refining || lessons.length === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {generating ? (
              <>Generating…</>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {questions.length ? 'Regenerate unit quiz' : 'Generate unit quiz'}
              </>
            )}
          </Button>
          {questions.length > 0 && (
            <>
              <Button type="button" variant="outline" onClick={addBlankQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add question
              </Button>
              <Button type="button" variant="ghost" className="text-red-600" onClick={deleteWholeQuiz}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete quiz
              </Button>
            </>
          )}
        </div>

        {questions.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              {questions.length} questions • {quizContent?.passingScore ?? 70}% to pass
              {quizContent?.totalPoints != null ? ` • ${quizContent.totalPoints} points` : ''}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Refine with AI</Label>
              <Textarea
                value={refineInstructions}
                onChange={(e) => setRefineInstructions(e.target.value)}
                placeholder="e.g. Make questions harder, add more scenario-based items, fix unclear options…"
                rows={2}
              />
              <Button type="button" variant="outline" onClick={refineUnitQuiz} disabled={refining || generating}>
                {refining ? (
                  <>Refining…</>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Refine quiz
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {questions.map((q, index) => {
                const isEditing = editingQuestionId === q.id;
                const options = q.options || [];
                return (
                  <div key={q.id} className="rounded-lg border bg-white dark:bg-slate-900 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Q{index + 1}. {q.question || '(Untitled question)'}
                      </p>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                        >
                          {isEditing ? (
                            <>
                              <Save className="h-3.5 w-3.5 mr-1" />
                              Done
                            </>
                          ) : (
                            'Edit'
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          rows={2}
                        />
                        {options.map((opt, optIndex) => (
                          <Input
                            key={`${q.id}-opt-${optIndex}`}
                            value={opt}
                            onChange={(e) => {
                              const next = [...options];
                              next[optIndex] = e.target.value;
                              const patch: Partial<QuizQuestion> = { options: next };
                              if (q.correctAnswer === opt) patch.correctAnswer = e.target.value;
                              updateQuestion(q.id, patch);
                            }}
                          />
                        ))}
                        <div>
                          <Label className="text-xs">Correct answer</Label>
                          <Input
                            value={Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer || ''}
                            onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Explanation</Label>
                          <Textarea
                            value={q.explanation || ''}
                            onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 space-y-1">
                        {options.map((opt) => (
                          <div key={opt} className={opt === q.correctAnswer ? 'text-green-700 font-medium' : ''}>
                            {opt === q.correctAnswer ? '✓ ' : '• '}
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {questions.length === 0 && (
          <p className="text-sm text-slate-500">
            No unit quiz yet. Generate one after lesson content is ready.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TargetIcon() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600">
      <Sparkles className="h-4 w-4" />
    </span>
  );
}
