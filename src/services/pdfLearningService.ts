/** Text model for PDF lesson generation (NVIDIA). */
import { nvidiaGenerateText, hasNvidiaConfigured } from '@/services/nvidiaClient';
import { escapeIllegalControlCharsInJsonStrings, extractBalancedJsonObject } from '@/utils/jsonTextSafe';
import { getFunctions, httpsCallable } from 'firebase/functions';

async function callNvidiaJson(prompt: string, maxOutputTokens: number): Promise<string> {
  const system =
    'You output a single valid JSON value (object or array as requested). No markdown, no commentary. Escape newlines inside JSON strings as \\n—never output raw line breaks inside a quoted string.';
  const run = async (useJsonMode: boolean) => {
    return nvidiaGenerateText({
      system,
      user: prompt,
      temperature: 0.25,
      max_tokens: maxOutputTokens,
      ...(useJsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    });
  };
  try {
    const text = await run(true);
    if (!text || text.length < 10) {
      throw new Error('AI returned no content. Check your API key and quota.');
    }
    return text;
  } catch (first) {
    console.warn('NVIDIA JSON mode failed, retrying without response_format:', first);
    const text = await run(false);
    if (!text || text.length < 10) {
      throw new Error('AI returned no content. Check your API key and quota.');
    }
    return text;
  }
}

/** Structured course wrapper around the subject (shown in UI + drives slide order). */
export interface PDFCourseLayout {
  courseTitle: string;
  /** One short paragraph: who this course is for + what the subject is */
  courseSummary: string;
  /** 4–6 measurable outcomes for the whole course */
  learningOutcomes: string[];
  /** Module names in order (each module has 2–3 slides) */
  modules: { title: string; description: string }[];
}

export interface PDFLesson {
  id: string;
  title: string;
  content: string;
}

function structureRawTextAsLessons(extractedText: string, fileName: string): PDFLesson[] {
  const trimmed = extractedText.trim();
  if (!trimmed) return [{ id: '1', title: 'Document Content', content: extractedText }];

  const lines = trimmed.split(/\r?\n/);
  const sectionStarts: { index: number; title: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 5) continue;
    const upper = line.toUpperCase();
    const isKnownHeader =
      /^(INSTRUCTIONS\s|SECTION\s+[A-Z]|QUESTION\s+\d|READ\s+THE\s+FOLLOWING)/i.test(line) ||
      /^\d+\.\d+\s/.test(line);
    const mostlyCaps = line.length >= 12 && (upper.match(/[A-Z]/g)?.length ?? 0) / line.length > 0.7;
    if (isKnownHeader || (mostlyCaps && line.length <= 100)) {
      sectionStarts.push({ index: i, title: line.slice(0, 70) });
    }
  }

  if (sectionStarts.length === 0) {
    const chunks = trimmed.split(/\n\s*\n/).filter((c) => c.trim().length > 50);
    if (chunks.length >= 2) {
      return chunks.map((c, i) => ({ id: String(i + 1), title: `Section ${i + 1}`, content: c.trim() }));
    }
    return [{ id: '1', title: fileName.replace(/\.pdf$/i, '') || 'Document Content', content: trimmed }];
  }

  const lessons: PDFLesson[] = [];
  for (let i = 0; i < sectionStarts.length; i++) {
    const startIdx = sectionStarts[i].index;
    const endIdx = i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : lines.length;
    const contentLines = lines.slice(startIdx, endIdx);
    let content = contentLines.join('\n').trim();
    if (content.length > 30) {
      lessons.push({
        id: String(lessons.length + 1),
        title: sectionStarts[i].title,
        content
      });
    }
  }
  return lessons.length ? lessons : [{ id: '1', title: fileName.replace(/\.pdf$/i, '') || 'Document Content', content: trimmed }];
}

