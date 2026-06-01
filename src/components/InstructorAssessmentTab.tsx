import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  Target,
  BookOpen,
  File,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadService, UploadedFile } from "@/services/fileUploadService";
import { DatabaseService, CourseAssessment } from "@/firebase/database";

// Use CourseAssessment from database service
type Assessment = CourseAssessment & {
  files: UploadedFile[];
};

interface AssessmentSubmission {
  id: string;
  learnerId: string;
  learnerName: string;
  submittedAt: string;
  files: UploadedFile[];
  status: 'submitted' | 'graded' | 'returned';
  marks?: number;
  feedback?: string;
}

interface AssessmentFormData {
  title: string;
  description: string;
  type: 'formative' | 'summative';
  courseId: string;
  instructions: string;
  dueDate: string;
  maxMarks: number;
  passingScore: number;
  files: UploadedFile[];
}

export const InstructorAssessmentTab: React.FC = () => {
  const { user } = useAuth();
  const { courses, students } = useDataSync();
  const { toast } = useToast();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'formative' | 'summative'>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'dueDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] = useState<Assessment | null>(null);
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [selectedSubmissionForMarking, setSelectedSubmissionForMarking] = useState<AssessmentSubmission | null>(null);
  const [showMarkingDialog, setShowMarkingDialog] = useState(false);
  const [markingFiles, setMarkingFiles] = useState<File[]>([]);
  const [isUploadingMarkedDocuments, setIsUploadingMarkedDocuments] = useState(false);
  
  const [formData, setFormData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    type: 'formative',
    courseId: '',
    instructions: '',
    dueDate: '',
    maxMarks: 100,
    passingScore: 50,
    files: []
  });

  // Load assessments
  useEffect(() => {
    loadAssessments();
  }, [user]);

  const loadAssessments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const firebaseAssessments = await DatabaseService.getAssessments({
        instructorId: user.id
      });
      
      // Convert CourseAssessment to Assessment format
      const assessments: Assessment[] = firebaseAssessments.map(assessment => ({
        ...assessment,
        files: assessment.files.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          size: file.size
        }))
      }));
      
      setAssessments(assessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load assessments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort assessments
  const filteredAssessments = useMemo(() => {
    let filtered = assessments.filter(assessment => {
      const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || assessment.type === filterType;
      const matchesCourse = filterCourse === 'all' || assessment.courseId === filterCourse;
      
      return matchesSearch && matchesType && matchesCourse;
    });

    // Sort assessments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [assessments, searchTerm, filterType, filterCourse, sortBy, sortOrder]);

  // Statistics
  const statistics = useMemo(() => {
    const totalAssessments = assessments.length;
    const formativeCount = assessments.filter(a => a.type === 'formative').length;
    const summativeCount = assessments.filter(a => a.type === 'summative').length;
    const publishedCount = assessments.filter(a => a.isPublished).length;
    const totalSubmissions = assessments.reduce((sum, a) => sum + a.submissions.length, 0);
    
    return {
      totalAssessments,
      formativeCount,
      summativeCount,
      publishedCount,
      totalSubmissions
    };
  }, [assessments]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadedFile = await FileUploadService.uploadFile(file);
        return uploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles]
      }));

      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleDownloadFiles = (files: UploadedFile[]) => {
    files.forEach(file => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleViewSubmissions = (assessment: Assessment) => {
    setSelectedAssessmentForSubmissions(assessment);
    setShowSubmissionsDialog(true);
  };

  const handleDownloadSubmissionFile = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkSubmission = (submission: AssessmentSubmission) => {
    setSelectedSubmissionForMarking(submission);
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
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive",
      });
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
          uploadedBy: user?.id || '',
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

      toast({
        title: "Success",
        description: `Successfully uploaded ${uploadedDocuments.length} marked document(s)`,
      });

      // Refresh assessments to show updated data
      await loadAssessments();
      
      // Close dialog
      setShowMarkingDialog(false);
      setSelectedSubmissionForMarking(null);
      setMarkingFiles([]);

    } catch (error) {
      console.error('Error uploading marked documents:', error);
      toast({
        title: "Error",
        description: "Failed to upload marked documents",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMarkedDocuments(false);
    }
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

  const handleCreateAssessment = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const courseName = courses.find(c => c.id === formData.courseId)?.title || 'Unknown Course';
      
      // Convert UploadedFile[] to the format expected by CourseAssessment
      const assessmentFiles = formData.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        url: file.url,
        size: file.size
      }));
      
      const assessmentData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        courseId: formData.courseId,
        courseName: courseName,
        instructorId: user.id,
        instructorName: user.displayName || 'Instructor',
        instructions: formData.instructions,
        files: assessmentFiles,
        dueDate: formData.dueDate || undefined,
        maxMarks: formData.maxMarks,
        passingScore: formData.passingScore,
        isPublished: true,
        order: 0, // Default order
        assignedLearners: [],
        submissions: []
      };
      
      const assessmentId = await DatabaseService.createAssessment(assessmentData);
      
      // Create the new assessment object for local state
      const newAssessment: Assessment = {
        id: assessmentId,
        ...assessmentData,
        files: formData.files, // Keep original UploadedFile format for UI
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAssessments(prev => [...prev, newAssessment]);
      
      toast({
        title: "Success",
        description: "Assessment created successfully"
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditAssessment = async () => {
    if (!editingAssessment) return;
    
    setIsUpdating(true);
    try {
      const courseName = courses.find(c => c.id === formData.courseId)?.title || 'Unknown Course';
      
      // Convert UploadedFile[] to the format expected by CourseAssessment
      const assessmentFiles = formData.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        url: file.url,
        size: file.size
      }));
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        courseId: formData.courseId,
        courseName: courseName,
        instructions: formData.instructions,
        files: assessmentFiles,
        dueDate: formData.dueDate || undefined,
        maxMarks: formData.maxMarks,
        passingScore: formData.passingScore
      };
      
      await DatabaseService.updateAssessment(editingAssessment.id, updateData);
      
      // Update local state
      const updatedAssessment: Assessment = {
        ...editingAssessment,
        ...updateData,
        files: formData.files, // Keep original UploadedFile format for UI
        updatedAt: new Date().toISOString()
      };
      
      setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? updatedAssessment : a));
      
      toast({
        title: "Success",
        description: "Assessment updated successfully"
      });
      
      setIsEditDialogOpen(false);
      setEditingAssessment(null);
      resetForm();
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to update assessment",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setIsDeleting(assessmentId);
    try {
      await DatabaseService.deleteAssessment(assessmentId);
      
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      
      toast({
        title: "Success",
        description: "Assessment deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleTogglePublish = async (assessmentId: string) => {
    setIsPublishing(assessmentId);
    try {
      const assessment = assessments.find(a => a.id === assessmentId);
      if (!assessment) return;
      
      const newPublishedStatus = !assessment.isPublished;
      
      await DatabaseService.updateAssessment(assessmentId, {
        isPublished: newPublishedStatus
      });
      
      setAssessments(prev => prev.map(a => 
        a.id === assessmentId 
          ? { ...a, isPublished: newPublishedStatus, updatedAt: new Date().toISOString() }
          : a
      ));
      
      toast({
        title: "Success",
        description: `Assessment ${newPublishedStatus ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update assessment status",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'formative',
      courseId: '',
      instructions: '',
      dueDate: '',
      maxMarks: 100,
      passingScore: 50,
      files: []
    });
  };

  const openEditDialog = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      courseId: assessment.courseId,
      instructions: assessment.instructions,
      dueDate: assessment.dueDate || '',
      maxMarks: assessment.maxMarks,
      passingScore: assessment.passingScore,
      files: assessment.files
    });
    setIsEditDialogOpen(true);
  };

  const getTypeColor = (type: 'formative' | 'summative') => {
    return type === 'formative' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assessment Management</h2>
          <p className="text-muted-foreground">Create and manage formative and summative assessments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Create a new formative or summative assessment for your learners
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assessment title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'formative' | 'summative') => 
                    setFormData(prev => ({ ...prev, type: value }))}>
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
                <Label htmlFor="course">Course</Label>
                <Select value={formData.courseId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, courseId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assessment description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter detailed instructions for learners"
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Assessment Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload assessment documents (PDF, DOC, etc.)</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
                {formData.files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMarks">Max Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="passingScore">Passing Score</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssessment} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Assessment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statistics.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Formative</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.formativeCount}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Summative</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.summativeCount}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">{statistics.publishedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.totalSubmissions}</p>
              </div>
              <Upload className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={(value: 'all' | 'formative' | 'summative') => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="formative">Formative</SelectItem>
                <SelectItem value="summative">Summative</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <CardDescription className="mt-1">{assessment.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(assessment.type)}>
                    {assessment.type}
                  </Badge>
                  <Badge className={getStatusColor(assessment.isPublished)}>
                    {assessment.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {assessment.courseName}
                </div>
                
                {assessment.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(assessment.dueDate).toLocaleDateString()}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {assessment.assignedLearners.length} learners assigned
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  {assessment.submissions.length} submissions
                </div>
                
                {assessment.files.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <File className="h-4 w-4" />
                    {assessment.files.length} document(s)
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Marks: {assessment.maxMarks}</span>
                  <span className="text-muted-foreground">Pass: {assessment.passingScore}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(assessment)}
                    disabled={isUpdating || isDeleting === assessment.id || isPublishing === assessment.id}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  {assessment.files.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFiles(assessment.files)}
                      disabled={isUpdating || isDeleting === assessment.id || isPublishing === assessment.id}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  
                  {assessment.submissions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSubmissions(assessment)}
                      disabled={isUpdating || isDeleting === assessment.id || isPublishing === assessment.id}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Submissions ({assessment.submissions.length})
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(assessment.id)}
                    disabled={isUpdating || isDeleting === assessment.id || isPublishing === assessment.id}
                  >
                    {isPublishing === assessment.id ? 'Updating...' : (assessment.isPublished ? 'Unpublish' : 'Publish')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAssessment(assessment.id)}
                    disabled={isUpdating || isDeleting === assessment.id || isPublishing === assessment.id}
                  >
                    {isDeleting === assessment.id ? 'Deleting...' : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssessments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterCourse !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Create your first assessment to get started'
              }
            </p>
            {(!searchTerm && filterType === 'all' && filterCourse === 'all') && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assessment</DialogTitle>
            <DialogDescription>
              Update the assessment details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Assessment Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assessment title"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Assessment Type</Label>
                <Select value={formData.type} onValueChange={(value: 'formative' | 'summative') => 
                  setFormData(prev => ({ ...prev, type: value }))}>
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
              <Label htmlFor="edit-course">Course</Label>
              <Select value={formData.courseId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter assessment description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Enter detailed instructions for learners"
                rows={4}
              />
            </div>
            
            <div>
              <Label>Assessment Documents</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload assessment documents (PDF, DOC, etc.)</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="edit-file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('edit-file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              {formData.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-maxMarks">Max Marks</Label>
                <Input
                  id="edit-maxMarks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-passingScore">Passing Score</Label>
                <Input
                  id="edit-passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEditAssessment} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Assessment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      {showSubmissionsDialog && selectedAssessmentForSubmissions && (
        <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assessment Submissions</DialogTitle>
              <DialogDescription>
                View and download submissions for "{selectedAssessmentForSubmissions.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedAssessmentForSubmissions.submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions yet</p>
                </div>
              ) : (
                selectedAssessmentForSubmissions.submissions.map((submission) => (
                  <Card key={submission.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{submission.learnerName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                            {submission.status}
                          </Badge>
                          {submission.marks && (
                            <Badge variant="outline">
                              {submission.marks}/{selectedAssessmentForSubmissions.maxMarks}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {submission.files.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Submitted Files:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {submission.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">
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
                          onClick={() => handleMarkSubmission(submission)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          {submission.markedDocuments && submission.markedDocuments.length > 0 ? 'Add More Marks' : 'Mark Submission'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmissionsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Marking Dialog */}
      {showMarkingDialog && selectedSubmissionForMarking && (
        <Dialog open={showMarkingDialog} onOpenChange={setShowMarkingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Marked Documents</DialogTitle>
              <DialogDescription>
                Upload marked documents for {selectedSubmissionForMarking.learnerName}'s submission
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="marking-files">Select Marked Documents</Label>
                <Input
                  id="marking-files"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={handleMarkingFileChange}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: PDF, Word, PowerPoint, Images
                </p>
              </div>

              {markingFiles.length > 0 && (
                <div>
                  <Label>Selected Files:</Label>
                  <div className="mt-2 space-y-2">
                    {markingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({FileUploadService.formatFileSize(file.size)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMarkingDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadMarkedDocuments}
                disabled={isUploadingMarkedDocuments || markingFiles.length === 0}
              >
                {isUploadingMarkedDocuments ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Marked Documents
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
