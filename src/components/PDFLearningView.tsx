import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, BookOpen, Play, Pause, Loader2, Download, ChevronLeft, ChevronRight, MessageCircle, Target, CheckCircle, ClipboardList, Mic, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { funnelPath } from '@/utils/funnelPath';
import SimplePDFView from './SimplePDFView';
import CourseContentRenderer from './CourseContentRenderer';
import CreativeCourseHTML from './CreativeCourseHTML';
import '@/styles/creative-course.css';
import type { PDFLearningResult } from '@/services/pdfLearningService';
import { generateContentForSlide, type GeneratedSlideContent } from '@/services/pdfLearningService';
import { useSlideNarration } from '@/hooks/useSlideNarration';
import { lessonContentService, type QuizContent } from '@/services/lessonContentService';
import { gradeQuestions } from '@/utils/quizGrading';

interface PDFLearningViewProps {
  pdfFile: File;
  learningResult: PDFLearningResult | null;
  isGenerating: boolean;
  onBackToChat: () => void;
  /** Shown when AI generation failed and document outline is displayed instead. */
  generationError?: string | null;
}

export const PDFLearningView: React.FC<PDFLearningViewProps> = ({
  pdfFile,
  learningResult,
  isGenerating,
  onBackToChat,
  generationError = null
}) => {
  const navigate = useNavigate();
  const [pdfFileObj, setPdfFileObj] = useState<{ id: string; name: string; type: 'pdf'; url: string; size: number } | null>(null);
  const [textSectionIndex, setTextSectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  /** Within current slide: one bullet/step at a time (Next advances step, then next slide). */
  const [panelIndex, setPanelIndex] = useState(0);
  const [lessonQuizzes, setLessonQuizzes] = useState<{ [key: string]: QuizContent }>({});
  /** Per-lesson quiz generation (multiple slides can build quizzes in parallel) */
  const [quizGenLoading, setQuizGenLoading] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [quizResults, setQuizResults] = useState<{ [key: string]: { score: number; showResults: boolean; correctByQuestionId: { [key: string]: boolean } } }>({});
  /** Per-slide AI content (generated when user selects that slide/topic) */
  const [slideContentByIndex, setSlideContentByIndex] = useState<
    Record<number, { loading: boolean; error?: string } & Partial<GeneratedSlideContent>>
  >({});
  const slideGenInFlight = React.useRef<Set<number>>(new Set());
  const slideCompletedRef = React.useRef<Set<number>>(new Set());
  const { playing: narrationPlaying, autoAdvanceRef, rate, setRate, pitch, setPitch, speak, stop: stopNarration } =
    useSlideNarration();
  const [autoAdvanceAfterNarration, setAutoAdvanceAfterNarration] = useState(false);

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

  useEffect(() => {
    slideCompletedRef.current = new Set();
    slideGenInFlight.current = new Set();
    setSlideContentByIndex({});
    setLessonQuizzes({});
    setQuizAnswers({});
    setQuizResults({});
    setQuizGenLoading({});
  }, [pdfFile.name, learningResult?.generatedByAI, learningResult?.slides?.length]);

  useEffect(() => {
    setPanelIndex(0);
  }, [slideIndex]);

  const lessons = learningResult?.lessons ?? [];
  const slides = learningResult?.slides ?? [];
  const courseLayout = learningResult?.courseLayout;
  const currentLesson = lessons[textSectionIndex];
  const currentSlide = slides[slideIndex];

  /** Sidebar groups when AI course has modules */
  const sidebarGroups = React.useMemo(() => {
    if (!learningResult?.generatedByAI || !slides.length) return null;
    const map = new Map<number, { moduleTitle: string; indices: number[] }>();
    slides.forEach((s, i) => {
      const idx = s.moduleIndex ?? 0;
      const title = s.moduleTitle ?? courseLayout?.modules[idx]?.title ?? `Part ${idx + 1}`;
      if (!map.has(idx)) map.set(idx, { moduleTitle: title, indices: [] });
      map.get(idx)!.indices.push(i);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([, g]) => g);
  }, [learningResult?.generatedByAI, slides, courseLayout?.modules]);

  const ensureSlideAIContent = useCallback(
    async (index: number) => {
      if (!learningResult?.generatedByAI || !courseLayout || !slides[index] || !learningResult.textContent) return;
      if (slideCompletedRef.current.has(index)) return;
      if (slideGenInFlight.current.has(index)) return;
      slideGenInFlight.current.add(index);
      setSlideContentByIndex((prev) => ({ ...prev, [index]: { ...(prev[index] ?? {}), loading: true, error: undefined } }));
      try {
        const out = await generateContentForSlide({
          excerpt: learningResult.textContent,
          fileName: pdfFile.name,
          course: courseLayout,
          slide: slides[index],
          slideIndex: index,
          totalSlides: slides.length
        });
        slideCompletedRef.current.add(index);
        setSlideContentByIndex((prev) => ({ ...prev, [index]: { ...out, loading: false } }));
        const lessonId = lessons[index]?.id ?? String(index + 1);
        const quizTitle = slides[index]?.title ?? `Topic ${index + 1}`;
            const quizSource = [
              out.plainText,
              ...(out.slidePanels ?? []).map((p) => `${p.bullet} ${p.body}`),
              out.slideDeckBody,
              ...(out.examples ?? [])
            ]
              .filter(Boolean)
              .join('\n\n');
        if (quizSource.length > 50) {
          setQuizGenLoading((m) => ({ ...m, [lessonId]: true }));
          try {
            const quiz = await lessonContentService.generateQuizFromLessonContent(quizTitle, quizSource);
            setLessonQuizzes((q) => ({ ...q, [lessonId]: quiz }));
          } catch (err) {
            console.error('Auto quiz failed for slide', index, err);
          } finally {
            setQuizGenLoading((m) => {
              const n = { ...m };
              delete n[lessonId];
              return n;
            });
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Generation failed';
        setSlideContentByIndex((prev) => ({ ...prev, [index]: { loading: false, error: msg } }));
      } finally {
        slideGenInFlight.current.delete(index);
      }
    },
    [learningResult, courseLayout, slides, pdfFile.name, lessons]
  );

  useEffect(() => {
    if (!learningResult?.generatedByAI || slides.length === 0) return;
    void ensureSlideAIContent(slideIndex);
  }, [learningResult?.generatedByAI, slideIndex, slides.length, ensureSlideAIContent]);

  const getSlidePanels = useCallback(
    (index: number) => {
      const s = slides[index];
      const gen = slideContentByIndex[index];
      if (gen?.slidePanels?.length)
        return gen.slidePanels as { bullet: string; body: string; imageDataUrl?: string | null }[];
      return [
        {
          bullet: s?.title ?? 'Topic',
          body:
            gen?.slideDeckBody ??
            s?.content ??
            'Open this topic again to regenerate with step-by-step slides.'
        }
      ];
    },
    [slides, slideContentByIndex]
  );

  const buildNarrationScriptForStep = useCallback(
    (slideIdx: number, stepIdx: number): string => {
      const s = slides[slideIdx];
      if (!s) return '';
      const panels = getSlidePanels(slideIdx);
      const p = panels[Math.min(stepIdx, panels.length - 1)];
      const parts: string[] = [
        `${s.title}. Step ${stepIdx + 1} of ${panels.length}.`,
        `${p.bullet}. ${p.body}`
      ];
      return parts.filter(Boolean).join(' ');
    },
    [slides, getSlidePanels]
  );

  const advanceAfterNarration = useCallback(
    (slideIdx: number, stepIdx: number) => {
      if (!autoAdvanceRef.current) return;
      const panels = getSlidePanels(slideIdx);
      if (stepIdx < panels.length - 1) {
        setPanelIndex(stepIdx + 1);
        window.setTimeout(() => {
          const script = buildNarrationScriptForStep(slideIdx, stepIdx + 1);
          if (script.length >= 20)
            speak(script, () => advanceAfterNarration(slideIdx, stepIdx + 1));
        }, 500);
        return;
      }
      if (slideIdx < slides.length - 1) {
        const next = slideIdx + 1;
        setSlideIndex(next);
        setTextSectionIndex(next);
        setPanelIndex(0);
        window.setTimeout(() => {
          const script = buildNarrationScriptForStep(next, 0);
          if (script.length >= 20)
            speak(script, () => advanceAfterNarration(next, 0));
        }, 600);
      }
    },
    [
      autoAdvanceRef,
      getSlidePanels,
      buildNarrationScriptForStep,
      speak,
      slides.length
    ]
  );

  const playNarrationForCurrentStep = useCallback(() => {
    const script = buildNarrationScriptForStep(slideIndex, panelIndex);
    if (script.length < 20) return;
    autoAdvanceRef.current = autoAdvanceAfterNarration;
    speak(script, () => advanceAfterNarration(slideIndex, panelIndex));
  }, [
    buildNarrationScriptForStep,
    slideIndex,
    panelIndex,
    speak,
    autoAdvanceAfterNarration,
    autoAdvanceRef,
    advanceAfterNarration
  ]);

  const goToSlide = useCallback(
    (index: number) => {
      stopNarration();
      setSlideIndex(index);
      setTextSectionIndex(index);
      setPanelIndex(0);
    },
    [stopNarration]
  );

  const goNextStep = useCallback(() => {
    stopNarration();
    const panels = getSlidePanels(slideIndex);
    if (panelIndex < panels.length - 1) setPanelIndex((i) => i + 1);
    else if (slideIndex < slides.length - 1) {
      setSlideIndex((i) => i + 1);
      setTextSectionIndex((i) => i + 1);
      setPanelIndex(0);
    }
  }, [stopNarration, getSlidePanels, slideIndex, panelIndex, slides.length]);

  const goPrevStep = useCallback(() => {
    stopNarration();
    if (panelIndex > 0) setPanelIndex((i) => i - 1);
    else if (slideIndex > 0) {
      const prev = slideIndex - 1;
      setSlideIndex(prev);
      setTextSectionIndex(prev);
      const prevPanels = getSlidePanels(prev);
      setPanelIndex(Math.max(0, prevPanels.length - 1));
    }
  }, [stopNarration, panelIndex, slideIndex, getSlidePanels]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateQuizForLesson = useCallback(async (lessonId: string, title: string, content: string) => {
    setQuizGenLoading((m) => ({ ...m, [lessonId]: true }));
    try {
      const quiz = await lessonContentService.generateQuizFromLessonContent(title, content);
      setLessonQuizzes((q) => ({ ...q, [lessonId]: quiz }));
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setQuizGenLoading((m) => {
        const n = { ...m };
        delete n[lessonId];
        return n;
      });
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
        {/* Left sidebar: Uploaded file + Lessons */}
        <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col max-h-[45vh] md:max-h-none">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4" />
              Uploaded Files
              <span className="ml-auto bg-slate-200 dark:bg-slate-700 text-xs px-1.5 py-0.5 rounded">1</span>
            </h3>
            <div className="mt-2 flex items-center justify-between gap-2 p-2.5 rounded-lg border border-green-200 dark:border-green-800/60 bg-green-50/80 dark:bg-green-950/30">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">{pdfFile.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(pdfFile.size)}</p>
              </div>
              <span className="shrink-0 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Ready
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {learningResult?.generatedByAI ? 'Topics' : 'Lessons'}
              <span className="ml-auto flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium">
                {lessons.length || 'â€”'}
              </span>
            </h3>
            {lessons.length > 0 ? (
              <div className="mt-3 space-y-4">
                {sidebarGroups
                  ? sidebarGroups.map((group) => (
                      <div key={group.moduleTitle}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-0.5 line-clamp-2">
                          {group.moduleTitle}
                        </p>
                        <ul className="space-y-2">
                          {group.indices.map((i) => {
                            const l = lessons[i];
                            if (!l) return null;
                            return (
                              <li key={l.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTextSectionIndex(i);
                                    setSlideIndex(i);
                                  }}
                                  className={`w-full text-left rounded-xl border-2 px-3 py-2 transition-colors flex flex-col gap-1 ${
                                    textSectionIndex === i
                                      ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-medium'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span
                                      className="shrink-0 mt-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                                      aria-hidden
                                    >
                                      {i + 1}
                                    </span>
                                    <span className="text-sm leading-snug flex-1 min-w-0 line-clamp-3">{l.title}</span>
                                  </div>
                                  {(lessonQuizzes[l.id] || quizGenLoading[l.id]) && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-6">
                                      {quizGenLoading[l.id] ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                      ) : (
                                        <ClipboardList className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                      )}
                                      <span>{quizGenLoading[l.id] ? 'Quizâ€¦' : 'Quiz ready'}</span>
                                    </div>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))
                  : (
                  <ul className="space-y-2">
                    {lessons.map((l, i) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setTextSectionIndex(i);
                            setSlideIndex(i);
                          }}
                          className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-colors flex flex-col gap-1 ${
                            textSectionIndex === i
                              ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-medium'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="shrink-0 mt-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300" aria-hidden>
                              {i + 1}
                            </span>
                            <span className="text-sm leading-snug flex-1 min-w-0">{l.title}</span>
                          </div>
                          {(lessonQuizzes[l.id] || quizGenLoading[l.id]) && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-6">
                              {quizGenLoading[l.id] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                              ) : (
                                <ClipboardList className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                              )}
                              <span>{quizGenLoading[l.id] ? 'Quizâ€¦' : 'Quiz ready'}</span>
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Processing...</p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 mt-4 md:mt-0">
          <Tabs defaultValue="pdf" className="flex-1 flex flex-col">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(funnelPath('/dashboard'))}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    title="Back to Revo Learn"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  {/* Mobile-only quick link back to chat */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBackToChat}
                    className="shrink-0 rounded-lg gap-2 sm:hidden"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </Button>
                </div>
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto flex-nowrap overflow-x-auto">
                  <TabsTrigger value="pdf" className="gap-2 rounded-md whitespace-nowrap text-xs sm:text-sm">
                    <FileText className="w-4 h-4" />
                    pdf document
                  </TabsTrigger>
                  <TabsTrigger value="text" className="gap-2 rounded-md whitespace-nowrap text-xs sm:text-sm">
                    <BookOpen className="w-4 h-4" />
                    Text presentation
                  </TabsTrigger>
                  <TabsTrigger value="slides" className="gap-2 rounded-md whitespace-nowrap text-xs sm:text-sm">
                    <Play className="w-4 h-4" />
                    Slides presentation
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToChat}
                  className="hidden sm:inline-flex shrink-0 rounded-lg gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Back to AI chat
                </Button>
              </div>
            </div>

          <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-visible">
              <TabsContent value="pdf" className="mt-0 h-full">
                {pdfFileObj && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                    <SimplePDFView file={pdfFileObj} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="text" className="mt-0 h-full">
                {generationError && (
                  <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
                    <strong>AI unavailable:</strong> {generationError}
                  </div>
                )}
                {!generationError && learningResult?.fallbackReason === 'no_api_key' && (
                  <div className="mb-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
                    <strong>AI lessons are off</strong> — no API key configured. NVIDIA API is used for AI generation via Firebase Cloud Functions.
                  </div>
                )}
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                    <p className="text-slate-600 dark:text-slate-400">Building slides and text presentationâ€¦</p>
                  </div>
                ) : currentLesson ? (
                  <div className="max-w-3xl mx-auto">
                    {courseLayout && (
                      <div className="mb-6 rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-slate-900 p-5 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Course</p>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{courseLayout.courseTitle}</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{courseLayout.courseSummary}</p>
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Learning outcomes</p>
                          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                            {courseLayout.learningOutcomes.slice(0, 6).map((o, idx) => (
                              <li key={idx}>{o}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold text-sm">
                          {textSectionIndex + 1}
                        </span>
                        <div className="min-w-0">
                          {slides[textSectionIndex]?.moduleTitle && (
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">{slides[textSectionIndex].moduleTitle}</p>
                          )}
                          <p className="text-sm text-slate-500 truncate">
                            Lesson {textSectionIndex + 1} of {lessons.length}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 shrink-0 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30" asChild>
                        <a
                          href={pdfFileObj?.url}
                          download={pdfFile.name}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                    {learningResult?.generatedByAI ? (
                      <div className="rounded-xl overflow-hidden shadow-xl ring-1 ring-slate-200/80 dark:ring-slate-700/80">
                        {slideContentByIndex[textSectionIndex]?.loading ? (
                          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 text-slate-600">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-700" />
                            <p className="text-sm">Preparing this lessonâ€¦</p>
                          </div>
                        ) : slideContentByIndex[textSectionIndex]?.error ? (
                          <div className="p-6 bg-amber-950/50 text-amber-200 text-sm">
                            {slideContentByIndex[textSectionIndex].error}
                            <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                              slideCompletedRef.current.delete(textSectionIndex);
                              void ensureSlideAIContent(textSectionIndex);
                            }}>Retry</Button>
                          </div>
                        ) : slideContentByIndex[textSectionIndex]?.lessonHtml ? (
                          <CreativeCourseHTML html={slideContentByIndex[textSectionIndex].lessonHtml!} lightMode />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white border border-slate-200 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
                            <p className="text-sm">Preparing this topicâ€¦</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <header className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                          <h1 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 leading-tight">
                            {currentLesson.title}
                          </h1>
                        </header>
                        <div className="px-6 py-5 text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none">
                          <CourseContentRenderer content={currentLesson.content} />
                        </div>
                      </article>
                    )}

                    {/* Quiz â€” auto-generated per slide after content loads */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                      {lessonQuizzes[currentLesson.id] ? (
                        (() => {
                          const quiz = lessonQuizzes[currentLesson.id];
                          const result = quizResults[currentLesson.id];
                          const answers = quizAnswers[currentLesson.id] ?? {};
                          if (result?.showResults) {
                            return (
                              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quiz results</h3>
                                </div>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{result.score}%</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {result.score >= quiz.passingScore ? 'You passed!' : `Passing score: ${quiz.passingScore}%. Try again.`}
                                </p>
                                {result.score < quiz.passingScore && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => {
                                      setQuizResults((r) => ({ ...r, [currentLesson.id]: { score: 0, showResults: false, correctByQuestionId: {} } }));
                                      setQuizAnswers((a) => ({ ...a, [currentLesson.id]: {} }));
                                    }}
                                  >
                                    Try again
                                  </Button>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-6">
                              <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Topic quiz: {currentLesson.title}</h3>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.instructions}</p>
                              {quiz.questions.map((q, idx) => (
                                <div key={q.id} className="rounded-lg border border-slate-200 dark:border-slate-600 p-4 space-y-3">
                                  <p className="font-medium text-slate-900 dark:text-white">Q{idx + 1}. {q.question}</p>
                                  {q.type === 'multiple-choice' && q.options && (
                                    <div className="space-y-2">
                                      {q.options.map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={q.id} value={opt} checked={(answers[q.id] ?? '') === opt} onChange={(e) => setQuizAnswers((a) => ({ ...a, [currentLesson.id]: { ...(a[currentLesson.id] ?? {}), [q.id]: e.target.value } }))} className="rounded-full border-slate-300 text-orange-600 focus:ring-orange-500" />
                                          <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Button onClick={() => handleQuizSubmit(currentLesson.id, quiz)} className="bg-orange-500 hover:bg-orange-600">
                                Submit quiz
                              </Button>
                            </div>
                          );
                        })()
                      ) : quizGenLoading[currentLesson.id] ? (
                        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 px-4 py-4 flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600 shrink-0" />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">Creating your quiz</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Questions are based only on this topicâ€™s content.</p>
                          </div>
                        </div>
                      ) : learningResult?.generatedByAI ? (
                        <p className="text-sm text-slate-500 py-2">Open this topic to load content; the quiz is created automatically.</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => generateQuizForLesson(currentLesson.id, currentLesson.title, currentLesson.content)} className="gap-2">
                            <Target className="w-4 h-4" />
                            Add quiz
                          </Button>
                        </div>
                      )}
                    </div>

                    {lessons.length > 1 && (
                      <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTextSectionIndex((i) => {
                              const n = Math.max(0, i - 1);
                              setSlideIndex(n);
                              return n;
                            });
                          }}
                          disabled={textSectionIndex === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-slate-500 flex-1 text-center">
                          {textSectionIndex + 1} / {lessons.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTextSectionIndex((i) => {
                              const n = Math.min(lessons.length - 1, i + 1);
                              setSlideIndex(n);
                              return n;
                            });
                          }}
                          disabled={textSectionIndex >= lessons.length - 1}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                    <p>Content will be generated for this section...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="slides" className="mt-0 data-[state=inactive]:hidden">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <p className="text-slate-600 dark:text-slate-400">Building slidesâ€¦</p>
                  </div>
                ) : currentSlide ? (
                  <div className="max-w-4xl mx-auto px-2 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <p className="slideshow-badge mb-0">Slides presentation Â· AI narration</p>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" asChild>
                        <a href={pdfFileObj?.url} download={pdfFile.name} target="_blank" rel="noreferrer" className="gap-2">
                          <Download className="w-4 h-4" /> PDF
                        </a>
                      </Button>
                    </div>
                    <div className="slideshow-stage max-h-[70vh] sm:max-h-[72vh]">
                      <div className="slideshow-viewport">
                        {slideContentByIndex[slideIndex]?.loading ? (
                          <div className="flex flex-col items-center gap-4 py-16 text-indigo-200">
                            <Loader2 className="w-14 h-14 animate-spin" />
                            <p className="text-sm">Generating slide steps and lesson contentâ€¦</p>
                            <p className="text-xs text-slate-400 max-w-xs text-center">{currentSlide.title}</p>
                          </div>
                        ) : slideContentByIndex[slideIndex]?.error ? (
                          <div className="text-amber-200 text-sm p-6 text-center">
                            {slideContentByIndex[slideIndex].error}
                            <Button variant="secondary" size="sm" className="mt-4" onClick={() => {
                              slideCompletedRef.current.delete(slideIndex);
                              void ensureSlideAIContent(slideIndex);
                            }}>Retry</Button>
                          </div>
                        ) : (
                          <div className="slideshow-slide-stack slideshow-slide-stack--steps" key={`${slideIndex}-${panelIndex}`}>
                            <header className="slideshow-slide-header">
                              {currentSlide.moduleTitle && (
                                <p className="ss-module text-center sm:text-left">{currentSlide.moduleTitle}</p>
                              )}
                              <h2 className="ss-title text-center sm:text-left border-0 pb-0 mb-2">{currentSlide.title}</h2>
                              <p className="text-[11px] text-slate-500 mb-2 text-center sm:text-left">
                                One step at a time â€” use <strong>Next step</strong> when youâ€™re ready.
                              </p>
                              <div className="slideshow-step-dots" role="tablist" aria-label="Steps on this slide">
                                {getSlidePanels(slideIndex).map((_, pi) => (
                                  <button
                                    key={pi}
                                    type="button"
                                    role="tab"
                                    aria-selected={pi === panelIndex}
                                    data-active={pi === panelIndex}
                                    aria-label={`Step ${pi + 1}`}
                                    onClick={() => {
                                      stopNarration();
                                      setPanelIndex(pi);
                                    }}
                                  />
                                ))}
                              </div>
                            </header>
                            <div className="slideshow-panels-scroll slideshow-panels-scroll--single">
                              {(() => {
                                const panels = getSlidePanels(slideIndex);
                                const pi = Math.min(panelIndex, panels.length - 1);
                                const panel = panels[pi];
                                return (
                                  <div className="ss-panel-row ss-panel-row--step" key={pi}>
                                    <div className="ss-panel-left">
                                      <p className="ss-step-label">Step {pi + 1} of {panels.length}</p>
                                      <p className="ss-panel-bullet">{panel.bullet}</p>
                                      <p className="ss-panel-body">{panel.body}</p>
                                    </div>
                                    <div className="ss-panel-right">
                                      {panel.imageDataUrl ? (
                                        <img src={panel.imageDataUrl} alt="" className="ss-panel-img" />
                                      ) : (
                                        <div className="ss-image-placeholder ss-panel-placeholder">
                                          <span aria-hidden>ðŸŒ</span>
                                          <span className="text-[10px] opacity-80">Image</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="slideshow-dots">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            data-active={i === slideIndex}
                            aria-label={`Slide ${i + 1}`}
                            onClick={() => goToSlide(i)}
                          />
                        ))}
                      </div>
                      <div className="slideshow-narration">
                        <div className="slideshow-narration-label flex items-center gap-2">
                          <Mic className="w-3.5 h-3.5 text-indigo-300" />
                          Narration
                        </div>
                        <div className="slideshow-narration-bar mt-2">
                          <Button
                            type="button"
                            size="lg"
                            className={`rounded-full w-12 h-12 p-0 shrink-0 ${narrationPlaying ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            onClick={() => (narrationPlaying ? stopNarration() : playNarrationForCurrentStep())}
                            disabled={slideContentByIndex[slideIndex]?.loading || !!slideContentByIndex[slideIndex]?.error}
                            title={narrationPlaying ? 'Pause' : 'Play narration'}
                          >
                            {narrationPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
                          </Button>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                              {narrationPlaying
                                ? 'Speaking with fluent phrasingâ€¦'
                                : 'Reads this step only. Auto-advance moves to the next step, then the next slide.'}
                            </p>
                            <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={autoAdvanceAfterNarration}
                                onChange={(e) => {
                                  autoAdvanceRef.current = e.target.checked;
                                  setAutoAdvanceAfterNarration(e.target.checked);
                                }}
                                className="rounded border-slate-500"
                              />
                              Auto-advance when narration ends
                            </label>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                              <label className="flex items-center gap-1.5">
                                Speed
                                <input
                                  type="range"
                                  min={0.82}
                                  max={1.08}
                                  step={0.02}
                                  value={rate}
                                  onChange={(e) => setRate(Number(e.target.value))}
                                  className="w-20 accent-indigo-500"
                                />
                              </label>
                              <label className="flex items-center gap-1.5">
                                Tone
                                <input
                                  type="range"
                                  min={0.9}
                                  max={1.12}
                                  step={0.02}
                                  value={pitch}
                                  onChange={(e) => setPitch(Number(e.target.value))}
                                  className="w-20 accent-violet-500"
                                />
                              </label>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-200 shrink-0"
                            onClick={() => {
                              stopNarration();
                              goNextStep();
                            }}
                            disabled={
                              panelIndex >= getSlidePanels(slideIndex).length - 1 &&
                              slideIndex >= slides.length - 1
                            }
                            title="Next step (or next slide after last step)"
                          >
                            <SkipForward className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 pt-3 pb-1">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-indigo-900/80 text-white border-indigo-600 hover:bg-indigo-800"
                            onClick={goPrevStep}
                            disabled={slideIndex === 0 && panelIndex === 0}
                          >
                            <ChevronLeft className="w-4 h-4" /> Previous step
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500"
                            onClick={goNextStep}
                            disabled={
                              panelIndex >= getSlidePanels(slideIndex).length - 1 &&
                              slideIndex >= slides.length - 1
                            }
                          >
                            Next step <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="text-xs text-slate-400 tabular-nums">
                          Slide {slideIndex + 1}/{slides.length} Â· Step {panelIndex + 1}/{getSlidePanels(slideIndex).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Play className="w-12 h-12 mb-4 opacity-50" />
                    <p>No slides yet.</p>
                  </div>
                )}
              </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>

      {/* Chat with PDF prompt (hidden on very small screens to keep more space for slides) */}
      <div className="hidden md:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <MessageCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Chat with your PDF</p>
            <p className="text-sm text-slate-500">Document on the left, AI chat on the right. Ask any question about the document.</p>
          </div>
          <Button onClick={onBackToChat} size="sm" className="ml-auto rounded-lg">
            Open chat (document + AI side by side)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFLearningView;
