import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Play, Loader2, Download, ChevronLeft, ChevronRight, Target, CheckCircle } from 'lucide-react';
import SimplePDFView from './SimplePDFView';
import CourseContentRenderer from './CourseContentRenderer';
import type { PDFLearningResult } from '@/services/pdfLearningService';
import { lessonContentService, type QuizContent } from '@/services/lessonContentService';
import { gradeQuestions } from '@/utils/quizGrading';

interface PDFDocumentPanelProps {
  pdfFile: File;
  learningResult: PDFLearningResult | null;
  isGenerating: boolean;
  /** Compact mode for split view (no extra padding) */
  compact?: boolean;
}

export const PDFDocumentPanel: React.FC<PDFDocumentPanelProps> = ({
  pdfFile,
  learningResult,
  isGenerating,
  compact = false
}) => {
  const [pdfFileObj, setPdfFileObj] = useState<{ id: string; name: string; type: 'pdf'; url: string; size: number } | null>(null);
  const [textSectionIndex, setTextSectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lessonQuizzes, setLessonQuizzes] = useState<{ [key: string]: QuizContent }>({});
  const [generatingQuizFor, setGeneratingQuizFor] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [quizResults, setQuizResults] = useState<{ [key: string]: { score: number; showResults: boolean; correctByQuestionId: { [key: string]: boolean } } }>({});

  useEffect(() => {
    const url = URL.createObjectURL(pdfFile);
    setPdfFileObj({
      id: 'pdf-attached',
      name: pdfFile.name,
      type: 'pdf',
      url,
      size: pdfFile.size
    });
    return () => URL.revokeObjectURL(url);
  }, [pdfFile]);

  const lessons = learningResult?.lessons ?? [];
  const slides = learningResult?.slides ?? [];
  const currentLesson = lessons[textSectionIndex];
  const currentSlide = slides[slideIndex];

  const generateQuizForLesson = useCallback(async (lessonId: string, title: string, content: string) => {
    setGeneratingQuizFor(lessonId);
    try {
      const quiz = await lessonContentService.generateQuizFromLessonContent(title, content);
      setLessonQuizzes((q) => ({ ...q, [lessonId]: quiz }));
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setGeneratingQuizFor(null);
    }
  }, []);

  const handleQuizSubmit = useCallback((lessonId: string, quiz: QuizContent) => {
    const answers = quizAnswers[lessonId] ?? {};
    const { percentage: score, correctByQuestionId } = gradeQuestions(
      quiz.questions.map(question => ({ ...question, points: 1 })),
      answers
    );
    setQuizResults((r) => ({ ...r, [lessonId]: { score, showResults: true, correctByQuestionId } }));
  }, [quizAnswers]);

  return (
    <Tabs defaultValue="pdf" className="h-full flex flex-col min-h-0">
      <div className={compact ? 'p-2 border-b border-slate-200 dark:border-slate-800' : 'p-4 border-b border-slate-200 dark:border-slate-800'}>
        <TabsList className="w-full grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="pdf" className="gap-1.5 rounded-md text-xs sm:text-sm">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            pdf document
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-1.5 rounded-md text-xs sm:text-sm">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Text presentation
          </TabsTrigger>
          <TabsTrigger value="slides" className="gap-1.5 rounded-md text-xs sm:text-sm">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Slides presentation
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={compact ? 'flex-1 overflow-y-auto p-3' : 'flex-1 overflow-y-auto p-6'}>
        <TabsContent value="pdf" className="mt-0 h-full">
          {pdfFileObj && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
              <SimplePDFView file={pdfFileObj} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="mt-0 h-full">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Generating text presentation...</p>
            </div>
          ) : currentLesson ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold text-xs">
                    {textSectionIndex + 1}
                  </span>
                  <p className="text-xs text-slate-500 truncate">Section {textSectionIndex + 1} of {lessons.length}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 shrink-0" asChild>
                  <a href={pdfFileObj?.url} download={pdfFile.name} target="_blank" rel="noreferrer">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </Button>
              </div>
              <article className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                  <h1 className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-400 leading-tight">
                    {currentLesson.title}
                  </h1>
                </header>
                <div className="px-4 py-3 text-slate-700 dark:text-slate-300 text-sm">
                  <CourseContentRenderer content={currentLesson.content} />
                </div>
              </article>
              {/* Quiz after this section */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {lessonQuizzes[currentLesson.id] ? (
                  (() => {
                    const quiz = lessonQuizzes[currentLesson.id];
                    const result = quizResults[currentLesson.id];
                    const answers = quizAnswers[currentLesson.id] ?? {};
                    if (result?.showResults) {
                      return (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-slate-900 dark:text-white">Quiz: {result.score}%</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{result.score >= quiz.passingScore ? 'Passed' : `Passing: ${quiz.passingScore}%`}</p>
                          {result.score < quiz.passingScore && (
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => { setQuizResults((r) => ({ ...r, [currentLesson.id]: { score: 0, showResults: false, correctByQuestionId: {} } })); setQuizAnswers((a) => ({ ...a, [currentLesson.id]: {} })); }}>Try again</Button>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quiz</h3>
                        </div>
                        {quiz.questions.map((q, idx) => (
                          <div key={q.id} className="space-y-2">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Q{idx + 1}. {q.question}</p>
                            {q.options && (
                              <div className="space-y-1">
                                {q.options.map((opt) => (
                                  <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input type="radio" name={q.id} value={opt} checked={(answers[q.id] ?? '') === opt} onChange={(e) => setQuizAnswers((a) => ({ ...a, [currentLesson.id]: { ...(a[currentLesson.id] ?? {}), [q.id]: e.target.value } }))} className="rounded-full border-slate-300 text-orange-600" />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Button size="sm" onClick={() => handleQuizSubmit(currentLesson.id, quiz)} className="bg-orange-500 hover:bg-orange-600">Submit quiz</Button>
                      </div>
                    );
                  })()
                ) : generatingQuizFor === currentLesson.id ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating quiz...
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => generateQuizForLesson(currentLesson.id, currentLesson.title, currentLesson.content)} className="gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Add quiz after this section
                  </Button>
                )}
              </div>
              {lessons.length > 1 && (
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button variant="outline" size="sm" onClick={() => setTextSectionIndex((i) => Math.max(0, i - 1))} disabled={textSectionIndex === 0}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="text-xs text-slate-500 flex-1 text-center">{textSectionIndex + 1} / {lessons.length}</span>
                  <Button variant="outline" size="sm" onClick={() => setTextSectionIndex((i) => Math.min(lessons.length - 1, i + 1))} disabled={textSectionIndex >= lessons.length - 1}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
              <BookOpen className="w-10 h-10 mb-3 opacity-50" />
              <p>Content will be generated for this section...</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="slides" className="mt-0 h-full">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Generating Slides presentation...</p>
            </div>
          ) : currentSlide ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500">Slide {slideIndex + 1} / {slides.length}</p>
                <Button variant="outline" size="sm" className="gap-1.5 h-8" asChild>
                  <a href={pdfFileObj?.url} download={pdfFile.name} target="_blank" rel="noreferrer">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </Button>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 min-h-[300px] flex flex-col justify-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{currentSlide.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{currentSlide.content}</p>
                {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300 text-sm">
                    {currentSlide.bulletPoints.map((bp, i) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                )}
              </div>
              {slides.length > 1 && (
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setSlideIndex((i) => Math.max(0, i - 1))} disabled={slideIndex === 0}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="text-xs text-slate-500 flex-1 text-center">{slideIndex + 1} / {slides.length}</span>
                  <Button variant="outline" size="sm" onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))} disabled={slideIndex >= slides.length - 1}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
              <Play className="w-10 h-10 mb-3 opacity-50" />
              <p>Content will be generated for this slide...</p>
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default PDFDocumentPanel;
