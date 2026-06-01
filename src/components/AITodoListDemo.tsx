import React, { useState } from 'react';
import { AITodoList } from './AITodoList';

interface TodoItem {
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
}

const AITodoListDemo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'Review React fundamentals',
      description: 'Go through React hooks, components, and state management concepts',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'study',
      aiGenerated: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Complete TypeScript assignment',
      description: 'Finish the TypeScript interface and type definitions exercise',
      completed: false,
      priority: 'urgent',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'assignment',
      aiGenerated: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const courseData = {
    title: 'Modern Web Development',
    description: 'A comprehensive course covering React, TypeScript, and modern web development practices',
    level: 'intermediate',
    learningOutcomes: [
      'Master React fundamentals and hooks',
      'Understand TypeScript concepts',
      'Build responsive web applications',
      'Implement modern development practices'
    ],
    units: [
      {
        id: 1,
        title: 'React Fundamentals',
        lessons: [
          { id: 'lesson-1', title: 'Components and JSX' },
          { id: 'lesson-2', title: 'State and Props' },
          { id: 'lesson-3', title: 'Hooks and Effects' }
        ]
      },
      {
        id: 2,
        title: 'TypeScript Integration',
        lessons: [
          { id: 'lesson-4', title: 'Type Definitions' },
          { id: 'lesson-5', title: 'Interfaces and Types' },
          { id: 'lesson-6', title: 'Advanced TypeScript' }
        ]
      }
    ]
  };

  const userContext = {
    level: 'intermediate' as const,
    goals: ['Master React and TypeScript', 'Build a portfolio project'],
    availableTime: 15,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  const handleAddTodo = (todo: Omit<TodoItem, 'id' | 'createdAt' | 'aiGenerated'>) => {
    const newTodo: TodoItem = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      aiGenerated: false
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const handleUpdateTodo = (id: string, updates: Partial<TodoItem>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : undefined
          }
        : todo
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI To-Do List Demo</h1>
        <p className="text-gray-600">
          Experience the power of AI-driven task management. Generate smart todos based on your course content and learning goals.
        </p>
      </div>

      <AITodoList
        todos={todos}
        onAddTodo={handleAddTodo}
        onUpdateTodo={handleUpdateTodo}
        onDeleteTodo={handleDeleteTodo}
        onToggleComplete={handleToggleComplete}
        courseData={courseData}
        userContext={userContext}
      />

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Features Demonstrated:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>AI-Powered Generation:</strong> Generate smart todos based on course content and user context</li>
          <li>• <strong>Context-Aware:</strong> AI considers your course, level, goals, and available time</li>
          <li>• <strong>Multiple Generation Types:</strong> Study plans, assignments, exam prep, projects, and reviews</li>
          <li>• <strong>Smart Suggestions:</strong> AI provides personalized study recommendations</li>
          <li>• <strong>Study Planning:</strong> Get weekly schedules and milestone tracking</li>
          <li>• <strong>Priority Management:</strong> AI assigns appropriate priorities based on urgency and importance</li>
          <li>• <strong>Category Organization:</strong> Automatic categorization of different task types</li>
          <li>• <strong>Due Date Intelligence:</strong> Smart due date assignment based on context and deadlines</li>
        </ul>
      </div>
    </div>
  );
};

export default AITodoListDemo;
