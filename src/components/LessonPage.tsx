import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Play,
  FileText,
  Star,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  ExternalLink,
  Youtube
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'reading' | 'quiz' | 'assignment' | 'challenge' | 'project' | 'discussion';
  duration: string;
  completed: boolean;
  content?: string;
  youtubeUrl?: string;
  description?: string;
  objectives?: string[];
  resources?: string[];
  // Enhanced content types
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

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  completed: boolean;
}

interface LessonPageProps {
  lesson: Lesson;
  unit: Unit;
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    duration: string;
    category: string;
    status: string;
    enrolledLearners: number;
    rating: number;
    setaUnitStandards: any[];
    qctoQualifications: any[];
    complianceStatus: string;
    saqaId: string;
    units: Unit[];
  };
  onBack: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  isEditing?: boolean;
  onSave?: (lesson: Lesson) => void;
  onCancel?: () => void;
}

const LessonPage: React.FC<LessonPageProps> = ({ 
  lesson, 
  unit, 
  course, 
  onBack, 
  onNextLesson, 
  onPrevLesson,
  isEditing = false,
  onSave,
  onCancel
}) => {
  const [editingLesson, setEditingLesson] = useState<Lesson>(lesson);
  const [isEditingMode, setIsEditingMode] = useState(isEditing);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'article':
      case 'reading':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'quiz':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'assignment':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'project':
        return <Star className="w-5 h-5 text-indigo-600" />;
      case 'discussion':
        return <Users className="w-5 h-5 text-pink-600" />;
      case 'challenge':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editingLesson);
    }
    setIsEditingMode(false);
  };

  const handleCancel = () => {
    setEditingLesson(lesson);
    setIsEditingMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  const currentLessonIndex = unit.lessons.findIndex(l => l.id === lesson.id);
  const totalLessons = unit.lessons.length;

  // Enhanced content rendering functions
  const renderReadingContent = (readingContent: Lesson['readingContent']) => {
    if (!readingContent) return null;

    return (
      <div className="space-y-6">
        {readingContent.sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                {section.content.split('\n').map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-4 text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Points:</h4>
                  <ul className="space-y-1">
                    {section.keyPoints.map((point, pIndex) => (
                      <li key={pIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{readingContent.summary}</p>
          </CardContent>
        </Card>

        {readingContent.keyTerms && readingContent.keyTerms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {readingContent.keyTerms.map((term, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {readingContent.references && readingContent.references.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {readingContent.references.map((ref, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{ref}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderQuizContent = (quizContent: Lesson['quizContent']) => {
    if (!quizContent) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Quiz: {lesson.title}
          </CardTitle>
          <CardDescription>
            {quizContent.instructions}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quizContent.questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quizContent.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quizContent.timeLimit}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
          </div>

          <div className="space-y-4">
            {quizContent.questions.map((question, index) => (
              <div key={question.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {question.question}
                    </h4>
                    <div className="text-sm text-gray-600 mb-2">
                      {question.type} • {question.points} points
                    </div>
                    
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                            <input type="radio" name={`question-${question.id}`} className="text-purple-600" />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input type="radio" name={`question-${question.id}`} className="text-purple-600" />
                          <span className="text-gray-700">True</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input type="radio" name={`question-${question.id}`} className="text-purple-600" />
                          <span className="text-gray-700">False</span>
                        </label>
                      </div>
                    )}
                    
                    {(question.type === 'short-answer' || question.type === 'essay') && (
                      <textarea
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={question.type === 'essay' ? 4 : 2}
                        placeholder="Enter your answer here..."
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Passing Score: {quizContent.passingScore}%
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Submit Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProjectContent = (projectContent: Lesson['projectContent']) => {
    if (!projectContent) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-600" />
              {projectContent.title}
            </CardTitle>
            <CardDescription>
              {projectContent.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estimated Time</h4>
                <p className="text-gray-700">{projectContent.estimatedTime}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Total Points</h4>
                <p className="text-gray-700">100 points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projectContent.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projectContent.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projectContent.deliverables.map((deliverable, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{deliverable}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projectContent.resources.map((resource, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">{resource}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projectContent.evaluationCriteria.map((criteria, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{criteria}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                {getLessonIcon(lesson.type)}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {isEditingMode ? 'Edit Lesson' : lesson.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {unit.title} • Lesson {currentLessonIndex + 1} of {totalLessons}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditingMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingMode(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Lesson
                </Button>
              )}
              {isEditingMode && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {isEditingMode ? (
              /* Edit Mode */
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="lesson-title">Lesson Title</Label>
                      <Input 
                        id="lesson-title"
                        value={editingLesson.title}
                        onChange={(e) => setEditingLesson(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lesson-description">Description</Label>
                      <Textarea 
                        id="lesson-description"
                        value={editingLesson.description || ''}
                        onChange={(e) => setEditingLesson(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lesson-duration">Duration</Label>
                        <Input 
                          id="lesson-duration"
                          value={editingLesson.duration}
                          onChange={(e) => setEditingLesson(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 15 min"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lesson-type">Type</Label>
                        <select 
                          id="lesson-type"
                          value={editingLesson.type}
                          onChange={(e) => setEditingLesson(prev => ({ ...prev, type: e.target.value as any }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="video">Video</option>
                          <option value="article">Article</option>
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment</option>
                          <option value="challenge">Challenge</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-600" />
                      Video Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="youtube-url">YouTube URL</Label>
                      <Input 
                        id="youtube-url"
                        value={editingLesson.youtubeUrl || ''}
                        onChange={(e) => setEditingLesson(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Paste a YouTube video URL to embed it in the lesson
                      </p>
                    </div>
                    
                    {editingLesson.youtubeUrl && extractYouTubeVideoId(editingLesson.youtubeUrl) && (
                      <div className="mt-4">
                        <Label>Video Preview</Label>
                        <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${extractYouTubeVideoId(editingLesson.youtubeUrl)}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="lesson-content">Content</Label>
                      <Textarea 
                        id="lesson-content"
                        value={editingLesson.content || ''}
                        onChange={(e) => setEditingLesson(prev => ({ ...prev, content: e.target.value }))}
                        rows={10}
                        placeholder="Enter lesson content, instructions, or additional information..."
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Lesson Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getLessonIcon(lesson.type)}
                        <div>
                          <CardTitle className="text-xl">{lesson.title}</CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </Badge>
                            <Badge variant="outline">
                              {lesson.type}
                            </Badge>
                            {lesson.completed && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {lesson.description && (
                      <p className="text-gray-700 mb-4">{lesson.description}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Video Content */}
                {lesson.youtubeUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-red-600" />
                        Video Lesson
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={(() => {
                            // Extract video ID from YouTube URL and convert to embed URL
                            const url = lesson.youtubeUrl;
                            if (!url) return '';
                            
                            // Handle different YouTube URL formats
                            const patterns = [
                              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                              /youtube\.com\/v\/([^&\n?#]+)/,
                              /youtube\.com\/embed\/([^&\n?#]+)/
                            ];
                            
                            for (const pattern of patterns) {
                              const match = url.match(pattern);
                              if (match) {
                                return `https://www.youtube.com/embed/${match[1]}`;
                              }
                            }
                            
                            // If it's already an embed URL, return as is
                            if (url.includes('youtube.com/embed/')) {
                              return url;
                            }
                            
                            return '';
                          })()}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(lesson.youtubeUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in YouTube
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Lesson Content based on type */}
                {lesson.type === 'reading' && lesson.readingContent && (
                  renderReadingContent(lesson.readingContent)
                )}
                
                {lesson.type === 'quiz' && lesson.quizContent && (
                  renderQuizContent(lesson.quizContent)
                )}
                
                {lesson.type === 'project' && lesson.projectContent && (
                  renderProjectContent(lesson.projectContent)
                )}
                
                {/* Fallback to basic content for other types */}
                {!['reading', 'quiz', 'project'].includes(lesson.type) && lesson.content && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Lesson Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {lesson.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Objectives */}
                {lesson.objectives && lesson.objectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lesson.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Resources */}
                {lesson.resources && lesson.resources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lesson.resources.map((resource, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            <a 
                              href={resource} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {resource}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit Progress</span>
                    <span className="font-medium">
                      {Math.round((unit.lessons.filter(l => l.completed).length / unit.lessons.length) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(unit.lessons.filter(l => l.completed).length / unit.lessons.length) * 100} 
                    className="h-2" 
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{unit.lessons.filter(l => l.completed).length} of {unit.lessons.length} lessons completed</p>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unit.lessons.map((l, index) => (
                  <div 
                    key={l.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      l.id === lesson.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => {
                      // Navigate to lesson
                      window.location.href = `#lesson-${l.id}`;
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        l.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{l.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getLessonIcon(l.type)}
                          <span className="text-xs text-gray-500">{l.duration}</span>
                          {l.completed && <CheckCircle className="w-3 h-3 text-green-600" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              {onPrevLesson && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onPrevLesson}
                  disabled={currentLessonIndex === 0}
                >
                  Previous
                </Button>
              )}
              {onNextLesson && (
                <Button 
                  className="flex-1"
                  onClick={onNextLesson}
                  disabled={currentLessonIndex === totalLessons - 1}
                >
                  Next Lesson
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
