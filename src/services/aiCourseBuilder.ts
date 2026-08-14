import { nvidiaGenerateText } from '@/services/nvidiaClient';
import { escapeIllegalControlCharsInJsonStrings, extractBalancedJsonObject, fixInvalidJsonEscapes } from '@/utils/jsonTextSafe';

export interface AICourseRequest {
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in hours
  category?: string;
  targetAudience?: string;
  learningGoals?: string[];
  prerequisites?: string[];
  documentContent?: string;
}

export interface AICourseResponse {
  title: string;
  description: string;
  shortDescription: string;
  learningOutcomes: string[];
  targetAudience: string;
  prerequisites: string[];
  courseOverview: string;
  practicalApproach: string;
  tags: string[];
  keywords: string[];
  estimatedHours: number;
  thumbnailPrompt: string;
  units: AICourseUnit[];
}

export interface AICourseUnit {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: AICourseLesson[];
}

export interface AICourseLesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'quiz' | 'project' | 'discussion';
  duration: number; // in minutes
  content: string;
  objectives: string[];
  resources: string[];
  youtubeUrl?: string;
  pdfUrl?: string;
  order: number;
  isPublished: boolean;
  youtubeSearchQuery?: string;
  quiz?: {
    questions: any[];
    passingScore: number;
    timeLimit: number;
  };
}

export interface YouTubeVideoResult {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
  duration: string;
  viewCount: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

class AICourseBuilderService {
  async generateCourseStructure(request: AICourseRequest, documentContent?: string): Promise<AICourseResponse> {
    try {
      const prompt = this.buildCourseGenerationPrompt(request, documentContent);
      const text = await nvidiaGenerateText({
        system:
          'You are an expert curriculum designer. Output exactly one JSON object and nothing else—no markdown fences, no commentary. The object MUST include a non-empty "learningOutcomes" array (at least 5 strings) and a non-empty "units" array (exactly 6 units). Every unit MUST include a non-empty "lessons" array (exactly 3 lessons each). Escape newlines inside strings as \\n; do not break JSON strings across unescaped line breaks.',
        user: prompt,
        temperature: 0.55,
        max_tokens: 8192,
      });

      const parsed = this.parseCourseJson(text);
      return this.normalizeCourseResponse(parsed, request);
    } catch (error) {
      console.error('Error generating course structure:', error);
      throw error;
    }
  }

  async generateYouTubeVideos(searchQuery: string, count: number = 3): Promise<YouTubeVideoResult[]> {
    try {
      const prompt = this.buildYouTubeSearchPrompt(searchQuery, count);
      const text = await nvidiaGenerateText({ user: prompt, temperature: 0.7, max_tokens: 4096 });
      
      return this.parseYouTubeResponse(text);
    } catch (error) {
      console.error('Error generating YouTube videos:', error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      return `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(prompt)}`;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  private buildCourseGenerationPrompt(request: AICourseRequest, documentContent?: string): string {
    const documentSection = documentContent ? `
DOCUMENT CONTENT TO ANALYZE:
The user has uploaded a document with the following content. Use this content to create a more targeted and specific course that builds upon the information in the document:

${documentContent.substring(0, 4000)}${documentContent.length > 4000 ? '...' : ''}

IMPORTANT: Analyze the uploaded document and create a course structure that:
1. Builds upon the concepts and information in the document
2. Uses the document's terminology and approach
3. References specific examples or topics from the document
4. Creates lessons that expand on the document's content
5. Ensures the course complements and enhances the document's information

` : '';

    return `
Create a course structure for:

Topic: ${request.topic}
Level: ${request.level}
Duration: ${request.duration} hours

${documentSection}

IMPORTANT: Use real, specific titles for ${request.topic}. No generic placeholders.

Return this exact JSON structure (no markdown, no commentary):

{
  "title": "Course Title",
  "description": "2-3 sentence description",
  "shortDescription": "One sentence",
  "learningOutcomes": ["outcome1", "outcome2", "outcome3", "outcome4", "outcome5"],
  "targetAudience": "Who this is for",
  "prerequisites": ["prereq1", "prereq2"],
  "courseOverview": "One paragraph overview",
  "practicalApproach": "One paragraph",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["kw1", "kw2", "kw3"],
  "estimatedHours": ${request.duration},
  "thumbnailPrompt": "Image description",
  "units": [
    {
      "id": 1,
      "title": "Unit Title",
      "description": "2 sentences about this unit",
      "order": 1,
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson Title",
          "description": "2 sentences about what the learner will learn",
          "type": "reading",
          "duration": 30,
          "content": "2-3 sentence teaching outline",
          "objectives": ["objective1", "objective2"],
          "resources": ["resource1"],
          "youtubeSearchQuery": "search query",
          "readingContent": "",
          "quiz": {"questions": [], "passingScore": 70, "timeLimit": 0}
        }
      ]
    }
  ]
}

Requirements:
- EXACTLY 6 units, each with EXACTLY 3 lessons
- Mix lesson types: reading, video, project, discussion (do NOT create a quiz lesson type — quizzes are generated per unit later)
- Keep "content" to 2-3 sentences only (will be expanded later)
- Keep "readingContent" empty (will be expanded later)
- Keep quiz shells empty if present; prefer no per-lesson quiz content
- Use valid JSON only. Escape newlines as \\n inside strings.
- Return only one JSON object, nothing else.
    `;
  }

  private buildYouTubeSearchPrompt(searchQuery: string, count: number): string {
    return `
Find ${count} relevant YouTube videos for the search query: "${searchQuery}"

Return the results as a JSON array with this exact format:

[
  {
    "title": "Video Title",
    "description": "Video description",
    "thumbnailUrl": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
    "videoId": "VIDEO_ID",
    "duration": "10:30",
    "viewCount": "1.2M",
    "channelTitle": "Channel Name",
    "publishedAt": "2024-01-15T10:30:00Z",
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
]

Requirements:
- Find videos that are highly relevant to the search query
- Include popular, high-quality educational content
- Ensure all URLs are properly formatted
- Use realistic view counts and durations
- Return exactly ${count} videos
- Return only the JSON array, no additional text
    `;
  }

  private parseCourseJson(text: string): unknown {
    let trimmed = text.trim().replace(/^\uFEFF/, '');
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const chunk = extractBalancedJsonObject(trimmed) ?? trimmed;
    const fixed = fixInvalidJsonEscapes(chunk);
    const escaped = escapeIllegalControlCharsInJsonStrings(fixed);
    const noTrailingCommas = escaped.replace(/,(\s*[}\]])/g, '$1');
    try {
      return JSON.parse(noTrailingCommas);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/unterminated|Unexpected end|position \d+/i.test(msg)) {
        const repaired = this.repairTruncatedJson(noTrailingCommas);
        if (repaired) {
          console.warn('JSON was truncated; repaired successfully');
          return repaired;
        }
      }
      const match = /at position (\d+)/i.exec(msg);
      if (match) {
        const pos = parseInt(match[1], 10);
        console.warn(
          'JSON.parse failed after control-char escape; context:',
          noTrailingCommas.slice(Math.max(0, pos - 80), Math.min(noTrailingCommas.length, pos + 80))
        );
      } else {
        console.warn('JSON.parse failed after control-char escape:', msg);
      }
      throw e;
    }
  }

