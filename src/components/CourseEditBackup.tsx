import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  Play,
  FileText,
  Star,
  CheckCircle,
  Clock,
  Youtube,
  Target,
  Users,
  BookOpen,
  Award,
  Shield,
  Settings,
  Upload,
  Link,
  Video,
  AlertCircle,
  Info,
  Globe,
  Calendar,
  DollarSign
} from "lucide-react";

import { Course, DatabaseService } from "@/firebase/database";
import StudentAssignmentManager from "./StudentAssignmentManager";
import { FileUploadService, UploadedFile } from "@/services/fileUploadService";

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'challenge' | 'overview' | 'video' | 'article' | 'reading' | 'quiz' | 'assignment';
  duration: number;
  content: string;
  youtubeUrl?: string;
  pdfUrl?: string;
  order: number;
  isPublished: boolean;
  objectives: string[];
  resources: Resource[];
  quiz?: {
    questions: any[];
    passingScore: number;
    timeLimit: number;
  };
  // Reading lesson content types
  readingContentType?: 'text' | 'slides' | 'files' | 'video';
  googleSlidesUrl?: string;
  uploadedFiles?: UploadedFile[];
  richTextContent?: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url?: string;
  file?: UploadedFile;
  addedAt: string;
}

interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface CourseEditProps {
  course: Course & {
    units?: Unit[];
  };
  onBack: () => void;
  onSave: (course: any) => void;
  onViewLesson?: (lesson: Lesson, unit: Unit) => void;
  onDeleteCourse?: (course: Course) => void;
}