export interface PDFSlide {
  id: string;
  title: string;
  content: string;
  /** 2–3 teaching examples per slide (required for AI slides) */
  bulletPoints?: string[];
  /** Module this slide belongs to (matches course.modules) */
  moduleIndex?: number;
  moduleTitle?: string;
  /** intro = introduction to document; then topic slides */
  slideRole?: string;
}

function buildLessonsFromSlides(slides: PDFSlide[]): PDFLesson[] {
  if (!slides.length) return [];
  return slides.map((slide, i) => {
    const parts: string[] = [];
    if (slide.moduleTitle) {
      parts.push(`## ${slide.moduleTitle}`, '');
    }
    parts.push(`### ${slide.title}`, '');
    if (slide.content?.trim()) {
      parts.push(slide.content.trim(), '');
    }
    if (Array.isArray(slide.bulletPoints) && slide.bulletPoints.length > 0) {
      slide.bulletPoints.forEach((bp) => {
        if (bp?.trim()) parts.push(` - ${bp.trim()}`);
      });
    }
    const content = parts.join('\n').trim() || slide.title;
    return { id: String(i + 1), title: slide.title, content };
  });
}

export interface PDFLearningResult {
  textContent: string;
  lessons: PDFLesson[];
  slides: PDFSlide[];
  generatedByAI?: boolean;
  fallbackReason?: 'no_api_key';
  courseLayout?: PDFCourseLayout | null;
}

function tryParseJson<T>(s: string): T | null {
  let trimmed = s.trim().replace(/^\uFEFF/, '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const extracted = extractBalancedJsonObject(trimmed) ?? trimmed;
  const sanitized = escapeIllegalControlCharsInJsonStrings(extracted);
  const attempts = [sanitized, sanitized.replace(/,(\s*[}\]])/g, '$1')];
  for (const c of attempts) {
    try {
      return JSON.parse(c) as T;
    } catch {
      /* next */
    }
  }
  return null;
}

function normalizeCourseLayout(raw: any): PDFCourseLayout {
  const modulesIn = Array.isArray(raw?.modules) ? raw.modules : [];
  const modules = modulesIn
    .slice(0, 8)
    .map((m: any) => ({
      title: String(m?.title ?? 'Module').trim().slice(0, 120),
      description: String(m?.description ?? '').trim().slice(0, 300)
    }))
    .filter((m: { title: string }) => m.title.length > 0);
  const outcomesIn = Array.isArray(raw?.learningOutcomes) ? raw.learningOutcomes : [];
  const learningOutcomes = outcomesIn
    .filter((x: unknown) => typeof x === 'string')
    .map((x: string) => x.trim())
    .filter(Boolean)
    .slice(0, 8);
  return {
    courseTitle: String(raw?.courseTitle ?? 'Course').trim().slice(0, 200),
    courseSummary: String(raw?.courseSummary ?? '').trim().slice(0, 800),
    learningOutcomes: learningOutcomes.length ? learningOutcomes : ['Understand the main ideas from the document'],
    modules: modules.length >= 2 ? modules : [{ title: 'Module 1', description: 'Core content' }, { title: 'Module 2', description: 'Practice and review' }]
  };
}

function normalizeSlides(raw: unknown[], course: PDFCourseLayout): PDFSlide[] {
  return raw.map((s: any, i: number) => {
    const modIdx = typeof s?.moduleIndex === 'number' ? Math.max(0, Math.min(course.modules.length - 1, s.moduleIndex)) : 0;
    const moduleTitle = String(s?.moduleTitle ?? course.modules[modIdx]?.title ?? '').trim() || course.modules[0]?.title;
    let bullets = Array.isArray(s?.bulletPoints)
      ? s.bulletPoints.filter((bp: unknown) => typeof bp === 'string').map((bp: string) => bp.trim()).filter(Boolean)
      : [];
    const examples = Array.isArray(s?.examples)
      ? s.examples.filter((x: unknown) => typeof x === 'string').map((x: string) => x.trim()).filter(Boolean)
      : [];
    if (examples.length) bullets = [...examples, ...bullets].slice(0, 4);
    // Prefer exactly 2–3 example lines for teaching slides
    if (bullets.length > 3) bullets = bullets.slice(0, 3);
    return {
      id: String(i + 1),
      title: String(s?.title ?? `Slide ${i + 1}`).trim().slice(0, 200),
      content: String(s?.content ?? '').trim(),
      bulletPoints: bullets,
      moduleIndex: modIdx,
      moduleTitle,
      slideRole: String(s?.slideRole ?? '').trim() || undefined
    };
  });
}

