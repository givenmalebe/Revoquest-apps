import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useDataSync } from '@/contexts/DataSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationForm } from '@/components/RegistrationForm';
import {
  Search,
  Filter,
  BookOpen,
  Award,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Mail,
  X,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  Play,
  FileText,
  Target,
  List,
  Youtube,
  Download,
  Eye,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Calendar,
  Globe,
  Zap,
  Shield,
  Book,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

interface Course {
  title: string;
  id: number;
  nqfLevel: number;
  credits: number;
  authority: string;
  category: string;
  type: 'accreditation' | 'assessment';
  // Enhanced course properties for detailed view
  description?: string;
  duration?: string;
  level?: string;
  price?: number;
  enrolledLearners?: number;
  enrolledStudents?: number;
  rating?: number;
  thumbnail?: string;
  lessons?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  saqaId?: string;
  setaUnitStandards?: string[];
  qctoQualifications?: string[];
  complianceStatus?: 'Compliant' | 'Pending Review' | 'Non-Compliant';
  requirements?: string[];
  learningOutcomes?: string[];
  shortDescription?: string;
  language?: string;
  estimatedHours?: number;
  targetAudience?: string;
  prerequisites?: string[];
  courseOverview?: string;
  practicalApproach?: string;
  seoTitle?: string;
  seoDescription?: string;
  units?: CourseUnit[];
  assessments?: CourseAssessment[];
  assignedStudents?: string[];
  studentAssignments?: {
    studentId: string;
    assignedAt: string;
    status: 'active' | 'inactive' | 'pending';
    progress?: number;
  }[];
  enrollmentMode?: 'manual' | 'auto';
}

interface CourseUnit {
  id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string | number;
  title: string;
  description: string;
  content: string;
  type: 'video' | 'text' | 'reading' | 'quiz' | 'assignment' | 'learn' | 'practice' | 'challenge' | 'project' | 'discussion';
  duration: number;
  order: number;
  isPublished: boolean;
  resources?: string[];
  objectives?: string[];
  youtubeUrl?: string;
  pdfUrl?: string;
  readingContent?: {
    sections: {
      title: string;
      content: string;
      keyPoints?: string[];
    }[];
    summary: string;
    keyTerms: string[];
    references: string[];
  };
  readingContentType?: 'text' | 'slides' | 'files' | 'video';
  googleSlidesUrl?: string;
  uploadedFiles?: {
    id: string;
    name: string;
    type: 'pdf' | 'powerpoint' | 'document';
    url: string;
    size: number;
  }[];
  richTextContent?: string;
  quizContent?: {
    questions: {
      id: string;
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
      options?: string[];
      correctAnswer: string | string[];
      explanation?: string;
      points: number;
    }[];
    passingScore: number;
    timeLimit: number;
    totalPoints: number;
    instructions: string;
  };
  projectContent?: {
    title: string;
    description: string;
    objectives: string[];
    requirements: string[];
    deliverables: string[];
    resources: string[];
    evaluationCriteria: string[];
    estimatedTime: string;
  };
  videoContent?: {
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
  };
}

interface CourseAssessment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  duration: number;
  passingScore: number;
  totalPoints: number;
  questions?: any[];
  instructions: string;
  dueDate?: string;
  isPublished: boolean;
}

interface CoursesByCategory {
  [category: string]: Course[];
}

