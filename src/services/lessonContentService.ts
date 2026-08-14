import { nvidiaGenerateText } from '@/services/nvidiaClient';


export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizContent {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number; // in minutes
  totalPoints: number;
  instructions: string;
}

export interface FinalExamGradedQuestion {
  questionId: string;
  awardedPoints: number;
  maxPoints: number;
  isCorrect: boolean;
  feedback: string;
  suggestedReviewTopic?: string;
}

export interface FinalExamGradingResult {
  percentage: number;
  earnedPoints: number;
  totalPoints: number;
  gradedQuestions: FinalExamGradedQuestion[];
}

export interface ReadingContent {
  sections: {
    title: string;
    content: string;
    keyPoints?: string[];
  }[];
  summary: string;
  keyTerms: string[];
  references: string[];
}

export interface VideoContent {
  title: string;
  description: string;
  youtubeUrl?: string;
  duration: number;
  transcript?: string;
  keyMoments: {
    timestamp: string;
    title: string;
    description: string;
  }[];
}

export interface ProjectContent {
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  deliverables: string[];
  resources: string[];
  evaluationCriteria: string[];
  estimatedTime: string;
}

export interface LessonContent {
  type: 'video' | 'reading' | 'quiz' | 'project' | 'discussion' | 'assignment';
  content: string;
  videoContent?: VideoContent;
  readingContent?: ReadingContent;
  quizContent?: QuizContent;
  projectContent?: ProjectContent;
  objectives: string[];
  resources: string[];
}

class LessonContentService {
  /**
   * Generate content based on lesson type and topic
   */
  async generateLessonContent(
    title: string,
    description: string,
    type: string,
    topic: string,
    duration: number
  ): Promise<LessonContent> {
    const baseContent = {
      type: type as any,
      content: description,
      objectives: this.generateObjectives(title, topic),
      resources: this.generateResources(topic)
    };

    switch (type) {
      case 'video':
        return {
          ...baseContent,
          videoContent: this.generateVideoContent(title, description, topic, duration)
        };

      case 'reading':
        return {
          ...baseContent,
          readingContent: this.generateReadingContent(title, description, topic)
        };

      case 'quiz':
        return {
          ...baseContent,
          quizContent: await this.generateQuizContent(title, topic)
        };

      case 'project':
        return {
          ...baseContent,
          projectContent: this.generateProjectContent(title, description, topic)
        };

      default:
        return baseContent;
    }
  }

  /**
   * Generate video content structure
   */
  private generateVideoContent(title: string, description: string, topic: string, duration: number): VideoContent {
    return {
      title,
      description,
      duration,
      keyMoments: this.generateKeyMoments(title, topic, duration)
    };
  }

  /**
   * Generate reading content structure
   */
  private generateReadingContent(title: string, description: string, topic: string): ReadingContent {
    return {
      sections: [
        {
          title: 'Introduction',
          content: this.generateReadingSectionContent(title, topic, 'introduction'),
          keyPoints: this.generateKeyPoints(title, topic, 'introduction')
        },
        {
          title: 'Main Concepts',
          content: this.generateReadingSectionContent(title, topic, 'main'),
          keyPoints: this.generateKeyPoints(title, topic, 'main')
        },
        {
          title: 'Practical Applications',
          content: this.generateReadingSectionContent(title, topic, 'applications'),
          keyPoints: this.generateKeyPoints(title, topic, 'applications')
        },
        {
          title: 'Summary',
          content: this.generateReadingSectionContent(title, topic, 'summary'),
          keyPoints: this.generateKeyPoints(title, topic, 'summary')
        }
      ],
      summary: `This lesson covered the essential concepts of ${title} in the context of ${topic}. Students learned about the fundamental principles and practical applications.`,
      keyTerms: this.generateKeyTerms(title, topic),
      references: this.generateReferences(topic)
    };
  }

  /**
   * Generate quiz content structure using AI
   */
  private async generateQuizContent(title: string, topic: string, questionCount?: number): Promise<QuizContent> {
    const questions = await this.generateQuizQuestions(title, topic);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return {
      questions,
      passingScore: 70,
      timeLimit: Math.max(15, questions.length * 2), // 2 minutes per question minimum
      totalPoints,
      instructions: `Complete this quiz to test your understanding of ${title}. You have ${Math.max(15, questions.length * 2)} minutes to complete all questions.`
    };
  }