type SlidesPayload = {
  courseTitle?: string;
  courseSummary?: string;
  learningOutcomes?: string[];
  modules?: { title?: string; description?: string }[];
  slides?: unknown[];
};

/** First line or filename as document heading hint */
function documentHeadingHint(excerpt: string, fileName: string): string {
  const line = excerpt.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 3 && l.length < 100);
  const fromFile = fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  return (line && !/^page\s*\d/i.test(line) ? line.slice(0, 90) : fromFile) || 'this document';
}

/**
 * Step 1: Course shell + topic slides — slide 1 = introduction to document heading; every slide has 2–3 examples.
 */
async function generateCourseAndSlides(
  excerpt: string,
  fileName: string,
  slideCount: number,
  wordsPerSlide: string
): Promise<{ course: PDFCourseLayout; slides: PDFSlide[] } | null> {
  const headingHint = documentHeadingHint(excerpt, fileName);
  const prompt = `You are a curriculum designer. Build a COURSE FROM THE DOCUMENT. Output ONLY valid JSON.

DOCUMENT HEADING / SUBJECT (use for slide 1): "${headingHint}"
Infer the real course subject from the full document below.

**Slides = topics the learner chooses (like a deck).** Order is fixed:

**SLIDE 1 (mandatory — introduction):**
- slideRole: "intro"
- title MUST begin with "Introduction" and include the document subject or heading (e.g. "Introduction to [Subject]" or "Introduction: [same theme as document]").
- content: Welcome + what this document/course is + who it is for (${wordsPerSlide} words). Course tone—not exam boilerplate.
- **examples**: exactly 2 OR 3 strings. Each example = a short concrete illustration (scenario, mini case, or sample idea) that previews what appears in the document. Label mentally as Example 1 / 2 / 3.
- Also put the same 2–3 strings in **bulletPoints** (duplicate is OK).

**SLIDES 2..${slideCount} (topics):**
- Each slide = ONE main topic drawn from the document (concept, section theme, or skill).
- title = clear topic name (not "Slide 2").
- content: teach that topic in ${wordsPerSlide} words (original course prose).
- **examples**: exactly 2 OR 3 strings per slide—concrete examples, contrasts, or worked-style illustrations for that topic. Required every time.
- bulletPoints: same 2–3 examples (can match examples array).
- slideRole: foundations | deep_dive | application | recap (last slide recap).

**Course JSON:**
1) courseTitle – matches document subject.
2) courseSummary – 2–4 sentences.
3) learningOutcomes – exactly 5 strings.
4) modules – exactly 4 modules (Orientation → Core → Application → Review). Map slide 1 to module 0.
5) slides – exactly ${slideCount} objects, ids "1".."${slideCount}".

Each slide object MUST include:
"id","moduleIndex"(0-3),"moduleTitle","title","content","bulletPoints"(length 2 or 3),"examples"(length 2 or 3, same as bulletPoints),"slideRole"

JSON shape:
{"courseTitle":"","courseSummary":"","learningOutcomes":[],"modules":[{"title":"","description":""}],"slides":[{"id":"1","moduleIndex":0,"moduleTitle":"","title":"Introduction: ...","content":"","bulletPoints":["Example: ...","Example: ...","Example: ..."],"examples":["...","...","..."],"slideRole":"intro"}]}

Document:
${excerpt}`;

  const raw = await callNvidiaJson(prompt, 16384);
  const parsed = tryParseJson<SlidesPayload>(raw);
  const arr = parsed?.slides;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const course = normalizeCourseLayout(parsed);
  return { course, slides: normalizeSlides(arr, course) };
}

