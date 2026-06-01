import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  BookOpen,
  Calculator,
  Lightbulb,
  Target,
  Brain,
  Paperclip,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import {
  formatFinalExamDetailsForChat,
  getLearnerProgressSummary,
  type LearnerProgressSummary,
} from '@/services/learnerProgressForAIService';
import { parseActionsFromResponse, type AITutorAction } from '@/services/aiTutorActions';
import { CalendarService } from '@/services/calendarService';
import { learnerTodoService } from '@/services/learnerTodoService';
import { getAITutorChatMessages, saveAITutorChatMessages, fromPersisted } from '@/services/aiTutorChatPersistence';
import { persistentProgressService } from '@/services/persistentProgressService';
import { documentProcessor } from '@/services/documentProcessor';
import { generatePDFLearningContent, getFallbackLearningResult, type PDFLearningResult } from '@/services/pdfLearningService';
import PDFLearningView from '@/components/PDFLearningView';
import PDFDocumentPanel from '@/components/PDFDocumentPanel';
import {
  getOpenRouterApiKey,
  getOpenRouterModel,
  openRouterChatCompletion,
  openRouterGenerateText,
  type OpenRouterChatMessage,
  type OpenRouterTool,
} from '@/services/openRouterClient';
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mode: TutorModeId;
}

type TutorModeId = 'tutor' | 'calculator' | 'explainer' | 'planner' | 'coach';

interface TutorMode {
  id: TutorModeId;
  label: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  responseGuidelines: string;
}

type TutorLanguageId = 'en' | 'af' | 'zu' | 'xh' | 'st' | 'custom';

type TutorLanguage = {
  id: TutorLanguageId;
  label: string;
  instructions: string;
  translationName: string;
  ttsVoice: string;
  ttsModel?: string;
};

const SA_TIMEZONE = 'Africa/Johannesburg';
const TUTOR_CHAT_MAX_TOKENS = 2048;
const TUTOR_GREETING_MAX_TOKENS = 384;
const TUTOR_HISTORY_MESSAGES = 12;

/** Only enable tool calls when the learner is likely asking to change calendar/todos (faster replies otherwise). */
function messageNeedsTools(text: string): boolean {
  return /\b(schedule|calendar|todo|to-do|remind|meeting|one-on-one|one on one|book\b|appointment|delete\b.*\bevent|remove\b.*\btask|mark\b.*\b(done|complete)|add\b.*\btask|create\b.*\bevent|timetable|study session)\b/i.test(
    text
  );
}

/** Current date and time in South Africa for AI context (scheduling, planning). */
function getSouthAfricanTimeContext(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA', {
    timeZone: SA_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-ZA', {
    timeZone: SA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `Current date and time in South Africa (SAST, ${SA_TIMEZONE}): ${dateStr}, ${timeStr}. Use this for all scheduling, event creation, and planning with the learner. When they say "tomorrow at 3pm" or "next Monday", interpret in South African time.`;
}

/** Tool schemas for the tutor (OpenAI/OpenRouter `tools` format is derived below). */
const TUTOR_TOOL_DECLARATIONS = {
  functionDeclarations: [
    {
      name: 'create_calendar_event',
      description: 'Create a calendar/timetable event for the learner. When the learner agrees to a one-on-one you already offered (e.g. for a quiz or lesson), use that topic in the title: "One-on-one tutoring: [lesson or topic name]". Use for: study sessions, one-on-one tutoring (eventType "meeting"), deadlines, or any timetable entry. Events appear in the Calendar tab and Timetable.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title (e.g. "One-on-one tutoring: Fractions" for tutoring sessions)' },
          startTime: { type: 'string', description: 'Start time in ISO 8601 format, e.g. 2025-03-07T15:00:00' },
          endTime: { type: 'string', description: 'End time in ISO 8601 format' },
          description: { type: 'string', description: 'Optional description' },
          eventType: { type: 'string', enum: ['event', 'class', 'meeting', 'study', 'assignment', 'exam', 'deadline'], description: 'Use "meeting" for one-on-one tutoring sessions' },
        },
        required: ['title', 'startTime', 'endTime'],
      },
    },
    {
      name: 'add_todo_item',
      description: 'Add an item to the learner\'s To-Do list. Call this when the learner asks to add a task, reminder, or to-do. Items appear in the Overview tab in the AI To-Do List.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Optional description' },
          dueDate: { type: 'string', description: 'Due date YYYY-MM-DD' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          category: { type: 'string', enum: ['study', 'assignment', 'exam', 'personal', 'meeting', 'project', 'review'] },
        },
        required: ['title'],
      },
    },
    {
      name: 'delete_calendar_event',
      description: 'Delete a calendar/timetable event for the learner. Call this when the learner asks to delete, remove, or cancel an event. Use the event title (and optionally start time) to identify which event to delete.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the event to delete (e.g. "Study session", "Meeting with tutor")' },
          startTime: { type: 'string', description: 'Optional: start time in ISO 8601 format to match a specific occurrence' },
        },
        required: ['title'],
      },
    },
    {
      name: 'update_calendar_event',
      description: 'Edit/update an existing calendar or timetable event. Call when the learner asks to change the time, title, or details of an event. Identify the event by its current title (and optional start time), then provide the new values.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Current title of the event to update (to identify it)' },
          startTime: { type: 'string', description: 'Optional: current start time in ISO format to identify the event' },
          newTitle: { type: 'string', description: 'New title for the event' },
          newStartTime: { type: 'string', description: 'New start time in ISO 8601 format' },
          newEndTime: { type: 'string', description: 'New end time in ISO 8601 format' },
          newDescription: { type: 'string', description: 'New description' },
        },
        required: ['title'],
      },
    },
    {
      name: 'delete_todo_item',
      description: 'Delete/remove an item from the learner\'s To-Do list. Call when the learner asks to delete, remove, or cancel a task. Identify by task title (and optional due date).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the to-do to delete' },
          dueDate: { type: 'string', description: 'Optional: due date YYYY-MM-DD to match a specific task' },
        },
        required: ['title'],
      },
    },
    {
      name: 'update_todo_item',
      description: 'Edit/update an existing to-do item. Call when the learner asks to change the title, due date, priority, or mark it complete. Identify by current title (and optional due date).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Current title of the to-do to update (to identify it)' },
          dueDate: { type: 'string', description: 'Optional: current due date YYYY-MM-DD to identify the task' },
          newTitle: { type: 'string', description: 'New title' },
          newDescription: { type: 'string', description: 'New description' },
          newDueDate: { type: 'string', description: 'New due date YYYY-MM-DD' },
          newPriority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          completed: { type: 'boolean', description: 'Set to true to mark the task as done' },
        },
        required: ['title'],
      },
    },
  ],
};

const OPENROUTER_TUTOR_TOOLS: OpenRouterTool[] = TUTOR_TOOL_DECLARATIONS.functionDeclarations.map((fd) => ({
  type: 'function',
  function: {
    name: fd.name,
    description: fd.description,
    parameters: fd.parameters as unknown as Record<string, unknown>,
  },
}));

async function generateOpenRouterChatResponse(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { useTools?: boolean; maxTokens?: number }
): Promise<{ text: string; functionCalls?: Array<{ name: string; args: Record<string, unknown> }> }> {
  if (!getOpenRouterApiKey()) {
    throw new Error('AI not configured. Set OPENROUTER_API_KEY in firebase-functions/.env and deploy functions.');
  }

  const chatMessages: OpenRouterChatMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const { content, tool_calls } = await openRouterChatCompletion(chatMessages, {
    temperature: 0.7,
    max_tokens: options?.maxTokens ?? TUTOR_CHAT_MAX_TOKENS,
    tools: options?.useTools ? OPENROUTER_TUTOR_TOOLS : undefined,
  });

  const functionCalls = tool_calls?.map((tc) => ({
    name: tc.name,
    args: tc.arguments,
  }));

  return {
    text: content.trim(),
    functionCalls: functionCalls?.length ? functionCalls : undefined,
  };
}