  private repairTruncatedJson(text: string): unknown | null {
    let s = text;
    const inString = (s.match(/"/g) || []).length % 2 !== 0;
    if (inString) s += '"';
    let depth = 0;
    for (const ch of s) {
      if (ch === '{' || ch === '[') depth++;
      if (ch === '}' || ch === ']') depth--;
    }
    while (depth > 0) {
      const lastOpen = Math.max(s.lastIndexOf('{'), s.lastIndexOf('['));
      s += lastOpen >= 0 && s[lastOpen] === '{' ? '}' : ']';
      depth--;
    }
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  private normalizeLessonType(t: unknown): AICourseLesson['type'] {
    const s = String(t || 'reading').toLowerCase();
    const allowed: AICourseLesson['type'][] = ['video', 'reading', 'quiz', 'project', 'discussion'];
    return (allowed.includes(s as AICourseLesson['type']) ? s : 'reading') as AICourseLesson['type'];
  }

  private normalizeCourseResponse(data: unknown, request: AICourseRequest): AICourseResponse {
    const raw = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
    const topic = request.topic;

    const defaultOutcomes = [
      `Explain core ideas of ${topic} at a ${request.level} level`,
      `Apply ${topic} techniques in practical exercises`,
      `Evaluate trade-offs and common pitfalls in ${topic}`,
      `Build a small project or case study using ${topic}`,
      `Use documentation and community resources for ${topic} effectively`,
    ];

    const outcomesIn = Array.isArray(raw.learningOutcomes) ? raw.learningOutcomes : [];
    const learningOutcomes = outcomesIn
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim());
    const learningOutcomesFinal = learningOutcomes.length >= 3 ? learningOutcomes : defaultOutcomes;

    const prereqIn = Array.isArray(raw.prerequisites) ? raw.prerequisites : [];
    const prerequisites = prereqIn
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim());
    const prerequisitesFinal =
      prerequisites.length > 0 ? prerequisites : ['Basic computer literacy', 'Willingness to practice'];

    const tagsIn = Array.isArray(raw.tags) ? raw.tags : [];
    const tags = tagsIn.filter((x): x is string => typeof x === 'string' && x.trim()).map((x) => x.trim());
    const tagsFinal = tags.length > 0 ? tags : [topic.toLowerCase(), request.level.toLowerCase(), 'course'];

    const kwIn = Array.isArray(raw.keywords) ? raw.keywords : [];
    const keywords = kwIn.filter((x): x is string => typeof x === 'string' && x.trim()).map((x) => x.trim());
    const keywordsFinal = keywords.length > 0 ? keywords : [topic, request.level, 'online course'];

    const unitsIn = Array.isArray(raw.units) ? raw.units : [];
    const units: AICourseUnit[] = unitsIn.map((u: unknown, idx: number) => {
      const unit = (u && typeof u === 'object' ? u : {}) as Record<string, unknown>;
      const lessonsIn = Array.isArray(unit.lessons) ? unit.lessons : [];
      const lessons: AICourseLesson[] = lessonsIn.map((lesson: unknown, li: number) => {
        const L = (lesson && typeof lesson === 'object' ? lesson : {}) as Record<string, unknown>;
        const duration = typeof L.duration === 'number' && L.duration > 0 ? L.duration : 30;
        const objectives = Array.isArray(L.objectives)
          ? L.objectives.filter((x): x is string => typeof x === 'string').map((x) => x.trim())
          : [`Understand key ideas in ${String(L.title || 'this lesson')}`];
        const resources = Array.isArray(L.resources)
          ? L.resources.filter((x): x is string => typeof x === 'string').map((x) => x.trim())
          : [`Official docs and tutorials for ${topic}`];
        return {
          id: String(L.id || `lesson-${idx + 1}-${li + 1}`),
          title: String(L.title || `Lesson ${li + 1}`),
          description: String(L.description || `Learn about this topic in the context of ${topic}.`),
          type: this.normalizeLessonType(L.type),
          duration,
          content: String(L.content || ''),
          objectives: objectives.length ? objectives : [`Study ${String(L.title || 'this lesson')}`],
          resources: resources.length ? resources : [`Resources for ${topic}`],
          youtubeUrl: typeof L.youtubeUrl === 'string' ? L.youtubeUrl : '',
          pdfUrl: typeof L.pdfUrl === 'string' ? L.pdfUrl : '',
          order: typeof L.order === 'number' ? L.order : li + 1,
          isPublished: L.isPublished !== false,
          youtubeSearchQuery:
            typeof L.youtubeSearchQuery === 'string' && L.youtubeSearchQuery.trim()
              ? L.youtubeSearchQuery.trim()
              : `${String(L.title || topic)} ${topic} tutorial`,
          quiz:
            L.quiz && typeof L.quiz === 'object'
              ? (L.quiz as AICourseLesson['quiz'])
              : { questions: [], passingScore: 70, timeLimit: 0 },
        };
      });
      return {
        id: typeof unit.id === 'number' ? unit.id : idx + 1,
        title: String(unit.title || `Unit ${idx + 1}`),
        description: String(unit.description || `Topics and practice for ${topic}.`),
        order: typeof unit.order === 'number' ? unit.order : idx + 1,
        lessons,
      };
    });

    const unitsWithLessons = units.filter((u) => u.lessons.length > 0);

    if (unitsWithLessons.length === 0) {
      throw new Error(
        'The model returned units with no lessons. Try generating again, or shorten the topic / document excerpt.'
      );
    }

    let estimated =
      typeof raw.estimatedHours === 'number' && raw.estimatedHours > 0 ? raw.estimatedHours : request.duration;
    if (!estimated || estimated <= 0) {
      const minutes = unitsWithLessons.reduce(
        (sum, u) => sum + u.lessons.reduce((m, l) => m + (typeof l.duration === 'number' ? l.duration : 0), 0),
        0
      );
      estimated = Math.max(1, Math.round(minutes / 60) || request.duration);
    }

    return {
      title: String(raw.title || `${topic} — structured course`),
      description: String(raw.description || `A practical course on ${topic}.`),
      shortDescription: String(raw.shortDescription || `Learn ${topic} with guided units and lessons.`),
      learningOutcomes: learningOutcomesFinal,
      targetAudience: String(raw.targetAudience || request.targetAudience || 'Learners new to this subject'),
      prerequisites: prerequisitesFinal,
      courseOverview: String(raw.courseOverview || `Structured path through ${topic} with exercises and checks.`),
      practicalApproach: String(
        raw.practicalApproach || 'Hands-on tasks, short checks, and real-world style examples.'
      ),
      tags: tagsFinal,
      keywords: keywordsFinal,
      estimatedHours: estimated,
      thumbnailPrompt: String(raw.thumbnailPrompt || `Course cover for ${topic}`),
      units: unitsWithLessons,
    };
  }

  private parseYouTubeResponse(text: string): YouTubeVideoResult[] {
    try {
      // Clean the response text
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse JSON
      const videos = JSON.parse(cleanedText);
      
      // Validate response
      if (!Array.isArray(videos)) {
        throw new Error('Invalid YouTube response format');
      }
      
      return videos;
    } catch (error) {
      console.error('Error parsing YouTube response:', error);
      throw new Error('Failed to parse YouTube videos from AI response');
    }
  }
}

export const aiCourseBuilderService = new AICourseBuilderService();