/**
 * Step 2: Full lesson body with fixed course layout sections (markdown).
 */
async function generateLessonsFromSlideDeck(
  course: PDFCourseLayout,
  slides: PDFSlide[],
  excerpt: string
): Promise<PDFLesson[] | null> {
  const outline = slides
    .map(
      (s, i) =>
        `Lesson ${i + 1} | ${s.title} | Role: ${s.slideRole ?? 'foundations'} | Summary: ${s.content.slice(0, 140)} | Examples: ${(s.bulletPoints ?? []).join(' | ')}`
    )
    .join('\n');
  const prompt = `You expand each lesson into a CREATIVE HTML PAGE for an online course. Course: "${course.courseTitle}".

OUTPUT ONLY JSON: {"lessons":[{"id":"1","title":"lesson title","content":"<article class=\\"cc-lesson\\">...HTML...</article>"}, ...]}

Exactly ${slides.length} lessons, same order as:

${outline}

Each lesson **content** must be a single HTML fragment (no outer html/head/body). Use ONLY these tags: article, section, div, p, br, h1, h2, h3, strong, em, ul, ol, li, blockquote. Use class names exactly as below so CSS applies.

REQUIRED STRUCTURE (copy this pattern; replace text with real teaching):

<article class="cc-lesson">
  <header class="cc-hero">
    <p class="cc-hero-label">This lesson</p>
    <h1>Lesson headline (engaging, matches slide title)</h1>
    <p>One-sentence hook.</p>
  </header>
  <section class="cc-block cc-objectives">
    <h2>Learning objectives</h2>
    <ul><li>...</li><li>...</li></ul>
  </section>
  <section class="cc-block">
    <h2>Main ideas</h2>
    <p>2–4 paragraphs. Use <strong>key terms</strong>.</p>
    <h3>Go deeper</h3>
    <p>Extra explanation.</p>
  </section>
  <section class="cc-block cc-keypoints">
    <h2>Examples (2–3)</h2>
    <ul><li>Concrete example 1 from slide</li><li>Example 2</li><li>Example 3 if present</li></ul>
  </section>
  <div class="cc-callout">
    <span class="cc-callout-icon">!</span>
    <div><strong>Remember</strong><p>One memorable takeaway.</p></div>
  </div>
  <section class="cc-block cc-summary">
    <h2>Summary</h2>
    <p>Wrap up + optional bullet list.</p>
  </section>
</article>

Rules: Escape double quotes inside JSON as \\". No script, style, iframe, onclick. No markdown—HTML only. Teach the subject; do not paste exam boilerplate.

Document excerpt:
${excerpt.slice(0, 38000)}`;

  const raw = await callNvidiaJson(prompt, 16384);
  const parsed = tryParseJson<{ lessons?: unknown[] }>(raw);
  const arr = parsed?.lessons;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.map((l: any, i: number) => {
    const fromSlide = buildLessonsFromSlides(slides[i] ? [slides[i]] : [])[0]?.content ?? '';
    const body = String(l?.content ?? '').trim() || fromSlide;
    return {
      id: String(i + 1),
      title: String(l?.title ?? slides[i]?.title ?? `Lesson ${i + 1}`).trim(),
      content: body
    };
  });
}

/** One row: left heading + body, optional image URL for that point (images disabled with OpenRouter text-only). */
export interface SlideBulletPanel {
  bullet: string;
  body: string;
  imageDataUrl?: string | null;
}