const presetTutorLanguages: TutorLanguage[] = [
  {
    id: 'en',
    label: 'English',
    instructions: 'You must reply exclusively in English. If the student uses another language, translate their request to English first and answer in English using South African educational terminology.',
    translationName: 'English',
    ttsVoice: 'alloy',
    ttsModel: 'gpt-4o-mini-tts',
  },
  {
    id: 'af',
    label: 'Afrikaans',
    instructions: 'You must reply exclusively in Afrikaans. If the student uses another language, translate their request to Afrikaans first and answer in Afrikaans with locally relevant examples.',
    translationName: 'Afrikaans',
    ttsVoice: 'verse',
    ttsModel: 'gpt-4o-mini-tts',
  },
  {
    id: 'zu',
    label: 'isiZulu',
    instructions: 'You must reply exclusively in isiZulu. If the student uses another language, translate their request to isiZulu first and answer in isiZulu using learner-friendly phrasing and culturally relevant context.',
    translationName: 'isiZulu',
    ttsVoice: 'alloy',
    ttsModel: 'gpt-4o-mini-tts',
  },
  {
    id: 'xh',
    label: 'isiXhosa',
    instructions: 'You must reply exclusively in isiXhosa. If the student uses another language, translate their request to isiXhosa first and answer in isiXhosa with accessible vocabulary and South African examples.',
    translationName: 'isiXhosa',
    ttsVoice: 'alloy',
    ttsModel: 'gpt-4o-mini-tts',
  },
  {
    id: 'st',
    label: 'Sesotho',
    instructions: 'You must reply exclusively in Sesotho. If the student uses another language, translate their request to Sesotho first and answer in Sesotho with learner-friendly explanations.',
    translationName: 'Sesotho',
    ttsVoice: 'alloy',
    ttsModel: 'gpt-4o-mini-tts',
  },
];

/** Base persona: human, flexible tutor—knows the learner's name, talks about their course, has memory. */
const COURSE_TUTOR_PERSONA = `You are the learner's personal tutor: warm, clear, and genuinely invested in their growth. You know the learner's name (it will be given to you in context)—use it when greeting and when it feels natural. Talk about their course(s) by name so the conversation feels personal. You have memory of your conversation: refer back to what they said earlier, follow up on topics you discussed, and keep the thread going. You are not a robot. Speak in your own voice—give real lesson feedback, share what you notice, and invite conversation. You understand the whole system: their courses, progress, all quiz and final exam results, calendar, and to-dos. You know their grades, how many final exam attempts they have used, whether they passed or failed, and whether they have earned their certificate. **Always use the AUTHORITATIVE learner progress block in context as the single source of truth** for percentages, pass/fail, certificates, and lesson counts—never guess or contradict it. Your role includes helping them deserve their certificate: when they have failed the final exam or are preparing for it, offer to review weak areas, go over course material, and help them get ready so that when they pass, they have truly earned it. Use that picture to tutor at your best, but never reduce the learner to numbers. Focus on understanding, encouragement, and next steps—not just "performance."

**How you show up:**
- Give honest lesson feedback: what's going well, what might need a bit more time, and concrete next steps. If you see quiz struggles or repeated attempts, acknowledge it kindly and offer to go deeper.
- Invite the learner into the chat. You're here to talk—about the course, a tricky lesson, or scheduling one-on-one time for the bits they find hard.
- For topics where they're struggling (low quiz scores, not yet passed, multiple attempts): suggest a one-on-one tutoring slot. Offer to schedule it in their calendar so they have a dedicated time to work through it with you. Use create_calendar_event with a title like "One-on-one tutoring: [topic or lesson name]" and eventType "meeting" when they agree.
- **Memory for scheduling:** If you already offered a one-on-one for a specific topic (e.g. a quiz or lesson they struggled with) and the learner replies with a time (e.g. "tomorrow 9am", "tomorrow morning 09:00 to 10:00") or confirms ("yes", "one on one session", "schedule it"), the meeting is for that topic. Do not ask "what would you like to schedule?" or "is it for a study session or one-on-one?"—you already know. Create the calendar event with a title that includes the topic (e.g. "One-on-one tutoring: What is Python and Setting Up Your Environment") and confirm the time. You remember what you offered; act on it.
- Be flexible and smart: adapt to what they need right now—explaining a concept, planning the week, or just checking in. You're not only tracking progress; you're helping them learn.

When they need study material or guides: recommend reputable free resources (e.g. Khan Academy, MIT OpenCourseWare, Coursera, official guides, YouTube EDU) relevant to the course. Format links as [description](URL) when you know a URL; otherwise suggest clear search terms or resource types.

**Structured output (HTML):** When showing progress or next steps, use clean HTML so the learner sees tables and visual progress. You may use:
- <table>, <thead>, <tbody>, <tr>, <th>, <td> for progress tables.
- <div class="tutor-progress-bar"><div class="tutor-progress-fill" style="width: 45%">45%</div></div> for a single progress bar.
- <div class="tutor-chart"> with <div class="tutor-chart-bar" style="width: 60%">Course A — 60%</div> for a simple bar chart.
- <ul>/<ol> and <li> for action lists; <h3>/<h4> for headings, <p> for paragraphs.
Use only these tags and inline style for width; no <script>. When they ask "how am I doing?", "my progress", or "what should I do?", answer with a clear progress view and a short list of what to do next—in your own words, not boilerplate.

**Actions (events, todos, switch tab):** When you create an event, add a todo, or open a tab, output at the very end of your reply (after all text and HTML) a single line in this exact format:
<<ACTIONS>>[{"type":"create_event","title":"Event title","startTime":"2025-03-07T15:00:00","endTime":"2025-03-07T16:00:00","description":"optional","eventType":"meeting"},{"type":"add_todo","title":"Task title","dueDate":"2025-03-08","priority":"medium","category":"study"},{"type":"switch_tab","tab":"calendar"}]
<</ACTIONS>>
- create_event: title (required), startTime and endTime (ISO 8601), description (optional), eventType ("event"|"class"|"meeting"|"assignment"|"exam"|"deadline"). Use "meeting" for one-on-one tutoring sessions.
- add_todo: title (required), description, dueDate (YYYY-MM-DD), priority ("low"|"medium"|"high"|"urgent"), category ("study"|"assignment"|"exam"|"personal"|"meeting"|"project"|"review").
- switch_tab: "calendar", "overview", "courses", or "todos".
Output <<ACTIONS>> only when you are actually creating an event, adding a todo, or switching their view. Use valid JSON only.

**Tools (calendar and to-dos):** (1) Create: use create_calendar_event or add_todo_item so items appear in Calendar/Timetable and To-Do list. (2) Edit: use update_calendar_event or update_todo_item to change existing items. (3) Delete: use delete_calendar_event or delete_todo_item. Always use these tools so changes show in the learner's Calendar and To-Do list. For one-on-one tutoring sessions, you MUST create a real calendar event: use create_calendar_event with a clear title (e.g. "One-on-one tutoring: [lesson/topic]"), eventType "meeting", and realistic start/end times. Never say "I'll add it to your calendar" unless you actually call the tool to create the event.`;

