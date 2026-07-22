import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Edit, 
  Play,
  FileText, 
  BookOpen,
  Target,
  Award,
  Users,
  Clock,
  Star,
  Upload,
  Image,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  X,
  Sparkles,
  Wand2,
  Presentation
} from 'lucide-react';
import firebaseApiService from '@/services/firebaseApi';
import { NotificationService } from '@/services/notificationService';
import AICourseBuilder from './AICourseBuilder';
import { CourseAssessment } from "@/firebase/database";
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_NVIDIA_MODEL } from '@/services/nvidiaClient';

interface CourseCreationPageProps {
  onBack: () => void;
  onSave: (course: any) => void;
}

const CourseCreationPage: React.FC<CourseCreationPageProps> = ({ onBack, onSave }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    // Basic Information
    title: '',
    description: '',
    shortDescription: '',
    level: 'Beginner',
    duration: '',
    category: '',
    thumbnail: '',
    price: '',
    language: 'English',
    nqfLevel: '',
    estimatedHours: '',
    targetAudience: '',
    prerequisites: [] as string[],
    learningOutcomes: [] as string[],
    courseOverview: '',
    practicalApproach: '',
    integrations: {
      googleClassroom: false,
      microsoftTeams: false
    },
    
    // Course Structure
    units: [
      {
        id: 1,
        title: '',
        description: '',
        order: 1,
        isPublished: false,
        lessons: [
          {
            id: `lesson-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: '',
            description: '',
            type: 'learn',
            duration: 5,
            content: '',
            youtubeUrl: '',
            pdfUrl: '',
            googleSlidesUrl: '',
            order: 1,
            isPublished: false,
            objectives: [] as string[],
            resources: [] as any[],
            quiz: {
              questions: [] as any[],
              passingScore: 70,
              timeLimit: 0
            },
            quizContent: undefined as any
          }
        ]
      }
    ],
    
    // Compliance & Standards
    setaUnitStandards: [] as any[],
    qctoQualifications: [] as any[],
    complianceStatus: 'Pending',
    saqaId: '',
    
    // Assessment & Certification
    assessments: [] as CourseAssessment[],
    certificates: [] as any[],
    
    // Marketing & SEO
    seoTitle: '',
    seoDescription: '',
    tags: [] as string[],
    keywords: [] as string[],
  });

  const [newObjective, setNewObjective] = useState('');
  const [newResource, setNewResource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Assessment management state
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [editingAssessmentIndex, setEditingAssessmentIndex] = useState<number | null>(null);
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    type: 'formative' as 'formative' | 'summative',
    instructions: '',
    dueDate: '',
    maxMarks: 100,
    passingScore: 50,
    files: [] as any[]
  });
  const [saveStatus, setSaveStatus] = useState<'draft' | 'saving' | 'saved' | 'error'>('draft');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [quizGenerated, setQuizGenerated] = useState<string | null>(null);
  const [showQuizGenerator, setShowQuizGenerator] = useState<string | null>(null);
  const [generatingLearnContent, setGeneratingLearnContent] = useState<string | null>(null);
  const [learnContentGenerated, setLearnContentGenerated] = useState<string | null>(null);
  const [generatingLessonImages, setGeneratingLessonImages] = useState<string | null>(null);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const courseLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const courseCategories = ['Programming', 'Data Science', 'Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Cybersecurity', 'Design', 'Business', 'Marketing'];
  const lessonTypes = ['learn', 'video', 'slides'] as const;
  const lessonCategories: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    'learn': { icon: '📖', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    'video': { icon: '🎥', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    'slides': { icon: '📊', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  };



  const addUnit = () => {
    // Calculate the next lesson ID globally across all units
    const totalLessons = courseData.units.reduce((total, unit) => total + unit.lessons.length, 0);
    const nextLessonId = totalLessons + 1;
    
    const newUnit = {
      id: courseData.units.length + 1,
      title: '',
      description: '',
      order: courseData.units.length + 1,
      isPublished: false,
      lessons: [
        {
          id: `lesson-${nextLessonId}`,
          title: '',
          description: '',
          type: 'learn',
          duration: 5,
          content: '',
          youtubeUrl: '',
          pdfUrl: '',
          googleSlidesUrl: '',
          order: 1,
          isPublished: false,
          objectives: [],
          resources: [],
          quiz: {
            questions: [],
            passingScore: 70,
            timeLimit: 0
          },
          quizContent: undefined as any
        }
      ]
    };
    setCourseData(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
  };

  const removeUnit = (unitId: number) => {
    if (courseData.units.length > 1) {
      setCourseData(prev => ({
        ...prev,
        units: prev.units.filter(unit => unit.id !== unitId)
      }));
    }
  };

  const addLesson = (unitId: number) => {
    const unit = courseData.units.find(u => u.id === unitId);
    if (unit) {
      // Generate a truly unique lesson ID using timestamp and random number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const uniqueId = `lesson-${timestamp}-${random}`;
      
      const newLesson = {
        id: uniqueId,
        title: '',
        description: '',
        type: 'learn',
        duration: 5,
        content: '',
        youtubeUrl: '',
        pdfUrl: '',
        googleSlidesUrl: '',
        order: unit.lessons.length + 1,
        isPublished: false,
        objectives: [],
        resources: [],
        quiz: {
          questions: [],
          passingScore: 70,
          timeLimit: 0
        },
        quizContent: undefined as any
      };
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(u => 
          u.id === unitId 
            ? { ...u, lessons: [...u.lessons, newLesson] }
            : u
        )
      }));
    }
  };

  const removeLesson = (unitId: number, lessonId: number) => {
    setCourseData(prev => ({
      ...prev,
      units: prev.units.map(u => 
        u.id === unitId 
          ? { ...u, lessons: u.lessons.filter(l => l.id !== lessonId) }
          : u
      )
    }));
  };

  const updateUnit = (unitId: number, field: string, value: any) => {
    setCourseData(prev => ({
      ...prev,
      units: prev.units.map(u => 
        u.id === unitId ? { ...u, [field]: value } : u
      )
    }));
  };

  const updateLesson = async (unitId: number, lessonId: number, field: string, value: any) => {
    // If changing to quiz type, show quiz generator instead of auto-generating
    if (field === 'type' && value === 'quiz') {
      const lessonKey = `${unitId}-${lessonId}`;
      setShowQuizGenerator(lessonKey);
      setQuizTopic(''); // Reset topic
      setQuizQuestionCount(5); // Reset to default
      setQuizDifficulty('medium'); // Reset to default
    }
    
    // Regular update for non-quiz types
    setCourseData(prev => ({
      ...prev,
      units: prev.units.map(u => 
        u.id === unitId 
          ? { 
              ...u, 
              lessons: u.lessons.map(l => 
                l.id === lessonId ? { ...l, [field]: value } : l
              )
            }
          : u
      )
    }));
  };

  const generateCustomQuiz = async (unitId: number, lessonId: number) => {
    const unit = courseData.units.find(u => u.id === unitId);
    const lesson = unit?.lessons.find(l => l.id === lessonId);
    
    if (unit && lesson) {
      const lessonKey = `${unitId}-${lessonId}`;
      setGeneratingQuiz(lessonKey);
      
      try {
        // Import the lesson content service
        const { lessonContentService } = await import('../services/lessonContentService');
        
        // Generate custom quiz content using AI
        const quizContent = await lessonContentService.generateCustomQuizContent(
          lesson.title || 'Quiz',
          quizTopic || unit.title || 'Unit Content',
          quizQuestionCount,
          quizDifficulty
        );
        
        // Update the lesson with quiz content
        setCourseData(prev => ({
          ...prev,
          units: prev.units.map(u => 
            u.id === unitId 
              ? { 
                  ...u, 
                  lessons: u.lessons.map(l => 
                    l.id === lessonId 
                      ? { 
                          ...l, 
                          quizContent: quizContent,
                          content: `AI-generated quiz for ${lesson.title || 'this lesson'} on ${quizTopic || unit.title || 'unit content'} (${quizQuestionCount} questions, ${quizDifficulty} difficulty).`
                        } 
                      : l
                  )
                }
              : u
          )
        }));
        
        // Show success message and hide generator
        setQuizGenerated(lessonKey);
        setShowQuizGenerator(null);
        setTimeout(() => setQuizGenerated(null), 3000);
        console.log('✅ Custom AI Quiz generated successfully for:', lesson.title);
      } catch (error) {
        console.error('❌ Error generating custom AI quiz:', error);
      } finally {
        setGeneratingQuiz(null);
      }
    }
  };

  /** Generate AI quiz for this lesson (video, slides, or learn without quiz yet). Each lesson gets its own quiz. */
  const generateQuizForLesson = async (unitId: number, lessonId: number) => {
    const unit = courseData.units.find(u => u.id === unitId);
    const lesson = unit?.lessons.find(l => l.id === lessonId);
    if (!unit || !lesson) return;
    const lessonKey = `${unitId}-${lessonId}`;
    setGeneratingQuiz(lessonKey);
    try {
      const { lessonContentService } = await import('@/services/lessonContentService');
      const topic = unit.title || lesson.description || 'lesson content';
      const quizContent = await lessonContentService.generateCustomQuizContent(
        lesson.title || 'Lesson',
        topic,
        5,
        'medium'
      );
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(u =>
          u.id === unitId
            ? { ...u, lessons: u.lessons.map(l => l.id === lessonId ? { ...l, quizContent } : l) }
            : u
        )
      }));
      setQuizGenerated(lessonKey);
      setTimeout(() => setQuizGenerated(null), 3000);
    } catch (err) {
      console.error('Error generating quiz for lesson:', err);
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const generateLearnContent = async (unitId: number, lessonId: number) => {
    const unit = courseData.units.find(u => u.id === unitId);
    const lesson = unit?.lessons.find(l => l.id === lessonId);
    if (!unit || !lesson) return;
    const lessonKey = `${unitId}-${lessonId}`;
    setGeneratingLearnContent(lessonKey);
    try {
      const { lessonContentService } = await import('@/services/lessonContentService');
      const topic = unit.title || lesson.title || 'Lesson';
      const duration = typeof lesson.duration === 'number' ? lesson.duration : parseInt(String(lesson.duration)) || 15;
      const generated = await lessonContentService.generateCurriculumLessonContent(
        lesson.title || 'Lesson',
        lesson.description || '',
        topic,
        duration,
        lesson.richTextContent
      );
      // Generate quiz from lesson content so learners can verify understanding
      const quizContent = await lessonContentService.generateQuizFromLessonContent(
        lesson.title || 'Lesson',
        generated.content
      );
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(u =>
          u.id === unitId
            ? {
                ...u,
                lessons: u.lessons.map(l =>
                  l.id === lessonId
                    ? {
                        ...l,
                        content: generated.content || l.content,
                        objectives: generated.objectives || l.objectives,
                        resources: generated.resources || l.resources,
                        richTextContent: generated.richTextContent,
                        quizContent
                      }
                    : l
                )
              }
            : u
        )
      }));
      setLearnContentGenerated(lessonKey);
      setTimeout(() => setLearnContentGenerated(null), 3000);

      // Optional: fill figure placeholders in lesson HTML (no image API when using text-only models).
      const htmlWithPlaceholders = generated.richTextContent;
      if (htmlWithPlaceholders?.includes('lesson-image') && htmlWithPlaceholders?.includes('data-prompt')) {
        setGeneratingLessonImages(lessonKey);
        try {
          const { fillLessonImagesInHtml } = await import('@/services/lessonImageService');
          const htmlWithImages = await fillLessonImagesInHtml(htmlWithPlaceholders);
          setCourseData(prev => ({
            ...prev,
            units: prev.units.map(u =>
              u.id === unitId
                ? {
                    ...u,
                    lessons: u.lessons.map(l =>
                      l.id === lessonId ? { ...l, richTextContent: htmlWithImages } : l
                    )
                  }
                : u
            )
          }));
        } catch (imgErr) {
          console.warn('Lesson image generation failed:', imgErr);
        } finally {
          setGeneratingLessonImages(null);
        }
      }
    } catch (error) {
      console.error('Error generating learn content:', error);
    } finally {
      setGeneratingLearnContent(null);
    }
  };

  const addObjective = (unitId: number, lessonId: number) => {
    if (newObjective.trim()) {
      const lesson = courseData.units.find(u => u.id === unitId)?.lessons.find(l => l.id === lessonId);
      if (lesson) {
        updateLesson(unitId, lessonId, 'objectives', [...lesson.objectives, newObjective.trim()]);
        setNewObjective('');
      }
    }
  };

  const removeObjective = (unitId: number, lessonId: number, objective: string) => {
    const lesson = courseData.units.find(u => u.id === unitId)?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      updateLesson(unitId, lessonId, 'objectives', lesson.objectives.filter(o => o !== objective));
    }
  };

  const addResource = (unitId: number, lessonId: number) => {
    if (newResource.trim()) {
      const lesson = courseData.units.find(u => u.id === unitId)?.lessons.find(l => l.id === lessonId);
      if (lesson) {
        updateLesson(unitId, lessonId, 'resources', [...lesson.resources, newResource.trim()]);
        setNewResource('');
      }
    }
  };

  const removeResource = (unitId: number, lessonId: number, resource: string) => {
    const lesson = courseData.units.find(u => u.id === unitId)?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      updateLesson(unitId, lessonId, 'resources', lesson.resources.filter(r => r !== resource));
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (e.g. JPG, PNG, WebP)');
      return;
    }
    setThumbnailUploading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCourseData(prev => ({ ...prev, thumbnail: dataUrl }));
      setThumbnailUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setThumbnailUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    setError('');
    
    try {
      // Validate required fields
      if (!courseData.title) {
        setError('Course title is required');
        setSaveStatus('error');
        setIsLoading(false);
        return;
      }
      if (!courseData.description) {
        setError('Course description is required');
        setSaveStatus('error');
        setIsLoading(false);
        return;
      }
      if (!courseData.shortDescription) {
        setError('Short description is required');
        setSaveStatus('error');
        setIsLoading(false);
        return;
      }
      
      // Prepare course data for saving (Firebase will generate the ID)
      const currentDate = new Date().toISOString();
      
      // Prepare course data for saving
      const courseToSave = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        instructor: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Course Instructor',
        instructorId: user?.id || 'instructor-001',
        duration: courseData.duration || '40 hours',
        level: courseData.level as any || 'NQF Level 1',
        category: courseData.category || 'General',
        price: parseFloat(courseData.price) || 0,
        enrolledLearners: 0,
        enrolledStudents: 0,
        rating: 0,
        thumbnail: courseData.thumbnail || '/api/placeholder/300/200',
        lessons: courseData.units.reduce((total, unit) => total + unit.lessons.length, 0),
        isPublished: true, // Publish AI-generated courses by default so students can see them
        saqaId: courseData.saqaId || '',
        setaUnitStandards: courseData.setaUnitStandards || [],
        qctoQualifications: courseData.qctoQualifications || [],
        createdAt: currentDate,
        updatedAt: currentDate,
        complianceStatus: courseData.complianceStatus as any || 'Pending Review',
        
        // Extended properties for full course management
        shortDescription: courseData.shortDescription,
        language: courseData.language || 'English',
        nqfLevel: courseData.nqfLevel || '',
        estimatedHours: parseInt(courseData.estimatedHours) || 40,
        targetAudience: courseData.targetAudience || '',
        prerequisites: courseData.prerequisites || [],
        learningOutcomes: courseData.learningOutcomes || [],
        courseOverview: courseData.courseOverview || '',
        practicalApproach: courseData.practicalApproach || '',
        seoTitle: courseData.seoTitle || courseData.title,
        seoDescription: courseData.seoDescription || courseData.description,
        integrations: courseData.integrations || { googleClassroom: false, microsoftTeams: false },
        assignedStudents: [],
        studentAssignments: [],
        enrollmentMode: 'manual' as const,
        units: courseData.units.map((unit, index) => ({
          id: unit.id.toString(),
          title: unit.title || `Unit ${index + 1}`,
          description: unit.description || '',
          order: index + 1,
          isPublished: unit.isPublished || true, // Publish units by default
          lessons: unit.lessons.map((lesson, lessonIndex) => ({
            id: lesson.id.toString(),
            title: lesson.title || `Lesson ${lessonIndex + 1}`,
            description: lesson.description || '',
            type: (lesson.type as 'video' | 'text' | 'quiz' | 'assignment' | 'learn' | 'practice' | 'challenge' | 'slides') || 'text',
            duration: parseInt(lesson.duration?.toString()) || 5,
            content: lesson.content || '',
            youtubeUrl: lesson.youtubeUrl || '',
            pdfUrl: lesson.pdfUrl || '',
            googleSlidesUrl: (lesson as { googleSlidesUrl?: string }).googleSlidesUrl || '',
            richTextContent: (lesson as { richTextContent?: string }).richTextContent || '',
            order: lessonIndex + 1,
            isPublished: lesson.isPublished || true, // Publish lessons by default
            objectives: lesson.objectives || [],
            resources: (lesson.resources as string[]) || [],
            quiz: lesson.quiz || { questions: [], passingScore: 70, timeLimit: 0 },
            quizContent: (lesson as { quizContent?: unknown }).quizContent || undefined
          }))
        }))
      };
      
      console.log('Saving course locally:', courseToSave);
      console.log('Course units structure:', courseToSave.units);
      console.log('First unit lessons:', courseToSave.units[0]?.lessons);
      console.log('Total lessons being saved:', courseToSave.lessons);
      console.log('Course data before saving:', courseData);
      console.log('Course data units:', courseData.units);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to Firebase first
      let savedCourse;
      try {
        console.log('Saving course to Firebase with data:', courseToSave);
        console.log('Course units being saved:', courseToSave.units);
        console.log('Total lessons being saved:', courseToSave.lessons);
        
        const response = await firebaseApiService.courses.create(courseToSave);
        console.log('Course saved to Firebase:', response);
        
        if (response.success && response.data) {
          // Create the complete course object with Firebase ID
          savedCourse = {
            id: response.data.id,
            ...courseToSave,
            createdAt: currentDate,
            updatedAt: currentDate
          };
          
          console.log('Saved course data:', savedCourse);
          console.log('Saved course units:', savedCourse.units);
          console.log('Saved course lessons count:', savedCourse.lessons);
          
          // Send notification to all learners about new course
          try {
            const learnersResponse = await firebaseApiService.users.getLearners();
            if (learnersResponse.success && learnersResponse.data) {
              const learnerIds = learnersResponse.data.map((learner: any) => learner.id);
              await NotificationService.notifyCourseUpdate(
                response.data.id,
                courseToSave.title,
                `A new course "${courseToSave.title}" has been created and is now available for enrollment.`,
                user?.id || 'instructor-001',
                user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Course Instructor',
                learnerIds
              );
            }
          } catch (notificationError) {
            console.log('Notification failed, but course was saved:', notificationError);
          }
        } else {
          throw new Error('Failed to save course to Firebase');
        }
      } catch (apiError) {
        console.error('Firebase save failed:', apiError);
        throw new Error('Failed to save course. Please try again.');
      }
      
      // Call the onSave callback to update parent component with the saved course
      onSave(savedCourse);
      
      console.log('Course saved successfully:', savedCourse);
      
      // Update save status
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // Force a small delay to ensure the course is properly added to state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show success message and redirect back to dashboard
      alert('Course created successfully! Redirecting back to dashboard...');
      
      // Small delay to let user see the success message, then go back
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err: any) {
      console.error('Course save error:', err);
      setError(err.message || 'Failed to save course. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAICourseGenerated = (aiCourseData: any) => {
    console.log('AI Course Data received:', aiCourseData);
    console.log('AI Course Units:', aiCourseData.units);
    
    // Apply AI-generated course data to the current course form
    setCourseData(prev => ({
      ...prev,
      // Basic course info
      title: aiCourseData.title || prev.title,
      description: aiCourseData.description || prev.description,
      shortDescription: aiCourseData.shortDescription || prev.shortDescription,
      level: aiCourseData.level || prev.level,
      category: aiCourseData.category || prev.category,
      duration: aiCourseData.duration || prev.duration,
      estimatedHours: aiCourseData.estimatedHours || prev.estimatedHours,
      targetAudience: aiCourseData.targetAudience || prev.targetAudience,
      prerequisites: aiCourseData.prerequisites || prev.prerequisites,
      learningOutcomes: aiCourseData.learningOutcomes || prev.learningOutcomes,
      courseOverview: aiCourseData.courseOverview || prev.courseOverview,
      practicalApproach: aiCourseData.practicalApproach || prev.practicalApproach,
      tags: aiCourseData.tags || prev.tags,
      keywords: aiCourseData.keywords || prev.keywords,
      seoTitle: aiCourseData.seoTitle || prev.seoTitle,
      seoDescription: aiCourseData.seoDescription || prev.seoDescription,
      // Course structure - replace existing units with AI-generated ones
      units: aiCourseData.units || prev.units
    }));
    
    console.log('Updated course data:', {
      ...courseData,
      units: aiCourseData.units || courseData.units
    });
    
    setShowAIBuilder(false);
    setCurrentStep(2); // Go to course structure step
  };

  // Assessment management functions
  const addAssessment = () => {
    const newAssessment: CourseAssessment = {
      id: `assessment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: assessmentForm.title,
      description: assessmentForm.description,
      type: assessmentForm.type,
      instructions: assessmentForm.instructions,
      files: assessmentForm.files,
      dueDate: assessmentForm.dueDate || undefined,
      maxMarks: assessmentForm.maxMarks,
      passingScore: assessmentForm.passingScore,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: courseData.assessments.length + 1
    };

    setCourseData(prev => ({
      ...prev,
      assessments: [...prev.assessments, newAssessment]
    }));

    resetAssessmentForm();
    setShowAssessmentDialog(false);
  };

  const editAssessment = (index: number) => {
    const assessment = courseData.assessments[index];
    setAssessmentForm({
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      instructions: assessment.instructions,
      dueDate: assessment.dueDate || '',
      maxMarks: assessment.maxMarks,
      passingScore: assessment.passingScore,
      files: assessment.files
    });
    setEditingAssessmentIndex(index);
    setShowAssessmentDialog(true);
  };

  const updateAssessment = () => {
    if (editingAssessmentIndex === null) return;

    const updatedAssessment: CourseAssessment = {
      ...courseData.assessments[editingAssessmentIndex],
      title: assessmentForm.title,
      description: assessmentForm.description,
      type: assessmentForm.type,
      instructions: assessmentForm.instructions,
      files: assessmentForm.files,
      dueDate: assessmentForm.dueDate || undefined,
      maxMarks: assessmentForm.maxMarks,
      passingScore: assessmentForm.passingScore,
      updatedAt: new Date().toISOString()
    };

    setCourseData(prev => ({
      ...prev,
      assessments: prev.assessments.map((assessment, index) => 
        index === editingAssessmentIndex ? updatedAssessment : assessment
      )
    }));

    resetAssessmentForm();
    setShowAssessmentDialog(false);
    setEditingAssessmentIndex(null);
  };

  const deleteAssessment = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      assessments: prev.assessments.filter((_, i) => i !== index)
    }));
  };

  const resetAssessmentForm = () => {
    setAssessmentForm({
      title: '',
      description: '',
      type: 'formative',
      instructions: '',
      dueDate: '',
      maxMarks: 100,
      passingScore: 50,
      files: []
    });
    setEditingAssessmentIndex(null);
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: <FileText className="w-4 h-4" /> },
    { id: 2, title: 'Course Structure', icon: <BookOpen className="w-4 h-4" /> },
    { id: 3, title: 'Compliance', icon: <Award className="w-4 h-4" /> },
    { id: 4, title: 'Assessment', icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Course</h1>
                <p className="text-sm text-gray-600">Build your comprehensive course with live preview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Status Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    Saving...
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Save failed
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Saved {lastSaved && `• ${lastSaved.toLocaleTimeString()}`}
                  </>
                ) : courseData.title && courseData.description ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Ready to save
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    Draft
                  </>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAIBuilder(true)}
                disabled={isLoading}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Course Builder
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm" 
                disabled={isLoading || !courseData.title || !courseData.description}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save & Publish Course'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  currentStep === step.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : currentStep > step.id 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-green-300' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {steps.map(step => (
                  <TabsTrigger key={step.id} value={step.id.toString()}>
                    {step.icon}
                    <span className="ml-2 hidden sm:inline">{step.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

          {/* Step 1: Basic Information */}
          <TabsContent value="1">
            <div className="space-y-6">
                {/* Essential Course Information */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Course Essentials
                    </CardTitle>
                    <CardDescription>Start with the core information about your course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Course Title - Most Important */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-semibold">Course Title *</Label>
                      <Input
                        id="title"
                        value={courseData.title}
                        onChange={(e) => {
                          setCourseData(prev => ({ ...prev, title: e.target.value }));
                          if (saveStatus === 'saved' || saveStatus === 'error') setSaveStatus('draft');
                        }}
                        placeholder="e.g., Complete Python Programming for Beginners"
                        className="text-lg"
                      />
                      <p className="text-xs text-gray-500">This will be the main title learners see</p>
                    </div>

                    {/* Short Description */}
                    <div className="space-y-2">
                      <Label htmlFor="shortDescription" className="text-base font-semibold">Short Description *</Label>
                      <Input
                        id="shortDescription"
                        value={courseData.shortDescription}
                        onChange={(e) => {
                          setCourseData(prev => ({ ...prev, shortDescription: e.target.value }));
                          if (saveStatus === 'saved' || saveStatus === 'error') setSaveStatus('draft');
                        }}
                        placeholder="Brief, compelling description for course cards"
                      />
                      <p className="text-xs text-gray-500">Keep it under 100 characters for best display</p>
                    </div>

                    {/* Full Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-semibold">Full Description *</Label>
                      <Textarea
                        id="description"
                        value={courseData.description}
                        onChange={(e) => {
                          setCourseData(prev => ({ ...prev, description: e.target.value }));
                          if (saveStatus === 'saved' || saveStatus === 'error') setSaveStatus('draft');
                        }}
                        placeholder="Detailed course description that explains what learners will gain..."
                        rows={4}
                      />
                      <p className="text-xs text-gray-500">Explain what learners will learn and why it matters</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      Course Settings
                    </CardTitle>
                    <CardDescription>Configure the basic parameters for your course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="level">Difficulty Level</Label>
                        <Select value={courseData.level} onValueChange={(value) => setCourseData(prev => ({ ...prev, level: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courseLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={courseData.category} onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {courseCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select value={courseData.language} onValueChange={(value) => setCourseData(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                            <SelectItem value="Zulu">Zulu</SelectItem>
                            <SelectItem value="Xhosa">Xhosa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={courseData.duration}
                          onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price (ZAR)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={courseData.price}
                          onChange={(e) => setCourseData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nqfLevel">NQF Level</Label>
                        <Input
                          id="nqfLevel"
                          value={courseData.nqfLevel}
                          onChange={(e) => setCourseData(prev => ({ ...prev, nqfLevel: e.target.value }))}
                          placeholder="NQF Level 3"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Requirements & Outcomes</CardTitle>
                    <CardDescription>Define prerequisites and learning outcomes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Target Audience</Label>
                      <Select 
                        value={courseData.targetAudience} 
                        onValueChange={(value) => setCourseData(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginners">Complete Beginners</SelectItem>
                          <SelectItem value="intermediate">Intermediate Learners</SelectItem>
                          <SelectItem value="advanced">Advanced Learners</SelectItem>
                          <SelectItem value="professionals">Working Professionals</SelectItem>
                          <SelectItem value="students">Students</SelectItem>
                          <SelectItem value="career-changers">Career Changers</SelectItem>
                          <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                          <SelectItem value="managers">Managers & Leaders</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Prerequisites</Label>
                      <Select 
                        value={courseData.prerequisites[0] || ''} 
                        onValueChange={(value) => setCourseData(prev => ({ 
                          ...prev, 
                          prerequisites: value ? [value] : [] 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select prerequisite level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No prerequisites required</SelectItem>
                          <SelectItem value="basic-computer">Basic computer literacy</SelectItem>
                          <SelectItem value="high-school-math">High school mathematics</SelectItem>
                          <SelectItem value="college-level-math">College-level mathematics</SelectItem>
                          <SelectItem value="programming-basics">Basic programming knowledge</SelectItem>
                          <SelectItem value="industry-experience">Industry experience required</SelectItem>
                          <SelectItem value="certification">Previous certification required</SelectItem>
                          <SelectItem value="degree">Bachelor's degree required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Learning Goals</Label>
                      <Select 
                        value={courseData.learningOutcomes[0] || ''} 
                        onValueChange={(value) => setCourseData(prev => ({ 
                          ...prev, 
                          learningOutcomes: value ? [value] : [] 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary learning goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skill-development">Develop new skills</SelectItem>
                          <SelectItem value="career-advancement">Advance career</SelectItem>
                          <SelectItem value="certification">Earn certification</SelectItem>
                          <SelectItem value="knowledge-expansion">Expand knowledge base</SelectItem>
                          <SelectItem value="practical-application">Apply knowledge practically</SelectItem>
                          <SelectItem value="problem-solving">Improve problem-solving skills</SelectItem>
                          <SelectItem value="leadership">Develop leadership skills</SelectItem>
                          <SelectItem value="technical-expertise">Gain technical expertise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>


                {/* Navigation Buttons */}
                <div className="flex justify-end pt-6">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!courseData.title || !courseData.description}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next: Course Structure →
                        </Button>
                      </div>
            </div>
          </TabsContent>

          {/* Step 2: Course Structure */}
          <TabsContent value="2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Course Structure</h2>
                  <p className="text-gray-600">Organize your course into units and lessons</p>
                </div>
                <Button onClick={addUnit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </div>

              {/* Course Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {courseData.title || 'Course Title'}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {courseData.units.length} UNITS
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {courseData.units.reduce((total, unit) => total + unit.lessons.length, 0)} SKILLS
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {courseData.units.map((unit, unitIndex) => (
                <Card key={unit.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{unitIndex + 1}</span>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-medium">UNIT {unitIndex + 1}</div>
                          <div className="text-lg font-semibold">{unit.title || `Unit ${unitIndex + 1}`}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {unit.lessons.length} SKILLS
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeUnit(unit.id)}
                          disabled={courseData.units.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>Unit Title</Label>
                          <Input
                            value={unit.title}
                            onChange={(e) => updateUnit(unit.id, 'title', e.target.value)}
                          placeholder="e.g., Computational thinking with variables"
                          />
                        </div>
                        <div>
                          <Label>Unit Description</Label>
                        <Textarea
                            value={unit.description}
                            onChange={(e) => updateUnit(unit.id, 'description', e.target.value)}
                          placeholder="Describe what students will learn in this unit"
                          rows={2}
                          />
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Skills/Lessons</h4>
                        <Button size="sm" onClick={() => addLesson(unit.id)} variant="outline">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Skill
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unit.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {/* This getLessonIcon is the one from lessonCategories */}
                                {lesson.type === 'video' ? (
                                  <Play className="w-4 h-4 text-blue-600" />
                                ) : lesson.type === 'slides' ? (
                                  <Presentation className="w-4 h-4 text-amber-600" />
                                ) : (
                                  <BookOpen className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                  {lesson.title || `Skill ${lessonIndex + 1}`}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeLesson(unit.id, lesson.id)}
                                disabled={unit.lessons.length === 1}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(unit.id, lesson.id, 'title', e.target.value)}
                                placeholder="e.g., The programming platform"
                                className="text-xs h-8"
                              />
                              <div className="flex gap-2">
                              <Select value={lesson.type} onValueChange={(value) => updateLesson(unit.id, lesson.id, 'type', value)}>
                                  <SelectTrigger className="text-xs h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {lessonTypes.map(type => (
                                      <SelectItem key={type} value={type} className="text-xs">
                                      <div className="flex items-center gap-2">
                                          {type === 'video' ? (
                                            <Play className="w-4 h-4 text-blue-600" />
                                          ) : type === 'slides' ? (
                                            <Presentation className="w-4 h-4 text-amber-600" />
                                          ) : (
                                            <BookOpen className="w-4 h-4 text-gray-600" />
                                          )}
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <Input
                                    type="number"
                                    min="1"
                                    value={lesson.duration.toString()}
                                    onChange={(e) => updateLesson(unit.id, lesson.id, 'duration', parseInt(e.target.value) || 5)}
                                    placeholder="15"
                                    className="text-xs w-20 h-8"
                                    title="Duration in minutes"
                                  />
                                <span className="text-xs text-gray-500">min</span>
                              </div>
                          </div>
                          
                          {/* AI Quiz Generation Status */}
                          {generatingQuiz === `${unit.id}-${lesson.id}` && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                              <span>AI generating quiz...</span>
                            </div>
                          )}
                          
                          {quizGenerated === `${unit.id}-${lesson.id}` && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              <CheckCircle className="w-3 h-3" />
                              <span>Quiz generated successfully!</span>
                            </div>
                          )}
                          
                          {/* Quiz Generator for Quiz Type */}
                          {lesson.type === 'quiz' && showQuizGenerator === `${unit.id}-${lesson.id}` && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-blue-900">AI Quiz Generator</h4>
                                <button
                                  onClick={() => setShowQuizGenerator(null)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700">Quiz Topic</label>
                                  <Input
                                    value={quizTopic}
                                    onChange={(e) => setQuizTopic(e.target.value)}
                                    placeholder={unit.title || "Enter quiz topic..."}
                                    className="text-xs h-8"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs font-medium text-gray-700">Questions</label>
                                    <Input
                                      type="number"
                                      value={quizQuestionCount}
                                      onChange={(e) => setQuizQuestionCount(parseInt(e.target.value) || 5)}
                                      min="1"
                                      max="20"
                                      className="text-xs h-8"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700">Difficulty</label>
                                    <Select value={quizDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setQuizDifficulty(value)}>
                                      <SelectTrigger className="text-xs h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => generateCustomQuiz(unit.id, lesson.id)}
                                  disabled={generatingQuiz === `${unit.id}-${lesson.id}`}
                                  className="w-full text-xs h-8"
                                  size="sm"
                                >
                                  {generatingQuiz === `${unit.id}-${lesson.id}` ? (
                                    <>
                                      <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-2"></div>
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Target className="w-3 h-3 mr-2" />
                                      Generate Quiz
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Quiz Status Messages */}
                          {generatingQuiz === `${unit.id}-${lesson.id}` && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                              <span>AI generating quiz...</span>
                            </div>
                          )}
                          
                          {quizGenerated === `${unit.id}-${lesson.id}` && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              <CheckCircle className="w-3 h-3" />
                              <span>Quiz generated successfully!</span>
                            </div>
                          )}
                          
                          {lesson.type === 'quiz' && lesson.quizContent && (
                            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              <span>📝 {lesson.quizContent.questions?.length || 0} questions • {lesson.quizContent.passingScore}% passing score</span>
                            </div>
                          )}
                          
                              {/* Video: show YouTube URL field only when video is selected */}
                              {lesson.type === 'video' && (
                                <>
                                  <Label className="text-xs text-gray-600">Video link</Label>
                                  <Input
                                    value={lesson.youtubeUrl || ''}
                                    onChange={(e) => updateLesson(unit.id, lesson.id, 'youtubeUrl', e.target.value)}
                                    placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                                    className="text-xs h-8"
                                  />
                                </>
                              )}

                              {/* Learn: AI-generated lesson (NVIDIA) */}
                              {lesson.type === 'learn' && (
                                <div className="space-y-3">
                                  {generatingLearnContent === `${unit.id}-${lesson.id}` && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded">
                                      <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full" />
                                      <span>AI ({DEFAULT_NVIDIA_MODEL}) generating lesson...</span>
                                    </div>
                                  )}
                                  {learnContentGenerated === `${unit.id}-${lesson.id}` && !generatingLessonImages && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1.5 rounded">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Content generated</span>
                                    </div>
                                  )}
                                  {generatingLessonImages === `${unit.id}-${lesson.id}` && (
                                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded">
                                      <div className="animate-spin w-3 h-3 border border-amber-600 border-t-transparent rounded-full" />
                                      <span>Polishing lesson HTML…</span>
                                    </div>
                                  )}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => generateLearnContent(unit.id, lesson.id)}
                                    disabled={generatingLearnContent === `${unit.id}-${lesson.id}`}
                                  >
                                    <Sparkles className="w-3 h-3 mr-2" />
                                    Generate content with AI
                                  </Button>
                                  {lesson.quizContent?.questions?.length ? (
                                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                      <span>📝 {lesson.quizContent.questions.length} questions • {lesson.quizContent.passingScore}% to pass</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 h-6 px-1.5 text-[10px]"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete the quiz for this lesson?')) {
                                            updateLesson(unit.id, lesson.id, 'quizContent', null);
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Delete Quiz
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="w-full text-xs h-8"
                                      onClick={() => generateQuizForLesson(unit.id, lesson.id)}
                                      disabled={generatingQuiz === `${unit.id}-${lesson.id}`}
                                    >
                                      {generatingQuiz === `${unit.id}-${lesson.id}` ? (
                                        <span className="flex items-center gap-2"><span className="animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full" />Generating quiz...</span>
                                      ) : (
                                        <><Target className="w-3 h-3 mr-2" />Generate quiz for this lesson only</>
                                      )}
                                    </Button>
                                  )}
                                  {/* Rendered HTML/CSS preview of generated lesson */}
                                  {(lesson as { richTextContent?: string }).richTextContent && (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-600">
                                        Generated lesson preview (HTML)
                                      </div>
                                      <div
                                        className="creation-curriculum-preview prose prose-slate max-w-none p-4 text-sm max-h-[320px] overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: (lesson as { richTextContent: string }).richTextContent }}
                                      />
                                        <style>{`
                                          .creation-curriculum-preview .curriculum-lesson { display: block; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1e293b; line-height: 1.7; }
                                          .creation-curriculum-preview .lesson-time-estimate { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding: 0.625rem 1rem; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%); border: 1px solid #7dd3fc; border-radius: 0.75rem; }
                                          .creation-curriculum-preview .time-badge { padding: 0.3rem 0.75rem; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; font-weight: 700; border-radius: 9999px; font-size: 0.75rem; box-shadow: 0 2px 6px rgba(14,165,233,0.3); }
                                          .creation-curriculum-preview .time-hint { color: #0c4a6e; font-size: 0.75rem; }
                                          .creation-curriculum-preview .unit-context { font-size: 0.75rem; color: #2563eb; font-weight: 700; margin: 0 0 0.75rem 0; text-transform: uppercase; letter-spacing: 0.05em; }
                                          .creation-curriculum-preview .section-heading { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 0.35rem 0; }
                                          .creation-curriculum-preview .section-rule { border: none; height: 2px; background: linear-gradient(90deg, #3b82f6 0%, #93c5fd 50%, transparent 100%); margin: 0 0 0.75rem 0; border-radius: 2px; }
                                          .creation-curriculum-preview .lesson-objectives { margin-bottom: 1rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%); border-left: 4px solid #2563eb; border-radius: 0 0.5rem 0.5rem 0; padding: 0.75rem 1rem; box-shadow: 0 2px 8px rgba(37,99,235,0.08); }
                                          .creation-curriculum-preview .objectives-heading { font-size: 0.875rem; font-weight: 800; color: #1e40af; margin: 0 0 0.35rem 0; }
                                          .creation-curriculum-preview .objectives-intro { font-size: 0.75rem; color: #475569; margin: 0 0 0.5rem 0; }
                                          .creation-curriculum-preview .objectives-list { margin: 0; padding-left: 0; list-style: none; font-size: 0.8125rem; line-height: 1.7; color: #1e3a5f; }
                                          .creation-curriculum-preview .objectives-list li { margin-bottom: 0.35rem; }
                                          .creation-curriculum-preview .objective-item { padding-left: 1.5rem; position: relative; margin-bottom: 0.25rem; }
                                          .creation-curriculum-preview .objective-item::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 800; }
                                          .creation-curriculum-preview .section-badge { display: inline-block; padding: 0.2rem 0.5rem; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #1e40af; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 0.25rem; border: 1px solid #93c5fd; margin-bottom: 0.5rem; }
                                          .creation-curriculum-preview .key-term-badge { padding: 0.1rem 0.35rem; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; border-radius: 0.2rem; font-weight: 700; border: 1px solid #a5b4fc; font-size: 0.8em; }
                                          .creation-curriculum-preview .main-content { margin-top: 0.75rem; }
                                          .creation-curriculum-preview .content-block { margin-bottom: 1rem; padding: 0.75rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
                                          .creation-curriculum-preview .content-subheading { font-size: 0.875rem; font-weight: 800; color: #1e40af; margin: 0 0 0.5rem 0; }
                                          .creation-curriculum-preview .content-block p { font-size: 0.8125rem; line-height: 1.65; color: #475569; margin: 0 0 0.5rem 0; }
                                          .creation-curriculum-preview .formula-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; border-radius: 0.5rem; padding: 0.625rem 0.875rem; margin: 0.5rem 0; text-align: center; font-size: 0.8125rem; color: #1e3a5f; font-weight: 600; }
                                          .creation-curriculum-preview .key-rule-box { background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 1px solid #fbbf24; border-left: 4px solid #eab308; border-radius: 0 0.5rem 0.5rem 0; padding: 0.625rem 0.875rem; margin: 0.5rem 0; font-size: 0.8125rem; color: #713f12; }
                                          .creation-curriculum-preview .key-rule-box h4 { margin: 0 0 0.25rem 0; font-weight: 800; color: #854d0e; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .example-block { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #d8b4fe; border-left: 4px solid #8b5cf6; border-radius: 0 0.5rem 0.5rem 0; padding: 0.625rem 0.875rem; margin: 0.5rem 0; }
                                          .creation-curriculum-preview .example-title { font-size: 0.8125rem; font-weight: 800; color: #6d28d9; margin: 0 0 0.35rem 0; }
                                          .creation-curriculum-preview .solution-steps { margin: 0.35rem 0 0 0; padding-left: 1rem; color: #4c1d95; font-size: 0.8125rem; line-height: 1.7; }
                                          .creation-curriculum-preview .exam-tip-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-left: 4px solid #22c55e; border-radius: 0 0.5rem 0.5rem 0; padding: 0.625rem 0.875rem; margin: 0.5rem 0; font-size: 0.8125rem; color: #166534; }
                                          .creation-curriculum-preview .exam-tip-box strong { color: #15803d; }
                                          .creation-curriculum-preview .callout-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.8125rem; color: #1e40af; }
                                          .creation-curriculum-preview .callout-box strong { color: #1d4ed8; }
                                          .creation-curriculum-preview .definition-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-left: 4px solid #8b5cf6; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .definition-box h4 { font-size: 0.8125rem; font-weight: 800; color: #6d28d9; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .definition-box p { margin: 0; color: #4c1d95; line-height: 1.6; }
                                          .creation-curriculum-preview .warning-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-left: 4px solid #f97316; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .warning-box h4 { font-size: 0.8125rem; font-weight: 800; color: #c2410c; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .warning-box p { margin: 0; color: #9a3412; line-height: 1.6; }
                                          .creation-curriculum-preview .highlight-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 1px solid #fbbf24; border-radius: 0.5rem; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .highlight-box h4 { font-size: 0.8125rem; font-weight: 800; color: #854d0e; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .highlight-box p { margin: 0; color: #713f12; line-height: 1.6; }
                                          .creation-curriculum-preview .info-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .info-box h4 { font-size: 0.8125rem; font-weight: 800; color: #15803d; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .info-box p { margin: 0; color: #166534; line-height: 1.6; }
                                          .creation-curriculum-preview .quote-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 0 0.5rem 0.5rem 0; font-style: italic; color: #475569; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .quote-box cite { display: block; margin-top: 0.35rem; font-size: 0.6875rem; font-style: normal; color: #94a3b8; font-weight: 600; }
                                          .creation-curriculum-preview .deep-dive { margin: 0.5rem 0; padding: 0.75rem 1rem; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 0.5rem; }
                                          .creation-curriculum-preview .deep-dive h4 { font-size: 0.8125rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0; padding-bottom: 0.35rem; border-bottom: 1px solid #e2e8f0; }
                                          .creation-curriculum-preview .deep-dive p { margin: 0 0 0.35rem 0; font-size: 0.8125rem; line-height: 1.6; color: #334155; }
                                          .creation-curriculum-preview .real-world-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #6ee7b7; border-radius: 0.5rem; }
                                          .creation-curriculum-preview .real-world-box h4 { font-size: 0.8125rem; font-weight: 800; color: #047857; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .real-world-box p { margin: 0; color: #065f46; line-height: 1.6; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .common-mistake-box { margin: 0.5rem 0; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.8125rem; }
                                          .creation-curriculum-preview .common-mistake-box h4 { font-size: 0.8125rem; font-weight: 800; color: #b91c1c; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .common-mistake-box p { margin: 0; color: #991b1b; line-height: 1.6; }
                                          .creation-curriculum-preview .content-divider { border: none; height: 2px; background: linear-gradient(90deg, transparent 0%, #cbd5e1 20%, #94a3b8 50%, #cbd5e1 80%, transparent 100%); margin: 1rem 0; border-radius: 2px; }
                                          .creation-curriculum-preview .section-number { display: inline-flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 50%; font-size: 0.6875rem; font-weight: 800; margin-right: 0.35rem; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }
                                          .creation-curriculum-preview .quiz-prep-box { margin: 0.75rem 0; padding: 0.75rem 1rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 0.5rem; }
                                          .creation-curriculum-preview .quiz-prep-heading { font-size: 0.8125rem; font-weight: 800; color: #92400e; margin: 0 0 0.25rem 0; }
                                          .creation-curriculum-preview .quiz-prep-text { font-size: 0.75rem; color: #78350f; margin: 0; }
                                          .creation-curriculum-preview .key-takeaways { margin-top: 0.75rem; }
                                          .creation-curriculum-preview .takeaways-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem; }
                                          .creation-curriculum-preview .takeaway-card { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
                                          .creation-curriculum-preview .takeaway-title { font-size: 0.8125rem; font-weight: 800; color: #1e40af; margin: 0 0 0.2rem 0; }
                                          .creation-curriculum-preview .takeaway-card p { margin: 0; font-size: 0.75rem; line-height: 1.5; color: #1e3a5f; }
                                          .creation-curriculum-preview .practice-opportunities { margin-top: 0.75rem; }
                                          .creation-curriculum-preview .challenge-set { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 0.5rem; padding: 0.625rem 0.875rem; margin: 0.5rem 0; }
                                          .creation-curriculum-preview .challenge-set h4 { font-size: 0.8125rem; font-weight: 800; color: #166534; margin: 0 0 0.35rem 0; }
                                          .creation-curriculum-preview .practice-list { margin: 0.35rem 0 0 0.75rem; padding-left: 1rem; font-size: 0.8125rem; color: #166534; line-height: 1.7; }
                                          .creation-curriculum-preview .comparison-table { overflow-x: auto; margin: 0.5rem 0; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
                                          .creation-curriculum-preview .comparison-table table { width: 100%; font-size: 0.75rem; border-collapse: collapse; }
                                          .creation-curriculum-preview .comparison-table th { background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); color: white; padding: 0.5rem 0.625rem; text-align: left; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
                                          .creation-curriculum-preview .comparison-table td { padding: 0.5rem 0.625rem; border-bottom: 1px solid #e2e8f0; }
                                          .creation-curriculum-preview .comparison-table tr:nth-child(even) td { background: #f8fafc; }
                                          .creation-curriculum-preview .comparison-table tr:last-child td { border-bottom: none; }
                                          .creation-curriculum-preview .key-terms-box { margin-top: 0.75rem; padding: 0.625rem 0.875rem; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 0.5rem; border: 1px solid #e2e8f0; }
                                          .creation-curriculum-preview .key-terms-box h3 { font-size: 0.8125rem; font-weight: 800; color: #475569; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: 0.04em; }
                                          .creation-curriculum-preview .term { display: inline-block; padding: 0.15rem 0.5rem; margin: 0.15rem 0.2rem 0.15rem 0; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; border: 1px solid #a5b4fc; }
                                          .creation-curriculum-preview .lesson-intro { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; }
                                          .creation-curriculum-preview .lesson-intro p { font-size: 0.875rem; line-height: 1.7; color: #334155; }
                                          .creation-curriculum-preview .lesson-steps { margin-top: 0.75rem; margin-bottom: 0.75rem; }
                                          .creation-curriculum-preview .step-list { list-style: none; padding-left: 0; counter-reset: step; }
                                          .creation-curriculum-preview .step { counter-increment: step; margin-bottom: 0.75rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 0.5rem; border-left: 4px solid #3b82f6; position: relative; }
                                          .creation-curriculum-preview .step::before { content: counter(step); position: absolute; left: -0.5rem; top: 0.75rem; width: 1.5rem; height: 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 50%; font-size: 0.6875rem; font-weight: 800; line-height: 1.5rem; text-align: center; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }
                                          .creation-curriculum-preview .step-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; margin: 0 0 0.35rem 0; padding-left: 0.35rem; }
                                          .creation-curriculum-preview .step-body { padding-left: 0.35rem; }
                                          .creation-curriculum-preview .step-body p { margin: 0.15rem 0 0 0; font-size: 0.8125rem; line-height: 1.6; color: #475569; }
                                          .creation-curriculum-preview .key-points-box, .creation-curriculum-preview .summary-box { margin-top: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; }
                                          .creation-curriculum-preview .key-points-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; }
                                          .creation-curriculum-preview .key-points-box h3, .creation-curriculum-preview .summary-box h3 { font-size: 0.8125rem; font-weight: 800; color: #1e293b; margin: 0 0 0.5rem 0; }
                                          .creation-curriculum-preview .key-points-list { margin: 0; padding-left: 1rem; color: #1e3a5f; font-size: 0.8125rem; line-height: 1.6; }
                                          .creation-curriculum-preview .summary-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; }
                                          .creation-curriculum-preview .summary-box p { margin: 0; font-size: 0.8125rem; line-height: 1.6; color: #166534; }
                                          .creation-curriculum-preview .lesson-generated-image { width: 100%; max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5rem 0; display: block; }
                                          .creation-curriculum-preview .lesson-image { margin: 0.5rem 0; padding: 0.75rem 1rem; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 0.5rem; font-size: 0.75rem; color: #64748b; border: 1px solid #cbd5e1; }
                                          .creation-curriculum-preview .lesson-step-section { margin-bottom: 0.75rem; }
                                        `}</style>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Slides: Google Slides embed URL */}
                              {lesson.type === 'slides' && (
                                <>
                                  <Label className="text-xs text-gray-600">Google Slides embed</Label>
                                  <Input
                                    value={(lesson as { googleSlidesUrl?: string }).googleSlidesUrl || ''}
                                    onChange={(e) => updateLesson(unit.id, lesson.id, 'googleSlidesUrl', e.target.value)}
                                    placeholder="Paste Google Slides embed URL (Share → Publish to web → Embed)"
                                    className="text-xs h-8"
                                  />
                                </>
                              )}

                              {/* Each lesson gets its own AI-generated quiz: for video and slides, show Generate quiz */}
                              {(lesson.type === 'video' || lesson.type === 'slides') && (
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600">Quiz for this lesson</Label>
                                  {!lesson.quizContent?.questions?.length ? (
                                    <>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs h-8"
                                        onClick={() => generateQuizForLesson(unit.id, lesson.id)}
                                        disabled={generatingQuiz === `${unit.id}-${lesson.id}`}
                                      >
                                        {generatingQuiz === `${unit.id}-${lesson.id}` ? (
                                          <>
                                            <div className="animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full mr-2" />
                                            Generating...
                                          </>
                                        ) : (
                                          <>
                                            <Target className="w-3 h-3 mr-2" />
                                            Generate quiz for this lesson
                                          </>
                                        )}
                                      </Button>
                                      {quizGenerated === `${unit.id}-${lesson.id}` && (
                                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                          <CheckCircle className="w-3 h-3" />
                                          Quiz generated
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                      <span>📝 {lesson.quizContent.questions.length} questions • {lesson.quizContent.passingScore}% to pass</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 h-6 px-1.5 text-[10px]"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete the quiz for this lesson?')) {
                                            updateLesson(unit.id, lesson.id, 'quizContent', null);
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Delete Quiz
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Quiz Configuration */}
                              {lesson.type === 'quiz' && (
                                <div className="space-y-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  <div className="text-xs font-medium text-yellow-800">Quiz Settings</div>
                                  <div className="flex gap-2">
                                <Input
                                      type="number"
                                      value={(lesson.quiz?.passingScore || 70).toString()}
                                      onChange={(e) => updateLesson(unit.id, lesson.id, 'quiz', {
                                        ...lesson.quiz,
                                        passingScore: parseInt(e.target.value) || 70
                                      })}
                                      placeholder="70"
                                      className="text-xs w-16 h-8"
                                    />
                                    <span className="text-xs text-gray-600 self-center">% to pass</span>
                                    <Input
                                      type="number"
                                      value={(lesson.quiz?.timeLimit || 0).toString()}
                                      onChange={(e) => updateLesson(unit.id, lesson.id, 'quiz', {
                                        ...lesson.quiz,
                                        timeLimit: parseInt(e.target.value) || 0
                                      })}
                                      placeholder="0"
                                      className="text-xs w-16 h-8"
                                    />
                                    <span className="text-xs text-gray-600 self-center">min limit</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6"
                                    onClick={() => {
                                      // Add a sample question for demonstration
                                      const sampleQuestion = {
                                        question: "What is a variable in Python?",
                                        options: [
                                          "A container for storing data",
                                          "A type of loop",
                                          "A function",
                                          "A class"
                                        ],
                                        correctAnswer: "A container for storing data"
                                      };
                                      updateLesson(unit.id, lesson.id, 'quiz', {
                                        ...lesson.quiz,
                                        questions: [...(lesson.quiz?.questions || []), sampleQuestion]
                                      });
                                    }}
                                  >
                                    + Add Sample Question
                                  </Button>
                                  {lesson.quiz?.questions?.length > 0 && (
                                    <div className="text-xs text-green-600">
                                      {lesson.quiz.questions.length} question(s) added
                              </div>
                                  )}
                            </div>
                              )}

                              {/* Lesson Description */}
                              <Textarea
                                value={lesson.description || ''}
                                onChange={(e) => updateLesson(unit.id, lesson.id, 'description', e.target.value)}
                                placeholder="Lesson description..."
                                className="text-xs"
                                rows={2}
                              />
                              </div>
                                  </div>
                                ))}
                              </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  ← Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next: Compliance →
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Step 3: Compliance */}
          <TabsContent value="3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>SETA Unit Standards</CardTitle>
                  <CardDescription>Add SETA unit standards for compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>SAQA ID</Label>
                      <Input
                        value={courseData.saqaId}
                        onChange={(e) => setCourseData(prev => ({ ...prev, saqaId: e.target.value }))}
                        placeholder="e.g., 101456"
                      />
                    </div>
                    <div>
                      <Label>Compliance Status</Label>
                      <Select value={courseData.complianceStatus} onValueChange={(value) => setCourseData(prev => ({ ...prev, complianceStatus: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Unit Standard
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>QCTO Qualifications</CardTitle>
                  <CardDescription>Add QCTO qualifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add QCTO Qualification
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 col-span-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  ← Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next: Assessment →
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Step 4: Assessment */}
          <TabsContent value="4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Course Assessments
                  </CardTitle>
                  <CardDescription>Create formative and summative assessments for your course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Assessment List */}
                    {courseData.assessments.length > 0 ? (
                      <div className="space-y-4">
                        {courseData.assessments.map((assessment, index) => (
                          <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{assessment.title}</h4>
                                    <Badge className={assessment.type === 'formative' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                      {assessment.type}
                                    </Badge>
                                    {assessment.isPublished && (
                                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>Max Marks: {assessment.maxMarks}</span>
                                    <span>Passing Score: {assessment.passingScore}</span>
                                    {assessment.dueDate && <span>Due: {new Date(assessment.dueDate).toLocaleDateString()}</span>}
                                    <span>Files: {assessment.files.length}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => editAssessment(index)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteAssessment(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Yet</h3>
                        <p className="text-gray-600 mb-4">Add formative and summative assessments to evaluate learner progress</p>
                      </div>
                    )}

                    {/* Add Assessment Button */}
                    <Button
                      onClick={() => setShowAssessmentDialog(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(3)}
                  disabled={currentStep === 1}
                >
                  ← Previous
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={onBack}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading || !courseData.title || !courseData.description}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save & Publish Course'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

            </Tabs>
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Preview Card */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>See how your course will appear</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Thumbnail */}
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {courseData.thumbnail ? (
                      <img src={courseData.thumbnail} alt="Course thumbnail" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No thumbnail</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Course Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">
                        {courseData.title || 'Course Title'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {courseData.shortDescription || 'Add a short description to see it here...'}
                      </p>
                    </div>
                    
                    {/* Course Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {courseData.level || 'Beginner'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {courseData.category || 'Category'}
                        </Badge>
                      </div>
                      {courseData.duration && (
                        <div className="flex items-center gap-1 col-span-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">{courseData.duration} hours</span>
                        </div>
                      )}
                      {courseData.price && (
                        <div className="flex items-center gap-1 col-span-2">
                          <span className="font-semibold text-green-600">R{courseData.price}</span>
                        </div>
                      )}
                    </div>

                    {/* Course Stats */}
                    <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          {courseData.units.length}
                        </div>
                        <div className="text-xs text-gray-600">Units</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {courseData.units.reduce((total, unit) => total + unit.lessons.length, 0)}
                        </div>
                        <div className="text-xs text-gray-600">Lessons</div>
                      </div>
                    </div>

                    {/* Tags Preview */}
                  </div>
                </CardContent>
              </Card>

              {/* Upload Thumbnail */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Course Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    className="hidden"
                    aria-label="Choose thumbnail image"
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => thumbnailInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); thumbnailInputRef.current?.click(); } }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-2">Upload thumbnail</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={(e) => { e.stopPropagation(); thumbnailInputRef.current?.click(); }}
                      disabled={thumbnailUploading}
                    >
                      {thumbnailUploading ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Course Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-600">
                        {courseData.units.reduce((total, unit) => total + unit.lessons.length, 0)}
                      </div>
                      <div className="text-xs text-blue-600">Lessons</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-600">
                        {courseData.units.length}
                      </div>
                      <div className="text-xs text-green-600">Units</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-bold text-purple-600">
                        {courseData.units.reduce((total, unit) => {
                          return total + unit.lessons.reduce((unitTotal, lesson) => {
                            const duration = parseInt(lesson.duration?.toString()) || 0;
                            return unitTotal + duration;
                          }, 0);
                        }, 0)}
                      </div>
                      <div className="text-xs text-purple-600">Minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Dialog */}
      {showAssessmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingAssessmentIndex !== null ? 'Edit Assessment' : 'Add Assessment'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAssessmentDialog(false);
                  resetAssessmentForm();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessment-title">Assessment Title</Label>
                  <Input
                    id="assessment-title"
                    value={assessmentForm.title}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assessment title"
                  />
                </div>
                <div>
                  <Label htmlFor="assessment-type">Assessment Type</Label>
                  <Select 
                    value={assessmentForm.type} 
                    onValueChange={(value: 'formative' | 'summative') => 
                      setAssessmentForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formative">Formative</SelectItem>
                      <SelectItem value="summative">Summative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="assessment-description">Description</Label>
                <Textarea
                  id="assessment-description"
                  value={assessmentForm.description}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assessment description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assessment-instructions">Instructions</Label>
                <Textarea
                  id="assessment-instructions"
                  value={assessmentForm.instructions}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter detailed instructions for learners"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="assessment-dueDate">Due Date</Label>
                  <Input
                    id="assessment-dueDate"
                    type="date"
                    value={assessmentForm.dueDate}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="assessment-maxMarks">Max Marks</Label>
                  <Input
                    id="assessment-maxMarks"
                    type="number"
                    value={assessmentForm.maxMarks}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="assessment-passingScore">Passing Score</Label>
                  <Input
                    id="assessment-passingScore"
                    type="number"
                    value={assessmentForm.passingScore}
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssessmentDialog(false);
                  resetAssessmentForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingAssessmentIndex !== null ? updateAssessment : addAssessment}
                disabled={!assessmentForm.title || !assessmentForm.description}
              >
                {editingAssessmentIndex !== null ? 'Update Assessment' : 'Add Assessment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Course Builder Modal */}
      {showAIBuilder && (
        <AICourseBuilder
          onCourseGenerated={handleAICourseGenerated}
          onClose={() => setShowAIBuilder(false)}
        />
      )}
    </div>
  );
};

export default CourseCreationPage;