/** One AI call = lesson + N panels (each bullet + body + its own image). */
export interface GeneratedSlideContent {
  slideBullets: string[];
  /** Each item = one bullet row in the slideshow (text left, image right). */
  slidePanels: SlideBulletPanel[];
  slideDeckBody: string;
  examples: string[];
  lessonHtml: string;
  plainText: string;
  /** First panel image, for backward compat / thumbnails */
  slideImageDataUrl?: string | null;
}

const GEMINI_IMAGE_MODEL =
  import.meta.env.VITE_GEMINI_IMAGE_MODEL?.trim() || 'gemini-2.5-flash-image';

/** Slide panel illustration: OpenRouter image model first, then optional direct Gemini proxy. */
async function generateSlideImageForPanel(
  topicTitle: string,
  courseTitle: string,
  bulletSummary: string
): Promise<string | null> {
  const prompt = `Create a single clean educational illustration for a presentation slide.
Topic: "${topicTitle}"
Course context: ${courseTitle}
Key ideas to visualize (do not render as text in the image): ${bulletSummary.slice(0, 500)}
Style: modern flat infographic, professional, soft colors, no logos, no watermarks, no readable paragraphs—icons and diagrams only. 16:9 friendly composition.`;

  // NVIDIA does not support image generation; skip straight to Gemini proxy

  // Fallback to secure Gemini image proxy in the backend
  try {
    const functions = getFunctions();
    const secureGeminiImageProxy = httpsCallable<
      { prompt: string; model?: string },
      any
    >(functions, 'secureGeminiImage');

    const response = await secureGeminiImageProxy({
      prompt,
      model: GEMINI_IMAGE_MODEL,
    });

    const data = response.data;
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part?.inlineData;
      if (inline?.data && inline?.mimeType) {
        return `data:${inline.mimeType};base64,${inline.data}`;
      }
    }
  } catch (e) {
    console.warn('Slide image (Gemini proxy) failed', e);
  }
  return null;
}