const tutorModes: TutorMode[] = [
  {
    id: 'tutor',
    label: 'Tutor',
    description: 'Your course tutor—explains concepts, suggests study materials, and tracks your progress.',
    icon: <BookOpen className="w-4 h-4" />, 
    prompt: `You are a patient academic tutor for the learner's course(s). Provide organised explanations using headings, bullet points, worked examples and recap the key takeaway at the end. Use simple language without oversimplifying the core concept. When relevant, suggest study guides or online resources (with links if you know them) to deepen understanding.`,
    responseGuidelines: 'Structure the answer with clear headings, examples, and a quick recap. When useful, include 1–2 links or search suggestions for further study. End by inviting follow-up questions and offering to help with more topics.'
  },
  {
    id: 'calculator',
    label: 'Calculator',
    description: 'Step-by-step problem solver for maths, finance and quantitative questions.',
    icon: <Calculator className="w-4 h-4" />, 
    prompt: `You are a symbolic mathematics assistant. Solve quantitative questions by outlining each step, showing formulas, substituting values, and presenting the final answer in a highlighted form. Double-check calculations before responding.`,
    responseGuidelines: 'Show step-by-step working, include formulas, highlight the final numeric answer, and mention any assumptions made.'
  },
  {
    id: 'explainer',
    label: 'Explainer',
    description: 'Break down complex ideas into simple, memorable explanations.',
    icon: <Lightbulb className="w-4 h-4" />, 
    prompt: `You specialise in analogies and storytelling. Break the topic down into digestible parts, use real-world analogies, and highlight common misconceptions learners should avoid. When useful, suggest a study guide or resource link.`,
    responseGuidelines: 'Provide a simple analogy, a real-world application, and list pitfalls or misconceptions to avoid. Optionally add a link or search suggestion for further study.'
  },
  {
    id: 'planner',
    label: 'Planner',
    description: 'Create study plans, revision timetables and action lists.',
    icon: <Target className="w-4 h-4" />, 
    prompt: `You are a study coach. Design structured study plans with milestones, daily/weekly actions, recommended resources (with links when you know them), and motivation tips. Tailor the plan length based on the user request.`,
    responseGuidelines: 'Provide a timeline, milestones, recommended resources (with URLs when possible), motivation tips, and a quick progress tracking checklist.'
  },
  {
    id: 'coach',
    label: 'Coach',
    description: 'Boost confidence, set goals, and give motivational feedback.',
    icon: <Brain className="w-4 h-4" />, 
    prompt: `You are a learning coach focused on mindset. Offer encouragement, help the learner set SMART goals, anticipate challenges, and suggest reflective questions. When relevant, point them to helpful study materials.`,
    responseGuidelines: 'Encourage the learner, set SMART goals, anticipate roadblocks with solutions, and end with a reflective question. Invite them to ask for study links anytime.'
  }
];

const WELCOME_PLACEHOLDER_CONTENT = 'Hi! What would you like to work on?';

/** Short placeholder before the AI greeting loads. No long lists. */
const buildWelcomePlaceholder = (): Message => ({
  id: 'welcome',
  content: WELCOME_PLACEHOLDER_CONTENT,
  sender: 'ai',
  timestamp: new Date(),
  mode: 'tutor'
});

const ALLOWED_HTML_TAGS = new Set([
  'p', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'a', 'h2', 'h3', 'h4', 'br', 'hr'
]);

/** Sanitize HTML for AI message display: allow only safe tags and attributes. */
function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  function escapeAttr(v: string): string {
    return v.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function sanitizeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(tag)) return Array.from(el.childNodes).map(sanitizeNode).join('');
    let attrStr = '';
    const classVal = el.getAttribute('class');
    if (classVal) attrStr += ` class="${escapeAttr(classVal)}"`;
    const styleVal = el.getAttribute('style');
    if (styleVal) attrStr += ` style="${escapeAttr(styleVal)}"`;
    if (tag === 'a') {
      const href = el.getAttribute('href');
      if (href && /^(https?:|\#)/i.test(href)) attrStr += ` href="${escapeAttr(href)}"`;
    }
    const inner = Array.from(el.childNodes).map(sanitizeNode).join('');
    if (tag === 'br' || tag === 'hr') return `<${tag} />`;
    return `<${tag}${attrStr}>${inner}</${tag}>`;
  }
  return Array.from(doc.body.childNodes).map(sanitizeNode).join('');
}

/** True if content looks like HTML we should render (tables, tutor progress bars, lists). */
function looksLikeStructuredHtml(content: string): boolean {
  return /<(table|div\s+class="tutor-|ul|ol|h[234])[\s>]/i.test(content);
}

/** Render message content: structured HTML (tables, progress bars) or plain text with links. */
function renderMessageContent(content: string, isAi: boolean) {
  if (isAi && looksLikeStructuredHtml(content)) {
    const safe = sanitizeHtml(content);
    return (
      <div
        className="tutor-message-html prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }
  const parts: (string | { text: string; url: string })[] = [];
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push(content.slice(lastIndex, m.index).replace(/\*\*(.*?)\*\*/g, '$1'));
    }
    parts.push({ text: m[1], url: m[2] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex).replace(/\*\*(.*?)\*\*/g, '$1'));
  }
  if (parts.length === 0) {
    parts.push(content.replace(/\*\*(.*?)\*\*/g, '$1'));
  }
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 dark:text-orange-400 underline hover:no-underline"
          >
            {p.text}
          </a>
        )
      )}
    </>
  );
}

const sanitizeForSpeech = (input: string) => {
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[_~]/g, '')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/#+\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

function formatEventTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

async function executeAITutorActions(
  actions: AITutorAction[],
  userId: string,
  userName: string,
  navigate: (path: string) => void
): Promise<string[]> {
  const results: string[] = [];
  let didCreateEvent = false;
  let didAddTodo = false;
  const hasSwitchTab = actions.some((a) => a.type === 'switch_tab');

  for (const action of actions) {
    try {
      if (action.type === 'create_event') {
        const start = action.startTime || new Date().toISOString();
        const end = action.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await CalendarService.createEvent({
          title: action.title,
          description: action.description,
          startTime: start,
          endTime: end,
          type: action.eventType || 'event',
          creatorId: userId,
          creatorName: userName,
          creatorRole: 'learner',
          isOnline: false,
          invitedUserIds: [],
          invitedUsers: [],
        });
        didCreateEvent = true;
        results.push(
          `Created event **"${action.title}"** (${formatEventTime(start)} – ${formatEventTime(end)}) in your Calendar.`
        );
      } else if (action.type === 'add_todo') {
        await learnerTodoService.addTodo(userId, {
          title: action.title,
          description: action.description,
          completed: false,
          priority: action.priority || 'medium',
          dueDate: action.dueDate,
          category: action.category || 'study',
          aiGenerated: true,
        });
        didAddTodo = true;
        const due = action.dueDate ? ` (due ${action.dueDate})` : '';
        results.push(`Added to your To-Do list: **"${action.title}"**${due}.`);
      } else if (action.type === 'switch_tab') {
        const tab = action.tab || 'overview';
        navigate(`/lms?tab=${tab}`);
        results.push(`Opening your **${tab}** tab so you can see it.`);
      }
    } catch (err) {
      console.error('AI action failed:', action, err);
      results.push(`Could not complete: ${action.type}.`);
    }
  }

  // Always show what was created: open Calendar after event(s), Overview after todo(s), so the learner can see it
  if (!hasSwitchTab) {
    if (didCreateEvent) {
      navigate('/lms?tab=calendar');
      results.push('Opening your **Calendar** tab so you can see the new event.');
    } else if (didAddTodo) {
      navigate('/lms?tab=overview');
      results.push('Opening your **Overview** tab so you can see your To-Do list.');
    }
  }

  return results;
}

