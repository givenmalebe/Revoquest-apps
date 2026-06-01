import { getOpenRouterApiKey, openRouterGenerateText } from '@/services/openRouterClient';
import { escapeIllegalControlCharsInJsonStrings, extractBalancedJsonObject } from '@/utils/jsonTextSafe';

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
      if (!getOpenRouterApiKey()) {
        throw new Error(
          'AI not configured. Set OPENROUTER_API_KEY in firebase-functions/.env and deploy functions.'
        );
      }

      const prompt = this.buildCourseGenerationPrompt(request, documentContent);
      const text = await openRouterGenerateText({
        system:
          'You are an expert curriculum designer. Output exactly one JSON object and nothing else—no markdown fences, no commentary. The object MUST include a non-empty "learningOutcomes" array (at least 5 strings) and a non-empty "units" array (at least 3 units). Every unit MUST include a non-empty "lessons" array (at least 2 lessons each). Escape newlines inside strings as \\n; do not break JSON strings across unescaped line breaks.',
        user: prompt,
        temperature: 0.55,
        max_tokens: 32768,
        response_format: { type: 'json_object' },
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
      if (!getOpenRouterApiKey()) {
        throw new Error(
          'AI not configured. Set OPENROUTER_API_KEY in firebase-functions/.env and deploy functions.'
        );
      }

      const prompt = this.buildYouTubeSearchPrompt(searchQuery, count);
      const text = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 4096 });
      
      return this.parseYouTubeResponse(text);
    } catch (error) {
      console.error('Error generating YouTube videos:', error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      if (!getOpenRouterApiKey()) {
        throw new Error(
          'AI not configured. Set OPENROUTER_API_KEY in firebase-functions/.env and deploy functions.'
        );
      }

      // For now, return a placeholder URL
      // In production, integrate with DALL-E, Midjourney, or similar
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
Create a comprehensive, professional course structure for the following request:

Topic: ${request.topic}
Level: ${request.level}
Duration: ${request.duration} hours
Category: ${request.category || 'General'}
Target Audience: ${request.targetAudience || 'General learners'}
Learning Goals: ${request.learningGoals?.join(', ') || 'Master the fundamentals'}
Prerequisites: ${request.prerequisites?.join(', ') || 'None'}

${documentSection}

IMPORTANT: Generate REAL, SPECIFIC content for ${request.topic}. Do NOT use generic placeholders like "Welcome and Course Overview" or "Understanding the Fundamentals". Create meaningful, topic-specific lesson titles, descriptions, and content that directly relate to ${request.topic}.

Please generate a detailed course structure with the following format (return as valid JSON):

{
  "title": "Course Title",
  "description": "Detailed course description (2-3 paragraphs)",
  "shortDescription": "Brief course description (1-2 sentences)",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4", "Outcome 5"],
  "targetAudience": "Target audience description",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "courseOverview": "Course overview and approach",
  "practicalApproach": "How the course emphasizes practical learning",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "estimatedHours": ${request.duration},
  "thumbnailPrompt": "Description for course thumbnail image",
  "units": [
    {
      "id": 1,
      "title": "Unit Title",
      "description": "Unit description",
      "order": 1,
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson Title",
          "description": "Lesson description",
          "type": "video",
          "duration": 30,
          "content": "Detailed lesson content",
          "objectives": ["Objective 1", "Objective 2"],
          "resources": ["Resource 1", "Resource 2"],
          "youtubeUrl": "",
          "pdfUrl": "",
          "order": 1,
          "isPublished": true,
          "youtubeSearchQuery": "search query for this lesson",
          "readingContent": "Comprehensive article content with multiple paragraphs",
          "quiz": {
            "questions": [],
            "passingScore": 70,
            "timeLimit": 0
          }
        }
      ]
    }
  ]
}

Requirements:
- Create 3-5 units for a comprehensive course (adjust based on duration)
- Each unit should have 2-4 lessons
- Mix different lesson types (video, reading, quiz, project, discussion)
- Include realistic durations (15-90 minutes per lesson)
- Add detailed content and objectives for each lesson
- Include relevant YouTube search queries for video lessons
- For READING lessons: Generate comprehensive article-style content with multiple detailed paragraphs covering the topic
- For QUIZ lessons: Include 5-10 relevant questions with multiple choice answers
- For PROJECT lessons: Provide step-by-step project instructions and deliverables
- For DISCUSSION lessons: Include thought-provoking discussion topics and questions
- For EVERY lesson, the "content" field must be a full teaching outline: at least 4–8 short paragraphs (or structured bullets with explanations) covering definitions, steps, one example, and one "common mistake" note—aim for ~350–900 words of teaching text per lesson (escape any line breaks inside JSON strings as \\n).
- "description" for each lesson must be 2–4 sentences that clearly state what the learner will do and learn (not a single generic sentence).
- Use only valid JSON: double-quoted strings; escape inner quotes as \\" and newlines as \\n—never emit raw line breaks inside a JSON string.
- Ensure the total duration matches the requested ${request.duration} hours
- Make the content practical and engaging
- Include real-world examples and applications
- Focus on hands-on learning and practical skills
- Generate specific, actionable learning outcomes
- Create detailed lesson descriptions that explain what students will learn
- Include practical examples and real-world applications
- Make lesson titles descriptive and specific to the topic
- Ensure content is appropriate for the specified level (${request.level})

Return only one JSON object (no markdown). Required top-level keys: title, description, shortDescription, learningOutcomes, targetAudience, prerequisites, courseOverview, practicalApproach, tags, keywords, estimatedHours, thumbnailPrompt, units.
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
    const escaped = escapeIllegalControlCharsInJsonStrings(chunk);
    const noTrailingCommas = escaped.replace(/,(\s*[}\]])/g, '$1');
    try {
      return JSON.parse(noTrailingCommas);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
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
