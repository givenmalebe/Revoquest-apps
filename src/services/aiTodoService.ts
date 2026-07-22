import { nvidiaGenerateText } from '@/services/nvidiaClient';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category: 'study' | 'assignment' | 'exam' | 'personal' | 'meeting' | 'project' | 'review';
  aiGenerated: boolean;
  createdAt: string;
  completedAt?: string;
  estimatedDuration?: number; // in minutes
  tags?: string[];
  relatedCourseId?: string;
  relatedLessonId?: string;
}

export interface AITodoGenerationRequest {
  context?: {
    courseTitle?: string;
    courseDescription?: string;
    currentLesson?: string;
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    studyGoals?: string[];
    availableTime?: number; // in hours per week
    deadline?: string;
  };
  todoType?: 'study' | 'assignment' | 'exam' | 'personal' | 'meeting' | 'project' | 'review';
  count?: number; // number of todos to generate
  focus?: string; // specific focus area
}

export interface AITodoGenerationResponse {
  todos: Omit<TodoItem, 'id' | 'createdAt' | 'aiGenerated' | 'completed'>[];
  suggestions: string[];
  studyPlan?: {
    weeklySchedule: string[];
    milestones: string[];
    recommendations: string[];
  };
}

class AITodoService {
  /**
   * Generate AI-powered todos based on context
   */
  async generateTodos(request: AITodoGenerationRequest): Promise<AITodoGenerationResponse> {
    try {
      const prompt = this.buildTodoGenerationPrompt(request);
      
      const text = await nvidiaGenerateText({ user: prompt, temperature: 0.8, max_tokens: 8192 });
      
      // Parse the JSON response
      const parsed = JSON.parse(text);
      
      return {
        todos: parsed.todos || [],
        suggestions: parsed.suggestions || [],
        studyPlan: parsed.studyPlan
      };
    } catch (error) {
      console.error('AI Todo generation failed:', error);
      
      // Fallback to mock data if AI fails
      return this.generateMockTodos(request);
    }
  }

  /**
   * Generate smart study schedule based on course content
   */
  async generateStudySchedule(courseData: any, userPreferences: any): Promise<AITodoGenerationResponse> {
    const request: AITodoGenerationRequest = {
      context: {
        courseTitle: courseData.title,
        courseDescription: courseData.description,
        userLevel: userPreferences.level || 'beginner',
        studyGoals: userPreferences.goals || ['Complete the course'],
        availableTime: userPreferences.availableTime || 10,
        deadline: userPreferences.deadline
      },
      todoType: 'study',
      count: 15,
      focus: 'comprehensive study plan'
    };

    return this.generateTodos(request);
  }

  /**
   * Generate assignment-specific todos
   */
  async generateAssignmentTodos(assignmentData: any): Promise<AITodoGenerationResponse> {
    const request: AITodoGenerationRequest = {
      context: {
        courseTitle: assignmentData.courseTitle,
        currentLesson: assignmentData.lessonTitle,
        deadline: assignmentData.dueDate
      },
      todoType: 'assignment',
      count: 8,
      focus: assignmentData.assignmentType || 'general assignment'
    };

    return this.generateTodos(request);
  }

  /**
   * Generate exam preparation todos
   */
  async generateExamTodos(examData: any): Promise<AITodoGenerationResponse> {
    const request: AITodoGenerationRequest = {
      context: {
        courseTitle: examData.courseTitle,
        currentLesson: examData.examTopic,
        deadline: examData.examDate,
        userLevel: examData.level || 'intermediate'
      },
      todoType: 'exam',
      count: 12,
      focus: 'exam preparation and review'
    };

    return this.generateTodos(request);
  }

  /**
   * Generate project-based todos
   */
  async generateProjectTodos(projectData: any): Promise<AITodoGenerationResponse> {
    const request: AITodoGenerationRequest = {
      context: {
        courseTitle: projectData.courseTitle,
        currentLesson: projectData.projectTitle,
        deadline: projectData.dueDate,
        userLevel: projectData.level || 'intermediate'
      },
      todoType: 'project',
      count: 10,
      focus: projectData.projectType || 'practical project'
    };

    return this.generateTodos(request);
  }

