import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Sparkles, 
  Wand2, 
  Image, 
  Play, 
  BookOpen, 
  Target, 
  Clock, 
  Users,
  CheckCircle,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  ExternalLink,
  Upload,
  FileText,
  X
} from 'lucide-react';
import { aiCourseBuilderService, AICourseRequest, AICourseResponse, YouTubeVideoResult } from '@/services/aiCourseBuilder';
import { hasNvidiaConfigured } from '@/services/nvidiaClient';
import { youtubeService } from '@/services/youtubeService';
import { lessonContentService } from '@/services/lessonContentService';
import { documentProcessor, DocumentProcessingResult } from '@/services/documentProcessor';

interface AICourseBuilderProps {
  onCourseGenerated: (courseData: any) => void;
  onClose: () => void;
}

const AICourseBuilder: React.FC<AICourseBuilderProps> = ({ onCourseGenerated, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<AICourseResponse | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideoResult[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [documentProcessingResult, setDocumentProcessingResult] = useState<DocumentProcessingResult | null>(null);

  const [courseRequest, setCourseRequest] = useState<AICourseRequest>({
    topic: '',
    level: 'Beginner',
    duration: 20,
    category: 'Programming',
    targetAudience: '',
    learningGoals: [],
    prerequisites: []
  });

  const courseLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const courseCategories = ['Programming', 'Data Science', 'Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Cybersecurity', 'Design', 'Business', 'Marketing'];
  
  const targetAudienceOptions = [
    { value: 'beginners', label: 'Complete Beginners' },
    { value: 'intermediate', label: 'Intermediate Learners' },
    { value: 'advanced', label: 'Advanced Learners' },
    { value: 'professionals', label: 'Working Professionals' },
    { value: 'students', label: 'Students' },
    { value: 'career-changers', label: 'Career Changers' },
    { value: 'entrepreneurs', label: 'Entrepreneurs' },
    { value: 'managers', label: 'Managers & Leaders' }
  ];

  const learningGoalsOptions = [
    { value: 'skill-development', label: 'Develop new skills' },
    { value: 'career-advancement', label: 'Advance career' },
    { value: 'certification', label: 'Earn certification' },
    { value: 'knowledge-expansion', label: 'Expand knowledge base' },
    { value: 'practical-application', label: 'Apply knowledge practically' },
    { value: 'problem-solving', label: 'Improve problem-solving skills' },
    { value: 'leadership', label: 'Develop leadership skills' },
    { value: 'technical-expertise', label: 'Gain technical expertise' }
  ];

  const prerequisitesOptions = [
    { value: 'none', label: 'No prerequisites required' },
    { value: 'basic-computer', label: 'Basic computer literacy' },
    { value: 'high-school-math', label: 'High school mathematics' },
    { value: 'college-level-math', label: 'College-level mathematics' },
    { value: 'programming-basics', label: 'Basic programming knowledge' },
    { value: 'industry-experience', label: 'Industry experience required' },
    { value: 'certification', label: 'Previous certification required' },
    { value: 'degree', label: 'Bachelor\'s degree required' }
  ];

  const processDocument = async (file: File) => {
    setIsProcessingDocument(true);
    setError('');
    
    try {
      const result = await documentProcessor.processDocument(file);
      setDocumentProcessingResult(result);
      setDocumentContent(result.content);
      console.log('📄 Document processed successfully:', result);
    } catch (err: any) {
      console.error('❌ Document processing error:', err);
      setError(`Failed to process document: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessingDocument(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
      processDocument(file);
    }
  };

  const removeDocument = () => {
    setUploadedDocument(null);
    setDocumentContent('');
    setDocumentProcessingResult(null);
  };

  const generateCourse = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Check if NVIDIA AI is available (proxied via Cloud Function)
      const aiAvailable = hasNvidiaConfigured();
      console.log('🔍 Checking NVIDIA API availability:', { available: aiAvailable });
      
      if (!aiAvailable) {
        // Generate a mock course for testing when API key is not available
        console.log('🔧 API key not available - generating mock course for testing');
        const mockCourse = await generateMockCourse({
          ...courseRequest,
          documentContent
        });
        console.log('✅ Mock course generated successfully:', mockCourse);
        setGeneratedCourse(mockCourse);
        setCurrentStep(2);
        setYoutubeVideos([]);
        return;
      }
      
      console.log('🚀 Using real AI generation with NVIDIA');

      const courseData = await aiCourseBuilderService.generateCourseStructure({
        ...courseRequest,
        documentContent
      });
      setGeneratedCourse(courseData);
      setCurrentStep(2);
      
      // Generate YouTube videos for each lesson (only if API key is available)
      const allVideos: YouTubeVideoResult[] = [];
      for (const unit of courseData.units) {
        for (const lesson of unit.lessons) {
          if (lesson.youtubeSearchQuery) {
            try {
              const videos = await aiCourseBuilderService.generateYouTubeVideos(lesson.youtubeSearchQuery, 2);
              allVideos.push(...videos);
            } catch (videoError) {
              console.warn('Failed to generate videos for lesson:', lesson.title, videoError);
            }
          }
        }
      }
      setYoutubeVideos(allVideos);
    } catch (err: any) {
      console.error('❌ Course generation error:', err);
      setError(`Failed to generate course: ${err.message || 'Unknown error'}. Please try again or check your API configuration.`);
    } finally {
      console.log('🏁 Course generation finished');
      setIsGenerating(false);
    }
  };

  const generateMockCourse = async (request: AICourseRequest): Promise<AICourseResponse> => {
    console.log('🎯 Starting mock course generation for:', request.topic);
    console.log('📄 Document content available:', !!request.documentContent);
    
    try {
      // Generate enhanced lesson content using the new service
      const generateLessons = async (unitTitle: string, unitDescription: string, lessonTitles: string[], types: string[]) => {
        console.log('📚 Generating lessons for unit:', unitTitle);
        const lessons = [];
        
        for (let i = 0; i < lessonTitles.length; i++) {
          const title = lessonTitles[i];
          const type = types[i] || 'video';
          const duration = type === 'project' ? 120 : type === 'quiz' ? 30 : 45;
          
          console.log(`📝 Creating lesson ${i + 1}: ${title} (${type})`);
          
          try {
            // Generate search query for YouTube videos
            const searchQuery = youtubeService.generateSearchQuery(title, request.topic, type);
            console.log('🔍 YouTube search query:', searchQuery);
            
            // Generate lesson content using the content service
            const lessonContent = await lessonContentService.generateLessonContent(
              title,
              `${title} - ${unitDescription}`,
              type,
              request.topic,
              duration
            );
            console.log('📄 Generated lesson content:', lessonContent);

            // Try to find YouTube videos (will use mock data if API key not available)
            const youtubeVideos = await youtubeService.searchVideos(searchQuery, 1);
            const selectedVideo = youtubeVideos[0];
            console.log('🎥 Selected YouTube video:', selectedVideo);

            // Generate a proper YouTube URL for video lessons
            let youtubeUrl = '';
            if (type === 'video' || type === 'learn') {
              if (selectedVideo?.url) {
                youtubeUrl = selectedVideo.url;
              } else {
                // Generate a mock YouTube URL for testing
                youtubeUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ`; // Rick Roll for testing
              }
            }

            // Generate a truly unique lesson ID using timestamp and random number
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const uniqueId = `lesson-${timestamp}-${random}`;
            
            const lesson = {
              id: uniqueId,
              title,
              description: `${title} - ${unitDescription}`,
              type: type as any,
              duration,
              content: lessonContent.content,
              objectives: lessonContent.objectives,
              resources: lessonContent.resources,
              youtubeUrl: youtubeUrl,
              pdfUrl: '',
              order: lessons.length + 1,
              isPublished: true,
              youtubeSearchQuery: searchQuery,
              // Add enhanced content based on type
              ...(type === 'reading' && { readingContent: lessonContent.readingContent }),
              ...(type === 'quiz' && { quizContent: lessonContent.quizContent }),
              ...(type === 'project' && { projectContent: lessonContent.projectContent }),
              ...(type === 'video' && { videoContent: lessonContent.videoContent }),
              quiz: lessonContent.quizContent || { questions: [], passingScore: 70, timeLimit: 0 }
            };
            
            lessons.push(lesson);
            console.log('✅ Lesson created successfully:', lesson.title);
          } catch (lessonError) {
            console.error('❌ Error creating lesson:', lessonError);
            // Create a basic lesson even if enhanced content fails
            const fallbackYoutubeUrl = (type === 'video' || type === 'learn') 
              ? `https://www.youtube.com/watch?v=dQw4w9WgXcQ` // Rick Roll for testing
              : '';
              
            lessons.push({
              id: `lesson-${lessons.length + 1}`,
              title,
              description: `${title} - ${unitDescription}`,
              type: type as any,
              duration,
              content: `This lesson covers ${title} in the context of ${request.topic}.`,
              objectives: [`Learn about ${title}`],
              resources: [`Resources for ${title}`],
              youtubeUrl: fallbackYoutubeUrl,
              pdfUrl: '',
              order: lessons.length + 1,
              isPublished: true,
              youtubeSearchQuery: `${title} ${request.topic}`,
              quiz: { questions: [], passingScore: 70, timeLimit: 0 }
            });
          }
        }
        
        console.log('📚 Generated lessons:', lessons.length);
        return lessons;
      };

      // Generate units with enhanced lessons
      console.log('🏗️ Building course units...');
      const units = [
        {
          id: 1,
          title: 'Introduction to ' + request.topic,
          description: 'Get started with the basics and set up your development environment.',
          order: 1,
          lessons: await generateLessons(
            'Introduction to ' + request.topic,
            'Get started with the basics and set up your development environment.',
            [
              'Welcome and Course Overview',
              'Setting Up Your Environment',
              'Understanding the Fundamentals'
            ],
            ['video', 'video', 'reading']
          )
        },
        {
          id: 2,
          title: 'Core Concepts',
          description: 'Learn the fundamental concepts and principles.',
          order: 2,
          lessons: await generateLessons(
            'Core Concepts',
            'Learn the fundamental concepts and principles.',
            [
              'Understanding the Basics',
              'Hands-on Practice',
              'Key Principles Quiz'
            ],
            ['video', 'project', 'quiz']
          )
        },
        {
          id: 3,
          title: 'Advanced Topics',
          description: 'Explore advanced concepts and real-world applications.',
          order: 3,
          lessons: await generateLessons(
            'Advanced Topics',
            'Explore advanced concepts and real-world applications.',
            [
              'Advanced Techniques',
              'Real-world Project',
              'Best Practices Discussion'
            ],
            ['video', 'project', 'discussion']
          )
        }
      ];

      console.log('🎉 Course generation completed successfully!');
      console.log('📊 Generated units:', units.length);
      console.log('📚 Total lessons:', units.reduce((total, unit) => total + unit.lessons.length, 0));

      const documentBasedDescription = request.documentContent 
        ? `A comprehensive course on ${request.topic} designed for ${request.level} learners. This course builds upon the uploaded document content and covers all the essential concepts with hands-on experience through practical exercises and real-world projects.`
        : `A comprehensive course on ${request.topic} designed for ${request.level} learners. This course covers all the essential concepts and provides hands-on experience through practical exercises and real-world projects.`;

      return {
        title: `${request.topic} - Complete Course`,
        description: documentBasedDescription,
        shortDescription: `Learn ${request.topic} from scratch with this comprehensive course.`,
        learningOutcomes: request.documentContent ? [
          `Master the fundamentals of ${request.topic} based on the uploaded document`,
          `Build practical projects using ${request.topic} concepts from the document`,
          `Understand best practices and industry standards as outlined in the document`,
          `Apply ${request.topic} concepts to real-world scenarios using document examples`,
          `Develop problem-solving skills in ${request.topic} with document-based exercises`
        ] : [
          `Master the fundamentals of ${request.topic}`,
          `Build practical projects using ${request.topic}`,
          `Understand best practices and industry standards`,
          `Apply ${request.topic} concepts to real-world scenarios`,
          `Develop problem-solving skills in ${request.topic}`
        ],
        targetAudience: request.targetAudience || 'Beginners and intermediate learners',
        prerequisites: request.prerequisites || ['Basic computer skills', 'No prior experience required'],
        courseOverview: request.documentContent 
          ? `This course provides a structured approach to learning ${request.topic} based on the uploaded document. We'll start with the basics and gradually build up to more advanced concepts through hands-on projects and exercises that build upon the document's content.`
          : `This course provides a structured approach to learning ${request.topic}. We'll start with the basics and gradually build up to more advanced concepts through hands-on projects and exercises.`,
        practicalApproach: request.documentContent
          ? `The course emphasizes practical learning through coding exercises, projects, and real-world examples based on the uploaded document. You'll build actual applications and solve real problems using the concepts and examples from the document.`
          : `The course emphasizes practical learning through coding exercises, projects, and real-world examples. You'll build actual applications and solve real problems.`,
        tags: [request.topic.toLowerCase(), request.level.toLowerCase(), 'programming', 'hands-on', 'practical'],
        keywords: [request.topic, request.level, 'tutorial', 'course', 'learning'],
        estimatedHours: request.duration,
        thumbnailPrompt: `Professional course thumbnail for ${request.topic} course`,
        units
      };
    } catch (error) {
      console.error('❌ Error in generateMockCourse:', error);
      throw error;
    }
  };

  const toggleVideoSelection = (videoUrl: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(videoUrl)) {
      newSelection.delete(videoUrl);
    } else {
      newSelection.add(videoUrl);
    }
    setSelectedVideos(newSelection);
  };

  const applyCourse = () => {
    if (!generatedCourse) return;

    console.log('Generated Course from AI:', generatedCourse);
    console.log('Generated Units:', generatedCourse.units);
    console.log('Total lessons across all units:', generatedCourse.units.reduce((total, unit) => total + unit.lessons.length, 0));

    // Convert AI course data to the format expected by CourseCreationPage
    const courseData = {
      title: generatedCourse.title,
      description: generatedCourse.description,
      shortDescription: generatedCourse.shortDescription,
      level: courseRequest.level,
      category: courseRequest.category,
      duration: generatedCourse.estimatedHours.toString(),
      language: 'English',
      nqfLevel: 'NQF Level 3',
      estimatedHours: generatedCourse.estimatedHours,
      targetAudience: courseRequest.targetAudience || generatedCourse.targetAudience || '',
      prerequisites: courseRequest.prerequisites || generatedCourse.prerequisites,
      learningOutcomes: courseRequest.learningGoals || generatedCourse.learningOutcomes,
      courseOverview: generatedCourse.courseOverview,
      practicalApproach: generatedCourse.practicalApproach,
      tags: generatedCourse.tags,
      keywords: generatedCourse.keywords,
      seoTitle: generatedCourse.title,
      seoDescription: generatedCourse.description,
      thumbnail: '', // Will be generated
      units: generatedCourse.units.map(unit => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        order: unit.order,
        isPublished: true, // Publish AI-generated units by default
        lessons: unit.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          duration: lesson.duration,
          content: lesson.content,
          youtubeUrl: '', // Will be filled with selected videos
          pdfUrl: '',
          order: lesson.id,
          isPublished: true, // Publish AI-generated lessons by default
          objectives: lesson.objectives,
          resources: lesson.resources,
          quiz: {
            questions: [],
            passingScore: 70,
            timeLimit: 0
          }
        }))
      }))
    };

    console.log('Processed Course Data for CourseCreationPage:', courseData);
    console.log('Processed Units:', courseData.units);
    console.log('Total lessons in processed data:', courseData.units.reduce((total, unit) => total + unit.lessons.length, 0));

    onCourseGenerated(courseData);
  };

  const steps = [
    { id: 1, title: 'Course Details', icon: <BookOpen className="w-4 h-4" /> },
    { id: 2, title: 'AI Generated Content', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  AI Course Builder
                </h1>
                <p className="text-sm text-gray-600">Let AI help you create an amazing course</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
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
                    ? 'bg-purple-100 text-purple-700' 
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
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {steps.map(step => (
              <TabsTrigger key={step.id} value={step.id.toString()}>
                {step.icon}
                <span className="ml-2 hidden sm:inline">{step.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Step 1: Course Details */}
          <TabsContent value="1">
            <div className="space-y-6">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    Course Requirements
                  </CardTitle>
                  <CardDescription>Tell us about the course you want to create</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="topic">Course Topic *</Label>
                      <Input
                        id="topic"
                        value={courseRequest.topic}
                        onChange={(e) => setCourseRequest(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="e.g., Python Programming, Digital Marketing, Data Analysis"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="level">Difficulty Level</Label>
                      <Select value={courseRequest.level} onValueChange={(value: any) => setCourseRequest(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {courseLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={courseRequest.duration}
                        onChange={(e) => setCourseRequest(prev => ({ ...prev, duration: parseInt(e.target.value) || 20 }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={courseRequest.category} onValueChange={(value) => setCourseRequest(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {courseCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select 
                      value={courseRequest.targetAudience || ''} 
                      onValueChange={(value) => setCourseRequest(prev => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetAudienceOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Learning Goals</Label>
                    <Select 
                      value={courseRequest.learningGoals?.[0] || ''} 
                      onValueChange={(value) => setCourseRequest(prev => ({ 
                        ...prev, 
                        learningGoals: value ? [value] : [] 
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select primary learning goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {learningGoalsOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Prerequisites</Label>
                    <Select 
                      value={courseRequest.prerequisites?.[0] || ''} 
                      onValueChange={(value) => setCourseRequest(prev => ({ 
                        ...prev, 
                        prerequisites: value ? [value] : [] 
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select prerequisite level" />
                      </SelectTrigger>
                      <SelectContent>
                        {prerequisitesOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Document Upload Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Upload Document (Optional)
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Upload a document to help AI create a more targeted course based on your content
                      </p>
                    </div>
                    
                    {!uploadedDocument ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          id="document-upload"
                          accept=".pdf,.txt,.doc,.docx,.json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="document-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, TXT, DOC, DOCX, or JSON files
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{uploadedDocument.name}</p>
                              <p className="text-xs text-gray-500">
                                {documentProcessor.formatFileSize(uploadedDocument.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isProcessingDocument && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeDocument}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {documentProcessingResult && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-700">Document Analysis:</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{documentProcessingResult.wordCount} words</span>
                                <span>•</span>
                                <span>{documentProcessingResult.characterCount} characters</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {documentContent.substring(0, 200)}...
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              AI will use this content to create a targeted course
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={generateCourse} 
                      disabled={!courseRequest.topic || isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {documentContent ? 'Generating Course from Document...' : 'Generating Course...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {documentContent ? 'Generate Course from Document' : 'Generate Course with AI'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {!hasNvidiaConfigured()
                        ? 'AI unavailable — set NVIDIA_API_KEY in firebase-functions/.env and deploy functions'
                        : documentContent 
                          ? 'AI will analyze your document and create a targeted course'
                          : 'AI-powered course generation enabled'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Step 2: AI Generated Content */}
          <TabsContent value="2">
            {generatedCourse ? (
              <div className="space-y-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Generated Course Structure
                    </CardTitle>
                    <CardDescription>Review and customize the AI-generated content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{generatedCourse.title}</h3>
                      <p className="text-gray-600 mt-1">{generatedCourse.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Learning Outcomes</h4>
                        <ul className="space-y-1">
                          {generatedCourse.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Course Stats</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Units:</span>
                            <span className="font-medium">{generatedCourse.units.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Lessons:</span>
                            <span className="font-medium">
                              {generatedCourse.units.reduce((total, unit) => total + unit.lessons.length, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{generatedCourse.estimatedHours} hours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {generatedCourse.units.map((unit, unitIndex) => (
                  <Card key={unit.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{unitIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{unit.title}</h3>
                          <p className="text-gray-600 text-sm">{unit.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {unit.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {lesson.type === 'video' ? (
                                  <Play className="w-4 h-4 text-blue-600" />
                                ) : lesson.type === 'quiz' ? (
                                  <Target className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <BookOpen className="w-4 h-4 text-green-600" />
                                )}
                                <span className="font-medium">{lesson.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {lesson.duration} min
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                            {lesson.objectives.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Objectives:</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {lesson.objectives.map((objective, objIndex) => (
                                    <li key={objIndex} className="flex items-start gap-1">
                                      <span className="text-purple-500">•</span>
                                      {objective}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end gap-4">
                  <Button onClick={applyCourse} className="bg-green-600 hover:bg-green-700">
                    Apply to Course Builder
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Generated Yet</h3>
                <p className="text-gray-600 mb-4">Go back to step 1 to generate your course</p>
                <Button onClick={() => setCurrentStep(1)}>
                  Generate Course
                </Button>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AICourseBuilder;