/** Execute a single tutor tool call (calendar / to-do) and return result text for the UI. */
async function executeTutorToolCall(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  userName: string,
  navigate: (path: string) => void
): Promise<{ result: string; didCreateEvent?: boolean; didAddTodo?: boolean }> {
  let result = '';
  let didCreateEvent = false;
  let didAddTodo = false;
  let didModifyCalendar = false;
  let didModifyTodo = false;
  try {
    if (name === 'create_calendar_event') {
      const title = String(args.title || 'Event');
      const startTime = String(args.startTime || new Date().toISOString());
      const endTime = String(args.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString());
      const eventTypeRaw = (args.eventType as string) || 'event';
      const validTypes = ['event', 'class', 'meeting', 'assignment', 'exam', 'deadline'];
      const eventType = eventTypeRaw === 'study' ? 'event' : eventTypeRaw;
      await CalendarService.createEvent({
        title,
        description: args.description ? String(args.description) : undefined,
        startTime,
        endTime,
        type: validTypes.includes(eventType) ? eventType as 'event' | 'class' | 'meeting' | 'assignment' | 'exam' | 'deadline' : 'event',
        creatorId: userId,
        creatorName: userName,
        creatorRole: 'learner',
        // Treat AI-tutor sessions and study sessions as online meetings by default
        isOnline: eventType === 'meeting' || eventType === 'class' || eventType === 'event',
        location: eventType === 'meeting' ? 'AI Tutor (in-app chat)' : undefined,
        meetingLink: eventType === 'meeting' ? '/ai-tutor' : undefined,
        invitedUserIds: [],
        invitedUsers: [],
      });
      didCreateEvent = true;
      didModifyCalendar = true;
      result = `Created calendar event "${title}" (${formatEventTime(startTime)} – ${formatEventTime(endTime)}). It is now in the learner's Calendar and Timetable.`;
    } else if (name === 'add_todo_item') {
      const title = String(args.title || 'Task');
      await learnerTodoService.addTodo(userId, {
        title,
        description: args.description ? String(args.description) : undefined,
        completed: false,
        priority: (args.priority as any) || 'medium',
        dueDate: args.dueDate ? String(args.dueDate) : undefined,
        category: (args.category as any) || 'study',
        aiGenerated: true,
      });
      didAddTodo = true;
      didModifyTodo = true;
      result = `Added to-do "${title}" to the learner's To-Do list. It is now visible in the Overview tab.`;
    } else if (name === 'delete_calendar_event') {
      const title = String(args.title || '').trim();
      const startTimeArg = args.startTime ? String(args.startTime).trim() : undefined;
      if (!title) {
        result = 'No event title provided. Please specify which event to delete.';
      } else {
        const events = await CalendarService.getUserEvents(userId);
        const match = (ev: { title: string; startTime: string }) => {
          const titleMatch = ev.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(ev.title.toLowerCase());
          if (!titleMatch) return false;
          if (startTimeArg) {
            const evStart = ev.startTime.slice(0, 19);
            const argStart = startTimeArg.slice(0, 19);
            return evStart === argStart || ev.startTime.startsWith(startTimeArg.slice(0, 10));
          }
          return true;
        };
        const toDelete = events.filter((ev) => match(ev));
        if (toDelete.length === 0) {
          result = `No calendar event found matching "${title}"${startTimeArg ? ` at ${startTimeArg}` : ''}. The learner can check their Calendar tab to see current events.`;
        } else {
          for (const ev of toDelete) {
            await CalendarService.deleteEvent(ev.id);
          }
          didModifyCalendar = true;
          result = toDelete.length === 1
            ? `Deleted calendar event "${toDelete[0].title}" (${formatEventTime(toDelete[0].startTime)}). It has been removed from the Calendar and Timetable.`
            : `Deleted ${toDelete.length} calendar event(s) matching "${title}". They have been removed from the Calendar and Timetable.`;
        }
      }
    } else if (name === 'update_calendar_event') {
      const title = String(args.title || '').trim();
      const startTimeArg = args.startTime ? String(args.startTime).trim() : undefined;
      if (!title) {
        result = 'No event title provided. Specify which event to edit.';
      } else {
        const events = await CalendarService.getUserEvents(userId);
        const match = (ev: { title: string; startTime: string }) => {
          const titleMatch = ev.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(ev.title.toLowerCase());
          if (!titleMatch) return false;
          if (startTimeArg) return ev.startTime.startsWith(startTimeArg.slice(0, 10)) || ev.startTime.slice(0, 19) === startTimeArg.slice(0, 19);
          return true;
        };
        const toUpdate = events.filter((ev) => match(ev));
        if (toUpdate.length === 0) {
          result = `No calendar event found matching "${title}". The learner can check their Calendar tab.`;
        } else {
          const ev = toUpdate[0];
          const updates: Record<string, unknown> = {};
          if (args.newTitle != null) updates.title = String(args.newTitle);
          if (args.newStartTime != null) updates.startTime = String(args.newStartTime);
          if (args.newEndTime != null) updates.endTime = String(args.newEndTime);
          if (args.newDescription != null) updates.description = String(args.newDescription);
          if (Object.keys(updates).length === 0) {
            result = 'No new values provided. Specify newTitle, newStartTime, newEndTime, or newDescription to update the event.';
          } else {
            await CalendarService.updateEvent(ev.id, updates as any);
            didModifyCalendar = true;
            result = `Updated calendar event "${ev.title}" with the new details. It is updated in the Calendar and Timetable.`;
          }
        }
      }
    } else if (name === 'delete_todo_item') {
      const title = String(args.title || '').trim();
      const dueDateArg = args.dueDate ? String(args.dueDate).trim() : undefined;
      if (!title) {
        result = 'No task title provided. Specify which to-do to delete.';
      } else {
        const todos = await learnerTodoService.getTodos(userId);
        const match = (t: { title: string; dueDate?: string }) => {
          const titleMatch = t.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(t.title.toLowerCase());
          if (!titleMatch) return false;
          if (dueDateArg && t.dueDate) return t.dueDate.startsWith(dueDateArg.slice(0, 10));
          return true;
        };
        const toDelete = todos.filter((t) => match(t));
        if (toDelete.length === 0) {
          result = `No to-do found matching "${title}". The learner can check their To-Do list on the Overview tab.`;
        } else {
          for (const t of toDelete) await learnerTodoService.deleteTodo(t.id);
          didModifyTodo = true;
          result = toDelete.length === 1
            ? `Deleted to-do "${toDelete[0].title}" from the learner's To-Do list.`
            : `Deleted ${toDelete.length} to-do(s) matching "${title}".`;
        }
      }
    } else if (name === 'update_todo_item') {
      const title = String(args.title || '').trim();
      const dueDateArg = args.dueDate ? String(args.dueDate).trim() : undefined;
      if (!title) {
        result = 'No task title provided. Specify which to-do to edit.';
      } else {
        const todos = await learnerTodoService.getTodos(userId);
        const match = (t: { title: string; dueDate?: string }) => {
          const titleMatch = t.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(t.title.toLowerCase());
          if (!titleMatch) return false;
          if (dueDateArg && t.dueDate) return t.dueDate.startsWith(dueDateArg.slice(0, 10));
          return true;
        };
        const toUpdate = todos.filter((t) => match(t));
        if (toUpdate.length === 0) {
          result = `No to-do found matching "${title}". The learner can check their To-Do list.`;
        } else {
          const t = toUpdate[0];
          const updates: Record<string, unknown> = {};
          if (args.newTitle != null) updates.title = String(args.newTitle);
          if (args.newDescription != null) updates.description = String(args.newDescription);
          if (args.newDueDate != null) updates.dueDate = String(args.newDueDate);
          if (args.newPriority != null) updates.priority = args.newPriority;
          if (args.completed !== undefined) updates.completed = Boolean(args.completed);
          if (Object.keys(updates).length === 0) {
            result = 'No new values provided. Specify newTitle, newDueDate, newPriority, completed, or newDescription to update the task.';
          } else {
            await learnerTodoService.updateTodo(t.id, updates as any);
            didModifyTodo = true;
            result = `Updated to-do "${t.title}" with the new details. It is updated in the learner's To-Do list.`;
          }
        }
      }
    } else {
      result = `Unknown function: ${name}`;
    }
  } catch (err) {
    console.error('Tutor tool call failed:', name, args, err);
    result = `Error: ${err instanceof Error ? err.message : 'Failed to execute'}`;
  }
  if (didModifyCalendar) navigate('/lms?tab=calendar');
  else if (didModifyTodo) navigate('/lms?tab=overview');
  return { result, didCreateEvent, didAddTodo };
}