const Courses = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesByCategory, setCoursesByCategory] = useState<CoursesByCategory>({});
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchResultsReady, setSearchResultsReady] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [detailedCourse, setDetailedCourse] = useState<Course | null>(null);
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [showCategoryPopout, setShowCategoryPopout] = useState(false);
  const [selectedCategoryForPopout, setSelectedCategoryForPopout] = useState<string>('');
  const [enrolling, setEnrolling] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Hooks
  const { user } = useAuth();
  const { enrollStudent } = useDataSync();

  // Check if user is already enrolled in a course
  const isEnrolledInCourse = (courseId: string) => {
    return user?.enrolledCourses?.includes(courseId) || false;
  };

  // Handle enroll button click - show registration form (same as navigation)
  const handleEnrollClick = () => {
    setIsRegistrationOpen(true);
  };

  useEffect(() => {
    // Load course data
    const loadCourses = async () => {
      try {
        const [coursesResponse, categoriesResponse] = await Promise.all([
          fetch(`/courses.json?v=${Date.now()}`),
          fetch(`/courses-by-category.json?v=${Date.now()}`)
        ]);
        
        const coursesData = await coursesResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setCourses(coursesData);
        setCoursesByCategory(categoriesData);
        setFilteredCourses(coursesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading courses:', error);
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Handle search parameter from URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      // Expand all categories when searching
      setExpandedCategories(new Set(Object.keys(coursesByCategory)));
      // Scroll to top when search parameter is detected
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, coursesByCategory]);

  useEffect(() => {
    // Filter courses based on search term, category, and type
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.type === selectedType);
    }

    setFilteredCourses(filtered);
    
    // Mark search results as ready when they're loaded
    if (searchTerm && filtered.length > 0) {
      setSearchResultsReady(true);
      // Scroll to search results after a short delay to ensure DOM is updated
      setTimeout(() => {
        const searchResultsSection = document.querySelector('[data-search-results]');
        if (searchResultsSection) {
          searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } else {
      setSearchResultsReady(false);
    }
  }, [courses, searchTerm, selectedCategory, selectedType]);

  const openCategoryPopout = (category: string) => {
    setSelectedCategoryForPopout(category);
    setShowCategoryPopout(true);
  };

  const categories = Object.keys(coursesByCategory);
  const totalCourses = courses.length;
  const accreditationCourses = courses.filter(c => c.type === 'accreditation').length;
  const assessmentCourses = courses.filter(c => c.type === 'assessment').length;

  const handleViewCourseDetails = async (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
    setLoadingCourseDetail(true);

    try {
      // Try to fetch detailed course data
      const detailedCourseData = await fetchDetailedCourseData(course.id);
      setDetailedCourse(detailedCourseData);
    } catch (error) {
      console.error('Error fetching detailed course data:', error);
      // Fallback to basic course data
      setDetailedCourse(course);
    } finally {
      setLoadingCourseDetail(false);
    }
  };

  // Generate comprehensive curriculum content for courses based on SAQA qualifications
  const generateCurriculumContent = (course: Course): CourseUnit[] => {
    const curriculumTemplates = {
      'Health and Safety and Construction': [
        {
          id: 'module-1',
          title: 'Occupational Health and Safety Fundamentals',
          description: 'Unit Standard 120373: Apply occupational health and safety principles in the workplace',
          order: 1,
          isPublished: true,
          lessons: [
            { id: 1, title: 'OHS Act and Legal Framework', description: 'Understanding the Occupational Health and Safety Act 85 of 1993', content: 'Comprehensive coverage of OHS Act requirements, employer and employee duties, and legal compliance obligations as per SAQA standards.', type: 'reading', duration: 90, order: 1, isPublished: true },
            { id: 2, title: 'Hazard Identification and Risk Assessment', description: 'Unit Standard 120373: Identify and assess workplace hazards', content: 'Systematic approach to hazard identification, risk assessment methodologies, and documentation requirements according to SAQA unit standards.', type: 'video', duration: 120, order: 2, isPublished: true },
            { id: 3, title: 'Safety Management Systems', description: 'Implementing ISO 45001 and OHSAS 18001 standards', content: 'Development and implementation of safety management systems, policy formulation, and continuous improvement processes.', type: 'reading', duration: 105, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Construction Safety Management',
          description: 'Unit Standard 259601: Manage construction health and safety',
          order: 2,
          isPublished: true,
          lessons: [
            { id: 4, title: 'Construction Site Safety Planning', description: 'Developing comprehensive safety plans for construction sites', content: 'Site-specific safety planning, hazard analysis, and safety coordination as per CETA and SAQA requirements.', type: 'video', duration: 135, order: 1, isPublished: true },
            { id: 5, title: 'Personal Protective Equipment (PPE)', description: 'Selection, use, and maintenance of PPE in construction', content: 'PPE requirements, selection criteria, proper usage, and maintenance procedures according to construction safety standards.', type: 'reading', duration: 90, order: 2, isPublished: true },
            { id: 6, title: 'Emergency Preparedness and Response', description: 'Emergency procedures and incident response planning', content: 'Emergency response planning, evacuation procedures, first aid requirements, and incident reporting protocols.', type: 'video', duration: 120, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-3',
          title: 'Safety Inspection and Compliance',
          description: 'Unit Standard 99712: Conduct safety inspections and audits',
          order: 3,
          isPublished: true,
          lessons: [
            { id: 7, title: 'Safety Inspection Techniques', description: 'Conducting systematic safety inspections', content: 'Inspection methodologies, checklists, documentation, and reporting procedures for safety inspections.', type: 'reading', duration: 105, order: 1, isPublished: true },
            { id: 8, title: 'Regulatory Compliance', description: 'Ensuring compliance with health and safety regulations', content: 'Understanding regulatory requirements, compliance monitoring, and corrective action procedures.', type: 'video', duration: 90, order: 2, isPublished: true },
            { id: 9, title: 'Safety Training and Communication', description: 'Delivering effective safety training programs', content: 'Training needs analysis, program development, delivery methods, and evaluation techniques for safety training.', type: 'reading', duration: 75, order: 3, isPublished: true }
          ]
        }
      ],
      'Professional Courses': [
        {
          id: 'module-1',
          title: 'Quality Management Fundamentals',
          description: 'Unit Standard 120373: Apply quality management principles in organizational context',
          order: 1,
          isPublished: true,
          lessons: [
            { id: 1, title: 'ISO 9001:2015 Quality Management Systems', description: 'Understanding and implementing ISO 9001 standards', content: 'Comprehensive coverage of ISO 9001:2015 requirements, quality management principles, and implementation strategies as per SAQA standards.', type: 'reading', duration: 120, order: 1, isPublished: true },
            { id: 2, title: 'Quality Planning and Control', description: 'Unit Standard 259601: Develop quality management plans', content: 'Quality planning methodologies, control systems, and monitoring processes according to QCTO and SAQA requirements.', type: 'video', duration: 135, order: 2, isPublished: true },
            { id: 3, title: 'Process Improvement Methodologies', description: 'Lean Six Sigma and continuous improvement', content: 'Lean Six Sigma principles, process mapping, waste elimination, and continuous improvement methodologies.', type: 'reading', duration: 105, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Strategic Quality Management',
          description: 'Unit Standard 118768: Develop and implement quality strategies',
          order: 2,
          isPublished: true,
          lessons: [
            { id: 4, title: 'Quality Strategy Development', description: 'Creating comprehensive quality strategies', content: 'Strategic planning for quality management, stakeholder analysis, and quality policy development as per SAQA standards.', type: 'video', duration: 150, order: 1, isPublished: true },
            { id: 5, title: 'Risk Management in Quality', description: 'Unit Standard 120401: Manage quality-related risks', content: 'Risk identification, assessment, and mitigation strategies in quality management contexts.', type: 'reading', duration: 120, order: 2, isPublished: true },
            { id: 6, title: 'Performance Measurement and KPIs', description: 'Developing quality performance indicators', content: 'Key performance indicators, measurement systems, and performance monitoring in quality management.', type: 'video', duration: 90, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-3',
          title: 'Leadership and Team Management',
          description: 'Unit Standard 121151: Lead quality management teams',
          order: 3,
          isPublished: true,
          lessons: [
            { id: 7, title: 'Quality Leadership Principles', description: 'Leading quality initiatives and teams', content: 'Leadership principles in quality management, team building, and change management strategies.', type: 'reading', duration: 105, order: 1, isPublished: true },
            { id: 8, title: 'Stakeholder Management', description: 'Managing internal and external stakeholders', content: 'Stakeholder identification, engagement strategies, and communication in quality management contexts.', type: 'video', duration: 90, order: 2, isPublished: true },
            { id: 9, title: 'Audit and Compliance Management', description: 'Conducting quality audits and ensuring compliance', content: 'Internal and external audit processes, compliance management, and corrective action procedures.', type: 'reading', duration: 120, order: 3, isPublished: true }
          ]
        }
      ],
      'Education and teaching': [
        {
          id: 'module-1',
          title: 'Occupational Training Fundamentals',
          description: 'Unit Standard 97154: Apply occupational training principles',
        order: 1,
        isPublished: true,
        lessons: [
            { id: 1, title: 'Adult Learning Principles', description: 'Unit Standard 123394: Develop outcomes-based learning programmes', content: 'Understanding adult learning theories, andragogy principles, and learner-centered approaches as per SAQA standards.', type: 'reading', duration: 120, order: 1, isPublished: true },
            { id: 2, title: 'Curriculum Design and Development', description: 'Unit Standard 123398: Facilitate learning transfer in workplace', content: 'Outcomes-based curriculum design, learning outcome development, and assessment criteria according to SAQA requirements.', type: 'video', duration: 135, order: 2, isPublished: true },
            { id: 3, title: 'Assessment Design and Implementation', description: 'Unit Standard 120401: Design outcomes-based assessment', content: 'Assessment design principles, formative and summative assessment, and assessment criteria development.', type: 'reading', duration: 105, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Facilitation and Training Delivery',
          description: 'Unit Standard 117871: Facilitate learning using various methodologies',
          order: 2,
          isPublished: true,
          lessons: [
            { id: 4, title: 'Training Methodologies', description: 'Unit Standard 115753: Conduct outcomes-based assessment', content: 'Various training methodologies, facilitation techniques, and learner engagement strategies according to SAQA standards.', type: 'video', duration: 150, order: 1, isPublished: true },
            { id: 5, title: 'Technology-Enhanced Learning', description: 'Integrating technology in occupational training', content: 'Digital learning tools, e-learning platforms, and technology integration in training delivery.', type: 'reading', duration: 120, order: 2, isPublished: true },
            { id: 6, title: 'Workplace Learning Transfer', description: 'Unit Standard 123398: Facilitate learning transfer', content: 'Ensuring learning transfer to workplace, practical application, and performance improvement strategies.', type: 'video', duration: 135, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-3',
          title: 'Assessment and Quality Assurance',
          description: 'Unit Standard 115759: Conduct moderation of outcomes-based assessment',
          order: 3,
          isPublished: true,
          lessons: [
            { id: 7, title: 'Assessment Moderation', description: 'Unit Standard 115759: Conduct assessment moderation', content: 'Moderation processes, quality assurance in assessment, and maintaining assessment standards.', type: 'reading', duration: 105, order: 1, isPublished: true },
            { id: 8, title: 'Special Needs and Inclusive Learning', description: 'Unit Standard 10294: Identify and respond to learners with special needs', content: 'Inclusive learning approaches, special needs identification, and adaptive teaching strategies.', type: 'video', duration: 120, order: 2, isPublished: true },
            { id: 9, title: 'Professional Development and Ethics', description: 'Unit Standard 10305: Devise interventions for special needs learners', content: 'Professional development planning, ethical considerations in training, and continuous improvement strategies.', type: 'reading', duration: 90, order: 3, isPublished: true }
          ]
        }
      ],
      'IT and Related': [
        {
          id: 'module-1',
          title: 'Software Testing Fundamentals',
          description: 'Unit Standard 119438: Apply software testing principles',
            order: 1,
            isPublished: true,
          lessons: [
            { id: 1, title: 'Software Testing Principles', description: 'Unit Standard 119438: Occupational Certificate Software Tester', content: 'Fundamental principles of software testing, testing methodologies, and quality assurance processes as per SAQA standards.', type: 'video', duration: 135, order: 1, isPublished: true },
            { id: 2, title: 'Test Planning and Design', description: 'Unit Standard 120401: Design test strategies and plans', content: 'Test planning methodologies, test case design, and test documentation according to QCTO requirements.', type: 'reading', duration: 120, order: 2, isPublished: true },
            { id: 3, title: 'Test Execution and Reporting', description: 'Unit Standard 115753: Execute tests and report results', content: 'Test execution processes, defect management, and test reporting procedures.', type: 'video', duration: 105, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Advanced Testing Techniques',
          description: 'Unit Standard 115759: Apply advanced testing methodologies',
            order: 2,
            isPublished: true,
          lessons: [
            { id: 4, title: 'Automated Testing', description: 'Unit Standard 123394: Implement test automation', content: 'Test automation frameworks, scripting, and continuous integration testing practices.', type: 'video', duration: 150, order: 1, isPublished: true },
            { id: 5, title: 'Performance and Security Testing', description: 'Unit Standard 120373: Conduct performance and security testing', content: 'Performance testing methodologies, security testing approaches, and vulnerability assessment.', type: 'reading', duration: 135, order: 2, isPublished: true },
            { id: 6, title: 'Test Management and Quality Assurance', description: 'Unit Standard 118768: Manage testing projects and quality', content: 'Test project management, quality metrics, and stakeholder communication in testing contexts.', type: 'video', duration: 120, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-3',
          title: 'Professional Practice and Ethics',
          description: 'Unit Standard 121151: Apply professional ethics in software testing',
          order: 3,
          isPublished: true,
          lessons: [
            { id: 7, title: 'Professional Ethics and Standards', description: 'Unit Standard 10305: Apply professional ethics in IT', content: 'Professional ethics in software testing, industry standards, and ethical decision-making processes.', type: 'reading', duration: 90, order: 1, isPublished: true },
            { id: 8, title: 'Communication and Documentation', description: 'Unit Standard 10294: Communicate effectively in technical contexts', content: 'Technical communication, documentation standards, and stakeholder reporting in testing projects.', type: 'video', duration: 105, order: 2, isPublished: true },
            { id: 9, title: 'Continuous Professional Development', description: 'Unit Standard 15227: Plan and manage professional development', content: 'Professional development planning, skill enhancement, and career advancement in software testing.', type: 'reading', duration: 75, order: 3, isPublished: true }
          ]
        }
      ],
      'Insurance and Finance courses': [
        {
          id: 'module-1',
          title: 'Financial Advisory Fundamentals',
          description: 'Unit Standard 105026: Apply financial advisory principles',
          order: 1,
          isPublished: true,
          lessons: [
            { id: 1, title: 'Financial Markets and Products', description: 'Unit Standard 105026: Occupational Certificate Financial Advisor', content: 'Understanding financial markets, investment products, and financial instruments as per SAQA standards.', type: 'reading', duration: 135, order: 1, isPublished: true },
            { id: 2, title: 'Risk Assessment and Management', description: 'Unit Standard 120373: Assess and manage financial risks', content: 'Risk assessment methodologies, risk management strategies, and portfolio risk analysis according to QCTO requirements.', type: 'video', duration: 150, order: 2, isPublished: true },
            { id: 3, title: 'Regulatory Compliance and Ethics', description: 'Unit Standard 105025: Apply financial services regulations', content: 'Financial services regulations, compliance requirements, and ethical considerations in financial advisory.', type: 'reading', duration: 120, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Insurance Operations and Management',
          description: 'Unit Standard 99668: Apply insurance operations principles',
        order: 2,
        isPublished: true,
        lessons: [
            { id: 4, title: 'Underwriting and Risk Assessment', description: 'Unit Standard 117329: Apply underwriting principles', content: 'Insurance underwriting processes, risk assessment, and policy pricing methodologies according to SAQA standards.', type: 'video', duration: 135, order: 1, isPublished: true },
            { id: 5, title: 'Claims Management and Processing', description: 'Unit Standard 99668: Manage insurance claims', content: 'Claims processing procedures, investigation techniques, and settlement processes in insurance operations.', type: 'reading', duration: 120, order: 2, isPublished: true },
            { id: 6, title: 'Policy Administration and Customer Service', description: 'Unit Standard 105025: Manage policy administration', content: 'Policy administration systems, customer relationship management, and service delivery in insurance contexts.', type: 'video', duration: 105, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-3',
          title: 'Advanced Financial Planning',
          description: 'Unit Standard 105021: Apply advanced financial planning principles',
          order: 3,
          isPublished: true,
          lessons: [
            { id: 7, title: 'Investment Analysis and Portfolio Management', description: 'Unit Standard 105021: Occupational Certificate Investment Adviser', content: 'Investment analysis techniques, portfolio construction, and performance evaluation strategies.', type: 'video', duration: 150, order: 1, isPublished: true },
            { id: 8, title: 'Retirement and Estate Planning', description: 'Unit Standard 121568: Advanced Occupational Diploma Financial Administration Manager', content: 'Retirement planning strategies, estate planning principles, and wealth preservation techniques.', type: 'reading', duration: 135, order: 2, isPublished: true },
            { id: 9, title: 'Client Relationship Management', description: 'Unit Standard 118694: Apply client relationship management', content: 'Client acquisition, relationship building, and service delivery in financial advisory contexts.', type: 'video', duration: 120, order: 3, isPublished: true }
          ]
        }
      ],
      'Short Skills Programs': [
        {
          id: 'module-1',
          title: 'Emergency First Aid Fundamentals',
          description: 'Unit Standard SP-230801: Basic Emergency First Aid Responder',
            order: 1,
            isPublished: true,
          lessons: [
            { id: 1, title: 'Basic Life Support (BLS)', description: 'Unit Standard SP-230801: Apply basic life support techniques', content: 'Cardiopulmonary resuscitation (CPR), airway management, and basic life support procedures as per SAQA standards.', type: 'video', duration: 90, order: 1, isPublished: true },
            { id: 2, title: 'First Aid for Common Injuries', description: 'Unit Standard SP-230802: Intermediate Emergency First Aid', content: 'Treatment of cuts, burns, fractures, and other common injuries according to first aid protocols.', type: 'reading', duration: 75, order: 2, isPublished: true },
            { id: 3, title: 'Emergency Response Procedures', description: 'Unit Standard 123394: Respond to emergency situations', content: 'Emergency assessment, scene safety, and emergency response coordination procedures.', type: 'video', duration: 60, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Community Development Skills',
          description: 'Unit Standard SP-210601: Auxiliary Community Development Facilitator',
          order: 2,
          isPublished: true,
          lessons: [
            { id: 4, title: 'Community Assessment and Planning', description: 'Unit Standard SP-210601: Assess community needs and resources', content: 'Community needs assessment, resource mapping, and development planning methodologies.', type: 'reading', duration: 120, order: 1, isPublished: true },
            { id: 5, title: 'Stakeholder Engagement', description: 'Unit Standard 123398: Facilitate community participation', content: 'Stakeholder identification, engagement strategies, and community mobilization techniques.', type: 'video', duration: 105, order: 2, isPublished: true },
            { id: 6, title: 'Project Implementation and Monitoring', description: 'Unit Standard 120401: Implement and monitor community projects', content: 'Project implementation strategies, monitoring and evaluation, and sustainability planning.', type: 'reading', duration: 90, order: 3, isPublished: true }
          ]
        }
      ],
      'Assessment Centre': [
        {
          id: 'module-1',
          title: 'Assessment Design and Development',
          description: 'Unit Standard 120401: Design outcomes-based assessment',
          order: 1,
          isPublished: true,
          lessons: [
            { id: 1, title: 'Assessment Principles and Standards', description: 'Unit Standard 120401: Apply assessment design principles', content: 'Outcomes-based assessment principles, assessment criteria development, and quality assurance standards as per SAQA requirements.', type: 'reading', duration: 120, order: 1, isPublished: true },
            { id: 2, title: 'Assessment Instrument Development', description: 'Unit Standard 115753: Develop assessment instruments', content: 'Designing assessment tools, question development, and assessment instrument validation processes.', type: 'video', duration: 135, order: 2, isPublished: true },
            { id: 3, title: 'Moderation and Quality Assurance', description: 'Unit Standard 115759: Conduct assessment moderation', content: 'Assessment moderation processes, quality assurance procedures, and maintaining assessment standards.', type: 'reading', duration: 105, order: 3, isPublished: true }
          ]
        },
        {
          id: 'module-2',
          title: 'Assessment Administration and Management',
          description: 'Unit Standard 115753: Conduct outcomes-based assessment',
          order: 2,
          isPublished: true,
          lessons: [
            { id: 4, title: 'Assessment Administration', description: 'Unit Standard 115753: Administer assessments effectively', content: 'Assessment administration procedures, candidate management, and assessment environment setup.', type: 'video', duration: 120, order: 1, isPublished: true },
            { id: 5, title: 'Results Processing and Analysis', description: 'Unit Standard 120373: Process and analyze assessment results', content: 'Assessment scoring, result analysis, statistical analysis, and performance reporting procedures.', type: 'reading', duration: 105, order: 2, isPublished: true },
            { id: 6, title: 'Feedback and Reporting Systems', description: 'Unit Standard 10294: Provide assessment feedback and reporting', content: 'Feedback delivery methods, report writing, and communication of assessment results to stakeholders.', type: 'video', duration: 90, order: 3, isPublished: true }
          ]
        }
      ]
    };

    // Get curriculum template based on course category
    const template = curriculumTemplates[course.category as keyof typeof curriculumTemplates] || curriculumTemplates['Professional Courses'];
    
    return template;
  };

  const fetchDetailedCourseData = async (courseId: number): Promise<Course> => {
    // Find the original course data
    const originalCourse = courses.find(c => c.id === courseId);
    
    if (!originalCourse) {
      throw new Error('Course not found');
    }
    
    // Generate comprehensive curriculum content
    const curriculumContent = generateCurriculumContent(originalCourse);
    
    // Return the course data with comprehensive curriculum, preserving all original data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...originalCourse, // This preserves all original data including qualificationRules
          id: courseId,
          modules: curriculumContent,
          units: curriculumContent, // Support both naming conventions
          lessons: curriculumContent.reduce((total, module) => total + module.lessons.length, 0),
          description: originalCourse.description || `Comprehensive ${originalCourse.category.toLowerCase()} course designed to provide in-depth knowledge and practical skills.`,
          duration: originalCourse.duration || '6 months',
          level: originalCourse.level || 'Intermediate',
          price: originalCourse.price || 2500,
          enrolledLearners: originalCourse.enrolledLearners || 0,
          enrolledStudents: originalCourse.enrolledStudents || 0,
          rating: originalCourse.rating || 4.8,
          thumbnail: originalCourse.thumbnail || '/api/placeholder/400/300',
          instructor: originalCourse.instructor || 'Dr. Jane Smith',
          instructorId: originalCourse.instructorId || 'instructor123',
          isPublished: originalCourse.isPublished || true,
          createdAt: originalCourse.createdAt || new Date().toISOString(),
          updatedAt: originalCourse.updatedAt || new Date().toISOString(),
          requirements: originalCourse.requirements || [
            'Basic computer literacy',
            'High school diploma or equivalent',
            'English proficiency',
            'Access to computer and internet'
          ],
          learningOutcomes: originalCourse.learningOutcomes || [
            'Master core concepts and principles as per SAQA unit standards',
            'Apply knowledge in practical scenarios and workplace contexts',
            'Develop professional competencies aligned with industry requirements',
            'Prepare for and successfully complete the External Integrated Summative Assessment (ISA)',
            'Achieve QCTO-accredited qualification certification'
          ],
          targetAudience: originalCourse.targetAudience || 'Professionals seeking to enhance their skills and advance their careers',
          prerequisites: originalCourse.prerequisites || ['Basic understanding of the field', 'Motivation to learn'],
          courseOverview: originalCourse.courseOverview || `This comprehensive course provides in-depth knowledge and practical skills in ${originalCourse.category.toLowerCase()}. Upon completion, learners will be prepared to write the External Integrated Summative Assessment (ISA) conducted by a QCTO-accredited assessment center to obtain their nationally recognized qualification.`,
          practicalApproach: originalCourse.practicalApproach || 'Hands-on learning with real-world applications and case studies',
          assessments: originalCourse.assessments || [
      {
        id: 'assessment-1',
              title: 'Formative Assessment',
              description: 'Internal formative assessment covering course content and practical applications',
              type: 'formative',
              courseId: courseId.toString(),
              courseName: originalCourse.title,
              instructorId: 'instructor123',
              instructorName: 'Dr. Jane Smith',
              instructions: 'Complete all questions within the time limit. This internal assessment helps track your progress and understanding of course concepts.',
              files: [],
              dueDate: null,
              maxMarks: 100,
        passingScore: 70,
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              order: 1,
              assignedLearners: []
      },
      {
        id: 'assessment-2',
              title: 'External Integrated Summative Assessment (ISA)',
              description: 'External Integrated Summative Assessment conducted by QCTO-accredited assessment center',
              type: 'summative',
              courseId: courseId.toString(),
              courseName: originalCourse.title,
              instructorId: 'instructor123',
              instructorName: 'Dr. Jane Smith',
              instructions: 'This is the final external assessment that will be conducted by a QCTO-accredited assessment center. The ISA evaluates your integrated knowledge and practical skills across all course modules. You must pass this assessment to receive your qualification certificate.',
              files: [],
              dueDate: null,
              maxMarks: 200,
        passingScore: 80,
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              order: 2,
              assignedLearners: []
            }
          ]
        });
      }, 1000);
    });
  };


  const handleCloseCourseDetail = () => {
    setSelectedCourse(null);
    setDetailedCourse(null);
    setShowCourseDetail(false);
    setExpandedUnits(new Set());
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'reading': return <FileText className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'project': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 text-slate-900 dark:text-white py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.2),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30">
              <BookOpen className="w-4 h-4 mr-2" />
              Comprehensive Course Catalog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Courses
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-600 dark:text-slate-300">
              Discover{" "}
              <span className="font-bold text-orange-600 dark:text-orange-400">{totalCourses}+</span>{" "}
              Accredited Courses Across Multiple Industries
            </p>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50 shadow-lg mb-8">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                From professional development to specialized certifications, we offer comprehensive training programs designed to advance your career and unlock your potential.
              </p>
            </div>

            {/* Course Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{totalCourses}+</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Accredited Courses</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">15+</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Industry Categories</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">100%</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">SETA Accredited</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section - Show immediately when searching */}
      {searchTerm && (
        <section className="py-16 bg-white" data-search-results>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4 text-slate-900">
                Search Results for "{searchTerm}"
              </h2>
              {!searchResultsReady ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading search results...</p>
                </div>
              ) : (
                <p className="text-center text-gray-600 mb-12">
                  Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching your search
                </p>
              )}

              {searchResultsReady && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge 
                              variant="outline" 
                              className={course.type === 'accreditation' ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'}
                            >
                              {course.type === 'accreditation' ? 'Accreditation' : 'Assessment'}
                            </Badge>
                            <Badge className="bg-orange-100 text-orange-800">
                              NQF {course.nqfLevel}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg leading-tight">
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              SAQA ID: {course.saqaId || course.id}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {course.credits} Credits
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-2" />
                              {course.authority}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-2" />
                              {course.category}
                            </div>
                          </div>
                          <div className="text-center pt-2">
                            <button 
                              onClick={() => handleViewCourseDetails(course)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2 cursor-pointer transition-colors"
                            >
                              Course Details
                            </button>
                            <div className="text-xs text-gray-400">
                              NQF Level {course.nqfLevel} • {course.credits} Credits
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({coursesByCategory[category]?.length || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="accreditation">Accreditation Courses</SelectItem>
                  <SelectItem value="assessment">Assessment Centre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Courses by Category - Only show when not searching */}
      {!searchTerm && (
        <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
                    Course Categories
                  </Badge>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Courses by{" "}
                  <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                    Category
                  </span>
                </h2>

                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Explore our comprehensive course catalog organized by industry categories
                </p>
              </div>

              {selectedCategory === 'all' ? (
                // Show all categories when no search term
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const categoryCourses = coursesByCategory[category] || [];

                    return (
                      <Card
                        key={category}
                        className="group relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                        onClick={() => openCategoryPopout(category)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <BookOpen className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-orange-700 transition-colors">
                                    {category}
                                  </h3>
                                  <Badge className="mt-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm">
                                    {categoryCourses.length} courses
                                  </Badge>
                                </div>
                              </div>
                            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700/50 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-all duration-300">
                              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-orange-600 transition-colors duration-300" />
                              </div>
                            </div>
                          
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>Click to view all courses</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              ) : (
                // Show filtered courses when category is selected
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge 
                            variant="outline" 
                            className={course.type === 'accreditation' ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'}
                          >
                            {course.type === 'accreditation' ? 'Accreditation' : 'Assessment'}
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-800">
                            NQF {course.nqfLevel}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            SAQA ID: {course.saqaId || course.id}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {course.credits} Credits
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            {course.authority}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            {course.category}
                          </div>
                        </div>
                        <div className="text-center">
                          <button 
                            onClick={() => handleViewCourseDetails(course)}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2 cursor-pointer transition-colors"
                          >
                            Course Details
                          </button>
                          <div className="text-xs text-gray-400">
                            NQF Level {course.nqfLevel} • {course.credits} Credits
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Free Courses Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-900/20 dark:via-slate-800 dark:to-green-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Section Header */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full border border-green-200 dark:border-green-800 shadow-sm">
                <BookOpen className="w-5 h-5 text-green-600" />
                <Badge className="border-green-300 text-green-700 bg-green-50 dark:bg-green-900/50 dark:text-green-300 font-medium">
                  Free Learning Platform
                </Badge>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Start Learning{" "}
                <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                  for Free
                </span>
              </h2>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Access our comprehensive digital literacy courses at no cost. Build essential skills for the modern workplace with our free e-learning platform.
              </p>
            </div>

            {/* Free Course Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Digital Literacy</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Master essential computer skills, digital citizenship, and online safety fundamentals.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Career Development</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Learn resume writing, job search strategies, and professional networking skills.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">Certification Ready</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Complete courses and earn certificates to enhance your professional profile.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-6">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => window.open('https://sites.google.com/view/e-learning-platform4ir/digital-literacy/month-1/week-1?authuser=0', '_blank')}
              >
                <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Learning for Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                No registration required • Start immediately • Learn at your own pace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Course Detail Modal */}
      <Dialog open={showCourseDetail} onOpenChange={setShowCourseDetail}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
          {/* Modern Header with Gradient Background */}
          <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {detailedCourse?.category || 'Course'}
                      </Badge>
                    </div>
                  </div>
                  <DialogTitle className="text-4xl font-bold mb-3 leading-tight">
                  {loadingCourseDetail ? 'Loading Course...' : (detailedCourse?.title || selectedCourse?.title)}
                </DialogTitle>
                  <DialogDescription className="text-xl text-orange-100">
                  {loadingCourseDetail ? 'Please wait while we load the complete course details...' : 'Complete Course Review and Curriculum'}
                </DialogDescription>
              </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCloseCourseDetail}
                  className="text-white hover:bg-white/20 rounded-xl p-3"
                >
                  <X className="h-6 w-6" />
              </Button>
            </div>
              
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
              </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{detailedCourse?.nqfLevel || 'N/A'}</div>
                      <div className="text-orange-100 text-sm font-medium">NQF Level</div>
            </div>
                </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{detailedCourse?.credits || 'N/A'}</div>
                      <div className="text-orange-100 text-sm font-medium">Credits</div>
                    </div>
                </div>
              </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{detailedCourse?.duration || '6 months'}</div>
                      <div className="text-orange-100 text-sm font-medium">Duration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loadingCourseDetail ? (
            <div className="flex items-center justify-center py-20 bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Course Details</h3>
                <p className="text-gray-600">Please wait while we prepare the comprehensive course information...</p>
              </div>
            </div>
          ) : detailedCourse ? (
            <div className="flex flex-col h-full">
              {/* Tabs Navigation */}
              <div className="bg-white border-b border-gray-200 px-8 pt-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                    <TabsTrigger 
                      value="overview" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="curriculum" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <List className="w-4 h-4" />
                      Curriculum
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assessments" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Award className="w-4 h-4" />
                      Assessments
                    </TabsTrigger>
                </TabsList>
                </Tabs>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-8">
                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-8 mt-0">

                    {/* Purpose and Rationale */}
                    <Card className="border-0 shadow-lg bg-white">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          Purpose and Rationale
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="space-y-8">
                          {/* Purpose Section */}
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">P</span>
                              </div>
                              Purpose
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">
                              {detailedCourse.purpose || `The purpose of this qualification is to prepare a learner to operate as a professional in the ${detailedCourse.category} field.`}
                            </p>
                          </div>

                          {/* Rationale Section */}
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">R</span>
                              </div>
                              Rationale
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">
                              {detailedCourse.rationale || `This qualification provides the foundation for effective professional practice in the ${detailedCourse.category} field.`}
                            </p>
                          </div>

                          {/* Entry Requirements */}
                          {detailedCourse.entryRequirements && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">E</span>
                                </div>
                                Entry Requirements
                              </h4>
                              <p className="text-gray-700">{detailedCourse.entryRequirements}</p>
                            </div>
                          )}

                          {/* RPL Information */}
                          {detailedCourse.rplInfo && (
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">R</span>
                                </div>
                                Recognition of Prior Learning
                              </h4>
                              <p className="text-gray-700">{detailedCourse.rplInfo}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exit Level Outcomes */}
                    {detailedCourse.exitLevelOutcomes && (
                      <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                          <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            Exit Level Outcomes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detailedCourse.exitLevelOutcomes.map((outcome, index) => (
                              <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-700 font-medium">{outcome}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Requirements & Prerequisites */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {detailedCourse.requirements && (
                        <Card className="border-0 shadow-lg bg-white">
                          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              Requirements
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {detailedCourse.requirements.map((req, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                  <span className="text-gray-700 font-medium">{req}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {detailedCourse.prerequisites && (
                        <Card className="border-0 shadow-lg bg-white">
                          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                              Prerequisites
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {detailedCourse.prerequisites.map((prereq, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                  <span className="text-gray-700 font-medium">{prereq}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>


                    {/* Course Information */}
                    <Card className="border-0 shadow-lg bg-white">
                      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                          </div>
                          Course Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                              <span className="font-semibold text-gray-800">SAQA ID</span>
                              <a 
                                href={detailedCourse.saqaUrl || `https://allqs.saqa.org.za/showQualification.php?id=${detailedCourse.saqaId || detailedCourse.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 font-mono hover:text-blue-900 hover:underline"
                              >
                                {detailedCourse.saqaId || detailedCourse.id}
                              </a>
                                      </div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                              <span className="font-semibold text-gray-800">Authority</span>
                              <span className="text-green-700 font-mono">{detailedCourse.authority || 'N/A'}</span>
                                      </div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                              <span className="font-semibold text-gray-800">Category</span>
                              <span className="text-purple-700">{detailedCourse.category}</span>
                                    </div>
                                    </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                              <span className="font-semibold text-gray-800">Category</span>
                              <span className="text-orange-700">{detailedCourse.category}</span>
                                  </div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                              <span className="font-semibold text-gray-800">Type</span>
                              <Badge className="bg-indigo-600 text-white capitalize">
                                {detailedCourse.type}
                              </Badge>
                                          </div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                              <span className="font-semibold text-gray-800">Status</span>
                              <Badge className={detailedCourse.complianceStatus === 'Compliant' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                                {detailedCourse.complianceStatus || 'Active'}
                              </Badge>
                                              </div>
                                          </div>
                                    </div>
                                  </CardContent>
                              </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button 
                        className={`group flex-1 font-semibold px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                          isEnrolledInCourse(detailedCourse?.id || '') 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                        }`}
                        onClick={handleEnrollClick}
                        disabled={enrolling || isEnrolledInCourse(detailedCourse?.id || '')}
                      >
                        {enrolling ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enrolling...
                          </>
                        ) : isEnrolledInCourse(detailedCourse?.id || '') ? (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Already Enrolled
                          </>
                        ) : (
                          <>
                            Enroll in Course
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 py-6 text-lg font-semibold"
                        onClick={handleCloseCourseDetail}
                      >
                        <X className="w-5 h-5 mr-2" />
                        Close Review
                      </Button>
                    </div>

                    {/* SETA/QCTO Information */}
                    {(detailedCourse.setaUnitStandards || detailedCourse.qctoQualifications) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-orange-600" />
                            Accreditation Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                          {detailedCourse.setaUnitStandards && detailedCourse.setaUnitStandards.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-800 mb-2">SETA Unit Standards:</h4>
                              <div className="flex flex-wrap gap-2">
                                {detailedCourse.setaUnitStandards.map((standard, index) => (
                                  <Badge key={index} variant="outline" className="text-blue-600 border-blue-600">
                                    {standard}
                                  </Badge>
                                ))}
                                      </div>
                                        </div>
                          )}
                          {detailedCourse.qctoQualifications && detailedCourse.qctoQualifications.length > 0 && (
                                      <div>
                              <h4 className="font-semibold text-gray-800 mb-2">QCTO Qualifications:</h4>
                              <div className="flex flex-wrap gap-2">
                                {detailedCourse.qctoQualifications.map((qualification, index) => (
                                  <Badge key={index} variant="outline" className="text-green-600 border-green-600">
                                    {qualification}
                                    </Badge>
                                ))}
                                      </div>
                                    </div>
                          )}
                                </CardContent>
                              </Card>
                    )}
                    </TabsContent>

                    {/* Curriculum Tab */}
                    <TabsContent value="curriculum" className="space-y-8 mt-0">
                      <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                          <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                              <List className="w-5 h-5 text-white" />
                                    </div>
                            Qualification Rules
                          </CardTitle>
                                </CardHeader>
                        <CardContent className="p-8">
                          <p className="text-gray-600 mb-6">This qualification is made up of the following compulsory Knowledge, Practical Skills and Work Experience Modules</p>
                          
                          {detailedCourse.qualificationRules ? (
                            <div className="space-y-8">
                              {/* Knowledge Modules */}
                              {detailedCourse.qualificationRules.knowledgeModules && (
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                      <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                    Knowledge Modules
                                  </h3>
                                  <div className="space-y-3">
                                    {detailedCourse.qualificationRules.knowledgeModules.map((module, index) => (
                                      <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                          <span className="text-white text-sm font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-gray-700 font-medium">{module}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Practical Skill Modules */}
                              {detailedCourse.qualificationRules.practicalSkillModules && (
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                      <Target className="w-4 h-4 text-white" />
                                    </div>
                                    Practical Skill Modules
                                  </h3>
                                  <div className="space-y-3">
                                    {detailedCourse.qualificationRules.practicalSkillModules.map((module, index) => (
                                      <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                          <span className="text-white text-sm font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-gray-700 font-medium">{module}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Work Experience Modules */}
                              {detailedCourse.qualificationRules.workExperienceModules && (
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                      <Users className="w-4 h-4 text-white" />
                                    </div>
                                    Work Experience Modules
                                  </h3>
                                  <div className="space-y-3">
                                    {detailedCourse.qualificationRules.workExperienceModules.map((module, index) => (
                                      <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                          <span className="text-white text-sm font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-gray-700 font-medium">{module}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Qualification Rules Available</h3>
                              <p className="text-gray-500">Qualification rules details are not available at this time.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                    {/* Assessments Tab */}
                    <TabsContent value="assessments" className="space-y-8 mt-0">
                      <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                          <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                          Course Assessments
                        </CardTitle>
                      </CardHeader>
                        <CardContent className="p-8">
                          <p className="text-gray-600 mb-6">Evaluations and assessments throughout the course</p>
                          
                        {detailedCourse.assessments && detailedCourse.assessments.length > 0 ? (
                            <div className="space-y-6">
                            {detailedCourse.assessments.map((assessment, index) => (
                                <div key={assessment.id || index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{assessment.title}</h3>
                                      <p className="text-gray-600 mb-4">{assessment.description}</p>
                                      
                                      <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4" />
                                          <span>{assessment.maxMarks} points</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Target className="w-4 h-4" />
                                          <span>{assessment.passingScore}% passing score</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Award className="w-4 h-4" />
                                          <span>{assessment.maxMarks} total points</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={`${
                                        assessment.type === 'formative' 
                                          ? 'text-blue-600 border-blue-600' 
                                          : 'text-green-600 border-green-600'
                                      }`}
                                    >
                                      {assessment.type === 'formative' ? 'Quiz' : 'Project'}
                                    </Badge>
                                  </div>
                                  
                                  {assessment.instructions && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                                      <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                                      <p className="text-sm text-gray-600">{assessment.instructions}</p>
                                    </div>
                                  )}
                                </div>
                            ))}
                          </div>
                        ) : (
                            <div className="text-center py-12">
                              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <h3 className="text-lg font-semibold text-gray-600 mb-2">No assessments available</h3>
                              <p className="text-gray-500">Course assessments will be available soon.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  </Tabs>
                          </div>
                          </div>
                          </div>
                        ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Unable to load course details</p>
                          </div>
                          </div>
                        )}
        </DialogContent>
      </Dialog>

      {/* Registration Form Modal - Same as Navigation */}
      <RegistrationForm 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />

      {/* Category Popout Dialog */}
      <Dialog open={showCategoryPopout} onOpenChange={setShowCategoryPopout}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-orange-600" />
              {selectedCategoryForPopout}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Browse all courses in this category
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedCategoryForPopout && coursesByCategory[selectedCategoryForPopout] && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesByCategory[selectedCategoryForPopout].map((course, index) => (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border border-orange-200/50 dark:border-orange-800/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => {
                      handleViewCourseDetails(course);
                      setShowCategoryPopout(false);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                            <Badge
                          className={`text-xs px-3 py-1 ${
                            course.type === 'accreditation'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                        >
                          {course.type === 'accreditation' ? 'Accreditation' : 'Assessment'}
                            </Badge>
                        <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-700/90 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{course.rating}</span>
                          </div>
                          </div>

                      <h4 className="font-semibold text-slate-800 dark:text-white mb-3 group-hover:text-orange-700 transition-colors text-lg">
                        {course.title}
                      </h4>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}</span>
                            </div>
                          </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium text-sm">
                          <BookOpen className="w-4 h-4" />
                          <span>View Details</span>
                          </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </CardContent>
                      </Card>
                ))}
                            </div>
                          )}

            {selectedCategoryForPopout && (!coursesByCategory[selectedCategoryForPopout] || coursesByCategory[selectedCategoryForPopout].length === 0) && (
            <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No courses found</h3>
                <p className="text-gray-500 dark:text-gray-500">There are no courses available in this category yet.</p>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Courses;