export async function generateContentForSlide(params: {
  excerpt: string;
  fileName: string;
  course: PDFCourseLayout;
  slide: PDFSlide;
  slideIndex: number;
  totalSlides: number;
}): Promise<GeneratedSlideContent> {
  if (!hasNvidiaConfigured()) {
    throw new Error('NVIDIA API not configured');
  }
  const { excerpt, fileName, course, slide, slideIndex, totalSlides } = params;
  const maxExcerpt = excerpt.length > 55000 ? excerpt.slice(0, 55000) + '\n...[truncated]' : excerpt;
  const seed = `Title: ${slide.title}\nModule: ${slide.moduleTitle ?? ''}\nRole: ${slide.slideRole ?? ''}\nSeed content: ${slide.content.slice(0, 400)}\nSeed examples: ${(slide.bulletPoints ?? []).join(' | ')}`;

  const prompt = `You write ONE clear, INFORMATIVE lesson (like a textbook section). Course: "${course.courseTitle}".
Slide ${slideIndex + 1} of ${totalSlides}. Source file: ${fileName}

TOPIC only:
${seed}

TONE: Informative and factual. Explain concepts plainly. Include definitions where useful, logical steps, and why the topic matters. No fluff, no marketing. Suitable for someone studying the document.

OUTPUT ONLY valid JSON:
{
  "slidePanels": [
    { "bullet": "Short heading (one teaching step)", "body": "DEEP explanation for THIS step only: 5–8 sentences. Define terms, give a mini example or formula if relevant, then why it matters. Learners see ONE step at a time—this body must fully teach that step before they press Next." },
    { "bullet": "...", "body": "..." }
  ],
  "slideBullets": ["same as each slidePanels[].bullet in order"],
  "slideDeckBody": "Optional full paragraph summary of whole slide for narration.",
  "examples": ["Example 1", "Example 2", "Example 3"],
  "lessonHtml": "<article class=\\"cc-lesson\\">...</article>",
  "plainText": "Full lesson plain text"
}

CRITICAL: Exactly 4, 5, or 6 objects in slidePanels. Each panel is ONE STEP shown alone on screen (not all at once). Order panels as a lesson sequence: step 1 → step 2 → … bullet = step title; body = long paragraph ONLY for that step (left column). No repeating the same idea across panels—each step adds new depth. Each panel body MUST be at least 5-8 detailed sentences — do not write brief summaries. Teach each concept thoroughly with definitions, examples, step-by-step reasoning, and real-world applications.

lessonHtml structure — MUST include all of the following:

1) cc-hero: h1 topic title (blue theme); p overview.

2) cc-block cc-objectives: h2 "Learning objectives"; ul 3–4 bullets.

3) cc-block: h2 "Main content"; p + h3 subheads; teach the topic. Each content block MUST have 3-4 substantial paragraphs — explain concepts in depth like a university textbook. Include analogies, step-by-step reasoning, worked examples, and real-world applications. Do not write brief summaries.

4) cc-table-block: h2 "At a glance" or "Compare" or similar COLORED heading; then <table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr> at least 3 rows—smart comparison, checklist, or concept vs definition.

5) section.cc-activity: h2 "Your turn" or "Activity"; p.cc-activity-intro one line task; <ol class="cc-steps"> with 3–5 <li>. Each li: <p class="cc-step-task">Step N: short title</p><p class="cc-step-work">What to do / question</p><details class="cc-answer"><summary>Show answer</summary><div class="cc-answer-body"><p>Clear worked answer or model response.</p></div></details>

6) cc-block cc-keypoints: h2 Examples; ul.

7) cc-callout key takeaway.

8) cc-block cc-summary: h2 Summary; ul.

Tags: article, section, div, p, br, h1, h2, h3, strong, em, ul, ol, li, blockquote, table, thead, tbody, tr, th, td, details, summary. Use classes cc-lesson, cc-hero, cc-hero-label, cc-block, cc-objectives, cc-keypoints, cc-summary, cc-table-block, cc-activity, cc-steps, cc-step-task, cc-step-work, cc-answer, cc-answer-body, cc-callout, cc-callout-icon. Escape " in JSON.

Document:
${maxExcerpt}`;

  const raw = await callNvidiaJson(prompt, 16384);
  const parsed = tryParseJson<{
    slidePanels?: { bullet?: string; body?: string }[];
    slideBullets?: unknown[];
    slideDeckBody?: string;
    examples?: unknown[];
    lessonHtml?: string;
    plainText?: string;
  }>(raw);

  let slidePanels: SlideBulletPanel[] = [];
  const panelsIn = Array.isArray(parsed?.slidePanels) ? parsed.slidePanels : [];
  for (const p of panelsIn.slice(0, 6)) {
    const bullet = String(p?.bullet ?? '').trim().slice(0, 200);
    const body = String(p?.body ?? '').trim().slice(0, 2200);
    if (bullet.length > 2 && body.length > 20) slidePanels.push({ bullet, body });
  }
  const slideDeckBody = String(parsed?.slideDeckBody ?? slide.content ?? '').trim();
  if (slidePanels.length < 4) {
    const fallbackBullets = Array.isArray(parsed?.slideBullets)
      ? parsed.slideBullets.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
      : [];
    const lines =
      fallbackBullets.length >= 4
        ? fallbackBullets
        : [
            slide.title,
            ...slideDeckBody.split(/[.!?]\s+/).filter((s) => s.length > 20).slice(0, 5)
          ].filter(Boolean);
    slidePanels = lines.slice(0, 6).map((bullet, i) => ({
      bullet: bullet.slice(0, 120),
      body:
        slideDeckBody.slice(i * 80, i * 80 + 280) ||
        `${bullet}. This point supports understanding of ${slide.title} in the context of ${course.courseTitle}.`
    }));
  }

  const slideBullets = slidePanels.map((p) => p.bullet);
  const examples = Array.isArray(parsed?.examples)
    ? parsed.examples.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean).slice(0, 4)
    : (slide.bulletPoints ?? []).slice(0, 3);
  let lessonHtml = String(parsed?.lessonHtml ?? '').trim();
  if (!lessonHtml.includes('<article')) {
    lessonHtml = `<article class="cc-lesson"><header class="cc-hero"><h1>${escapeXml(slide.title)}</h1></header><section class="cc-block"><p>${escapeXml(slideDeckBody)}</p></section></article>`;
  }
  const plainText =
    String(parsed?.plainText ?? '').trim() ||
    slidePanels.map((p) => `${p.bullet}\n${p.body}`).join('\n\n') ||
    slideDeckBody;

  const imageJobs = slidePanels.map((panel) =>
    generateSlideImageForPanel(
      `${slide.title} — ${panel.bullet}`,
      course.courseTitle,
      `${panel.bullet}. ${panel.body.slice(0, 400)}`
    )
  );
  const imageResults = await Promise.all(imageJobs);
  slidePanels = slidePanels.map((panel, i) => ({
    ...panel,
    imageDataUrl: imageResults[i] ?? null
  }));

  return {
    slideBullets,
    slidePanels,
    slideDeckBody,
    examples: examples.length ? examples : ['—'],
    lessonHtml,
    plainText,
    slideImageDataUrl: slidePanels[0]?.imageDataUrl ?? null
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getFallbackLearningResult(extractedText: string, fileName: string): PDFLearningResult {
  const lessons = structureRawTextAsLessons(extractedText, fileName);
  const slides = lessons.slice(0, 12).map((l, i) => ({
    id: String(i + 1),
    title: l.title,
    content: l.content.slice(0, 400),
    bulletPoints: [] as string[]
  }));
  return {
    textContent: extractedText,
    lessons,
    slides,
    generatedByAI: false,
    courseLayout: null
  };
}

export async function generatePDFLearningContent(
  extractedText: string,
  fileName: string
): Promise<PDFLearningResult> {
  if (!hasNvidiaConfigured()) {
    const fallbackLessons = structureRawTextAsLessons(extractedText, fileName);
    return {
      textContent: extractedText,
      lessons: fallbackLessons,
      slides: fallbackLessons.slice(0, 12).map((l, i) => ({
        id: String(i + 1),
        title: l.title,
        content: l.content.slice(0, 400),
        bulletPoints: []
      })),
      generatedByAI: false,
      fallbackReason: 'no_api_key',
      courseLayout: null
    };
  }

  const maxChars = 100000;
  const excerpt =
    extractedText.length > maxChars ? extractedText.slice(0, maxChars) + '\n...[truncated]' : extractedText;

  let course: PDFCourseLayout | null = null;
  let slides: PDFSlide[] | null = null;
  try {
    const first = await generateCourseAndSlides(excerpt, fileName, 10, '55-95 words');
    if (first && first.slides.length >= 4) {
      course = first.course;
      slides = first.slides;
    } else {
      const second = await generateCourseAndSlides(excerpt, fileName, 8, '45-75 words');
      if (second) {
        course = second.course;
        slides = second.slides;
      }
    }
  } catch {
    slides = null;
  }

  if (!slides || slides.length === 0 || !course) {
    return getFallbackLearningResult(extractedText, fileName);
  }

  // Lessons are placeholders; full HTML is generated per slide when the user opens that topic (see generateContentForSlide).
  const lessons: PDFLesson[] = slides.map((s, i) => ({
    id: String(i + 1),
    title: s.title,
    content: '<article class="cc-lesson"><p class="cc-hero-label">Open this topic</p><p>Content is generated when you select this slide.</p></article>'
  }));

  return {
    textContent: extractedText,
    lessons,
    slides,
    generatedByAI: true,
    courseLayout: course
  };
}
