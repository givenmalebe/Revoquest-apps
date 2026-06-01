import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Award, 
  AlertCircle,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { KnowledgeModuleGrade } from '@/services/gradingService';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  grade: KnowledgeModuleGrade | null;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  grade
}) => {
  if (!grade) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'redo_required':
        return 'bg-red-100 text-red-800';
      case 'resubmitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Module Feedback
              </DialogTitle>
              <DialogDescription>
                Detailed feedback for KM{grade.moduleNumber}: {grade.moduleName}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grade Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grade Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    KM{grade.moduleNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">Module</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
                    {grade.marks}/{grade.maxMarks}
                  </div>
                  <div className="text-sm text-muted-foreground">Marks</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
                    {grade.grade}
                  </div>
                  <div className="text-sm text-muted-foreground">Grade</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
                    {grade.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Percentage</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4">
                <Badge 
                  className={grade.assessmentType === 'formative' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'}
                >
                  {grade.assessmentType === 'formative' ? 'Formative' : 'Summative'}
                </Badge>
                <Badge className={getStatusColor(grade.status)}>
                  {grade.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Instructor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Instructor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Instructor:</span> {grade.instructorName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Graded on: {grade.gradedAt 
                      ? new Date(grade.gradedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Not available'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Content */}
          {grade.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Instructor Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {grade.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          {grade.comments && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {grade.comments}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Redo Information */}
          {grade.requiresRedo && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  Resubmission Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {grade.redoReason && (
                    <div>
                      <p className="font-medium text-red-700 mb-1">Reason for Resubmission:</p>
                      <p className="text-sm text-gray-700 bg-white rounded p-3 border">
                        {grade.redoReason}
                      </p>
                    </div>
                  )}
                  {grade.redoDeadline && (
                    <div className="flex items-center gap-2 text-red-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Deadline: {new Date(grade.redoDeadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Feedback Message */}
          {!grade.feedback && !grade.comments && !grade.requiresRedo && (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Additional Feedback</h3>
                <p className="text-muted-foreground">
                  This module has been graded but no additional feedback was provided.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