  /**
   * Build the AI prompt for todo generation
   */
  private buildTodoGenerationPrompt(request: AITodoGenerationRequest): string {
    const context = request.context || {};
    const count = request.count || 5;
    const todoType = request.todoType || 'study';
    const focus = request.focus || 'general tasks';

    return `You are an expert educational productivity coach and task management specialist. Generate ${count} high-quality, actionable todos for a student based on the following context:

CONTEXT:
- Course: ${context.courseTitle || 'General Learning'}
- Description: ${context.courseDescription || 'No specific course description'}
- Current Lesson/Topic: ${context.currentLesson || 'General topic'}
- User Level: ${context.userLevel || 'beginner'}
- Study Goals: ${context.studyGoals?.join(', ') || 'Learn and improve'}
- Available Time: ${context.availableTime || 10} hours per week
- Deadline: ${context.deadline || 'No specific deadline'}
- Focus Area: ${focus}
- Todo Type: ${todoType}

REQUIREMENTS:
1. Create realistic, actionable todos that are specific and measurable
2. Include appropriate priorities based on urgency and importance
3. Set realistic due dates based on the context and deadline
4. Add helpful descriptions that explain what needs to be done
5. Include estimated durations for each task
6. Add relevant tags for better organization
7. Make todos progressive (build upon each other)
8. Include both learning and practical application tasks
9. Consider the user's level and available time
10. Mix different types of activities (reading, practice, review, etc.)

FORMAT YOUR RESPONSE AS JSON:
{
  "todos": [
    {
      "title": "Specific, actionable task title",
      "description": "Detailed description of what needs to be done and why it's important",
      "priority": "high|medium|low|urgent",
      "dueDate": "YYYY-MM-DD",
      "category": "study|assignment|exam|personal|meeting|project|review",
      "estimatedDuration": 30,
      "tags": ["tag1", "tag2", "tag3"],
      "relatedCourseId": "course-id-if-applicable",
      "relatedLessonId": "lesson-id-if-applicable"
    }
  ],
  "suggestions": [
    "Helpful suggestion 1",
    "Helpful suggestion 2",
    "Helpful suggestion 3"
  ],
  "studyPlan": {
    "weeklySchedule": [
      "Monday: Focus on theory and concepts",
      "Tuesday: Hands-on practice and exercises",
      "Wednesday: Review and reinforcement",
      "Thursday: Advanced topics and applications",
      "Friday: Project work and practical application",
      "Saturday: Review and catch-up",
      "Sunday: Plan next week and reflect"
    ],
    "milestones": [
      "Complete basic concepts (Week 1)",
      "Finish first project (Week 2)",
      "Pass mid-term assessment (Week 3)",
      "Complete final project (Week 4)"
    ],
    "recommendations": [
      "Study in focused 25-minute sessions with 5-minute breaks",
      "Use active recall techniques for better retention",
      "Practice explaining concepts to others",
      "Create visual summaries of key concepts"
    ]
  }
}

IMPORTANT:
- Use only double quotes in JSON
- Ensure all dates are in YYYY-MM-DD format
- Make todos specific and actionable
- Consider the user's level and available time
- Include a mix of learning styles and activities
- Make sure todos are realistic and achievable
- Focus on practical application and skill development`;
  }