const CourseEdit: React.FC<CourseEditProps> = ({ course, onBack, onSave, onViewLesson, onDeleteCourse }) => {
  console.log('CourseEdit received course:', course);
  console.log('Course units:', course.units);
  console.log('Course lessons count:', course.lessons);
  
  // Initialize editingCourse with content type fields added to all lessons
  const initializeCourseWithContentTypes = (courseData: Course) => {
    const updatedCourse = {
      ...courseData,
      units: courseData.units?.map(unit => ({
        ...unit,
        lessons: unit.lessons?.map(lesson => ({
          ...lesson,
          // Ensure content type fields are initialized
          readingContentType: lesson.readingContentType || 'text',
          googleSlidesUrl: lesson.googleSlidesUrl || '',
          uploadedFiles: lesson.uploadedFiles || [],
          richTextContent: lesson.richTextContent || ''
        })) || []
      })) || [],
      assessments: courseData.assessments || []
    };
    console.log('CourseEdit - Initialized course with assessments:', updatedCourse.assessments?.length || 0);
    return updatedCourse;
  };
  
  const [editingCourse, setEditingCourse] = useState(initializeCourseWithContentTypes(course));
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState("basics");
  const [isLoading, setIsLoading] = useState(false);

  // Update editingCourse when course prop changes
  useEffect(() => {
    console.log('CourseEdit useEffect - Course prop changed:', course.title);
    console.log('CourseEdit useEffect - Course assessments:', course.assessments);
    console.log('CourseEdit useEffect - Assessment count:', course.assessments?.length || 0);
    
    const initializedCourse = initializeCourseWithContentTypes(course);
    console.log('CourseEdit useEffect - Initialized course assessments:', initializedCourse.assessments);
    console.log('CourseEdit useEffect - Initialized assessment count:', initializedCourse.assessments?.length || 0);
    
    setEditingCourse(initializedCourse);
  }, [course]);
  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newResource, setNewResource] = useState('');
  
  // Resource management state
  const [newResourceType, setNewResourceType] = useState<'pdf' | 'link' | 'video' | 'document'>('pdf');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Custom quiz generation function
  const generateCustomQuiz = async () => {
    if (!editingLesson) return;
    
    setGeneratingQuiz(true);
    try {
      // Import the lesson content service
      const { lessonContentService } = await import('../services/lessonContentService');
      
      // Find the unit for this lesson
      const unit = editingCourse.units?.find(u => 
        u.lessons?.some(l => l.id === editingLesson.id)
      );
      
      // Generate custom quiz content using AI
      const quizContent = await lessonContentService.generateCustomQuizContent(
        editingLesson.title || 'Quiz',
        quizTopic || unit?.title || 'Unit Content',
        quizQuestionCount,
        quizDifficulty
      );
      
      // Update the lesson with quiz content
      setEditingLesson(prev => prev ? {
        ...prev,
        quizContent: quizContent,
        content: `AI-generated quiz for ${editingLesson.title || 'this lesson'} on ${quizTopic || unit?.title || 'unit content'} (${quizQuestionCount} questions, ${quizDifficulty} difficulty).`
      } : null);
      
      setQuizGenerated(true);
      setShowQuizGenerator(false);
      setTimeout(() => setQuizGenerated(false), 3000);
      console.log('✅ Custom AI Quiz generated successfully for:', editingLesson.title);
    } catch (error) {
      console.error('❌ Error generating custom AI quiz:', error);
    } finally {
      setGeneratingQuiz(false);
    }
  };
  
  // Student assignment state
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const courseLevels = ['NQF Level 1', 'NQF Level 2', 'NQF Level 3', 'NQF Level 4', 'NQF Level 5', 'NQF Level 6'];
  const courseCategories = ['Management', 'Marketing', 'Data Science', 'Programming', 'Project Management', 'Business Strategy'];
  const lessonTypes = ['learn', 'practice', 'challenge', 'overview', 'video', 'article', 'reading', 'quiz', 'assignment'];
  const complianceStatuses = ['Compliant', 'Pending Review', 'Non-Compliant'];

  useEffect(() => {
    // Initialize units if they don't exist
    if (!editingCourse.units || editingCourse.units.length === 0) {
      console.log('CourseEdit - No units found, initializing default unit');
      setEditingCourse(prev => ({
        ...prev,
        units: [{
          id: 1,
          title: 'Introduction',
          description: '',
          order: 1,
          isPublished: false,
          lessons: []
        }]
      }));
    } else {
      console.log('CourseEdit - Units found:', editingCourse.units);
      console.log('CourseEdit - Total lessons in units:', editingCourse.units.reduce((total, unit) => total + unit.lessons.length, 0));
    }
  }, [editingCourse.units]);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'learn':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'article':
      case 'reading':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'quiz':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'assignment':
        return <Edit className="w-4 h-4 text-orange-600" />;
      case 'challenge':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'practice':
        return <Settings className="w-4 h-4 text-indigo-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  // File upload handlers for reading lessons
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editingLesson) return;

    try {
      setIsLoading(true);
      
      // Upload files to Firebase Storage
      const uploadedFiles = await FileUploadService.uploadFiles(
        Array.from(files), 
        editingCourse.id, 
        editingLesson.id
      );
      
      setEditingLesson(prev => prev ? { 
        ...prev, 
        uploadedFiles: [...(prev.uploadedFiles || []), ...uploadedFiles] 
      } : null);
      
      console.log('Files uploaded successfully:', uploadedFiles);
    } catch (error) {
      console.error('Error uploading files:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = async (fileId: string) => {
    if (!editingLesson) return;
    
    try {
      // Find the file to get its storage path
      const fileToRemove = editingLesson.uploadedFiles?.find(file => file.id === fileId);
      
      if (fileToRemove?.storagePath) {
        // Delete from Firebase Storage
        await FileUploadService.deleteFile(fileToRemove.storagePath);
      }
      
      // Remove from local state
      setEditingLesson(prev => prev ? { 
        ...prev, 
        uploadedFiles: (prev.uploadedFiles || []).filter(file => file.id !== fileId) 
      } : null);
      
      console.log('File removed successfully');
    } catch (error) {
      console.error('Error removing file:', error);
      // Still remove from local state even if storage deletion fails
      setEditingLesson(prev => prev ? { 
        ...prev, 
        uploadedFiles: (prev.uploadedFiles || []).filter(file => file.id !== fileId) 
      } : null);
    }
  };

  const formatFileSize = FileUploadService.formatFileSize;

  // Resource management functions
  const handleResourceFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewResourceFile(file);
    }
  };

  // Helper function to convert file to data URL (same as profile picture upload)
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const addResource = async () => {
    if (!editingLesson || !newResourceTitle) return;

    try {
      let resourceData: any = {
        id: Date.now().toString(),
        title: newResourceTitle,
        type: newResourceType,
        addedAt: new Date().toISOString()
      };

      if (newResourceType === 'link' || newResourceType === 'video') {
        if (!newResourceUrl) return;
        resourceData.url = newResourceUrl;
      } else if (newResourceType === 'pdf' || newResourceType === 'document') {
        if (!newResourceFile) return;
        
        // Use data URL approach (same as profile picture upload)
        console.log('Using data URL approach for resource file upload');
        const dataUrl = await fileToDataUrl(newResourceFile);
        
        resourceData.file = {
          id: Date.now().toString(),
          name: newResourceFile.name,
          type: newResourceFile.type,
          url: dataUrl,
          size: newResourceFile.size
        };
        resourceData.url = dataUrl;
        
        console.log('Resource file uploaded successfully using data URL:', {
          fileName: newResourceFile.name,
          size: newResourceFile.size,
          type: newResourceFile.type
        });
      }

      // Add resource to lesson
      setEditingLesson(prev => prev ? {
        ...prev,
        resources: [...(prev.resources || []), resourceData]
      } : null);

      // Reset form
      setNewResourceTitle('');
      setNewResourceUrl('');
      setNewResourceFile(null);
      setNewResourceType('pdf');

      console.log('Resource added successfully:', resourceData);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const removeResource = (index: number) => {
    if (!editingLesson) return;

    const resourceToRemove = editingLesson.resources?.[index];
    
    // If it's a file resource, delete from storage
    if (resourceToRemove?.file?.storagePath) {
      FileUploadService.deleteFile(resourceToRemove.file.storagePath).catch(console.error);
    }

    // Remove from lesson
    setEditingLesson(prev => prev ? {
      ...prev,
      resources: (prev.resources || []).filter((_, i) => i !== index)
    } : null);

    console.log('Resource removed successfully');
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    try {
      // Update the course with current timestamp
      const calculatedLessons = editingCourse.units?.reduce((total, unit) => total + unit.lessons.length, 0) || 0;
      console.log('Course edit - calculated lessons from units:', calculatedLessons);
      console.log('Course edit - original lessons count:', editingCourse.lessons);
      console.log('Course edit - units structure:', editingCourse.units);
      
      // Clean up empty resources from all lessons before saving
      const cleanedCourse = {
        ...editingCourse,
        units: editingCourse.units?.map(unit => ({
          ...unit,
          lessons: unit.lessons.map(lesson => ({
            ...lesson,
            resources: lesson.resources?.filter(resource => 
              resource && resource.title && resource.title.trim() !== ''
            ) || []
          }))
        })) || []
      };

      const updatedCourse = {
        ...cleanedCourse,
        updatedAt: new Date().toISOString(),
        lessons: calculatedLessons || editingCourse.lessons,
        assessments: editingCourse.assessments || []
      };

      console.log('Saving course changes:', updatedCourse);
      console.log('Course assessments being saved:', updatedCourse.assessments);
      console.log('First unit lessons with content types:', updatedCourse.units?.[0]?.lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        readingContentType: lesson.readingContentType,
        googleSlidesUrl: lesson.googleSlidesUrl,
        uploadedFiles: lesson.uploadedFiles,
        richTextContent: lesson.richTextContent
      })));
      
      // Debug: Check if content type data is present in the course data
      const lessonWithContentType = updatedCourse.units?.[0]?.lessons?.find(lesson => lesson.id === 'lesson-1-2');
      if (lessonWithContentType) {
        console.log('🔍 Lesson 2 content type data before save:', {
          readingContentType: lessonWithContentType.readingContentType,
          googleSlidesUrl: lessonWithContentType.googleSlidesUrl,
          uploadedFiles: lessonWithContentType.uploadedFiles,
          richTextContent: lessonWithContentType.richTextContent
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to save to backend first, but don't fail if it doesn't work
      try {
        await DatabaseService.updateCourse(updatedCourse.id, updatedCourse);
        console.log('Course updated in backend');
      } catch (apiError) {
        console.log('Backend update failed, continuing with local update:', apiError);
      }

      // Course is now only stored in Firebase - no localStorage needed

      // Call the onSave callback to update parent component
      onSave(updatedCourse);
      
      console.log('Course updated successfully:', updatedCourse);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete course handler
  const handleDeleteCourse = async () => {
    if (!onDeleteCourse) {
      console.error('onDeleteCourse callback not provided');
      return;
    }

    try {
      console.log('Deleting course:', editingCourse.title);
      await onDeleteCourse(editingCourse);
      setShowDeleteConfirm(false);
      // The parent component will handle navigation back to dashboard
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  // Student assignment handlers
  const handleAssignStudent = (studentId: string) => {
    const newAssignment = {
      studentId,
      assignedAt: new Date().toISOString(),
      status: 'active' as const,
      progress: 0
    };
    
    setEditingCourse(prev => ({
      ...prev,
      assignedStudents: [...(prev.assignedStudents || []), studentId],
      studentAssignments: [...(prev.studentAssignments || []), newAssignment]
    }));
  };

  const handleUnassignStudent = (studentId: string) => {
    setEditingCourse(prev => ({
      ...prev,
      assignedStudents: (prev.assignedStudents || []).filter(id => id !== studentId),
      studentAssignments: (prev.studentAssignments || []).filter(assignment => assignment.studentId !== studentId)
    }));
  };

  const handleBulkAssign = (studentIds: string[]) => {
    const newAssignments = studentIds.map(studentId => ({
      studentId,
      assignedAt: new Date().toISOString(),
      status: 'active' as const,
      progress: 0
    }));
    
    setEditingCourse(prev => ({
      ...prev,
      assignedStudents: [...(prev.assignedStudents || []), ...studentIds],
      studentAssignments: [...(prev.studentAssignments || []), ...newAssignments]
    }));
  };

  const addUnit = () => {
    const newUnit: Unit = {
      id: Date.now(),
      title: `Unit ${(editingCourse.units?.length || 0) + 1}`,
      description: '',
      order: (editingCourse.units?.length || 0) + 1,
      isPublished: false,
      lessons: []
    };
    
    setEditingCourse(prev => ({
      ...prev,
      units: [...(prev.units || []), newUnit]
    }));
    setSelectedUnit(newUnit);
  };

  const deleteUnit = (unitId: number) => {
    setEditingCourse(prev => ({
      ...prev,
      units: prev.units?.filter(unit => unit.id !== unitId) || []
    }));
    
    if (selectedUnit?.id === unitId) {
      const remainingUnits = editingCourse.units?.filter(u => u.id !== unitId) || [];
      setSelectedUnit(remainingUnits[0] || null);
    }
  };

  const updateUnit = (unitId: number, updates: Partial<Unit>) => {
    setEditingCourse(prev => ({
      ...prev,
      units: prev.units?.map(u => u.id === unitId ? { ...u, ...updates } : u) || []
    }));
    
    if (selectedUnit?.id === unitId) {
      setSelectedUnit(prev => prev ? { ...prev, ...updates } : prev);
    }
  };

  const addLesson = (unitId: number) => {
    const unit = editingCourse.units?.find(u => u.id === unitId);
    if (!unit) return;

    // Generate a truly unique lesson ID using timestamp and random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const uniqueId = `lesson-${timestamp}-${random}`;

    const newLesson: Lesson = {
      id: uniqueId,
      title: `Lesson ${unit.lessons.length + 1}`,
      description: '',
      type: 'learn',
      duration: 15,
      content: '',
      youtubeUrl: '',
      pdfUrl: '',
      order: unit.lessons.length + 1,
      isPublished: false,
      objectives: [],
      resources: [],
      quiz: {
        questions: [],
        passingScore: 70,
        timeLimit: 0
      }
    };

    updateUnit(unitId, {
      lessons: [...unit.lessons, newLesson]
    });
  };

  const deleteLesson = (unitId: number, lessonId: string) => {
    const unit = editingCourse.units?.find(u => u.id === unitId);
    if (!unit) return;

    updateUnit(unitId, {
      lessons: unit.lessons.filter(l => l.id !== lessonId)
    });
  };

  const updateLesson = (unitId: number, lessonId: string, updates: Partial<Lesson>) => {
    const unit = editingCourse.units?.find(u => u.id === unitId);
    if (!unit) return;

    updateUnit(unitId, {
      lessons: unit.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
    });
  };

  const addTag = () => {
    if (newTag.trim() && !editingCourse.tags?.includes(newTag.trim())) {
      setEditingCourse(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditingCourse(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const totalLessons = editingCourse.units?.reduce((sum, unit) => sum + unit.lessons.length, 0) || 0;
  const completionRate = editingCourse.units?.length ? 
    (editingCourse.units.filter(u => u.isPublished).length / editingCourse.units.length) * 100 : 0;

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
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Course</h1>
                <p className="text-sm text-gray-600">{editingCourse.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save Status Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isLoading ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Ready to save
                  </>
                )}
              </div>
              <Badge variant={editingCourse.complianceStatus === 'Compliant' ? 'default' : 
                            editingCourse.complianceStatus === 'Pending Review' ? 'secondary' : 'destructive'}>
                {editingCourse.complianceStatus}
              </Badge>
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Course Completion</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{editingCourse.enrolledLearners} learners</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{editingCourse.rating || 0}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basics">Course Basics</TabsTrigger>
                <TabsTrigger value="structure">Course Structure</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

          {/* Course Basics Tab */}
          <TabsContent value="basics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update your course details and description</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        value={editingCourse.title}
                        onChange={(e) => setEditingCourse(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editingCourse.description}
                        onChange={(e) => setEditingCourse(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="level">NQF Level</Label>
                        <Select 
                          value={editingCourse.level} 
                          onValueChange={(value) => setEditingCourse(prev => ({ ...prev, level: value as any }))}
                        >
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
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={editingCourse.duration}
                          onChange={(e) => setEditingCourse(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 6 months"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={editingCourse.category} 
                          onValueChange={(value) => setEditingCourse(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courseCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Price (ZAR)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={editingCourse.price}
                          onChange={(e) => setEditingCourse(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Thumbnail</CardTitle>
                    <CardDescription>Upload an eye-catching image for your course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="thumbnail">Thumbnail URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="thumbnail"
                          value={editingCourse.thumbnail || ''}
                          onChange={(e) => setEditingCourse(prev => ({ ...prev, thumbnail: e.target.value }))}
                          placeholder="Enter image URL or upload below"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 1280x720px (16:9 aspect ratio)
                      </p>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="thumbnail-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsLoading(true);
                              
                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                alert('Please select an image file (JPG, PNG, GIF, etc.)');
                                return;
                              }
                              
                              // Validate file size (max 10MB)
                              const maxSize = 10 * 1024 * 1024; // 10MB
                              if (file.size > maxSize) {
                                alert('File size must be less than 10MB');
                                return;
                              }
                              
                              try {
                                // Try Cloudinary first
                                const { CloudinaryService } = await import('../services/cloudinaryService');
                                const uploadedUrl = await CloudinaryService.uploadImage(file);
                                setEditingCourse(prev => ({ ...prev, thumbnail: uploadedUrl }));
                                console.log('✅ Thumbnail uploaded to Cloudinary successfully');
                              } catch (cloudinaryError) {
                                console.log('⚠️ Cloudinary not configured, using local data URL');
                                // Fallback to local data URL
                                const { CloudinaryService } = await import('../services/cloudinaryService');
                                const localDataUrl = await CloudinaryService.createLocalDataUrl(file);
                                setEditingCourse(prev => ({ ...prev, thumbnail: localDataUrl }));
                                console.log('✅ Thumbnail converted to local data URL');
                              }
                            } catch (error) {
                              console.error('❌ Error uploading thumbnail:', error);
                              alert('Failed to upload thumbnail. Please try again.');
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                    
                    {/* Thumbnail Preview */}
                    {editingCourse.thumbnail && (
                      <div className="mt-4">
                        <Label className="mb-2 block">Preview</Label>
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                          <img 
                            src={editingCourse.thumbnail} 
                            alt="Course thumbnail preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setEditingCourse(prev => ({ ...prev, thumbnail: '' }))}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags & Keywords</CardTitle>
                    <CardDescription>Help learners discover your course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Course Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editingCourse.tags || []).map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Course Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Units Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Course Units</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4">
                    {editingCourse.units?.map((unit, index) => (
                      <div
                        key={unit.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUnit?.id === unit.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{unit.title}</p>
                              <p className="text-xs text-gray-500">{unit.lessons.length} lessons</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUnit(unit.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Unit Content */}
              <div className="lg:col-span-3">
                {selectedUnit ? (
                  <div className="space-y-6">
                    {/* Unit Header */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Unit {selectedUnit.order}: {selectedUnit.title}</CardTitle>
                            <CardDescription>{selectedUnit.description || 'No description'}</CardDescription>
                          </div>
                          <Button variant="outline" onClick={() => setEditingUnit(selectedUnit)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Unit
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {editingUnit && (
                        <CardContent className="border-t">
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label>Unit Title</Label>
                              <Input
                                value={editingUnit.title}
                                onChange={(e) => setEditingUnit(prev => prev ? { ...prev, title: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={editingUnit.description}
                                onChange={(e) => setEditingUnit(prev => prev ? { ...prev, description: e.target.value } : null)}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => {
                                updateUnit(editingUnit.id, editingUnit);
                                setEditingUnit(null);
                              }}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setEditingUnit(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* Lessons */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Lessons ({selectedUnit.lessons.length})</CardTitle>
                          <Button size="sm" onClick={() => addLesson(selectedUnit.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedUnit.lessons.map((lesson, index) => (
                          <div key={lesson.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold">{index + 1}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getLessonIcon(lesson.type)}
                                  <span className="font-medium">{lesson.title}</span>
                                  <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteLesson(selectedUnit.id, lesson.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {editingLesson?.id === lesson.id && (
                              <div className="space-y-4 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Lesson Title</Label>
                                    <Input
                                      value={editingLesson.title}
                                      onChange={(e) => setEditingLesson(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Type</Label>
                                    <Select 
                                      value={editingLesson.type} 
                                      onValueChange={async (value) => {
                                        if (value === 'quiz' && editingLesson) {
                                          setShowQuizGenerator(true);
                                          setQuizTopic(''); // Reset topic
                                          setQuizQuestionCount(5); // Reset to default
                                          setQuizDifficulty('medium'); // Reset to default
                                        }
                                        setEditingLesson(prev => prev ? { ...prev, type: value as any } : null);
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {lessonTypes.map(type => (
                                          <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="lesson-duration">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Duration (minutes)
                                      </div>
                                    </Label>
                                    <Input
                                      id="lesson-duration"
                                      type="number"
                                      min="1"
                                      value={editingLesson.duration}
                                      onChange={(e) => setEditingLesson(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 5 } : null)}
                                      placeholder="e.g., 15"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Time students must spend on this lesson
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={editingLesson.description}
                                    onChange={(e) => setEditingLesson(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    rows={3}
                                  />
                                </div>
                                
                                {/* AI Quiz Generation Status */}
                                {generatingQuiz && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                                    <div className="animate-spin w-4 h-4 border border-blue-600 border-t-transparent rounded-full"></div>
                                    <span>AI generating quiz...</span>
                                  </div>
                                )}
                                
                                {quizGenerated && (
                                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Quiz generated successfully!</span>
                                  </div>
                                )}
                                
                                {/* Quiz Generator for Quiz Type */}
                                {editingLesson.type === 'quiz' && showQuizGenerator && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-blue-900">AI Quiz Generator</h4>
                                      <button
                                        onClick={() => setShowQuizGenerator(false)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Quiz Topic</Label>
                                        <Input
                                          value={quizTopic}
                                          onChange={(e) => setQuizTopic(e.target.value)}
                                          placeholder="Enter quiz topic..."
                                          className="mt-1"
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Number of Questions</Label>
                                          <Input
                                            type="number"
                                            value={quizQuestionCount}
                                            onChange={(e) => setQuizQuestionCount(parseInt(e.target.value) || 5)}
                                            min="1"
                                            max="20"
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Difficulty</Label>
                                          <Select value={quizDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setQuizDifficulty(value)}>
                                            <SelectTrigger className="mt-1">
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
                                        onClick={generateCustomQuiz}
                                        disabled={generatingQuiz}
                                        className="w-full"
                                      >
                                        {generatingQuiz ? (
                                          <>
                                            <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full mr-2"></div>
                                            Generating Quiz...
                                          </>
                                        ) : (
                                          <>
                                            <Target className="w-4 h-4 mr-2" />
                                            Generate Quiz
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Quiz Status Messages */}
                                {generatingQuiz && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                                    <div className="animate-spin w-4 h-4 border border-blue-600 border-t-transparent rounded-full"></div>
                                    <span>AI generating quiz...</span>
                                  </div>
                                )}
                                
                                {quizGenerated && (
                                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Quiz generated successfully!</span>
                                  </div>
                                )}
                                
                                {editingLesson.type === 'quiz' && editingLesson.quizContent && (
                                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                    <span>📝 {editingLesson.quizContent.questions?.length || 0} questions • {editingLesson.quizContent.passingScore}% passing score</span>
                                  </div>
                                )}
                                {(editingLesson.type === 'video' || editingLesson.type === 'learn') && (
                                  <div>
                                    <Label>YouTube URL</Label>
                                    <Input
                                      value={editingLesson.youtubeUrl || ''}
                                      onChange={(e) => setEditingLesson(prev => prev ? { ...prev, youtubeUrl: e.target.value } : null)}
                                      placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                  </div>
                                )}
                                
                                {editingLesson.type === 'reading' && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Reading Content Type</Label>
                                      <Select
                                        value={editingLesson.readingContentType || 'text'}
                                        onValueChange={(value) => setEditingLesson(prev => prev ? { ...prev, readingContentType: value as 'text' | 'slides' | 'files' | 'video' } : null)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="text">Text Content</SelectItem>
                                          <SelectItem value="slides">Google Slides</SelectItem>
                                          <SelectItem value="files">Files (PDF/PowerPoint)</SelectItem>
                                          <SelectItem value="video">Video Content</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {editingLesson.readingContentType === 'slides' && (
                                      <div>
                                        <Label>Google Slides URL</Label>
                                        <Input
                                          value={editingLesson.googleSlidesUrl || ''}
                                          onChange={(e) => setEditingLesson(prev => prev ? { ...prev, googleSlidesUrl: e.target.value } : null)}
                                          placeholder="https://docs.google.com/presentation/d/e/2PACX-1vSKDyf4OJ35zAgCfUmYlER81H1XUvEu3mY2JxQNb6cGZ0vR0vS5sgA2VxGdKW58qMPZrMGm6cgUo-bu/pub?start=false&loop=false&delayms=3000"
                                        />
                                      </div>
                                    )}
                                    
                                    {editingLesson.readingContentType === 'video' && (
                                      <div>
                                        <Label>Video URL</Label>
                                        <Input
                                          value={editingLesson.youtubeUrl || ''}
                                          onChange={(e) => setEditingLesson(prev => prev ? { ...prev, youtubeUrl: e.target.value } : null)}
                                          placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                      </div>
                                    )}
                                    
                                    {editingLesson.readingContentType === 'files' && (
                                      <div>
                                        <Label>File Upload</Label>
                                        <div className="space-y-4">
                                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <input
                                              type="file"
                                              id={`file-upload-${editingLesson.id}`}
                                              multiple
                                              accept=".pdf,.ppt,.pptx,.doc,.docx"
                                              onChange={handleFileUpload}
                                              className="hidden"
                                            />
                                            <label htmlFor={`file-upload-${editingLesson.id}`} className="cursor-pointer block">
                                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                              <p className="text-sm text-gray-600">Click to upload PDF, PowerPoint, or document files</p>
                                              <p className="text-xs text-gray-500 mt-1">Supports: PDF, PPT, PPTX, DOC, DOCX</p>
                                            </label>
                                          </div>
                                          
                                          {/* Display uploaded files */}
                                          {editingLesson.uploadedFiles && editingLesson.uploadedFiles.length > 0 && (
                                            <div className="space-y-2">
                                              <Label>Uploaded Files</Label>
                                              {editingLesson.uploadedFiles.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                  <div className="flex items-center gap-3">
                                                    <FileText className={`w-6 h-6 ${FileUploadService.getFileTypeIcon(file.type)}`} />
                                                    <div>
                                                      <p className="text-sm font-medium">{file.name}</p>
                                                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                    </div>
                                                  </div>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeFile(file.id)}
                                                  >
                                                    Remove
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {editingLesson.readingContentType === 'text' && (
                                      <div>
                                        <Label>Rich Text Content</Label>
                                        <Textarea
                                          value={editingLesson.richTextContent || ''}
                                          onChange={(e) => setEditingLesson(prev => prev ? { ...prev, richTextContent: e.target.value } : null)}
                                          placeholder="Enter your reading content here... You can use HTML tags for formatting."
                                          rows={8}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                          You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt; for formatting.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Resources Section */}
                                <div className="space-y-4 border-t pt-4">
                                  <div>
                                    <Label className="text-base font-medium">Study Resources</Label>
                                    <p className="text-sm text-gray-600 mb-3">Add PDFs, links, or other study materials for this lesson</p>
                                    
                                    {/* Add Resource Form */}
                                    <div className="space-y-3">
                                      <div className="flex gap-2">
                                        <Select
                                          value={newResourceType}
                                          onValueChange={setNewResourceType}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="link">Link</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        
                                        <Input
                                          value={newResourceTitle}
                                          onChange={(e) => setNewResourceTitle(e.target.value)}
                                          placeholder="Resource title"
                                          className="flex-1"
                                        />
                                        
                                        {newResourceType === 'link' || newResourceType === 'video' ? (
                                          <Input
                                            value={newResourceUrl}
                                            onChange={(e) => setNewResourceUrl(e.target.value)}
                                            placeholder="URL"
                                            className="flex-1"
                                          />
                                        ) : (
                                          <div className="flex-1">
                                            <input
                                              type="file"
                                              id="resource-file"
                                              accept=".pdf,.doc,.docx,.ppt,.pptx"
                                              onChange={handleResourceFileUpload}
                                              className="hidden"
                                            />
                                            <label
                                              htmlFor="resource-file"
                                              className="flex items-center justify-center w-full px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                                            >
                                              <Upload className="w-4 h-4 mr-2" />
                                              Choose File
                                            </label>
                                          </div>
                                        )}
                                        
                                        <Button
                                          size="sm"
                                          onClick={addResource}
                                          disabled={!newResourceTitle || (newResourceType === 'link' && !newResourceUrl) || (newResourceType === 'video' && !newResourceUrl)}
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Display Resources */}
                                    {editingLesson.resources && editingLesson.resources.length > 0 && (
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Current Resources</Label>
                                        {editingLesson.resources
                                          .filter(resource => resource && resource.title && resource.title.trim() !== '')
                                          .map((resource, index) => (
                                          <div key={resource.id || index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                              {resource.type === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
                                              {resource.type === 'link' && <Link className="w-4 h-4 text-blue-500" />}
                                              {resource.type === 'video' && <Video className="w-4 h-4 text-purple-500" />}
                                              {resource.type === 'document' && <FileText className="w-4 h-4 text-green-500" />}
                                              
                                              <div>
                                                <p className="font-medium text-sm">{resource.title}</p>
                                                {resource.url && (
                                                  <p className="text-xs text-gray-500 truncate max-w-xs">
                                                    {resource.url}
                                                  </p>
                                                )}
                                                {resource.file && (
                                                  <p className="text-xs text-gray-500">
                                                    {resource.file.name} ({(resource.file.size / 1024).toFixed(1)} KB)
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeResource(index)}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => {
                                    // Clean up empty resources before saving
                                    const cleanedLesson = {
                                      ...editingLesson,
                                      resources: editingLesson.resources?.filter(resource => 
                                        resource && resource.title && resource.title.trim() !== ''
                                      ) || []
                                    };
                                    updateLesson(selectedUnit.id, editingLesson.id, cleanedLesson);
                                    setEditingLesson(null);
                                  }}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Lesson
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setEditingLesson(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedUnit.lessons.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No lessons in this unit yet</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => addLesson(selectedUnit.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Lesson
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Select a Unit</h3>
                      <p className="text-sm text-gray-600">Choose a unit from the sidebar to edit its content</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    SETA Compliance
                  </CardTitle>
                  <CardDescription>Configure SETA unit standards and compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>SAQA ID</Label>
                    <Input
                      value={editingCourse.saqaId || ''}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, saqaId: e.target.value }))}
                      placeholder="e.g., SAQA ID 101456"
                    />
                  </div>
                  <div>
                    <Label>Compliance Status</Label>
                    <Select 
                      value={editingCourse.complianceStatus} 
                      onValueChange={(value) => setEditingCourse(prev => ({ ...prev, complianceStatus: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {complianceStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4">
                    <Label className="text-sm font-medium">SETA Unit Standards</Label>
                    <div className="mt-2">
                      {editingCourse.setaUnitStandards?.length ? (
                        <div className="space-y-2">
                          {editingCourse.setaUnitStandards.map((standard, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{standard}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(prev => ({
                                    ...prev,
                                    setaUnitStandards: prev.setaUnitStandards?.filter((_, i) => i !== index) || []
                                  }));
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No SETA unit standards added</p>
                      )}
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Unit Standard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    QCTO Qualifications
                  </CardTitle>
                  <CardDescription>Link to QCTO qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-4">
                    <Label className="text-sm font-medium">QCTO Qualifications</Label>
                    <div className="mt-2">
                      {editingCourse.qctoQualifications?.length ? (
                        <div className="space-y-2">
                          {editingCourse.qctoQualifications.map((qualification, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{qualification}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(prev => ({
                                    ...prev,
                                    qctoQualifications: prev.qctoQualifications?.filter((_, i) => i !== index) || []
                                  }));
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No QCTO qualifications added</p>
                      )}
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add QCTO Qualification
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-4 h-4 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Compliance Status: {editingCourse.complianceStatus}</p>
                        <p className="text-blue-700">
                          {editingCourse.complianceStatus === 'Compliant' 
                            ? 'This course meets all compliance requirements'
                            : 'Review compliance requirements to improve status'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Course Assessments</h2>
                <p className="text-gray-600">Upload formative and summative assessments with availability dates</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('🔍 Debug Assessment State');
                    console.log('Current editingCourse:', editingCourse.title);
                    console.log('Current assessments:', editingCourse.assessments);
                    console.log('Assessment count:', editingCourse.assessments?.length || 0);
                    console.log('Assessment data:', JSON.stringify(editingCourse.assessments, null, 2));
                  }}
                >
                  Debug State
                </Button>
                <Button onClick={() => {
                console.log('Add Assessment button clicked');
                console.log('Current assessments before adding:', editingCourse.assessments?.length || 0);
                
                const newAssessment = {
                  id: `assessment-${Date.now()}`,
                  title: '',
                  type: 'formative' as 'formative' | 'summative',
                  description: '',
                  availableFrom: new Date().toISOString().split('T')[0],
                  availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                  instructions: '',
                  passingScore: 70,
                  timeLimit: 60,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                console.log('New assessment created:', newAssessment);
                
                setEditingCourse(prev => {
                  const updated = {
                    ...prev,
                    assessments: [...(prev.assessments || []), newAssessment]
                  };
                  console.log('Updated course with assessments:', updated.assessments?.length || 0);
                  console.log('Updated assessments:', updated.assessments);
                  return updated;
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Assessment
              </Button>
            </div>

            <div className="space-y-6">
              {editingCourse.assessments?.map((assessment, index) => (
                <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-medium">ASSESSMENT {index + 1}</div>
                          <div className="text-lg font-semibold">{assessment.title || `Assessment ${index + 1}`}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={assessment.type === 'formative' ? 'secondary' : 'default'} className="text-xs">
                          {assessment.type.toUpperCase()}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.filter(a => a.id !== assessment.id) || []
                            }));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Assessment Title</Label>
                        <Input
                          value={assessment.title}
                          onChange={(e) => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.map(a => 
                                a.id === assessment.id ? { ...a, title: e.target.value } : a
                              ) || []
                            }));
                          }}
                          placeholder="e.g., Mid-term Formative Assessment"
                        />
                      </div>
                      <div>
                        <Label>Assessment Type</Label>
                        <Select 
                          value={assessment.type} 
                          onValueChange={(value: 'formative' | 'summative') => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.map(a => 
                                a.id === assessment.id ? { ...a, type: value } : a
                              ) || []
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formative">Formative Assessment</SelectItem>
                            <SelectItem value="summative">Summative Assessment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={assessment.description}
                        onChange={(e) => {
                          setEditingCourse(prev => ({
                            ...prev,
                            assessments: prev.assessments?.map(a => 
                              a.id === assessment.id ? { ...a, description: e.target.value } : a
                            ) || []
                          }));
                        }}
                        placeholder="Describe what this assessment covers..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Available From</Label>
                        <Input
                          type="date"
                          value={assessment.availableFrom}
                          onChange={(e) => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.map(a => 
                                a.id === assessment.id ? { ...a, availableFrom: e.target.value } : a
                              ) || []
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Available Until</Label>
                        <Input
                          type="date"
                          value={assessment.availableUntil}
                          onChange={(e) => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.map(a => 
                                a.id === assessment.id ? { ...a, availableUntil: e.target.value } : a
                              ) || []
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Passing Score (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={assessment.passingScore || 70}
                          onChange={(e) => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.map(a => 
                                a.id === assessment.id ? { ...a, passingScore: parseInt(e.target.value) || 70 } : a
                              ) || []
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Time Limit (minutes)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={assessment.timeLimit || 60}
                          onChange={(e) => {
                            setEditingCourse(prev => ({
                              ...prev,
                              assessments: prev.assessments?.map(a => 
                                a.id === assessment.id ? { ...a, timeLimit: parseInt(e.target.value) || 60 } : a
                              ) || []
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Instructions</Label>
                      <Textarea
                        value={assessment.instructions || ''}
                        onChange={(e) => {
                          setEditingCourse(prev => ({
                            ...prev,
                            assessments: prev.assessments?.map(a => 
                              a.id === assessment.id ? { ...a, instructions: e.target.value } : a
                            ) || []
                          }));
                        }}
                        placeholder="Special instructions for students..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Assessment File</Label>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id={`assessment-file-${assessment.id}`}
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setIsLoading(true);
                                  
                                  // Validate file type
                                  const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
                                  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                                  if (!allowedTypes.includes(fileExtension)) {
                                    alert('Please select a valid file type (PDF, DOC, DOCX, PPT, PPTX)');
                                    return;
                                  }
                                  
                                  // Validate file size (max 50MB)
                                  const maxSize = 50 * 1024 * 1024; // 50MB
                                  if (file.size > maxSize) {
                                    alert('File size must be less than 50MB');
                                    return;
                                  }
                                  
                                  try {
                                    // Try Cloudinary first
                                    const { CloudinaryService } = await import('../services/cloudinaryService');
                                    const uploadedUrl = await CloudinaryService.uploadAssessmentFile(file);
                                    
                                    setEditingCourse(prev => ({
                                      ...prev,
                                      assessments: prev.assessments?.map(a => 
                                        a.id === assessment.id ? { 
                                          ...a, 
                                          fileUrl: uploadedUrl,
                                          fileName: file.name,
                                          fileSize: file.size,
                                          updatedAt: new Date().toISOString()
                                        } : a
                                      ) || []
                                    }));
                                    console.log('✅ Assessment file uploaded to Cloudinary successfully');
                                  } catch (cloudinaryError) {
                                    console.log('⚠️ Cloudinary not configured, using local data URL');
                                    // Fallback to local data URL
                                    const { CloudinaryService } = await import('../services/cloudinaryService');
                                    const localDataUrl = await CloudinaryService.createLocalDataUrl(file);
                                    
                                    setEditingCourse(prev => ({
                                      ...prev,
                                      assessments: prev.assessments?.map(a => 
                                        a.id === assessment.id ? { 
                                          ...a, 
                                          fileUrl: localDataUrl,
                                          fileName: file.name,
                                          fileSize: file.size,
                                          updatedAt: new Date().toISOString()
                                        } : a
                                      ) || []
                                    }));
                                    console.log('✅ Assessment file converted to local data URL');
                                  }
                                } catch (error) {
                                  console.error('❌ Error uploading assessment file:', error);
                                  alert('Failed to upload assessment file. Please try again.');
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                            }}
                            className="hidden"
                          />
                          <label htmlFor={`assessment-file-${assessment.id}`} className="cursor-pointer block">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload assessment file</p>
                            <p className="text-xs text-gray-500 mt-1">Supports: PDF, DOC, DOCX, PPT, PPTX (max 50MB)</p>
                          </label>
                        </div>
                        
                        {/* Display uploaded file */}
                        {assessment.fileUrl && (
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium">{assessment.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {assessment.fileSize ? `${(assessment.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(assessment.fileUrl, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(prev => ({
                                    ...prev,
                                    assessments: prev.assessments?.map(a => 
                                      a.id === assessment.id ? { 
                                        ...a, 
                                        fileUrl: undefined,
                                        fileName: undefined,
                                        fileSize: undefined,
                                        updatedAt: new Date().toISOString()
                                      } : a
                                    ) || []
                                  }));
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!editingCourse.assessments || editingCourse.assessments.length === 0) && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Assessments Added</h3>
                    <p className="text-gray-600 mb-4">Add formative and summative assessments for your course</p>
                    <Button onClick={() => {
                      const newAssessment = {
                        id: `assessment-${Date.now()}`,
                        title: '',
                        type: 'formative' as 'formative' | 'summative',
                        description: '',
                        availableFrom: new Date().toISOString().split('T')[0],
                        availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        instructions: '',
                        passingScore: 70,
                        timeLimit: 60,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      setEditingCourse(prev => ({
                        ...prev,
                        assessments: [...(prev.assessments || []), newAssessment]
                      }));
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Assessment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                  <CardDescription>Configure course preferences and access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Published</Label>
                        <p className="text-sm text-gray-600">Make this course visible to learners</p>
                      </div>
                      <Button
                        variant={editingCourse.isPublished ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditingCourse(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                      >
                        {editingCourse.isPublished ? 'Published' : 'Draft'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-base">Course Dates</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Created</Label>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(editingCourse.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Updated</Label>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(editingCourse.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Assignment */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Assignment
                  </CardTitle>
                  <CardDescription>
                    Manage students assigned to this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentAssignmentManager
                    courseId={editingCourse.id}
                    assignedStudents={editingCourse.studentAssignments?.map(assignment => ({
                      id: assignment.studentId,
                      firstName: `Student`,
                      lastName: assignment.studentId,
                      email: `student${assignment.studentId}@email.com`,
                      avatar: '',
                      phone: '',
                      enrolledCourses: [],
                      completedCourses: [],
                      currentGrade: '',
                      joinDate: assignment.assignedAt,
                      lastActive: assignment.assignedAt,
                      progress: assignment.progress || 0,
                      isActive: assignment.status === 'active',
                      courseProgress: {},
                      assignments: [],
                      certificates: [],
                      badges: []
                    })) || []}
                    onAssignStudent={handleAssignStudent}
                    onUnassignStudent={handleUnassignStudent}
                    onBulkAssign={handleBulkAssign}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-900">Delete Course</span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Once you delete a course, there is no going back. This will permanently delete the course and all its content.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={!onDeleteCourse}
                      >
                        Delete Course
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delete Confirmation Dialog */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
                        <p className="text-sm text-gray-600">This action cannot be undone</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm text-gray-700 mb-3">
                        Are you sure you want to delete <strong>"{editingCourse.title}"</strong>?
                      </p>
                      <p className="text-sm text-red-700">
                        This will permanently delete:
                      </p>
                      <ul className="text-sm text-red-700 ml-4 mt-2 space-y-1">
                        <li>• All course content and lessons</li>
                        <li>• Student enrollments and progress</li>
                        <li>• Assignments and submissions</li>
                        <li>• All associated data</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteCourse}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete Course
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Preview Card */}
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Eye className="w-5 h-5" />
                    Course Preview
                  </CardTitle>
                  <CardDescription>See how your course appears to learners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden group">
                    {editingCourse.thumbnail ? (
                      <>
                        <img 
                          src={editingCourse.thumbnail} 
                          alt="Course thumbnail" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                      </>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No thumbnail</p>
                        <p className="text-xs text-gray-400 mt-1">Add one in Course Basics</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Course Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">
                        {editingCourse.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {editingCourse.description?.substring(0, 100)}...
                      </p>
                    </div>
                    
                    {/* Course Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {editingCourse.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {editingCourse.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{editingCourse.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <DollarSign className="w-3 h-3 text-gray-500" />
                        <span className="font-semibold text-green-600">R{editingCourse.price}</span>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          {editingCourse.units?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Units</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {totalLessons}
                        </div>
                        <div className="text-xs text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">
                          {editingCourse.enrolledLearners}
                        </div>
                        <div className="text-xs text-gray-600">Learners</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">
                          {editingCourse.rating || 0}
                        </div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>

                    {/* Publishing Status */}
                    <div className="border-t pt-3">
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${
                        editingCourse.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          editingCourse.isPublished ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs font-medium">
                          {editingCourse.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Tags Preview */}
                    {editingCourse.tags && editingCourse.tags.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex flex-wrap gap-1">
                          {editingCourse.tags.slice(0, 4).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {editingCourse.tags.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{editingCourse.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Course Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Completion</span>
                        <span>{Math.round(completionRate)}%</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">
                          {editingCourse.units?.filter(u => u.isPublished).length || 0}
                        </div>
                        <div className="text-xs text-blue-600">Published</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-600">
                          {editingCourse.units?.filter(u => !u.isPublished).length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Draft</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setEditingCourse(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                  >
                    {editingCourse.isPublished ? 'Unpublish Course' : 'Publish Course'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setActiveTab('structure')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Content
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setActiveTab('compliance')}
                  >
                    <Shield className="w-3 h-3 mr-2" />
                    Check Compliance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEdit;
