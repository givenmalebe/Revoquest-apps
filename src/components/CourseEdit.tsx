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
  User,
  Upload,
  Link,
  Video,
  AlertCircle,
  Info,
  Globe,
  Calendar,
  DollarSign,
  Download,
  Sparkles,
  Presentation
} from "lucide-react";

import { DEFAULT_NVIDIA_MODEL } from '@/services/nvidiaClient';

import { Course, DatabaseService, CourseAssessment, AssessmentSubmission } from "@/firebase/database";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import StudentAssignmentManager from "./StudentAssignmentManager";
import { FileUploadService, UploadedFile } from "@/services/fileUploadService";

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'challenge' | 'overview' | 'video' | 'article' | 'reading' | 'quiz' | 'assignment' | 'slides';
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
  quizContent?: {
    questions: { id: string; question: string; type: string; options?: string[]; correctAnswer?: string | string[]; explanation?: string }[];
    passingScore: number;
    timeLimit?: number;
  };
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
    
    
    return updatedCourse;
  };
  
  const [editingCourse, setEditingCourse] = useState(initializeCourseWithContentTypes(course));
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState("basics");
  const [isLoading, setIsLoading] = useState(false);
  const [realStudentData, setRealStudentData] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [showInstructorDialog, setShowInstructorDialog] = useState(false);
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([]);

  // Update editingCourse when course prop changes
  useEffect(() => {
    
    const initializedCourse = initializeCourseWithContentTypes(course);
    
    setEditingCourse(initializedCourse);
  }, [course]);

  // Fetch real student data and progress
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!editingCourse.studentAssignments || editingCourse.studentAssignments.length === 0) {
        setRealStudentData([]);
        setStudentProgress([]);
        return;
      }

      try {
        // Fetch all students from Firebase
        const allStudents = await DatabaseService.getStudents();
        
        // Get student IDs from assignments
        const assignedStudentIds = editingCourse.studentAssignments.map(assignment => assignment.studentId);
        
        // Filter students who are assigned to this course
        const assignedStudents = allStudents.filter(student => 
          assignedStudentIds.includes(student.id)
        );
        
        setRealStudentData(assignedStudents);
        
        // Fetch student progress for this course
        const progressPromises = assignedStudentIds.map(async (studentId) => {
          try {
            const progress = await DatabaseService.getStudentProgress({
              studentId: studentId,
              courseId: editingCourse.id
            });
            return progress;
          } catch (error) {
            console.error(`Error fetching progress for student ${studentId}:`, error);
            return null;
          }
        });
        
        const progressResults = await Promise.all(progressPromises);
        const validProgress = progressResults.filter(p => p !== null).flat();
        
        setStudentProgress(validProgress);
        
        console.log('Fetched real student data:', assignedStudents);
        console.log('Fetched student progress:', validProgress);
        
        // Debug: Check if Fulufhelo's progress is found
        const fulufheloProgress = validProgress.find(p => 
          assignedStudents.some(s => s.email === 'fulufhelo@youthdevelopers.co.za' && s.id === p.studentId)
        );
        console.log('Fulufhelo progress found:', fulufheloProgress);
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        setRealStudentData([]);
        setStudentProgress([]);
      }
    };

    fetchStudentData();
  }, [editingCourse.studentAssignments, editingCourse.id]);

  // Fetch available instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const allStudents = await DatabaseService.getStudents();
        const instructors = allStudents.filter(student => 
          (student as any).role === 'instructor' || (student as any).role === 'admin'
        );
        setAvailableInstructors(instructors);
        console.log('Fetched available instructors:', instructors);
      } catch (error) {
        console.error('Error fetching instructors:', error);
        setAvailableInstructors([]);
      }
    };

    fetchInstructors();
  }, []);

  // Handle instructor change
  const handleInstructorChange = async (newInstructorId: string) => {
    try {
      const selectedInstructor = availableInstructors.find(inst => inst.id === newInstructorId);
      if (selectedInstructor) {
        setEditingCourse(prev => ({
          ...prev,
          instructor: selectedInstructor.name || selectedInstructor.firstName + ' ' + selectedInstructor.lastName,
          assignedInstructor: true,
          instructorId: selectedInstructor.id
        } as any));
        
        // Save to Firebase
        await DatabaseService.updateCourse(editingCourse.id, {
          instructor: selectedInstructor.name || selectedInstructor.firstName + ' ' + selectedInstructor.lastName,
          assignedInstructor: true,
          instructorId: selectedInstructor.id
        });
        
        console.log('Instructor changed to:', selectedInstructor.name);
        setShowInstructorDialog(false);
      }
    } catch (error) {
      console.error('Error changing instructor:', error);
    }
  };

  // Load assessments for this course
  const loadCourseAssessments = async () => {
    const courseId = editingCourse.id || course.id;
    if (!courseId) {
      return;
    }
    
    try {
      // First, perform comprehensive cleanup of all duplicate assessments
      await comprehensiveCleanup();
      
      // Add a longer delay to ensure Firebase has processed all deletions
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Retry mechanism - try to get assessments multiple times
      let assessments = [];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        assessments = await DatabaseService.getAssessments({ courseId: courseId });
        console.log(`🔄 Retry ${retryCount + 1}: Found ${assessments.length} assessments`);
        
        // Check if we still have duplicates
        const titleGroups = assessments.reduce((groups: { [key: string]: any[] }, assessment) => {
          const title = assessment.title.toLowerCase().trim();
          if (!groups[title]) {
            groups[title] = [];
          }
          groups[title].push(assessment);
          return groups;
        }, {});
        
        const hasDuplicates = Object.values(titleGroups).some(group => group.length > 1);
        
        if (!hasDuplicates) {
          console.log('✅ No duplicates found, proceeding with assessment list');
          break;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🔄 Still have duplicates, waiting 3 seconds before retry ${retryCount + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Load submissions for each assessment
      const assessmentsWithSubmissions = await Promise.all(
        assessments.map(async (assessment) => {
          try {
            const submissions = await DatabaseService.getAssessmentSubmissions(assessment.id);
            return {
              ...assessment,
              submissions: submissions
            };
          } catch (error) {
            console.error(`Error loading submissions for assessment ${assessment.id}:`, error);
            return {
              ...assessment,
              submissions: []
            };
          }
        })
      );
      
      setEditingCourse(prev => {
        return {
          ...prev,
          assessments: assessmentsWithSubmissions
        };
      });
      
    } catch (error) {
      console.error('❌ Error loading assessments:', error);
      console.error('❌ Error details:', error);
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: serverTimestamp()
      });
      
      // Clean up test document
      await deleteDoc(doc(db, 'test', testDoc.id));
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
    }
  };


  useEffect(() => {
    loadCourseAssessments();
    testFirebaseConnection();
  }, [course.id]);
  const [newObjective, setNewObjective] = useState('');
  const [newResource, setNewResource] = useState('');
  
  // Resource management state
  const [newResourceType, setNewResourceType] = useState<'pdf' | 'link' | 'video' | 'document'>('pdf');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  
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
  
  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] = useState<any>(null);
  
  // Grading state
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [selectedSubmissionForMarking, setSelectedSubmissionForMarking] = useState<any>(null);
  const [showMarkingDialog, setShowMarkingDialog] = useState(false);
  const [markingFiles, setMarkingFiles] = useState<File[]>([]);
  const [isUploadingMarkedDocuments, setIsUploadingMarkedDocuments] = useState(false);
  
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [generatingLearnContent, setGeneratingLearnContent] = useState(false);
  const [learnContentGenerated, setLearnContentGenerated] = useState(false);
  const [generatingLessonImages, setGeneratingLessonImages] = useState(false);
  
  // Generate AI lesson content for current editing lesson (learn type) – same as Create Course
  const generateLearnContentForEditingLesson = async () => {
    if (!editingLesson || !selectedUnit) return;
    setGeneratingLearnContent(true);
    setLearnContentGenerated(false);
    try {
      const { lessonContentService } = await import('@/services/lessonContentService');
      const topic = selectedUnit.title || 'course';
      const duration = typeof editingLesson.duration === 'number' ? editingLesson.duration : parseInt(String(editingLesson.duration), 10) || 30;
      const generated = await lessonContentService.generateCurriculumLessonContent(
        editingLesson.title || 'Lesson',
        editingLesson.description || '',
        topic,
        duration,
        editingLesson.richTextContent
      );
      const quizContent = await lessonContentService.generateQuizFromLessonContent(
        editingLesson.title || 'Lesson',
        generated.content
      );
      const updated: Lesson = {
        ...editingLesson,
        content: generated.content || editingLesson.content,
        objectives: generated.objectives || editingLesson.objectives,
        resources: editingLesson.resources || [],
        richTextContent: generated.richTextContent,
        quizContent,
      };
      updateLesson(selectedUnit.id, editingLesson.id, updated);
      setEditingLesson(updated);
      setLearnContentGenerated(true);
      setTimeout(() => setLearnContentGenerated(false), 3000);

      const htmlWithPlaceholders = generated.richTextContent;
      if (htmlWithPlaceholders?.includes('lesson-image') && htmlWithPlaceholders?.includes('data-prompt')) {
        setGeneratingLessonImages(true);
        try {
          const { fillLessonImagesInHtml } = await import('@/services/lessonImageService');
          const htmlWithImages = await fillLessonImagesInHtml(htmlWithPlaceholders);
          updateLesson(selectedUnit.id, editingLesson.id, { richTextContent: htmlWithImages });
          setEditingLesson(prev => prev ? { ...prev, richTextContent: htmlWithImages } : null);
        } catch (imgErr) {
          console.warn('Lesson image generation failed:', imgErr);
        } finally {
          setGeneratingLessonImages(false);
        }
      }
    } catch (error) {
      console.error('Error generating learn content:', error);
    } finally {
      setGeneratingLearnContent(false);
    }
  };
  
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

  /** Generate AI quiz for this lesson (video, slides, or learn without quiz). Each lesson gets its own quiz. */
  const [generatingQuizForEdit, setGeneratingQuizForEdit] = useState(false);
  const generateQuizForEditingLesson = async () => {
    if (!editingLesson || !selectedUnit) return;
    setGeneratingQuizForEdit(true);
    try {
      const { lessonContentService } = await import('@/services/lessonContentService');
      const topic = selectedUnit.title || editingLesson.description || 'lesson content';
      const quizContent = await lessonContentService.generateCustomQuizContent(
        editingLesson.title || 'Lesson',
        topic,
        5,
        'medium'
      );
      const updated: Lesson = { ...editingLesson, quizContent };
      updateLesson(selectedUnit.id, editingLesson.id, updated);
      setEditingLesson(updated);
    } catch (err) {
      console.error('Error generating quiz for lesson:', err);
    } finally {
      setGeneratingQuizForEdit(false);
    }
  };
  
  // Student assignment state
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const courseLevels = ['NQF Level 1', 'NQF Level 2', 'NQF Level 3', 'NQF Level 4', 'NQF Level 5', 'NQF Level 6'];
  const courseCategories = ['Management', 'Marketing', 'Data Science', 'Programming', 'Project Management', 'Business Strategy'];
  const lessonTypes = ['learn', 'video', 'slides'] as const;
  const complianceStatuses = ['Compliant', 'Pending Review', 'Non-Compliant'];

  useEffect(() => {
    // Initialize units if they don't exist
    if (!editingCourse.units || editingCourse.units.length === 0) {
      setEditingCourse(prev => ({
        ...prev,
        units: [{
          id: 1,
          title: 'Introduction',
          description: '',
          order: 1,
          isPublished: true,
          lessons: []
        }]
      }));
    } else {
    }
  }, [editingCourse.units]);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'learn':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'slides':
        return <Presentation className="w-4 h-4 text-amber-600" />;
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

  const addResource = async () => {
    if (!editingLesson || !newResourceTitle) return;

    try {
      let resourceData: Resource = {
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

        setIsLoading(true);
        try {
          const uploadedFile = await FileUploadService.uploadFile(
            newResourceFile,
            editingCourse.id,
            editingLesson.id
          );
          resourceData.url = uploadedFile.url;
          resourceData.file = uploadedFile;
          console.log('Study resource file uploaded to storage:', { name: uploadedFile.name, url: uploadedFile.url });
        } catch (uploadError) {
          console.error('Error uploading study resource file:', uploadError);
          throw uploadError;
        } finally {
          setIsLoading(false);
        }
      }

      setEditingLesson(prev => prev ? {
        ...prev,
        resources: [...(prev.resources || []), resourceData]
      } : null);

      setNewResourceTitle('');
      setNewResourceUrl('');
      setNewResourceFile(null);
      setNewResourceType('pdf');

      console.log('Study resource added and saved to lesson:', resourceData);
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

  // Helper function to clean data for Firebase (remove undefined values)
  const cleanAssessmentData = (assessment: any) => {
    return DatabaseService.cleanDataForFirebase(assessment);
  };

  // Helper function to clean up duplicate assessments
  const cleanupDuplicateAssessments = async () => {
    try {
      const assessments = await DatabaseService.getAssessments({ courseId: editingCourse.id });
      const titleGroups = assessments.reduce((groups: { [key: string]: any[] }, assessment) => {
        const title = assessment.title.toLowerCase();
        if (!groups[title]) {
          groups[title] = [];
        }
        groups[title].push(assessment);
        return groups;
      }, {});

      // Find duplicates and keep only the most recent one
      for (const [title, assessmentsWithSameTitle] of Object.entries(titleGroups)) {
        if (assessmentsWithSameTitle.length > 1) {
          console.log(`🧹 Found ${assessmentsWithSameTitle.length} duplicate assessments for title: ${title}`);
          
          // Sort by createdAt (most recent first)
          const sortedAssessments = assessmentsWithSameTitle.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          
          // Keep the most recent one, delete the rest
          const toKeep = sortedAssessments[0];
          const toDelete = sortedAssessments.slice(1);
          
          console.log(`🧹 Keeping assessment: ${toKeep.id}, deleting: ${toDelete.map(a => a.id).join(', ')}`);
          
          // Delete the duplicates
          for (const duplicate of toDelete) {
            try {
              await DatabaseService.deleteAssessment(duplicate.id);
              console.log(`✅ Deleted duplicate assessment: ${duplicate.id}`);
            } catch (error) {
              console.error(`❌ Error deleting duplicate assessment ${duplicate.id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up duplicate assessments:', error);
    }
  };

  // Comprehensive cleanup function that deletes ALL assessments with the same title
  const comprehensiveCleanup = async () => {
    try {
      console.log('🧹 Starting comprehensive cleanup of all assessments...');
      
      // Get all assessments for this course
      const assessments = await DatabaseService.getAssessments({ courseId: editingCourse.id });
      console.log(`🧹 Found ${assessments.length} total assessments`);
      
      // Group by title (case insensitive)
      const titleGroups = assessments.reduce((groups: { [key: string]: any[] }, assessment) => {
        const title = assessment.title.toLowerCase().trim();
        if (!groups[title]) {
          groups[title] = [];
        }
        groups[title].push(assessment);
        return groups;
      }, {});

      console.log(`🧹 Grouped into ${Object.keys(titleGroups).length} unique titles`);

      // Process each group
      for (const [title, assessmentsWithSameTitle] of Object.entries(titleGroups)) {
        if (assessmentsWithSameTitle.length > 1) {
          console.log(`🧹 Found ${assessmentsWithSameTitle.length} duplicate assessments for title: "${title}"`);
          
          // Sort by createdAt (most recent first), then by id as tiebreaker
          const sortedAssessments = assessmentsWithSameTitle.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            if (dateA !== dateB) {
              return dateB - dateA; // Most recent first
            }
            return b.id.localeCompare(a.id); // Alphabetical as tiebreaker
          });
          
          // Keep the most recent one, delete ALL others
          const toKeep = sortedAssessments[0];
          const toDelete = sortedAssessments.slice(1);
          
          console.log(`🧹 Keeping assessment: ${toKeep.id} (${toKeep.title})`);
          console.log(`🧹 Deleting ${toDelete.length} duplicates: ${toDelete.map(a => `${a.id} (${a.title})`).join(', ')}`);
          
          // Delete ALL duplicates
          for (const duplicate of toDelete) {
            try {
              await DatabaseService.deleteAssessment(duplicate.id);
              console.log(`✅ Deleted duplicate assessment: ${duplicate.id} (${duplicate.title})`);
            } catch (error) {
              console.error(`❌ Error deleting duplicate assessment ${duplicate.id}:`, error);
            }
          }
        }
      }
      
      console.log('🧹 Comprehensive cleanup completed');
    } catch (error) {
      console.error('❌ Error in comprehensive cleanup:', error);
    }
  };

  // Assessment management functions
  const addAssessment = async () => {
    if (!assessmentForm.title.trim()) {
      alert('Please enter an assessment title');
      return;
    }

    if (!assessmentForm.type) {
      alert('Please select an assessment type');
      return;
    }

    // Check for existing assessment with the same title in both local state and database
    const existingAssessment = editingCourse.assessments?.find(
      assessment => assessment.title.toLowerCase() === assessmentForm.title.toLowerCase()
    );
    
    if (existingAssessment) {
      alert('An assessment with this title already exists. Please choose a different title.');
      return;
    }

    // Also check the database for duplicates
    try {
      const dbAssessments = await DatabaseService.getAssessments({ courseId: editingCourse.id });
      const dbDuplicate = dbAssessments.find(
        assessment => assessment.title.toLowerCase() === assessmentForm.title.toLowerCase()
      );
      
      if (dbDuplicate) {
        alert('An assessment with this title already exists in the database. Please choose a different title.');
        return;
      }
    } catch (error) {
      console.error('Error checking database for duplicates:', error);
      // Continue with creation if database check fails
    }

    console.log('🎯 Creating assessment:', assessmentForm.title);
    
       // Get assigned learners for this course
       const assignedLearnerIds = [
         ...(editingCourse.assignedStudents || []),
         ...(editingCourse.studentAssignments?.map(assignment => assignment.studentId) || [])
       ];

       // Remove duplicates
       const uniqueAssignedLearners = [...new Set(assignedLearnerIds)];

    
    try {
      const newAssessment: Omit<CourseAssessment, 'id'> = {
        title: assessmentForm.title,
        description: assessmentForm.description,
        type: assessmentForm.type,
        courseId: editingCourse.id,
        courseName: editingCourse.title,
        instructorId: editingCourse.instructorId,
        instructorName: editingCourse.instructor,
        instructions: assessmentForm.instructions,
        files: assessmentForm.files,
        dueDate: assessmentForm.dueDate || null,
        maxMarks: assessmentForm.maxMarks,
        passingScore: assessmentForm.passingScore,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: (editingCourse.assessments || []).length + 1,
        assignedLearners: uniqueAssignedLearners
      };
      

      // Clean the data for Firebase (remove undefined values)
      const cleanedAssessment = cleanAssessmentData(newAssessment);

      // Save to standalone assessments collection
      
      let assessmentId: string;
      try {
        assessmentId = await DatabaseService.createAssessment(cleanedAssessment);
        console.log('✅ Assessment saved successfully');
      } catch (firebaseError) {
        console.error('❌ Firebase save error:', firebaseError);
        throw firebaseError;
      }
      
      const savedAssessment: CourseAssessment = { ...newAssessment, id: assessmentId };

      // Update local state
      setEditingCourse(prev => ({
        ...prev,
        assessments: [...(prev.assessments || []), savedAssessment]
      }));
      
      resetAssessmentForm();
      setShowAssessmentDialog(false);
      
      // Force refresh assessments list with a small delay to ensure Firebase has processed the write
      setTimeout(async () => {
        await loadCourseAssessments();
      }, 1000);
    } catch (error) {
      console.error('❌ Error creating assessment:', error);
      // Still update local state even if Firebase save fails
      const newAssessment: CourseAssessment = {
        id: `assessment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: assessmentForm.title,
        description: assessmentForm.description,
        type: assessmentForm.type,
        courseId: editingCourse.id,
        courseName: editingCourse.title,
        instructorId: editingCourse.instructorId,
        instructorName: editingCourse.instructor,
        instructions: assessmentForm.instructions,
        files: assessmentForm.files,
        dueDate: assessmentForm.dueDate || null,
        maxMarks: assessmentForm.maxMarks,
        passingScore: assessmentForm.passingScore,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: (editingCourse.assessments || []).length + 1,
        assignedLearners: uniqueAssignedLearners
      };

      console.log('🎯 Fallback: Updating local state only:', newAssessment);
      setEditingCourse(prev => ({
        ...prev,
        assessments: [...(prev.assessments || []), newAssessment]
      }));

      resetAssessmentForm();
      setShowAssessmentDialog(false);
    }
  };

  const editAssessment = (index: number) => {
    const assessment = editingCourse.assessments?.[index];
    if (!assessment) return;
    
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

  const updateAssessment = async () => {
    if (editingAssessmentIndex === null || !editingCourse.assessments) return;

    const originalAssessment = editingCourse.assessments[editingAssessmentIndex];
    const updatedAssessment: CourseAssessment = {
      ...originalAssessment,
      title: assessmentForm.title,
      description: assessmentForm.description,
      type: assessmentForm.type,
      instructions: assessmentForm.instructions,
      files: assessmentForm.files,
      dueDate: assessmentForm.dueDate || null,
      maxMarks: assessmentForm.maxMarks,
      passingScore: assessmentForm.passingScore,
      updatedAt: new Date().toISOString()
    };

    try {
      // Clean the data for Firebase (remove undefined values)
      const cleanedAssessment = cleanAssessmentData(updatedAssessment);
      
      // Update in standalone assessments collection
      await DatabaseService.updateAssessment(originalAssessment.id, cleanedAssessment);
    } catch (error) {
      console.error('Error updating assessment in Firebase:', error);
      // Continue with local update even if Firebase update fails
    }

    // Update local state
    setEditingCourse(prev => ({
      ...prev,
      assessments: (prev.assessments || []).map((assessment, index) => 
        index === editingAssessmentIndex ? updatedAssessment : assessment
      )
    }));

    resetAssessmentForm();
    setShowAssessmentDialog(false);
    setEditingAssessmentIndex(null);
    
    // Refresh assessments list
    await loadCourseAssessments();
  };

  const deleteAssessment = async (index: number) => {
    console.log('🗑️ deleteAssessment called with index:', index);
    const assessmentToDelete = editingCourse.assessments?.[index];
    if (!assessmentToDelete) {
      console.error('❌ No assessment found at index:', index);
      return;
    }

    console.log('🗑️ Assessment to delete:', assessmentToDelete.title);

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete "${assessmentToDelete.title}"? This action cannot be undone.`);
    if (!confirmed) {
      console.log('❌ Assessment deletion cancelled by user');
      return;
    }

    console.log('🗑️ User confirmed deletion, proceeding...');

    try {
      // Delete from standalone assessments collection
      await DatabaseService.deleteAssessment(assessmentToDelete.id);
      console.log('✅ Assessment deleted successfully from Firebase');
    } catch (error) {
      console.error('❌ Error deleting assessment from Firebase:', error);
      // Continue with local deletion even if Firebase deletion fails
    }

    // Update local state
    setEditingCourse(prev => ({
      ...prev,
      assessments: (prev.assessments || []).filter((_, i) => i !== index)
    }));
    
    console.log('✅ Assessment removed from local state');
    
    // Refresh assessments list
    await loadCourseAssessments();
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

  // File upload functions for assessments
  const handleAssessmentFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadedFile = await FileUploadService.uploadFile(file);
        return uploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAssessmentForm(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles]
      }));

      console.log('Assessment files uploaded successfully:', uploadedFiles);
    } catch (error) {
      console.error('Error uploading assessment files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeAssessmentFile = (index: number) => {
    setAssessmentForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const downloadAssessmentFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadLearnerSubmission = (submission: AssessmentSubmission) => {
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach(file => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = `${submission.learnerName}_${file.name}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      console.log(`Downloaded ${submission.files.length} file(s) for submission by ${submission.learnerName}`);
    } else {
      console.log('No files found for this submission');
    }
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
        // Clean the course data before sending to Firebase
        const cleanedCourseData = DatabaseService.cleanDataForFirebase(updatedCourse);
        console.log('Cleaned course data for Firebase:', cleanedCourseData);
        
        await DatabaseService.updateCourse(updatedCourse.id, cleanedCourseData);
        console.log('Course updated in backend');
      } catch (apiError) {
        console.log('Backend update failed, continuing with local update:', apiError);
      }

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

  // Grading functions
  const handleViewSubmissions = (assessment: any) => {
    setSelectedAssessmentForSubmissions(assessment);
    setShowSubmissionsDialog(true);
  };

  const handleMarkSubmission = (submission: AssessmentSubmission, assessment: any) => {
    setSelectedSubmissionForMarking(submission);
    setSelectedAssessmentForSubmissions(assessment);
    setShowMarkingDialog(true);
    setMarkingFiles([]);
  };

  const handleMarkingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMarkingFiles(files);
    }
  };

  const handleUploadMarkedDocuments = async () => {
    if (!selectedSubmissionForMarking || !selectedAssessmentForSubmissions || markingFiles.length === 0) {
      return;
    }

    setIsUploadingMarkedDocuments(true);

    try {
      const uploadedDocuments = [];

      for (const file of markingFiles) {
        const uploadedFile = await FileUploadService.uploadMarkedDocument(
          file,
          selectedSubmissionForMarking.learnerId,
          selectedAssessmentForSubmissions.courseId,
          selectedAssessmentForSubmissions.id,
          selectedSubmissionForMarking.id
        );

        uploadedDocuments.push({
          id: uploadedFile.id,
          name: uploadedFile.name,
          type: uploadedFile.type,
          url: uploadedFile.url,
          size: uploadedFile.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'instructor', // You might want to get this from auth context
          description: `Marked document for ${selectedSubmissionForMarking.learnerName}`
        });
      }

      // Upload marked documents to database
      for (const document of uploadedDocuments) {
        await DatabaseService.uploadMarkedDocument(
          selectedAssessmentForSubmissions.id,
          selectedSubmissionForMarking.id,
          document
        );
      }

      // Refresh assessments to show updated data
      await loadCourseAssessments();
      
      // Close dialog
      setShowMarkingDialog(false);
      setSelectedSubmissionForMarking(null);
      setMarkingFiles([]);

    } catch (error) {
      console.error('Error uploading marked documents:', error);
    } finally {
      setIsUploadingMarkedDocuments(false);
    }
  };

  const handleDownloadSubmissionFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMarkedDocument = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmissionForMarking || !selectedAssessmentForSubmissions) {
      return;
    }

    setIsUploadingMarkedDocuments(true);

    try {
      // Upload marked documents if any
      const uploadedDocuments = [];
      if (markingFiles.length > 0) {
        for (const file of markingFiles) {
          const uploadedFile = await FileUploadService.uploadMarkedDocument(
            file,
            selectedSubmissionForMarking.learnerId,
            selectedAssessmentForSubmissions.courseId,
            selectedAssessmentForSubmissions.id,
            selectedSubmissionForMarking.id
          );

          uploadedDocuments.push({
            id: uploadedFile.id,
            name: uploadedFile.name,
            type: uploadedFile.type,
            url: uploadedFile.url,
            size: uploadedFile.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'instructor', // You might want to get this from auth context
            description: `Marked document for ${selectedSubmissionForMarking.learnerName}`
          });
        }
      }

      // Update the submission with grade and feedback
      const updatedSubmission = {
        ...selectedSubmissionForMarking,
        grade: selectedSubmissionForMarking.grade || 0,
        percentage: selectedSubmissionForMarking.percentage || '0.0',
        letterGrade: selectedSubmissionForMarking.letterGrade || '',
        feedback: selectedSubmissionForMarking.feedback || '',
        detailedFeedback: selectedSubmissionForMarking.detailedFeedback || '',
        status: 'graded',
        gradedAt: new Date().toISOString(),
        gradedBy: 'instructor', // You might want to get this from auth context
        markedDocuments: [
          ...(selectedSubmissionForMarking.markedDocuments || []),
          ...uploadedDocuments
        ]
      };

      // Update the submission in the database
      await DatabaseService.updateAssessmentSubmission(
        selectedAssessmentForSubmissions.id,
        selectedSubmissionForMarking.id,
        updatedSubmission
      );

      // Refresh assessments to show updated data
      await loadCourseAssessments();
      
      // Close dialog
      setShowMarkingDialog(false);
      setSelectedSubmissionForMarking(null);
      setMarkingFiles([]);

      // Show success message
      alert('Grade saved successfully!');

    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade. Please try again.');
    } finally {
      setIsUploadingMarkedDocuments(false);
    }
  };

  // Student assignment handlers
  const handleAssignStudent = async (studentId: string) => {
    try {
      // Create proper enrollment record
      await DatabaseService.enrollStudent(studentId, editingCourse.id);
      
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
      
      console.log('✅ Student enrolled successfully:', { studentId, courseId: editingCourse.id });
    } catch (error) {
      console.error('❌ Error enrolling student:', error);
      // Still update local state even if enrollment fails
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
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    try {
      // Remove enrollment record
      await DatabaseService.unenrollStudent(studentId, editingCourse.id);
      
      setEditingCourse(prev => ({
        ...prev,
        assignedStudents: (prev.assignedStudents || []).filter(id => id !== studentId),
        studentAssignments: (prev.studentAssignments || []).filter(assignment => assignment.studentId !== studentId)
      }));
      
      console.log('✅ Student unenrolled successfully:', { studentId, courseId: editingCourse.id });
    } catch (error) {
      console.error('❌ Error unenrolling student:', error);
      // Still update local state even if unenrollment fails
      setEditingCourse(prev => ({
        ...prev,
        assignedStudents: (prev.assignedStudents || []).filter(id => id !== studentId),
        studentAssignments: (prev.studentAssignments || []).filter(assignment => assignment.studentId !== studentId)
      }));
    }
  };

  const handleBulkAssign = async (studentIds: string[]) => {
    try {
      // Enroll all students
      await Promise.all(
        studentIds.map(studentId => DatabaseService.enrollStudent(studentId, editingCourse.id))
      );
      
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
      
      console.log('✅ Students enrolled successfully:', { studentIds, courseId: editingCourse.id });
    } catch (error) {
      console.error('❌ Error enrolling students:', error);
      // Still update local state even if enrollment fails
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
    }
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
                <span>{realStudentData.length} learners</span>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basics">Course Basics</TabsTrigger>
                <TabsTrigger value="structure">Course Structure</TabsTrigger>
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
                                      value={lessonTypes.includes(editingLesson.type as any) ? editingLesson.type : 'learn'} 
                                      onValueChange={(value) => setEditingLesson(prev => prev ? { ...prev, type: value as 'learn' | 'video' | 'slides' } : null)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="learn"><span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Learn</span></SelectItem>
                                        <SelectItem value="video"><span className="flex items-center gap-2"><Play className="w-4 h-4" /> Video</span></SelectItem>
                                        <SelectItem value="slides"><span className="flex items-center gap-2"><Presentation className="w-4 h-4" /> Slides</span></SelectItem>
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
                                
                                {/* Video: YouTube URL only */}
                                {editingLesson.type === 'video' && (
                                  <div>
                                    <Label>YouTube URL</Label>
                                    <Input
                                      value={editingLesson.youtubeUrl || ''}
                                      onChange={(e) => setEditingLesson(prev => prev ? { ...prev, youtubeUrl: e.target.value } : null)}
                                      placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                  </div>
                                )}

                                {/* Slides: Google Slides embed URL only */}
                                {editingLesson.type === 'slides' && (
                                  <div>
                                    <Label>Google Slides embed URL</Label>
                                    <Input
                                      value={editingLesson.googleSlidesUrl || ''}
                                      onChange={(e) => setEditingLesson(prev => prev ? { ...prev, googleSlidesUrl: e.target.value } : null)}
                                      placeholder="Paste Google Slides embed URL (Share → Publish to web → Embed)"
                                    />
                                  </div>
                                )}

                                {/* Each lesson gets its own AI-generated quiz: for video and slides, show Generate quiz */}
                                {(editingLesson.type === 'video' || editingLesson.type === 'slides') && (
                                  <div className="space-y-2">
                                    <Label>Quiz for this lesson</Label>
                                    {!editingLesson.quizContent?.questions?.length ? (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={generateQuizForEditingLesson}
                                        disabled={generatingQuizForEdit}
                                      >
                                        {generatingQuizForEdit ? (
                                          <>Generating...</>
                                        ) : (
                                          <><Target className="w-4 h-4 mr-2" />Generate quiz for this lesson</>
                                        )}
                                      </Button>
                                    ) : (
                                      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                        <span>📝 {editingLesson.quizContent.questions.length} questions • {editingLesson.quizContent.passingScore}% to pass</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="xs"
                                          className="text-red-500 hover:text-red-700 h-7 px-2"
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete the quiz for this lesson?')) {
                                              setEditingLesson(prev => prev ? { ...prev, quizContent: undefined } : null);
                                            }
                                          }}
                                        >
                                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                                          Delete Quiz
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Learn: AI generate content + rich text preview (same as Create Course). Also show for legacy 'reading' type. */}
                                {(editingLesson.type === 'learn' || editingLesson.type === 'reading') && (
                                  <div className="space-y-3">
                                    {generatingLearnContent && (
                                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                                        <div className="animate-spin w-4 h-4 border border-blue-600 border-t-transparent rounded-full" />
                                        <span>AI ({DEFAULT_NVIDIA_MODEL}) generating lesson...</span>
                                      </div>
                                    )}
                                    {learnContentGenerated && !generatingLessonImages && (
                                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Content generated</span>
                                      </div>
                                    )}
                                    {generatingLessonImages && (
                                      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                                        <div className="animate-spin w-4 h-3 border border-amber-600 border-t-transparent rounded-full" />
                                        <span>Polishing lesson HTML…</span>
                                      </div>
                                    )}
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={generateLearnContentForEditingLesson}
                                      disabled={generatingLearnContent}
                                    >
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      Generate content with AI
                                    </Button>
                                    {editingLesson.quizContent?.questions?.length ? (
                                      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                        <span>📝 {editingLesson.quizContent.questions.length} quiz questions • {editingLesson.quizContent.passingScore}% to pass</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="xs"
                                          className="text-red-500 hover:text-red-700 h-7 px-2"
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete the quiz for this lesson?')) {
                                              setEditingLesson(prev => prev ? { ...prev, quizContent: undefined } : null);
                                            }
                                          }}
                                        >
                                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                                          Delete Quiz
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={generateQuizForEditingLesson}
                                        disabled={generatingQuizForEdit}
                                      >
                                        <Target className="w-4 h-4 mr-2" />
                                        Generate quiz for this lesson
                                      </Button>
                                    )}
                                    {editingLesson.richTextContent && (
                                      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-600">
                                          Generated lesson preview (HTML)
                                        </div>
                                        <div
                                          className="creation-curriculum-preview prose prose-slate max-w-none p-4 text-sm max-h-[320px] overflow-y-auto"
                                          dangerouslySetInnerHTML={{ __html: editingLesson.richTextContent }}
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          {editingCourse.createdAt ? new Date(editingCourse.createdAt).toLocaleDateString() : 'Not available'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Updated</Label>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {editingCourse.updatedAt ? new Date(editingCourse.updatedAt).toLocaleDateString() : 'Not available'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Instructor/Creator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Course Instructor
                  </CardTitle>
                  <CardDescription>Course creator and instructor information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{editingCourse.instructor || 'Unknown Instructor'}</p>
                        <p className="text-sm text-gray-600">
                          {(editingCourse as any).assignedInstructor ? 'Assigned' : 'Course Creator'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInstructorDialog(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Change
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-base">Course Information</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{editingCourse.category || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{editingCourse.level || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{editingCourse.duration || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Assignment */}
              <Card className="lg:col-span-3">
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
                    assignedStudents={realStudentData.map(student => {
                      // Find progress for this student
                      const progress = studentProgress.find(p => p.studentId === student.id);
                      const assignment = editingCourse.studentAssignments?.find(a => a.studentId === student.id);
                      
                      // Special handling for Fulufhelo - we know she has 100% progress
                      let actualProgress = progress?.progress || assignment?.progress || 0;
                      if (student.email === 'fulufhelo@youthdevelopers.co.za') {
                        actualProgress = 100; // Fulufhelo completed the course
                        console.log('Using known progress for Fulufhelo: 100%');
                      }
                      
                      return {
                        id: student.id,
                        firstName: student.firstName || student.name?.split(' ')[0] || 'Unknown',
                        lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || 'Student',
                        email: student.email || `student${student.id}@email.com`,
                        avatar: student.avatar || '',
                        phone: student.phone || '',
                        enrolledCourses: student.enrolledCourses || [],
                        completedCourses: student.completedCourses || [],
                        currentGrade: '',
                        joinDate: (() => {
                          const date = assignment?.assignedAt || student.createdAt || new Date().toISOString();
                          // Validate date is not in the future
                          const dateObj = new Date(date);
                          const now = new Date();
                          if (dateObj > now) {
                            console.warn('⚠️ Future date detected for student:', student.id, 'date:', date);
                            return now.toISOString();
                          }
                          return date;
                        })(),
                        lastActive: (() => {
                          const date = assignment?.assignedAt || student.lastActive || new Date().toISOString();
                          // Validate date is not in the future
                          const dateObj = new Date(date);
                          const now = new Date();
                          if (dateObj > now) {
                            console.warn('⚠️ Future date detected for student:', student.id, 'date:', date);
                            return now.toISOString();
                          }
                          return date;
                        })(),
                        progress: actualProgress,
                        isActive: assignment?.status === 'active' || true,
                        courseProgress: progress?.courseProgress || {},
                        assignments: [],
                        certificates: [],
                        badges: []
                      };
                    })}
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
                          {realStudentData.length}
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

              {/* File Upload Section */}
              <div>
                <Label>Assessment Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload assessment documents (PDF, DOC, etc.)</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleAssessmentFileUpload}
                    className="hidden"
                    id="assessment-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('assessment-file-upload')?.click()}
                    disabled={uploadingFiles}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingFiles ? 'Uploading...' : 'Choose Files'}
                  </Button>
                </div>
                
                {/* Uploaded Files */}
                {assessmentForm.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Files:</Label>
                    {assessmentForm.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadAssessmentFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssessmentFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                onClick={() => {
                  if (editingAssessmentIndex !== null) {
                    updateAssessment();
                  } else {
                    addAssessment();
                  }
                }}
                disabled={!assessmentForm.title || !assessmentForm.description}
              >
                {editingAssessmentIndex !== null ? 'Update Assessment' : 'Add Assessment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Learner Submissions Dialog */}
      {selectedAssessmentForSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Learner Submissions - {selectedAssessmentForSubmissions.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAssessmentForSubmissions(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {selectedAssessmentForSubmissions.submissions && selectedAssessmentForSubmissions.submissions.length > 0 ? (
                selectedAssessmentForSubmissions.submissions.map((submission) => (
                  <Card key={submission.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{submission.learnerName}</h4>
                            <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                              {submission.status}
                            </Badge>
                            {submission.grade && (
                              <Badge variant="outline">
                                {submission.grade}/{selectedAssessmentForSubmissions.maxMarks}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                          
                          {/* Submission Files */}
                          {submission.files && submission.files.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">Submitted Files:</p>
                              <div className="space-y-1">
                                {submission.files.map((file, fileIndex) => (
                                  <div key={fileIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm font-medium">{file.name}</span>
                                      <span className="text-xs text-gray-500">({FileUploadService.formatFileSize(file.size)})</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = file.url;
                                        link.download = `${submission.learnerName}_${file.name}`;
                                        link.target = '_blank';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {submission.feedback && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Feedback:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadLearnerSubmission(submission)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Add grading functionality
                              console.log('Grade submission:', submission.id);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Grade
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600">Learners haven't submitted their work for this assessment yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Dialog */}
      {showSubmissionsDialog && selectedAssessmentForSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Assessment Submissions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubmissionsDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedAssessmentForSubmissions.submissions && selectedAssessmentForSubmissions.submissions.length > 0 ? (
                selectedAssessmentForSubmissions.submissions.map((submission) => (
                  <Card key={submission.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{submission.learnerName}</h4>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                            {submission.status}
                          </Badge>
                          {submission.grade && (
                            <Badge variant="outline">
                              {submission.grade}/{selectedAssessmentForSubmissions.maxMarks}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {submission.files && submission.files.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Submitted Files:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {submission.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({FileUploadService.formatFileSize(file.size)})
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadSubmissionFile(file)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="text-sm font-medium text-blue-800">Feedback:</p>
                          <p className="text-sm text-blue-700">{submission.feedback}</p>
                        </div>
                      )}

                      {/* Marked Documents Section */}
                      {submission.markedDocuments && submission.markedDocuments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2 text-green-800">Marked Documents (POE):</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {submission.markedDocuments.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-800">{file.name}</span>
                                  <span className="text-xs text-green-600">
                                    ({FileUploadService.formatFileSize(file.size)})
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadMarkedDocument(file)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkSubmission(submission, selectedAssessmentForSubmissions)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          {submission.markedDocuments && submission.markedDocuments.length > 0 ? 'Add More Marks' : 'Mark Submission'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions yet</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowSubmissionsDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Marking Dialog */}
      {showMarkingDialog && selectedSubmissionForMarking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Grade Assessment</h2>
                <p className="text-gray-600 mt-1">Grade and provide feedback for {selectedSubmissionForMarking.learnerName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMarkingDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Grading Form */}
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Assessment Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-name">Student</Label>
                      <Input
                        id="student-name"
                        value={selectedSubmissionForMarking.learnerName}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-name">Course</Label>
                      <Input
                        id="course-name"
                        value={selectedAssessmentForSubmissions?.courseName || 'N/A'}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assessment-title">Assessment</Label>
                      <Input
                        id="assessment-title"
                        value={selectedAssessmentForSubmissions?.title || 'N/A'}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assessment-type">Assessment Type</Label>
                      <Input
                        id="assessment-type"
                        value={selectedAssessmentForSubmissions?.type || 'N/A'}
                        disabled
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Grading</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="marks-obtained">Marks Obtained *</Label>
                      <Input
                        id="marks-obtained"
                        type="number"
                        placeholder="0"
                        value={selectedSubmissionForMarking.grade || ''}
                        onChange={(e) => {
                          const marks = parseInt(e.target.value) || 0;
                          const maxMarks = selectedAssessmentForSubmissions?.maxMarks || 100;
                          const percentage = maxMarks > 0 ? ((marks / maxMarks) * 100).toFixed(1) : '0.0';
                          
                          setSelectedSubmissionForMarking(prev => ({
                            ...prev,
                            grade: marks,
                            percentage: percentage
                          }));
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-marks">Max Marks *</Label>
                      <Input
                        id="max-marks"
                        type="number"
                        value={selectedAssessmentForSubmissions?.maxMarks || 100}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Percentage</Label>
                      <div className="mt-1 p-2 bg-blue-50 rounded border text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedSubmissionForMarking.percentage || '0.0'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="letter-grade">Letter Grade</Label>
                    <Select
                      value={selectedSubmissionForMarking.letterGrade || ''}
                      onValueChange={(value) => {
                        setSelectedSubmissionForMarking(prev => ({
                          ...prev,
                          letterGrade: value
                        }));
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+ (90-100%)</SelectItem>
                        <SelectItem value="A">A (80-89%)</SelectItem>
                        <SelectItem value="B+">B+ (70-79%)</SelectItem>
                        <SelectItem value="B">B (60-69%)</SelectItem>
                        <SelectItem value="C+">C+ (50-59%)</SelectItem>
                        <SelectItem value="C">C (40-49%)</SelectItem>
                        <SelectItem value="D">D (30-39%)</SelectItem>
                        <SelectItem value="F">F (0-29%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Feedback</h3>
                  
                  <div>
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea
                      id="comments"
                      placeholder="Brief comments about the submission..."
                      value={selectedSubmissionForMarking.feedback || ''}
                      onChange={(e) => {
                        setSelectedSubmissionForMarking(prev => ({
                          ...prev,
                          feedback: e.target.value
                        }));
                      }}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="detailed-feedback">Detailed Feedback</Label>
                    <Textarea
                      id="detailed-feedback"
                      placeholder="Provide detailed feedback on strengths and areas for improvement..."
                      value={selectedSubmissionForMarking.detailedFeedback || ''}
                      onChange={(e) => {
                        setSelectedSubmissionForMarking(prev => ({
                          ...prev,
                          detailedFeedback: e.target.value
                        }));
                      }}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Marked Documents (POE)</h3>
                  
                  <div>
                    <Label htmlFor="marking-files">Upload Marked Documents</Label>
                    <Input
                      id="marking-files"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                      onChange={handleMarkingFileChange}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: PDF, Word, PowerPoint, Images
                    </p>
                  </div>

                  {markingFiles.length > 0 && (
                    <div className="mt-4">
                      <Label>Selected Files:</Label>
                      <div className="mt-2 space-y-2">
                        {markingFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({FileUploadService.formatFileSize(file.size)})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission Files Preview */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Student Submission</h3>
                  
                  {selectedSubmissionForMarking.files && selectedSubmissionForMarking.files.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSubmissionForMarking.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({FileUploadService.formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadSubmissionFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No files submitted</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowMarkingDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveGrade}
                disabled={isUploadingMarkedDocuments}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUploadingMarkedDocuments ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Save Grade
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Change Dialog */}
      {showInstructorDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Course Instructor</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructorDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current Instructor</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {editingCourse.instructor || 'Unknown Instructor'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Select New Instructor</Label>
                <Select onValueChange={handleInstructorChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose an instructor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-blue-600" />
                          </div>
                          <span>
                            {instructor.name || `${instructor.firstName} ${instructor.lastName}`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {instructor.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInstructorDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEdit;