  /**
   * Generate custom quiz content with specified parameters
   */
  async generateCustomQuizContent(
    title: string, 
    topic: string, 
    questionCount: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<QuizContent> {
    const questions = await this.generateCustomQuizQuestions(title, topic, questionCount, difficulty);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return {
      questions,
      passingScore: 70,
      timeLimit: Math.max(15, questions.length * 2),
      totalPoints,
      instructions: `Complete this quiz to test your understanding of ${title} on ${topic}. You have ${Math.max(15, questions.length * 2)} minutes to complete all questions.`
    };
  }

  /**
   * Generate project content structure
   */
  private generateProjectContent(title: string, description: string, topic: string): ProjectContent {
    return {
      title: `${title} - Hands-on Project`,
      description: `Apply your knowledge of ${title} by completing this practical project.`,
      objectives: [
        `Apply ${title} concepts in a real-world scenario`,
        `Demonstrate understanding through practical implementation`,
        `Develop problem-solving skills`,
        `Create a tangible deliverable`
      ],
      requirements: [
        'Follow the project specifications',
        'Implement all required features',
        'Include proper documentation',
        'Test your implementation thoroughly'
      ],
      deliverables: [
        'Source code or project files',
        'Documentation explaining your approach',
        'Screenshots or demo of the final result',
        'Reflection on challenges and solutions'
      ],
      resources: this.generateProjectResources(topic),
      evaluationCriteria: [
        'Correctness of implementation (40%)',
        'Code quality and organization (25%)',
        'Documentation and comments (20%)',
        'Creativity and innovation (15%)'
      ],
      estimatedTime: '2-4 hours'
    };
  }

  /**
   * Generate learning objectives
   */
  private generateObjectives(title: string, topic: string): string[] {
    return [
      `Understand the core concepts of ${title}`,
      `Apply ${title} principles in practical scenarios`,
      `Analyze real-world applications of ${title}`,
      `Evaluate different approaches to ${title} problems`
    ];
  }

  /**
   * Generate key moments for video content
   */
  private generateKeyMoments(title: string, topic: string, duration: number): VideoContent['keyMoments'] {
    const moments = [];
    const interval = Math.floor(duration / 4); // 4 key moments

    for (let i = 0; i < 4; i++) {
      const timestamp = `${Math.floor((i * interval) / 60)}:${((i * interval) % 60).toString().padStart(2, '0')}`;
      moments.push({
        timestamp,
        title: `Key Point ${i + 1}`,
        description: `Important concept about ${title}`
      });
    }

    return moments;
  }

  /**
   * Generate reading section content
   */
  private generateReadingSectionContent(title: string, topic: string, section: string): string {
    // Generate topic-specific content
    const getTopicSpecificContent = (title: string, topic: string, section: string) => {
      const lowerTitle = title.toLowerCase();
      const lowerTopic = topic.toLowerCase();
      
      if (lowerTitle.includes('javascript') || lowerTitle.includes('js') || lowerTopic.includes('javascript')) {
        const jsContent = {
          introduction: `JavaScript is a versatile programming language that powers the modern web. In this lesson, we'll explore the core concepts that make JavaScript unique and powerful. You'll learn about variables, data types, functions, and control structures that form the foundation of JavaScript programming.`,
          main: `The core concepts of JavaScript include variables, functions, objects, and arrays. We'll dive deep into how JavaScript handles data types, scope, closures, and the event loop. Understanding these concepts is crucial for writing effective JavaScript code and building interactive web applications.`,
          applications: `JavaScript is used everywhere on the web - from simple form validation to complex single-page applications. We'll examine how JavaScript powers interactive websites, handles user events, manipulates the DOM, and communicates with servers through APIs.`,
          summary: `You've learned the fundamental concepts of JavaScript programming. You now understand how variables work, how functions are defined and called, how objects and arrays store data, and how JavaScript makes web pages interactive.`
        };
        return jsContent[section as keyof typeof jsContent] || jsContent.introduction;
      } else if (lowerTitle.includes('python') || lowerTopic.includes('python')) {
        const pythonContent = {
          introduction: `Python is a powerful, versatile programming language known for its simplicity and readability. In this lesson, we'll explore Python's syntax, data structures, and fundamental concepts that make it an excellent choice for beginners and professionals alike.`,
          main: `Python's core concepts include variables, data types, control flow, and functions. We'll explore how Python handles numbers, strings, lists, dictionaries, and tuples. Understanding these concepts is essential for writing effective Python code and building applications.`,
          applications: `Python is used in web development, data science, artificial intelligence, automation, and more. We'll examine how Python powers everything from simple scripts to complex machine learning models and web applications.`,
          summary: `You've learned the fundamental concepts of Python programming. You now understand Python's syntax, data types, control structures, and how to write functions. These concepts form the foundation for more advanced Python programming.`
        };
        return pythonContent[section as keyof typeof pythonContent] || pythonContent.introduction;
      } else if (lowerTitle.includes('html') || lowerTitle.includes('css') || lowerTopic.includes('web')) {
        const webContent = {
          introduction: `Web development involves creating websites and web applications using HTML, CSS, and JavaScript. HTML provides the structure, CSS handles the styling, and JavaScript adds interactivity. This lesson focuses on the fundamental concepts of web development.`,
          main: `The core concepts of web development include HTML structure, CSS styling, and responsive design. We'll explore semantic HTML elements, CSS selectors, the box model, flexbox, grid, and how to create accessible, mobile-friendly websites.`,
          applications: `Web development skills are used to create everything from personal blogs to e-commerce sites and web applications. We'll examine how modern websites are built, the importance of responsive design, and best practices for user experience.`,
          summary: `You've learned the fundamental concepts of web development. You now understand how HTML structures content, how CSS styles and layouts work, and the principles of creating modern, accessible websites.`
        };
        return webContent[section as keyof typeof webContent] || webContent.introduction;
      }
      
      // Default content for other topics
      const defaultContent = {
        introduction: `Welcome to this comprehensive lesson on ${title}. In this section, we'll explore the fundamental concepts and provide you with a solid foundation for understanding ${topic}.`,
        main: `The core concepts of ${title} are essential for mastering ${topic}. We'll dive deep into the key principles, methodologies, and best practices that will help you succeed.`,
        applications: `Understanding how ${title} applies in real-world scenarios is crucial. We'll examine practical examples and case studies that demonstrate the value and impact of these concepts.`,
        summary: `In this lesson, we've covered the essential aspects of ${title}. You should now have a solid understanding of the key concepts and how they apply to ${topic}.`
      };
      return defaultContent[section as keyof typeof defaultContent] || defaultContent.introduction;
    };

    return getTopicSpecificContent(title, topic, section);
  }

  /**
   * Generate key points for reading sections
   */
  private generateKeyPoints(title: string, topic: string, section: string): string[] {
    // Generate topic-specific key points
    const getTopicSpecificKeyPoints = (title: string, topic: string, section: string) => {
      const lowerTitle = title.toLowerCase();
      const lowerTopic = topic.toLowerCase();
      
      if (lowerTitle.includes('javascript') || lowerTitle.includes('js') || lowerTopic.includes('javascript')) {
        const jsKeyPoints = {
          introduction: [
            'JavaScript is a versatile programming language for web development',
            'Understanding variables and data types is fundamental',
            'Functions are first-class citizens in JavaScript',
            'JavaScript runs in browsers and on servers with Node.js'
          ],
          main: [
            'Variables can be declared with var, let, or const',
            'JavaScript uses dynamic typing and type coercion',
            'Objects and arrays are key data structures',
            'Scope and closures are important concepts to understand'
          ],
          applications: [
            'JavaScript powers interactive web pages and SPAs',
            'Event handling makes websites responsive to user actions',
            'APIs allow JavaScript to communicate with servers',
            'Modern frameworks like React and Vue build on JavaScript'
          ],
          summary: [
            'You now understand JavaScript fundamentals',
            'Variables, functions, objects, and arrays are core concepts',
            'JavaScript enables interactive web experiences',
            'Continue practicing with projects and exercises'
          ]
        };
        return jsKeyPoints[section as keyof typeof jsKeyPoints] || jsKeyPoints.introduction;
      } else if (lowerTitle.includes('python') || lowerTopic.includes('python')) {
        const pythonKeyPoints = {
          introduction: [
            'Python is known for its simple, readable syntax',
            'Indentation is crucial for Python code structure',
            'Python supports multiple programming paradigms',
            'The Python interpreter allows interactive coding'
          ],
          main: [
            'Python uses dynamic typing and duck typing',
            'Lists, tuples, dictionaries, and sets are key data structures',
            'Functions are defined with the def keyword',
            'Python has a rich standard library'
          ],
          applications: [
            'Python is used in web development with Django/Flask',
            'Data science and machine learning rely heavily on Python',
            'Python excels at automation and scripting tasks',
            'Scientific computing uses Python with NumPy and SciPy'
          ],
          summary: [
            'You understand Python syntax and basic concepts',
            'Data structures and functions are fundamental',
            'Python is versatile and widely used in industry',
            'Continue learning with projects and libraries'
          ]
        };
        return pythonKeyPoints[section as keyof typeof pythonKeyPoints] || pythonKeyPoints.introduction;
      } else if (lowerTitle.includes('html') || lowerTitle.includes('css') || lowerTopic.includes('web')) {
        const webKeyPoints = {
          introduction: [
            'HTML provides the structure and content of web pages',
            'CSS controls the visual appearance and layout',
            'JavaScript adds interactivity and dynamic behavior',
            'Web standards ensure cross-browser compatibility'
          ],
          main: [
            'Semantic HTML elements improve accessibility and SEO',
            'CSS selectors target specific elements for styling',
            'The box model affects how elements are sized and spaced',
            'Flexbox and Grid provide powerful layout options'
          ],
          applications: [
            'Responsive design ensures websites work on all devices',
            'Web accessibility makes sites usable for everyone',
            'Performance optimization improves user experience',
            'Modern web development uses frameworks and tools'
          ],
          summary: [
            'You understand the three pillars of web development',
            'HTML, CSS, and JavaScript work together to create websites',
            'Best practices ensure maintainable and accessible code',
            'Continue learning with modern frameworks and tools'
          ]
        };
        return webKeyPoints[section as keyof typeof webKeyPoints] || webKeyPoints.introduction;
      }
      
      // Default key points for other topics
      const defaultKeyPoints = {
        introduction: [
          `${title} is a fundamental concept in ${topic}`,
          'Understanding the basics is crucial for advanced learning',
          'Practical application helps reinforce theoretical knowledge'
        ],
        main: [
          'Core principles form the foundation of understanding',
          'Best practices ensure effective implementation',
          'Common pitfalls should be avoided'
        ],
        applications: [
          'Real-world examples demonstrate practical value',
          'Case studies provide insights into implementation',
          'Industry standards guide best practices'
        ],
        summary: [
          'Key concepts have been thoroughly covered',
          'Practical applications have been demonstrated',
          'Next steps for continued learning are clear'
        ]
      };
      return defaultKeyPoints[section as keyof typeof defaultKeyPoints] || defaultKeyPoints.introduction;
    };

    return getTopicSpecificKeyPoints(title, topic, section);
  }

  /**
   * Generate quiz questions using AI
   */
  private async generateQuizQuestions(title: string, topic: string): Promise<QuizQuestion[]> {
    try {
      const prompt = `You are an expert educational assessment designer. Create 5 high-quality quiz questions about "${title}" in the context of "${topic}".

Requirements:
- Create a mix of question types: multiple-choice, true-false, short-answer, and essay
- Questions should test understanding, not just memorization
- Make questions progressively challenging
- Include real-world applications and scenarios
- Ensure questions are clear and unambiguous
- Provide plausible but incorrect options for multiple-choice questions
- Focus on practical knowledge and critical thinking

Format your response as JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this answer is correct",
      "points": 10
    },
    {
      "id": "q2", 
      "question": "True or false question text",
      "type": "true-false",
      "correctAnswer": "True",
      "explanation": "Explanation of why this is true/false",
      "points": 5
    },
    {
      "id": "q3",
      "question": "Short answer question text",
      "type": "short-answer", 
      "correctAnswer": "Expected answer key terms",
      "explanation": "What the answer should include",
      "points": 15
    },
    {
      "id": "q4",
      "question": "Essay question text",
      "type": "essay",
      "correctAnswer": "Key points that should be covered",
      "explanation": "What makes a good answer",
      "points": 25
    },
    {
      "id": "q5",
      "question": "Another multiple choice question",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B", 
      "explanation": "Why this answer is correct",
      "points": 10
    }
  ]
}`;

      const text = await nvidiaGenerateText({
        user: prompt,
        temperature: 0.6,
        max_tokens: 4096
      });
      
      // Clean the response text to extract JSON
      let jsonText = text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0];
      }
      
      // Remove any leading/trailing whitespace
      jsonText = jsonText.trim();
      
      // Parse the JSON response
      const parsed = JSON.parse(jsonText);
      return parsed.questions || [];
      
    } catch (error) {
      console.error('AI quiz generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate custom quiz questions using AI with specified count and difficulty
   */
  private async generateCustomQuizQuestions(
    title: string, 
    topic: string, 
    questionCount: number, 
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<QuizQuestion[]> {
    try {
      const difficultyDescription = {
        easy: "basic understanding and recall",
        medium: "application and analysis",
        hard: "synthesis, evaluation, and complex problem-solving"
      };

      const prompt = `You are an expert educational assessment designer. Create ${questionCount} high-quality quiz questions about "${title}" in the context of "${topic}".

Difficulty Level: ${difficulty} (${difficultyDescription[difficulty]})

Requirements:
- Create a balanced mix of question types: multiple-choice, true-false, short-answer, and essay
- Questions should test ${difficultyDescription[difficulty]}
- Make questions progressively challenging within the difficulty level
- Include real-world applications and scenarios
- Ensure questions are clear and unambiguous
- Provide plausible but incorrect options for multiple-choice questions
- Focus on practical knowledge and critical thinking appropriate for ${difficulty} level
- For ${difficulty} level: ${difficulty === 'easy' ? 'focus on basic concepts and definitions' : difficulty === 'medium' ? 'include application scenarios and analysis' : 'require synthesis, evaluation, and complex reasoning'}

Point values by difficulty:
- Easy: MC=5, TF=3, SA=8, Essay=15
- Medium: MC=10, TF=5, SA=12, Essay=20  
- Hard: MC=15, TF=8, SA=18, Essay=30

Format your response as JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this answer is correct",
      "points": 10
    }
  ]
}`;

      const text = await nvidiaGenerateText({
        user: prompt,
        temperature: 0.7,
        max_tokens: 4096
      });
      
      // Clean the response text to extract JSON
      let jsonText = text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0];
      }
      
      // Remove any leading/trailing whitespace
      jsonText = jsonText.trim();
      
      // Parse the JSON response
      const parsed = JSON.parse(jsonText);
      return parsed.questions || [];
      
    } catch (error) {
      console.error('AI custom quiz generation failed:', error);
      throw error;
    }
  }
  /**
   * Generate key terms
   */
  private generateKeyTerms(title: string, topic: string): string[] {
    return [
      title,
      topic,
      'Best Practices',
      'Implementation',
      'Quality Standards',
      'Methodology',
      'Framework',
      'Principles'
    ];
  }

  /**
   * Generate references
   */
  private generateReferences(topic: string): string[] {
    return [
      `Official ${topic} Documentation`,
      'Industry Best Practices Guide',
      'Academic Research Papers',
      'Professional Development Resources'
    ];
  }

  /**
   * Generate resources
   */
  private generateResources(topic: string): string[] {
    return [
      `https://example.com/${topic.toLowerCase()}-guide`,
      `https://example.com/${topic.toLowerCase()}-tutorial`,
      `https://example.com/${topic.toLowerCase()}-best-practices`
    ];
  }

  /**
   * Generate project resources
   */
  private generateProjectResources(topic: string): string[] {
    return [
      'Project template and starter files',
      'Step-by-step implementation guide',
      'Code examples and snippets',
      'Testing and validation checklist'
    ];
  }

  /**
   * Generate a step-by-step curriculum lesson as structured HTML using AI.
   * Structure: Learning Objectives (with "By the end of this lesson, you will be able to:" and bullet list with bold verbs),
   * then Main Content (section headings and sub-headings like "What is X?", paragraphs).
   */
  async generateCurriculumLessonContent(
    title: string,
    description: string,
    topic: string,
    duration: number,
    existingContent?: string
  ): Promise<{ richTextContent: string; objectives: string[]; resources: string[]; content: string }> {
    const objectives = this.generateObjectives(title, topic);
    const resources = this.generateResources(topic);
    try {
      const existingPlain = existingContent?.trim()
        ? existingContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000)
        : '';
      const existingSection = existingPlain
        ? `\nEXISTING LESSON CONTENT (read this first, then EXPAND and ENHANCE it — do NOT discard it):\n<existing>\n${existingPlain}\n</existing>\n\n`
        : '';

      const prompt = `You are an expert curriculum designer creating a premium textbook-quality lesson. Output ONLY valid HTML — no markdown, no code fences.

LESSON DETAILS:
Title: ${title}
Topic: ${topic}
Description: ${description}
Duration: ${duration} minutes
${existingSection}
INSTRUCTIONS:${existingContent?.trim() ? `
This lesson already has content. Your job is to EXPAND it:
1. Keep ALL existing sections and their content — do NOT remove or shorten anything
2. DEEPEN existing sections by adding more paragraphs, examples, and explanations
3. ADD 2-3 NEW content blocks with fresh topics, definitions, examples, and real-world applications
4. Add more definition-box, callout-box, deep-dive, real-world-box, and common-mistake-box elements
5. Add more worked examples with step-by-step solutions
6. The final lesson should be significantly longer and richer than the original
7. Output the COMPLETE lesson — existing content + all your additions merged together` : `
Create a brand new lesson from scratch:
`}

CRITICAL REQUIREMENTS:
- Write 3000+ words of actual teaching content across 5-6 content blocks
- Each content block MUST have 3-4 detailed paragraphs (150-200 words each)
- Use ALL the CSS classes provided below — do not skip any
- Every section must include real examples, analogies, and step-by-step reasoning
- Write like a university lecturer, not a textbook summary

OUTPUT ONLY valid HTML. Start with <article class="curriculum-lesson">. Do NOT include <html>, <head>, or <body>.

STRUCTURE (use these exact CSS class names):

1. <article class="curriculum-lesson">

2. LESSON TIME (required, right after <article>):
   <div class="lesson-time-estimate">
     <span class="time-badge">Estimated time: ${duration} min</span>
     <span class="time-hint">Complete at your own pace; the platform will track your progress.</span>
   </div>

3. UNIT CONTEXT: <p class="unit-context">Unit: [topic] — [lesson title]</p>

4. LEARNING OBJECTIVES (4-5 items):
   <section class="lesson-objectives">
     <h2 class="objectives-heading">Learning Objectives</h2>
     <hr class="section-rule" />
     <p class="objectives-intro">By the end of this lesson, you will be able to:</p>
     <ul class="objectives-list">
       <li class="objective-item"><strong>Define</strong> [concept]...</li>
       <li class="objective-item"><strong>Explain</strong> [principle]...</li>
       <li class="objective-item"><strong>Analyze</strong> [relationship]...</li>
       <li class="objective-item"><strong>Evaluate</strong> [impact]...</li>
     </ul>
   </section>
   Bold the first verb in each <li>. Use class="objective-item" on every <li>.

5. MAIN CONTENT — 5-6 numbered content blocks. Each block MUST contain:
   - A heading, 3-4 paragraphs of teaching content, and at least ONE special element
   - Use class="content-block" on each block wrapper
   - Use class="section-badge" for section labels
   - Use class="content-subheading" for h3 headings

   SPECIAL ELEMENTS (use ALL of these at least once across the lesson):
   a) <div class="formula-box"><p>[Formula or key definition]</p></div>
   b) <div class="key-rule-box"><h4>Key Rule: [Name]</h4><p>...</p></div>
   c) <div class="example-block"><h4 class="example-title">Example: [Name]</h4><p><strong>Problem:</strong>...</p><ol class="solution-steps"><li><strong>Step 1:</strong>...</li><li><strong>Step 2:</strong>...</li></ol></div>
   d) <div class="exam-tip-box"><strong>Exam Tip:</strong>...</div>
   e) <div class="definition-box"><h4>Definition: [Term]</h4><p>...</p></div>
   f) <div class="callout-box"><strong>Key Insight:</strong><p>...</p></div>
   g) <div class="highlight-box"><h4>Important: [Concept]</h4><p>...</p></div>
   h) <div class="info-box"><h4>Did you know?</h4><p>...</p></div>
   i) <div class="warning-box"><h4>Common Mistake:</h4><p>...</p></div>
   j) <div class="quote-box"><p>"[Quote or citation]"</p><cite>— [Source]</cite></div>
   k) <div class="deep-dive"><h4>Deep Dive: [Topic]</h4><p>...</p><p>...</p></div>
   l) <div class="real-world-box"><h4>Real-World Application</h4><p>...</p></div>
   m) <div class="common-mistake-box"><h4>Common Mistake to Avoid:</h4><p>...</p></div>
   n) <hr class="content-divider" /> (use between major sections)
   o) <span class="section-number">1</span> (before subheadings for numbered sections)
   p) <figure class="lesson-image" data-prompt="[Image description]"></figure> (image placeholders)

6. QUIZ PREP (required before Key Takeaways):
   <section class="quiz-prep-box">
     <h3 class="quiz-prep-heading">Ready for the quiz?</h3>
     <p class="quiz-prep-text">After reviewing the key takeaways below, you will take a short quiz to check your understanding.</p>
   </section>

7. KEY TAKEAWAYS (2x2 grid):
   <section class="key-takeaways">
     <h2 class="section-heading">Key Takeaways</h2>
     <hr class="section-rule" />
     <div class="takeaways-grid">
       <div class="takeaway-card"><h4 class="takeaway-title">[Title]</h4><p>...</p></div>
       <div class="takeaway-card"><h4 class="takeaway-title">[Title]</h4><p>...</p></div>
       <div class="takeaway-card"><h4 class="takeaway-title">[Title]</h4><p>...</p></div>
       <div class="takeaway-card"><h4 class="takeaway-title">[Title]</h4><p>...</p></div>
     </div>
   </section>

8. PRACTICE (required):
   <section class="practice-opportunities">
     <h2 class="section-heading">Practice Opportunities</h2>
     <hr class="section-rule" />
     <div class="challenge-set">
       <h4>Challenge Set 1: Apply Your Knowledge</h4>
       <p>[Short scenario]</p>
       <ol class="practice-list">
         <li><strong>Question 1:</strong> ...</li>
         <li><strong>Question 2:</strong> ...</li>
         <li><strong>Question 3:</strong> ...</li>
       </ol>
       <details class="practice-solutions">
         <summary>View solutions (self-check)</summary>
         <ol>
           <li><strong>Question 1:</strong> [model answer]</li>
           <li><strong>Question 2:</strong> [model answer]</li>
           <li><strong>Question 3:</strong> [model answer]</li>
         </ol>
       </details>
     </div>
   </section>
   RULES FOR PRACTICE:
   - Do NOT use <a href> or fake "View Solutions" links.
   - Always include working <details class="practice-solutions"> with a <summary> and the answers inside.
   - Answers must match the questions 1-for-1.

9. COMPARISON TABLE (if applicable):
   <div class="comparison-table"><table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table></div>

10. KEY TERMS:
    <div class="key-terms-box"><h3>Key Terms</h3><p><span class="term">[term1]</span> <span class="term">[term2]</span> ...</p></div>

Use <sup> for superscripts. Bold key terms with class="key-term-badge". Write substantial content — this is a full lesson, not an outline.`;

      const htmlText = await nvidiaGenerateText({
        user: prompt,
        temperature: 0.65,
        max_tokens: 8192
      });
      let html = htmlText.trim();

      if (html.startsWith('```')) {
        html = html.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '');
      }
      html = html.trim();

      if (!html.includes('class="curriculum-lesson"') && !html.includes("class='curriculum-lesson'")) {
        html = `<article class="curriculum-lesson">${html}</article>`;
      }

      const { sanitizePracticeHtml } = await import('@/utils/lessonHtml');
      html = sanitizePracticeHtml(html);

      const content = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000);
      return { richTextContent: html, objectives, resources, content };
    } catch (error) {
      console.error('AI curriculum generation failed, using fallback:', error);
      const fallbackReading = this.generateReadingContent(title, description, topic);
      const fallbackHtml = this.readingContentToHtml(fallbackReading);
      return {
        richTextContent: fallbackHtml,
        objectives,
        resources,
        content: fallbackReading.sections.map(s => s.content).join(' ').slice(0, 2000)
      };
    }
  }

  /**
   * Generate quiz questions from lesson content using AI (Gemini 2.5 Flash).
   * Questions are based on the lesson text so they test understanding of the material.
   */
  async generateQuizFromLessonContent(
    lessonTitle: string,
    lessonText: string
  ): Promise<QuizContent> {
    const sourceText = lessonText?.trim() || lessonTitle;
    try {
      const prompt = `You are an expert assessment designer. Based on the following lesson content, create a quiz to verify understanding.

Lesson title: ${lessonTitle}

Lesson content:
${sourceText.slice(0, 6000)}

Create 5-6 multiple-choice questions that:
- Test understanding of key concepts, definitions, and applications from the lesson
- Include scenario-based questions where appropriate (e.g. "In the scenario involving X, which...")
- Have 4 options each with one correct answer
- Are clear and unambiguous

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct",
      "points": 10
    }
  ]
}`;

      const jsonTextRaw = await nvidiaGenerateText({
        user: prompt,
        temperature: 0.6,
        max_tokens: 4096
      });
      let jsonText = jsonTextRaw.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      jsonText = jsonText.trim();
      const parsed = JSON.parse(jsonText);
      const questions: QuizQuestion[] = (parsed.questions || []).map((q: any, i: number) => ({
        id: q.id || `q${i + 1}`,
        question: q.question || '',
        type: 'multiple-choice' as const,
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? (q.options ? q.options[0] : ''),
        explanation: q.explanation,
        points: typeof q.points === 'number' ? q.points : 10
      }));
      if (questions.length === 0) {
        throw new Error('AI returned no quiz questions');
      }
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      return {
        questions,
        passingScore: 70,
        timeLimit: Math.max(15, questions.length * 2),
        totalPoints,
        instructions: 'Complete this quiz to verify your understanding of the lesson content.'
      };
    } catch (error) {
      console.error('AI quiz-from-content generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate one quiz covering an entire unit (all lessons), for unit-level assessment.
   */
  async generateQuizFromUnitContent(
    unitTitle: string,
    unitDescription: string,
    lessons: { title: string; description?: string; content?: string; richTextContent?: string; objectives?: string[] }[],
    questionCount: number = 8
  ): Promise<QuizContent> {
    const lessonBlocks = lessons
      .map((lesson, index) => {
        const parts = [
          `Lesson ${index + 1}: ${lesson.title}`,
          lesson.description || '',
          (lesson.objectives || []).length ? `Objectives: ${lesson.objectives.join('; ')}` : '',
          (lesson.content || '').slice(0, 1200),
          (lesson.richTextContent || '').replace(/<[^>]+>/g, ' ').slice(0, 1200),
        ].filter(Boolean);
        return parts.join('\n');
      })
      .join('\n\n---\n\n')
      .slice(0, 12000);

    const prompt = `You are an expert assessment designer for South African SETA/QCTO short courses.
Create ONE unit quiz that covers the WHOLE unit (not individual lessons).

Unit title: ${unitTitle}
Unit description: ${unitDescription || 'N/A'}

Unit lessons and content:
${lessonBlocks || unitTitle}

Create exactly ${Math.max(5, Math.min(15, questionCount))} multiple-choice questions that:
- Assess understanding across the full unit (spread coverage across lessons)
- Include a mix of knowledge, application, and scenario questions
- Have 4 options each with exactly one correct answer
- Are clear and unambiguous

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct",
      "points": 10
    }
  ]
}`;

    const jsonTextRaw = await nvidiaGenerateText({
      user: prompt,
      temperature: 0.55,
      max_tokens: 4096,
    });
    let jsonText = jsonTextRaw.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(jsonText.trim());
    const questions: QuizQuestion[] = (parsed.questions || []).map((q: any, i: number) => ({
      id: q.id || `uq${i + 1}`,
      question: q.question || '',
      type: 'multiple-choice' as const,
      options: q.options || [],
      correctAnswer: q.correctAnswer ?? (q.options ? q.options[0] : ''),
      explanation: q.explanation,
      points: typeof q.points === 'number' ? q.points : 10,
    }));
    if (questions.length === 0) {
      throw new Error('AI returned no unit quiz questions');
    }
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    return {
      questions,
      passingScore: 70,
      timeLimit: Math.max(20, questions.length * 2),
      totalPoints,
      instructions: `Complete this unit quiz to verify your understanding of "${unitTitle}".`,
    };
  }

  /**
   * Refine an existing unit quiz using admin feedback (keep structure, improve questions).
   */
  async refineQuizContent(
    unitTitle: string,
    existingQuiz: QuizContent,
    refineInstructions: string
  ): Promise<QuizContent> {
    const existingJson = JSON.stringify(
      {
        questions: existingQuiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
        })),
      },
      null,
      2
    ).slice(0, 8000);

    const prompt = `You are refining a unit quiz for "${unitTitle}".

Admin refinement instructions:
${refineInstructions.trim() || 'Improve clarity, difficulty balance, and explanations while keeping coverage of the unit.'}

Current quiz JSON:
${existingJson}

Return an improved quiz as ONLY a JSON object (no markdown):
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "...",
      "points": 10
    }
  ]
}

Rules:
- Keep roughly the same number of questions (${existingQuiz.questions.length})
- Prefer multiple-choice with 4 options
- Apply the admin instructions carefully
- Keep correct answers accurate`;

    const jsonTextRaw = await nvidiaGenerateText({
      user: prompt,
      temperature: 0.5,
      max_tokens: 4096,
    });
    let jsonText = jsonTextRaw.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(jsonText.trim());
    const questions: QuizQuestion[] = (parsed.questions || []).map((q: any, i: number) => ({
      id: q.id || `uq${i + 1}`,
      question: q.question || '',
      type: (q.type as QuizQuestion['type']) || 'multiple-choice',
      options: q.options || [],
      correctAnswer: q.correctAnswer ?? (q.options ? q.options[0] : ''),
      explanation: q.explanation,
      points: typeof q.points === 'number' ? q.points : 10,
    }));
    if (questions.length === 0) {
      throw new Error('AI returned no refined quiz questions');
    }
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    return {
      questions,
      passingScore: existingQuiz.passingScore || 70,
      timeLimit: existingQuiz.timeLimit || Math.max(20, questions.length * 2),
      totalPoints,
      instructions:
        existingQuiz.instructions ||
        `Complete this unit quiz to verify your understanding of "${unitTitle}".`,
    };
  }

  /**
   * Generate a 30-question multiple-choice final exam from the course outline.
   */
  async generateFinalExam(courseTitle: string, courseSummary: string): Promise<QuizContent> {
    const summaryLines = courseSummary
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const lessonLines = summaryLines
      .filter((line) => line.startsWith('- '))
      .map((line) => line.replace(/^- /, '').replace(/\s+Objectives:.*/, '').trim())
      .filter(Boolean);
    const unitLines = summaryLines
      .filter((line) => line.toLowerCase().startsWith('unit:'))
      .map((line) => line.replace(/^unit:\s*/i, '').trim())
      .filter(Boolean);
    const topics = [...new Set([...lessonLines, ...unitLines, courseTitle].filter(Boolean))];
    while (topics.length < 30) {
      topics.push(`${courseTitle} core concept ${topics.length + 1}`);
    }

    const questionTemplates = [
      (topic: string) => `What is the best demonstration of understanding "${topic}" in ${courseTitle}?`,
      (topic: string) => `When applying "${topic}", what should a learner do first?`,
      (topic: string) => `Which outcome best shows that "${topic}" has been applied correctly?`,
      (topic: string) => `What mistake should be avoided when working with "${topic}"?`,
      (topic: string) => `Why is "${topic}" important in ${courseTitle}?`,
      (topic: string) => `Which learner action best connects "${topic}" to real practice?`
    ];

    const makeOptions = (topic: string, index: number) => {
      const correctOptions = [
        `Explain ${topic} clearly and apply it to a relevant example`,
        `Identify the goal of ${topic} before choosing the method`,
        `A practical result that matches the purpose of ${topic}`,
        `Using ${topic} without checking the course requirements`,
        `It supports accurate decisions and better performance in ${courseTitle}`,
        `Use ${topic} to solve a realistic problem from the course`
      ];
      const correct = correctOptions[index % correctOptions.length];
      const distractors = [
        `Memorize the title of ${topic} without explaining it`,
        `Ignore the lesson context and use an unrelated method`,
        `Skip the key steps and focus only on finishing quickly`,
        `Treat ${topic} as theory only with no practical use`,
        `Choose an answer before reading the full scenario`,
        `Use the same response for every situation in the course`
      ];
      const options = [
        correct,
        distractors[(index + 1) % distractors.length],
        distractors[(index + 3) % distractors.length],
        distractors[(index + 5) % distractors.length]
      ];
      const rotation = index % options.length;
      return {
        correct,
        options: [...options.slice(rotation), ...options.slice(0, rotation)]
      };
    };

    const questions: QuizQuestion[] = Array.from({ length: 30 }, (_, index) => {
      const topic = topics[index % topics.length];
      const { correct, options } = makeOptions(topic, index);
      return {
        id: `q${index + 1}`,
        question: questionTemplates[index % questionTemplates.length](topic),
        type: 'multiple-choice',
        options,
        correctAnswer: correct,
        explanation: `The correct answer shows understanding of ${topic} and connects it to practical learning in ${courseTitle}.`,
        points: 2
      };
    });

    return {
      questions,
      passingScore: 80,
      timeLimit: 90,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      instructions: 'Final exam for the course. Answer all 30 multiple-choice questions. You need 80% to pass.'
    };
  }

  async gradeFinalExamAnswers(
    courseTitle: string,
    questions: QuizQuestion[],
    answers: Record<string, string>
  ): Promise<FinalExamGradingResult> {
    const totalPoints = questions.reduce((sum, question) => sum + (question.points || 0), 0);
    const gradingItems = questions.map((question) => ({
      id: question.id,
      question: question.question,
      maxPoints: question.points || 10,
      modelAnswer: Array.isArray(question.correctAnswer)
        ? question.correctAnswer.join(' / ')
        : String(question.correctAnswer || ''),
      rubric: question.explanation || '',
      learnerAnswer: answers[question.id] || ''
    }));

    const prompt = `You are a strict but fair final-exam grader.

Course: ${courseTitle}

Grade each learner answer semantically against the question, model answer, and rubric.

Rules:
- Award points for correct understanding even when wording differs from the model answer.
- Do not require exact wording.
- Award zero for blank, irrelevant, or contradictory answers.
- Give partial credit for answers that include some correct key ideas but miss important details.
- Do not invent credit for vague answers.
- isCorrect must be true only when awardedPoints is at least 80% of maxPoints.

Return ONLY valid JSON in this shape:
{
  "gradedQuestions": [
    {
      "questionId": "q1",
      "awardedPoints": 0,
      "maxPoints": 10,
      "isCorrect": false,
      "feedback": "Short feedback explaining the mark",
      "suggestedReviewTopic": "Topic to review"
    }
  ]
}

Items to grade:
${JSON.stringify(gradingItems)}`;

    const response = await nvidiaGenerateText({
      user: prompt,
      temperature: 0.1,
      max_tokens: 5000,
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(response);
    const rawGrades = Array.isArray(parsed.gradedQuestions) ? parsed.gradedQuestions : [];
    const gradesById = new Map<string, any>(rawGrades.map((grade: any) => [String(grade.questionId), grade]));

    const gradedQuestions = questions.map((question): FinalExamGradedQuestion => {
      const maxPoints = question.points || 10;
      const raw = gradesById.get(question.id);
      const awardedPoints = Math.max(0, Math.min(maxPoints, Number(raw?.awardedPoints ?? 0)));
      return {
        questionId: question.id,
        awardedPoints,
        maxPoints,
        isCorrect: awardedPoints >= maxPoints * 0.8,
        feedback: typeof raw?.feedback === 'string' && raw.feedback.trim()
          ? raw.feedback.trim()
          : 'No grading feedback returned.',
        suggestedReviewTopic: typeof raw?.suggestedReviewTopic === 'string'
          ? raw.suggestedReviewTopic.trim()
          : undefined
      };
    });

    const earnedPoints = gradedQuestions.reduce((sum, question) => sum + question.awardedPoints, 0);
    return {
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      earnedPoints,
      totalPoints,
      gradedQuestions
    };
  }

  /**
   * Convert ReadingContent to structured HTML matching the curriculum format (objectives + main content).
   */
  private readingContentToHtml(reading: ReadingContent): string {
    const objectivesList = (reading.sections.flatMap((s) => s.keyPoints || []).slice(0, 5))
      .map((p) => `<li class="objective-item">${escapeHtml(p)}</li>`)
      .join('') || '<li class="objective-item">Understand the key concepts covered in this lesson.</li>';
    const contentBlocks = reading.sections
      .map(
        (s) => `<div class="content-block"><h3 class="content-subheading">${escapeHtml(s.title)}</h3><p>${escapeHtml(s.content)}</p></div>`
      )
      .join('');
    return `<article class="curriculum-lesson">
      <div class="lesson-time-estimate"><span class="time-badge">Estimated time: 30 min</span><span class="time-hint">Complete at your own pace; the platform will track your progress.</span></div>
      <section class="lesson-objectives">
        <h2 class="objectives-heading">Learning Objectives</h2>
        <hr class="section-rule" />
        <p class="objectives-intro">By the end of this lesson, you will be able to:</p>
        <ul class="objectives-list">${objectivesList}</ul>
      </section>
      <section class="main-content">
        <h2 class="section-heading">Main Content</h2>
        <hr class="section-rule" />
        ${contentBlocks}
      </section>
      <section class="quiz-prep-box"><h3 class="quiz-prep-heading">Ready for the quiz?</h3><p class="quiz-prep-text">After reviewing the key takeaways, you will take a short quiz to check your understanding.</p></section>
      <section class="key-takeaways"><h2 class="section-heading">Key Takeaways</h2><hr class="section-rule" /><div class="takeaways-grid"><div class="takeaway-card"><h4 class="takeaway-title">Summary</h4><p>Review the main points before the quiz.</p></div></div></section>
    </article>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const lessonContentService = new LessonContentService();
