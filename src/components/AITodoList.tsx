import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Edit3, 
  Trash2, 
  Star,
  Clock,
  Target,
  Zap,
  Brain,
  Sparkles,
  Calendar,
  BookOpen,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { aiTodoService, AITodoGenerationRequest, TodoItem as AITodoItem } from '@/services/aiTodoService';

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category: 'study' | 'assignment' | 'exam' | 'personal' | 'meeting';
  aiGenerated: boolean;
  createdAt: string;
  completedAt?: string;
}

interface AITodoListProps {
  todos?: TodoItem[];
  onAddTodo?: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'aiGenerated'>) => void;
  onUpdateTodo?: (id: string, updates: Partial<TodoItem>) => void;
  onDeleteTodo?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  onGenerateAITodos?: () => void;
  courseData?: any; // Course data for context-aware todo generation
  userContext?: {
    level?: 'beginner' | 'intermediate' | 'advanced';
    goals?: string[];
    availableTime?: number;
    deadline?: string;
  };
}

export const AITodoList: React.FC<AITodoListProps> = ({
  todos = [],
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  onGenerateAITodos,
  courseData,
  userContext
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newCategory, setNewCategory] = useState<'study' | 'assignment' | 'exam' | 'personal' | 'meeting' | 'project' | 'review'>('study');
  const [newDueDate, setNewDueDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'ai-generated'>('all');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [aiGenerationType, setAiGenerationType] = useState<'study' | 'assignment' | 'exam' | 'project' | 'review'>('study');

  // Filter and sort todos
  const filteredTodos = useMemo(() => {
    let filtered = todos;

    switch (filter) {
      case 'pending':
        filtered = todos.filter(todo => !todo.completed);
        break;
      case 'completed':
        filtered = todos.filter(todo => todo.completed);
        break;
      case 'ai-generated':
        filtered = todos.filter(todo => todo.aiGenerated);
        break;
      default:
        filtered = todos;
    }

    // Sort by priority and due date
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  }, [todos, filter]);

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;

    const todo: Omit<TodoItem, 'id' | 'createdAt' | 'aiGenerated'> = {
      title: newTodo.trim(),
      description: newDescription.trim() || undefined,
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      category: newCategory
    };

    onAddTodo?.(todo);
    
    // Reset form
    setNewTodo('');
    setNewDescription('');
    setNewPriority('medium');
    setNewCategory('study');
    setNewDueDate('');
    setShowAddForm(false);
  };

  const handleGenerateAITodos = async () => {
    if (!onAddTodo) return;
    
    setIsGeneratingAI(true);
    setShowAIOptions(false);
    
    try {
      let response;
      
      if (courseData) {
        // Generate course-based todos
        response = await aiTodoService.generateCourseBasedTodos(courseData);
      } else {
        // Generate general todos based on user context
        const request: AITodoGenerationRequest = {
          context: {
            courseTitle: userContext?.goals?.[0] || 'Learning',
            userLevel: userContext?.level || 'beginner',
            studyGoals: userContext?.goals || ['Learn and improve'],
            availableTime: userContext?.availableTime || 10,
            deadline: userContext?.deadline
          },
          todoType: aiGenerationType,
          count: 8,
          focus: 'comprehensive learning plan'
        };
        
        response = await aiTodoService.generateTodos(request);
      }
      
      // Add generated todos
      response.todos.forEach((todo) => {
        const newTodo: Omit<TodoItem, 'id' | 'createdAt' | 'aiGenerated'> = {
          title: todo.title,
          description: todo.description,
          completed: false,
          priority: todo.priority,
          dueDate: todo.dueDate,
          category: todo.category
        };
        onAddTodo(newTodo);
      });
      
      // Store AI suggestions and study plan
      setAiSuggestions(response.suggestions);
      if (response.studyPlan) {
        setStudyPlan(response.studyPlan);
      }
      
    } catch (error) {
      console.error('Failed to generate AI todos:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateSpecificTodos = async (type: 'study' | 'assignment' | 'exam' | 'project' | 'review') => {
    if (!onAddTodo) return;
    
    setIsGeneratingAI(true);
    setShowAIOptions(false);
    
    try {
      let response;
      
      switch (type) {
        case 'study':
          response = await aiTodoService.generateStudySchedule(courseData, userContext);
          break;
        case 'assignment':
          response = await aiTodoService.generateAssignmentTodos({
            courseTitle: courseData?.title,
            lessonTitle: courseData?.currentLesson,
            dueDate: userContext?.deadline,
            assignmentType: 'general assignment'
          });
          break;
        case 'exam':
          response = await aiTodoService.generateExamTodos({
            courseTitle: courseData?.title,
            examTopic: courseData?.currentLesson,
            examDate: userContext?.deadline,
            level: userContext?.level
          });
          break;
        case 'project':
          response = await aiTodoService.generateProjectTodos({
            courseTitle: courseData?.title,
            projectTitle: courseData?.currentLesson,
            dueDate: userContext?.deadline,
            level: userContext?.level,
            projectType: 'practical project'
          });
          break;
        case 'review':
          response = await aiTodoService.generateTodos({
            context: {
              courseTitle: courseData?.title,
              userLevel: userContext?.level,
              studyGoals: ['Review and reinforce learning']
            },
            todoType: 'review',
            count: 6,
            focus: 'comprehensive review and reinforcement'
          });
          break;
        default:
          response = await aiTodoService.generateTodos({
            context: userContext,
            todoType: type,
            count: 5
          });
      }
      
      // Add generated todos
      response.todos.forEach((todo) => {
        const newTodo: Omit<TodoItem, 'id' | 'createdAt' | 'aiGenerated'> = {
          title: todo.title,
          description: todo.description,
          completed: false,
          priority: todo.priority,
          dueDate: todo.dueDate,
          category: todo.category
        };
        onAddTodo(newTodo);
      });
      
      setAiSuggestions(response.suggestions);
      if (response.studyPlan) {
        setStudyPlan(response.studyPlan);
      }
      
    } catch (error) {
      console.error('Failed to generate specific AI todos:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      study: BookOpen,
      assignment: Edit3,
      exam: Target,
      personal: Star,
      meeting: Calendar,
      project: Star,
      review: RefreshCw
    };
    const IconComponent = icons[category as keyof typeof icons] || Circle;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      study: 'bg-green-100 text-green-800',
      assignment: 'bg-blue-100 text-blue-800',
      exam: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800',
      meeting: 'bg-yellow-100 text-yellow-800',
      project: 'bg-indigo-100 text-indigo-800',
      review: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || colors.study;
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const isOverdue = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = todos.filter(todo => !todo.completed).length;
  const aiGeneratedCount = todos.filter(todo => todo.aiGenerated).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI To-Do List
            </CardTitle>
            <CardDescription>
              Smart task management powered by AI
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAIOptions(!showAIOptions)}
              className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-800 hover:from-purple-200 hover:to-pink-200"
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              AI Generate
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
            <div className="text-xs text-blue-600">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-xs text-orange-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{aiGeneratedCount}</div>
            <div className="text-xs text-purple-600">AI Generated</div>
          </div>
        </div>

        {/* AI Generation Options */}
        {showAIOptions && (
          <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Todo Generation
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSpecificTodos('study')}
                  className="flex items-center gap-2"
                  disabled={isGeneratingAI}
                >
                  <BookOpen className="w-4 h-4" />
                  Study Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSpecificTodos('assignment')}
                  className="flex items-center gap-2"
                  disabled={isGeneratingAI}
                >
                  <Edit3 className="w-4 h-4" />
                  Assignment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSpecificTodos('exam')}
                  className="flex items-center gap-2"
                  disabled={isGeneratingAI}
                >
                  <Target className="w-4 h-4" />
                  Exam Prep
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSpecificTodos('project')}
                  className="flex items-center gap-2"
                  disabled={isGeneratingAI}
                >
                  <Star className="w-4 h-4" />
                  Project
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSpecificTodos('review')}
                  className="flex items-center gap-2"
                  disabled={isGeneratingAI}
                >
                  <RefreshCw className="w-4 h-4" />
                  Review
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleGenerateAITodos}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Smart Todos
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAIOptions(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mb-6 p-4 border rounded-lg bg-blue-50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              AI Suggestions
            </h4>
            <ul className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-blue-500 mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Study Plan */}
        {studyPlan && (
          <div className="mb-6 p-4 border rounded-lg bg-green-50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              AI Study Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2 text-green-800">Weekly Schedule</h5>
                <ul className="space-y-1 text-sm text-green-700">
                  {studyPlan.weeklySchedule?.map((day: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {day}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2 text-green-800">Milestones</h5>
                <ul className="space-y-1 text-sm text-green-700">
                  {studyPlan.milestones?.map((milestone: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {studyPlan.recommendations && (
              <div className="mt-4">
                <h5 className="font-medium mb-2 text-green-800">Recommendations</h5>
                <ul className="space-y-1 text-sm text-green-700">
                  {studyPlan.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Add Todo Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-3">Add New Task</h4>
            <div className="space-y-3">
              <Input
                placeholder="Task title..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="study">Study</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="personal">Personal</option>
                    <option value="meeting">Meeting</option>
                    <option value="project">Project</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date (optional)</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTodo} disabled={!newTodo.trim()}>
                  Add Task
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All', count: todos.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'completed', label: 'Completed', count: completedCount },
            { key: 'ai-generated', label: 'AI Generated', count: aiGeneratedCount }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="text-xs"
            >
              {label} ({count})
            </Button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                  todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleComplete?.(todo.id)}
                    className="p-0 h-auto"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {todo.aiGenerated && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Zap className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(todo.priority)}`}
                        >
                          {todo.priority}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(todo.category)}`}
                        >
                          {getCategoryIcon(todo.category)}
                          <span className="ml-1">{todo.category}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    {todo.description && (
                      <p className={`text-sm mb-2 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {todo.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {todo.dueDate && (
                        <div className={`flex items-center gap-1 ${
                          isOverdue(todo.dueDate) && !todo.completed ? 'text-red-600' : ''
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{formatDueDate(todo.dueDate)}</span>
                          {isOverdue(todo.dueDate) && !todo.completed && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {todo.completed && todo.completedAt 
                            ? `Completed ${new Date(todo.completedAt).toLocaleDateString()}`
                            : `Created ${new Date(todo.createdAt).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {onUpdateTodo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateTodo(todo.id, { ...todo })}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteTodo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </p>
              <p className="text-sm">
                {filter === 'all' 
                  ? 'Add a task or generate AI suggestions to get started'
                  : 'Try changing the filter or add new tasks'
                }
              </p>
              {filter === 'all' && (
                <div className="mt-4 space-x-2">
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                  <Button variant="outline" onClick={() => setShowAIOptions(true)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AITodoList;