const translateToLanguage = async (text: string, language: TutorLanguage) => {
  if (!text.trim() || language.id === 'en') {
    return text;
  }

  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    console.warn('OpenRouter API key is not configured for translation.');
    return text;
  }

  try {
    const translated = await openRouterGenerateText({
      system: `You are a professional translator. Translate the following into ${language.translationName}. Preserve meaning, tone, lists, and formatting. Do not add commentary. Do not wrap words in asterisks or Markdown emphasis. Output only the translation.`,
      user: text,
      temperature: 0.2,
      max_tokens: 1536,
    });
    if (!translated) {
      return text;
    }
    return String(translated).trim();
  } catch (error) {
    console.warn('Failed to translate tutor response:', error);
    return text;
  }
};


export const AITutorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const examHelpContext = useMemo(() => {
    const context = searchParams.get('context');
    const courseTitle = searchParams.get('courseTitle');
    if (context === 'exam_help' && courseTitle) {
      return `The learner opened chat from the final exam for "${courseTitle}". Use the exam analysis below: state clearly whether they PASSED, did NOT PASS (and attempts left), or have NOT STARTED the exam. If passed, congratulate and mention certificate. If not passed, review missed questions and weak topics. If not started, explain they must complete the final exam to finish the course.`;
    }
    return '';
  }, [searchParams]);
  const [examHelpDetails, setExamHelpDetails] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(() => [buildWelcomePlaceholder()]);
  const [learnerProgressSummary, setLearnerProgressSummary] = useState<LearnerProgressSummary | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<TutorMode>(tutorModes[0]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<TutorLanguageId>('en');
  const [customLanguageName, setCustomLanguageName] = useState('');
  const [customLanguageVoice, setCustomLanguageVoice] = useState('');
  const [customLanguageGuidance, setCustomLanguageGuidance] = useState('');
  const activeLanguage = useMemo<TutorLanguage>(() => {
    if (selectedLanguageId === 'custom') {
      const name = customLanguageName.trim() || 'the requested language';
      const voice = customLanguageVoice.trim() || 'alloy';
      const guidance =
        customLanguageGuidance.trim() ||
        `You must reply exclusively in ${name}. If the student uses another language, translate their request to ${name} first and answer in ${name} with clear, culturally aware explanations that support South African learners.`;

      return {
        id: 'custom',
        label: customLanguageName.trim() || 'Custom language',
        instructions: guidance,
        translationName: customLanguageName.trim() || 'the requested language',
        ttsVoice: voice,
        ttsModel: 'gpt-4o-mini-tts',
      };
    }
    return presetTutorLanguages.find((lang) => lang.id === selectedLanguageId) ?? presetTutorLanguages[0];
  }, [customLanguageGuidance, customLanguageName, customLanguageVoice, selectedLanguageId]);


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const greetingGeneratedRef = useRef(false);
  const lastPersistedLengthRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** When user clears the chat, we keep this so the AI still has conversation context in memory */
  const clearedConversationRef = useRef<Message[]>([]);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLearningResult, setPdfLearningResult] = useState<PDFLearningResult | null>(null);
  const [isGeneratingPdfContent, setIsGeneratingPdfContent] = useState(false);
  const [pdfGenerationError, setPdfGenerationError] = useState<string | null>(null);
  const [showPdfLearningView, setShowPdfLearningView] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const context = searchParams.get('context');
    const courseId = searchParams.get('courseId');
    if (context !== 'exam_help' || !courseId) {
      setExamHelpDetails('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const progress = await persistentProgressService.getStudentProgress(user.id, courseId);
        const courseTitle = searchParams.get('courseTitle') || 'Course';
        if (cancelled) return;
        setExamHelpDetails(formatFinalExamDetailsForChat(progress, courseTitle));
      } catch (err) {
        if (!cancelled) {
          console.warn('Could not load exam-help details:', err);
          setExamHelpDetails('Exam-help mode is active, but detailed attempt data could not be loaded. Ask diagnostic questions and guide the learner to likely weak lessons.');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, searchParams]);

  // Load persisted chat memory (so the AI has memory across sessions). Don't treat placeholder-only as history.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getAITutorChatMessages(user.id).then((saved) => {
      if (cancelled) return;
      const isOnlyPlaceholder = saved.length === 1 && saved[0].sender === 'ai' && saved[0].content === WELCOME_PLACEHOLDER_CONTENT;
      if (saved.length > 0 && !isOnlyPlaceholder) {
        const restored: Message[] = saved.map((p) => {
          const m = fromPersisted(p);
          return { id: m.id, content: m.content, sender: m.sender, timestamp: m.timestamp, mode: 'tutor' as TutorModeId };
        });
        setMessages(restored);
      }
    }).catch((err) => {
      if (!cancelled) console.warn('Could not load AI tutor chat history:', err);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  // Persist messages when they change (so the AI has memory across sessions). Don't persist placeholder-only.
  useEffect(() => {
    if (!user?.id || messages.length === 0) return;
    const isOnlyPlaceholder = messages.length === 1 && messages[0].sender === 'ai' && messages[0].content === WELCOME_PLACEHOLDER_CONTENT;
    if (isOnlyPlaceholder) return;
    if (messages.length === lastPersistedLengthRef.current) return;
    lastPersistedLengthRef.current = messages.length;
    const toSave = messages.map((m) => ({ id: m.id, content: m.content, sender: m.sender, timestamp: m.timestamp }));
    saveAITutorChatMessages(user.id, toSave).catch((err) => console.warn('Could not save AI tutor chat:', err));
  }, [user?.id, messages]);

  // Load learner progress for AI context, then generate AI greeting (learners only; skip if we already restored history)
  useEffect(() => {
    if (!user?.id || user?.role !== 'learner') return;
    if (greetingGeneratedRef.current) return;
    let cancelled = false;
    getLearnerProgressSummary(user.id).then(async (summary) => {
      if (!cancelled) setLearnerProgressSummary(summary);
      if (cancelled || greetingGeneratedRef.current) return;
      greetingGeneratedRef.current = true;
      const progressContext = summary?.summaryForAI
        ? `Learner progress: ${summary.summaryForAI}`
        : 'The learner has not started any courses yet.';
      const courseList = summary?.byCourse?.length
        ? summary.byCourse.map((c) => c.title).join(', ')
        : '';
      const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'there';
      const recentChat = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
        .join('\n');
      const timeContext = getSouthAfricanTimeContext();
      const examHelpHint = examHelpContext
        ? `\n\n**Important (exam help mode):** ${examHelpContext}\n` +
          `Exam analysis (PASSED / NOT PASSED / NOT STARTED — follow this exactly):\n${examHelpDetails || 'Exam details loading...'}\n` +
          `In your first response: state pass/fail/not-started, latest score and attempts, what happened on the last attempt (missed questions if any), then 2-4 concrete next steps.`
        : '';
      const systemContent = `${COURSE_TUTOR_PERSONA}\n\n${timeContext}\n\n**Learner's name:** ${userName}\n\n**Their course(s):** ${courseList || 'None yet.'}\n\n${progressContext}${examHelpHint}\n\nRecent conversation (last messages, if any):\n${recentChat || 'No previous messages in this chat.'}`;
      const userContent = examHelpContext
        ? `The learner ${userName} opened chat from the final exam. Greet them by name. Using the exam analysis, say clearly if they passed, failed (and attempts left), or have not started. Summarize what happened on their last attempt and give a short revision plan.`
        : `The learner ${userName} just opened the chat again. Greet them by name (use "${userName}"). Briefly pick up from the most recent messages above (if there were any) so it feels like a continuation, not a new chat. Summarize where they are in their learning and what might be a good next step (from the progress data). Offer to help with a concrete next action (review a topic, plan study time, or schedule a one-on-one in their calendar). Keep it conversational, warm, and short (2–4 short paragraphs). No bullet lists. Make it feel like a real tutor checking in who remembers the last conversation.`;
      try {
        const { text } = await generateOpenRouterChatResponse(
          [{ role: 'system', content: systemContent }, { role: 'user', content: userContent }],
          { useTools: false, maxTokens: TUTOR_GREETING_MAX_TOKENS }
        );
        if (!cancelled && text) {
          setMessages((prev) => {
            const aiMessage: Message = {
              id: Date.now().toString(),
              content: text,
              sender: 'ai',
              timestamp: new Date(),
              mode: 'tutor',
            };
            if (prev.length === 1 && prev[0].id === 'welcome') {
              // First time: replace placeholder
              return [{ ...prev[0], content: text }];
            }
            // Every time the chat is opened, append a fresh greeting from the tutor
            return [...prev, aiMessage];
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('AI greeting failed, keeping placeholder:', err);
          setMessages((prev) => {
            const fallbackText = examHelpContext
              ? `Hi ${userName}. I can see you're working on your final exam recovery. Let's fix this step by step: we'll review the questions you missed, focus on the weak lesson areas, and build a short study plan before your next attempt. Ask me "what did I get wrong?" and I'll break it down.`
              : `Hi ${userName}! How's your day going? Ready to work on your courses? Tell me what you'd like to focus on or ask me to schedule a one-on-one and I'll set it up.`;
            const aiMessage: Message = {
              id: Date.now().toString(),
              content: fallbackText,
              sender: 'ai',
              timestamp: new Date(),
              mode: 'tutor',
            };
            if (prev.length === 1 && prev[0].id === 'welcome') {
              return [{ ...prev[0], content: fallbackText }];
            }
            return [...prev, aiMessage];
          });
        }
      }
    }).catch((err) => {
      if (!cancelled) console.warn('Could not load learner progress for AI:', err);
    });
    return () => { cancelled = true; };
  }, [user?.id, user?.role, user?.firstName, user?.lastName, examHelpContext, examHelpDetails]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/lms');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const recentConversation = useMemo(() => {
    return messages
      .filter((message) => message.id !== 'welcome')
      .slice(-TUTOR_HISTORY_MESSAGES)
      .map((message) => {
        const role = message.sender === 'user' ? 'Student' : 'Tutor';
        return `${role}: ${message.content}`;
      })
      .join('\n');
  }, [messages]);

  const MAX_TTS_CHARACTERS = 2000;

  const speakResponse = useCallback(async (text: string) => {
    const sanitized = sanitizeForSpeech(text);
    if (!sanitized.trim()) return;

    let speechText = sanitized.trim();
    if (speechText.length > MAX_TTS_CHARACTERS) {
      speechText = speechText.slice(0, MAX_TTS_CHARACTERS);
    }

    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find((v) => v.lang.startsWith(activeLanguage.id === 'en' ? 'en' : activeLanguage.id)) || voices[0];
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
    }
  }, [activeLanguage]);


  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      mode: activeMode.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let progressSummary = learnerProgressSummary;
      if (user?.id) {
        try {
          progressSummary = await getLearnerProgressSummary(user.id);
          setLearnerProgressSummary(progressSummary);
        } catch (progressErr) {
          console.warn('Could not refresh learner progress for AI:', progressErr);
        }
      }

      const languageInstruction = activeLanguage.instructions
        ? `\nLanguage preference: ${activeLanguage.instructions}`
        : '';
      const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Learner';
      const progressContext = progressSummary?.summaryForAI
        ? `\n\nLearner progress (includes final exam PASSED / NOT PASSED / NOT STARTED per course): ${progressSummary.summaryForAI}`
        : '';
      const courseContext = progressSummary?.byCourse?.length
        ? `\n\nYou are tutoring this learner in: ${progressSummary.byCourse.map((c) => c.title).join(', ')}. Use their course names when you talk about their learning. Refer to these courses when relevant and offer subject-specific study materials and links.`
        : '\n\nThe learner may be about to enroll or browsing. Offer to help with any course they are doing or planning to take.';
      const southAfricanTimeContext = getSouthAfricanTimeContext();
      const pdfSlideDeckContext =
        pdfLearningResult?.generatedByAI &&
        Array.isArray(pdfLearningResult.slides) &&
        pdfLearningResult.slides.length > 0
          ? `\n\n**Slides from this PDF:** The app generated **${pdfLearningResult.slides.length} slide topics** (learner should use the **Slides** tab). Each topic opens step-by-step panels with detailed teaching text and lesson-style HTML. Topic titles in order: ${pdfLearningResult.slides
              .slice(0, 28)
              .map((s) => s.title)
              .join(' | ')}${pdfLearningResult.slides.length > 28 ? ' | …' : ''}. Point them to **Slides** for structured, slide-by-slide study; use the document excerpt below for exact quotes and citations.`
          : '';
      const pdfContext = pdfLearningResult?.textContent
        ? `\n\n**Attached PDF document (use this to answer questions about the document):** The learner has attached a PDF. Use the following extracted text to answer their questions about it. Quote or refer to specific parts when relevant.\n\n---\n${pdfLearningResult.textContent.slice(0, 80000)}\n---${pdfSlideDeckContext}`
        : '';
      const examHelpHint = examHelpContext ? `\n\n**Important:** ${examHelpContext}` : '';
      let examReviewContext = examHelpContext
        ? `\n\nExam details for this chat (use directly):\n${examHelpDetails || 'Exam details loading...'}`
        : '';
      if (!examHelpContext && user?.id && searchParams.get('courseId')) {
        try {
          const courseId = searchParams.get('courseId')!;
          const courseTitle =
            progressSummary?.byCourse?.find((c) => c.courseId === courseId)?.title ||
            searchParams.get('courseTitle') ||
            'Course';
          const progress = await persistentProgressService.getStudentProgress(user.id, courseId);
          examReviewContext = `\n\nFocused course exam status:\n${formatFinalExamDetailsForChat(progress, courseTitle)}`;
        } catch {
          // ignore
        }
      }
      const systemInstructions = `${COURSE_TUTOR_PERSONA}\n\n**Time context:** ${southAfricanTimeContext}\n\n**Learner's name:** ${userName}\n\n${courseContext}${progressContext}${examHelpHint}${examReviewContext}${pdfContext}\n\n---\nMode for this reply: ${activeMode.prompt}\n\nResponse guidelines: ${activeMode.responseGuidelines}. Speak in a natural, human way—not robotic. Use their name when it fits. Talk about their course(s) by name. You have memory of this conversation—refer back to earlier messages when relevant. If you offered a one-on-one for a specific topic and they reply with a time or "yes" or "one on one", you MUST actually schedule that meeting using the create_calendar_event tool (or, if tools are unavailable, clearly say that you cannot create the calendar event). Do not just promise; create the event so it appears in their Calendar. Give real lesson feedback where relevant. If the learner has struggling areas (from the progress context), gently offer to schedule one-on-one time and use create_calendar_event when they agree. Invite them to ask more or share how they're finding the course. When they ask about the attached PDF, answer using the document text above.${languageInstruction}`;

      const cleared = clearedConversationRef.current;
      const currentMessages = messages.filter((m) => m.id !== 'welcome');
      const fullHistoryForAI = [...cleared, ...currentMessages]
        .slice(-TUTOR_HISTORY_MESSAGES)
        .map((m) => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
        .join('\n');
      const conversationHistory = fullHistoryForAI || 'None yet.';
      const request = content.trim();
      const userMessageContent = `Conversation history (you remember this):\n${conversationHistory}\n\nStudent (${userName}) request: ${request}`;

      const useTools = messageNeedsTools(request);
      let aiResponse = await generateOpenRouterChatResponse(
        [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: userMessageContent },
        ],
        { useTools }
      );

      const actionResults: string[] = [];

      // If the model returned function calls, execute them (real writes to Firestore – Calendar and To-Do list)
      if (aiResponse.functionCalls?.length && user?.id) {
        for (const fc of aiResponse.functionCalls) {
          const { result } = await executeTutorToolCall(
            fc.name,
            fc.args,
            user.id,
            userName,
            navigate
          );
          actionResults.push(result);
        }
        // If the model only returned function calls with no text, add a short confirmation
        if (!aiResponse.text) {
          aiResponse = {
            text: "I've created that for you. You can see it in your Calendar and Timetable (or in your To-Do list on the Overview tab).",
          };
        }
      }

      const { text: responseText, actions } = parseActionsFromResponse(aiResponse.text);
      let finalResponse = responseText;

      // Also run any <<ACTIONS>> block from the text (backwards compatibility)
      if (actions.length > 0 && user?.id) {
        const extra = await executeAITutorActions(actions, user.id, userName, navigate);
        if (extra.length > 0) actionResults.push(...extra);
      }

      if (actionResults.length > 0) {
        finalResponse = finalResponse + '\n\n**Done:** ' + actionResults.join(' ');
      }

      if (activeLanguage.id !== 'en') {
        finalResponse = await translateToLanguage(finalResponse, activeLanguage);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: finalResponse,
        sender: 'ai',
        timestamp: new Date(),
        mode: activeMode.id
      };

      setMessages(prev => [...prev, aiMessage]);
      // Voice/TTS disabled for now – can be re-enabled later
    } catch (error) {
      console.error('Error generating AI response:', error);
      const message = error instanceof Error ? error.message : 'Unknown OpenRouter error';
      let fallbackMessage = 'I ran into a problem generating a reply.';
      if (message.includes('403')) {
        fallbackMessage = 'The AI provider rejected the request (403). Your API key may be invalid or restricted.';
      } else if (message.includes('429')) {
        fallbackMessage = 'Rate limit was reached (429). Please wait a bit, then try again.';
      } else if (message.includes('404') || message.includes('not found')) {
        fallbackMessage = `The configured model was unavailable (${getOpenRouterModel()}). Check the model id on OpenRouter.`;
      } else if (message.includes('400')) {
        fallbackMessage = 'The AI provider rejected the request (400). Check model compatibility and your account.';
      }
      fallbackMessage += `\n\nTechnical details: ${message.slice(0, 280)}`;
      if (activeLanguage.id !== 'en') {
        fallbackMessage = await translateToLanguage(fallbackMessage, activeLanguage);
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackMessage,
        sender: 'ai',
        timestamp: new Date(),
        mode: activeMode.id
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const clearChat = () => {
    const current = messages.filter((m) => m.id !== 'welcome');
    if (current.length > 0) clearedConversationRef.current = [...clearedConversationRef.current, ...current];
    setMessages([buildWelcomePlaceholder()]);
    setCopiedMessageId(null);
  };

  const handlePdfAttach = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      if (file) console.warn('Only PDF files are supported');
      event.target.value = '';
      return;
    }
    setPdfFile(file);
    setPdfLearningResult(null);
    setPdfGenerationError(null);
    setIsGeneratingPdfContent(true);
    setShowPdfLearningView(true);
    try {
      const docResult = await documentProcessor.processDocument(file);
      try {
        const learningResult = await generatePDFLearningContent(docResult.content, file.name);
        setPdfLearningResult(learningResult);
      } catch (aiErr) {
        const message = aiErr instanceof Error ? aiErr.message : 'AI generation failed';
        setPdfGenerationError(message);
        setPdfLearningResult(getFallbackLearningResult(docResult.content, file.name));
      }
    } catch (err) {
      console.error('Failed to process PDF:', err);
      setPdfGenerationError(err instanceof Error ? err.message : 'Failed to process PDF');
      setPdfFile(null);
      setShowPdfLearningView(false);
    } finally {
      setIsGeneratingPdfContent(false);
      event.target.value = '';
    }
  };

  const handleBackToChat = () => {
    setShowPdfLearningView(false);
  };

  const handleDetachPdf = () => {
    setPdfFile(null);
    setPdfLearningResult(null);
    setPdfGenerationError(null);
    setShowPdfLearningView(false);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const courseTitles = learnerProgressSummary?.byCourse?.map((c) => c.title).join(', ') || null;
  const progressPercent = learnerProgressSummary?.overallPercent ?? null;
  const coursesCompleted = learnerProgressSummary?.coursesCompleted ?? null;
  const courseCount = learnerProgressSummary?.courseCount ?? null;

  if (pdfFile && showPdfLearningView) {
    return (
      <PDFLearningView
        pdfFile={pdfFile}
        learningResult={pdfLearningResult}
        isGenerating={isGeneratingPdfContent}
        onBackToChat={handleBackToChat}
        generationError={pdfGenerationError}
      />
    );
  }

  // Split layout: document left, chat right (when PDF attached and user is chatting)
  const chatContent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-end gap-2',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.sender === 'ai' && (
              <Avatar className="w-9 h-9 shrink-0 ring-2 ring-orange-200 dark:ring-orange-800">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 text-sm shadow-sm relative',
                message.sender === 'user'
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={cn('break-words', message.sender === 'ai' && looksLikeStructuredHtml(message.content) ? 'tutor-message-html-wrapper' : 'whitespace-pre-wrap')}>
                  {renderMessageContent(message.content, message.sender === 'ai')}
                </div>
                {message.sender === 'ai' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    title="Copy answer"
                  >
                    {copiedMessageId === message.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  {tutorModes.find(mode => mode.id === message.mode)?.label || 'Tutor'}
                </Badge>
                <span>{formatTime(message.timestamp)}</span>
              </div>
            </div>
            {message.sender === 'user' && (
              <Avatar className="w-9 h-9 shrink-0 bg-slate-600">
                <AvatarFallback className="bg-slate-600 text-white text-sm">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2">
            <Avatar className="w-9 h-9 shrink-0 ring-2 ring-orange-200 dark:ring-orange-800">
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handlePdfAttach} className="hidden" />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="rounded-xl shrink-0" title="Attach PDF">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about this document..."
            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-orange-500"
            disabled={isLoading}
          />
          <Button onClick={() => sendMessage(inputMessage)} disabled={isLoading || !inputMessage.trim()} size="default" className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shrink-0 px-5">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  if (pdfFile && !showPdfLearningView) {
    return (
      <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
        <style>{`
          .tutor-message-html-wrapper .tutor-message-html { font-size: 0.875rem; line-height: 1.5; }
          .tutor-message-html-wrapper .tutor-message-html p { margin: 0.5em 0; }
          .tutor-message-html-wrapper .tutor-message-html h2, .tutor-message-html-wrapper .tutor-message-html h3, .tutor-message-html-wrapper .tutor-message-html h4 { margin: 0.75em 0 0.35em; font-weight: 600; }
          .tutor-message-html-wrapper .tutor-message-html table { width: 100%; border-collapse: collapse; margin: 0.5em 0; font-size: 0.8125rem; }
          .tutor-message-html-wrapper .tutor-message-html th, .tutor-message-html-wrapper .tutor-message-html td { border: 1px solid rgb(203 213 225); padding: 0.5rem 0.75rem; text-align: left; }
          .tutor-message-html-wrapper .tutor-message-html th { background: rgb(241 245 249); font-weight: 600; }
          .dark .tutor-message-html-wrapper .tutor-message-html th, .dark .tutor-message-html-wrapper .tutor-message-html td { border-color: rgb(51 65 85); }
          .dark .tutor-message-html-wrapper .tutor-message-html th { background: rgb(30 41 59); }
          .tutor-message-html-wrapper .tutor-message-html ul, .tutor-message-html-wrapper .tutor-message-html ol { margin: 0.5em 0; padding-left: 1.25rem; }
          .tutor-message-html-wrapper .tutor-message-html li { margin: 0.25em 0; }
          .tutor-message-html-wrapper .tutor-message-html .tutor-progress-bar { background: rgb(226 232 240); border-radius: 9999px; height: 1.5rem; overflow: hidden; margin: 0.5em 0; max-width: 100%; }
          .dark .tutor-message-html-wrapper .tutor-message-html .tutor-progress-bar { background: rgb(51 65 85); }
          .tutor-message-html-wrapper .tutor-message-html .tutor-progress-fill { background: linear-gradient(90deg, rgb(249 115 22), rgb(234 88 12)); height: 100%; }
          .tutor-message-html-wrapper .tutor-message-html a { color: rgb(234 88 12); text-decoration: underline; }
          .dark .tutor-message-html-wrapper .tutor-message-html a { color: rgb(251 146 60); }
        `}</style>
        <div className="flex-1 min-w-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{pdfFile.name}</p>
            <p className="text-xs text-slate-500">Document — switch tabs above to view PDF, text, or slides</p>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PDFDocumentPanel pdfFile={pdfFile} learningResult={pdfLearningResult} isGenerating={isGeneratingPdfContent} compact />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-900 shadow-lg max-w-full overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-white">Chat with your PDF</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions about the document. I have the full text.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-slate-500 hover:text-slate-700 gap-1 shrink-0" title="Clear chat (AI keeps context)">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPdfLearningView(true)} className="text-xs text-slate-500 hover:text-slate-700 shrink-0">
                Full document
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDetachPdf} className="text-xs text-slate-500 hover:text-slate-700 shrink-0">
                Detach PDF
              </Button>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {chatContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
      <style>{`
        .tutor-message-html-wrapper .tutor-message-html { font-size: 0.875rem; line-height: 1.5; }
        .tutor-message-html-wrapper .tutor-message-html p { margin: 0.5em 0; }
        .tutor-message-html-wrapper .tutor-message-html p:first-child { margin-top: 0; }
        .tutor-message-html-wrapper .tutor-message-html h2, .tutor-message-html-wrapper .tutor-message-html h3, .tutor-message-html-wrapper .tutor-message-html h4 { margin: 0.75em 0 0.35em; font-weight: 600; }
        .tutor-message-html-wrapper .tutor-message-html table { width: 100%; border-collapse: collapse; margin: 0.5em 0; font-size: 0.8125rem; }
        .tutor-message-html-wrapper .tutor-message-html th, .tutor-message-html-wrapper .tutor-message-html td { border: 1px solid rgb(203 213 225); padding: 0.5rem 0.75rem; text-align: left; }
        .tutor-message-html-wrapper .tutor-message-html th { background: rgb(241 245 249); font-weight: 600; }
        .dark .tutor-message-html-wrapper .tutor-message-html th, .dark .tutor-message-html-wrapper .tutor-message-html td { border-color: rgb(51 65 85); }
        .dark .tutor-message-html-wrapper .tutor-message-html th { background: rgb(30 41 59); }
        .tutor-message-html-wrapper .tutor-message-html ul, .tutor-message-html-wrapper .tutor-message-html ol { margin: 0.5em 0; padding-left: 1.25rem; }
        .tutor-message-html-wrapper .tutor-message-html li { margin: 0.25em 0; }
        .tutor-message-html-wrapper .tutor-message-html .tutor-progress-bar { background: rgb(226 232 240); border-radius: 9999px; height: 1.5rem; overflow: hidden; margin: 0.5em 0; max-width: 100%; }
        .dark .tutor-message-html-wrapper .tutor-message-html .tutor-progress-bar { background: rgb(51 65 85); }
        .tutor-message-html-wrapper .tutor-message-html .tutor-progress-fill { background: linear-gradient(90deg, rgb(249 115 22), rgb(234 88 12)); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 600; transition: width 0.3s ease; }
        .tutor-message-html-wrapper .tutor-message-html .tutor-chart { margin: 0.5em 0; }
        .tutor-message-html-wrapper .tutor-message-html .tutor-chart-bar { background: linear-gradient(90deg, rgb(251 146 60), rgb(249 115 22)); border-radius: 0.375rem; margin: 0.35em 0; padding: 0.35rem 0.75rem; color: white; font-size: 0.8125rem; box-sizing: border-box; }
        .tutor-message-html-wrapper .tutor-message-html a { color: rgb(234 88 12); text-decoration: underline; }
        .tutor-message-html-wrapper .tutor-message-html hr { border: none; border-top: 1px solid rgb(226 232 240); margin: 0.75em 0; }
        .dark .tutor-message-html-wrapper .tutor-message-html a { color: rgb(251 146 60); }
      `}</style>
      <div className="w-full flex flex-col bg-white dark:bg-slate-900 shadow-lg max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/funnel/dashboard')}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                title="Back to Revo Learn"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Your Course Tutor</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {courseTitles || 'AI tutor for your courses'}
                  {coursesCompleted != null && courseCount != null && courseCount > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium">
                      {coursesCompleted}/{courseCount} courses complete
                    </span>
                  )}
                  {progressPercent != null && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 text-xs font-medium">
                      {progressPercent}% avg progress
                    </span>
                  )}
                  {pdfLearningResult && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-xs font-medium">
                      <Paperclip className="w-3 h-3" />
                      Document in context — ask me anything about it
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-xs text-slate-500 hover:text-slate-700 gap-1.5"
                title="Clear chat (conversation is still saved in memory)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
              {pdfLearningResult && (
                <Button variant="ghost" size="sm" onClick={handleDetachPdf} className="text-xs text-slate-500 hover:text-slate-700">
                  Detach PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'ai' && (
                <Avatar className="w-9 h-9 shrink-0 ring-2 ring-orange-200 dark:ring-orange-800">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 text-sm shadow-sm relative",
                  message.sender === 'user'
                    ? 'bg-orange-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={cn("break-words", message.sender === 'ai' && looksLikeStructuredHtml(message.content) ? "tutor-message-html-wrapper" : "whitespace-pre-wrap")}>
                    {renderMessageContent(message.content, message.sender === 'ai')}
                  </div>
                  {message.sender === 'ai' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => copyToClipboard(message.content, message.id)}
                      title="Copy answer"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                    {tutorModes.find(mode => mode.id === message.mode)?.label || 'Tutor'}
                  </Badge>
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>

              {message.sender === 'user' && (
                <Avatar className="w-9 h-9 shrink-0 bg-slate-600">
                  <AvatarFallback className="bg-slate-600 text-white text-sm">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-2">
              <Avatar className="w-9 h-9 shrink-0 ring-2 ring-orange-200 dark:ring-orange-800">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfAttach}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="rounded-xl shrink-0"
              title="Attach PDF"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={courseTitles ? `Ask about ${courseTitles.split(',')[0]} or attach a PDF...` : 'Ask your tutor anything—or attach a PDF to get text & slides...'}
              className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-orange-500"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              size="default"
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shrink-0 px-5"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