  /**
   * Generate mock todos as fallback
   */
  private generateMockTodos(request: AITodoGenerationRequest): AITodoGenerationResponse {
    const context = request.context || {};
    const count = request.count || 5;
    const todoType = request.todoType || 'study';
    
    const mockTodos = [
      {
        title: `Review ${context.courseTitle || 'course'} fundamentals`,
        description: 'Go through the basic concepts and ensure solid understanding before moving to advanced topics',
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'study' as const,
        estimatedDuration: 45,
        tags: ['review', 'fundamentals', 'preparation'],
        relatedCourseId: context.courseTitle?.toLowerCase().replace(/\s+/g, '-'),
        relatedLessonId: 'lesson-1'
      },
      {
        title: `Complete practice exercises for ${context.currentLesson || 'current topic'}`,
        description: 'Work through hands-on exercises to reinforce learning and identify areas that need more attention',
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'assignment' as const,
        estimatedDuration: 60,
        tags: ['practice', 'exercises', 'hands-on'],
        relatedCourseId: context.courseTitle?.toLowerCase().replace(/\s+/g, '-'),
        relatedLessonId: 'lesson-2'
      },
      {
        title: `Create study notes for ${context.currentLesson || 'recent topics'}`,
        description: 'Summarize key concepts, create visual diagrams, and organize information for easy review',
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'study' as const,
        estimatedDuration: 30,
        tags: ['notes', 'summary', 'organization'],
        relatedCourseId: context.courseTitle?.toLowerCase().replace(/\s+/g, '-'),
        relatedLessonId: 'lesson-3'
      },
      {
        title: `Research additional resources for ${context.currentLesson || 'current topic'}`,
        description: 'Find supplementary materials, tutorials, or examples to deepen understanding',
        priority: 'low' as const,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'study' as const,
        estimatedDuration: 20,
        tags: ['research', 'resources', 'supplementary'],
        relatedCourseId: context.courseTitle?.toLowerCase().replace(/\s+/g, '-'),
        relatedLessonId: 'lesson-4'
      },
      {
        title: `Plan next week's study schedule`,
        description: 'Review upcoming topics, set goals, and create a structured plan for continued learning',
        priority: 'low' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'personal' as const,
        estimatedDuration: 15,
        tags: ['planning', 'schedule', 'organization'],
        relatedCourseId: context.courseTitle?.toLowerCase().replace(/\s+/g, '-'),
        relatedLessonId: 'lesson-5'
      }
    ];

    return {
      todos: mockTodos.slice(0, count),
      suggestions: [
        'Break down large tasks into smaller, manageable chunks',
        'Use the Pomodoro technique for focused study sessions',
        'Review material within 24 hours for better retention',
        'Practice active recall by explaining concepts out loud',
        'Create a dedicated study space free from distractions'
      ],
      studyPlan: {
        weeklySchedule: [
          'Monday: Focus on new concepts and theory',
          'Tuesday: Hands-on practice and exercises',
          'Wednesday: Review and reinforcement',
          'Thursday: Advanced topics and applications',
          'Friday: Project work and practical application',
          'Saturday: Review and catch-up',
          'Sunday: Plan next week and reflect'
        ],
        milestones: [
          'Complete basic concepts (Week 1)',
          'Finish first project (Week 2)',
          'Pass mid-term assessment (Week 3)',
          'Complete final project (Week 4)'
        ],
        recommendations: [
          'Study in focused 25-minute sessions with 5-minute breaks',
          'Use active recall techniques for better retention',
          'Practice explaining concepts to others',
          'Create visual summaries of key concepts'
        ]
      }
    };
  }

  /**
   * Generate todos based on course content analysis
   */
  async generateCourseBasedTodos(courseData: any): Promise<AITodoGenerationResponse> {
    const units = courseData.units || [];
    const totalLessons = units.reduce((total: number, unit: any) => total + (unit.lessons?.length || 0), 0);
    
    const request: AITodoGenerationRequest = {
      context: {
        courseTitle: courseData.title,
        courseDescription: courseData.description,
        userLevel: courseData.level || 'beginner',
        studyGoals: courseData.learningOutcomes || ['Complete the course'],
        availableTime: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      todoType: 'study',
      count: Math.min(20, Math.max(5, totalLessons)),
      focus: 'comprehensive course completion'
    };

    return this.generateTodos(request);
  }
}

export const aiTodoService = new AITodoService();
export default aiTodoService;
