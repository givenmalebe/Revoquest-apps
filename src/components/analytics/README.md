# Analytics Dashboard Components

This directory contains comprehensive analytics components for the instructor dashboard, providing detailed insights into student performance, course completion progress, and attendance tracking.

## Components Overview

### 1. StudentPerformanceChart
- **Purpose**: Displays detailed student performance metrics and progress tracking
- **Features**:
  - Overall grade and progress visualization
  - Top performers leaderboard
  - Individual student performance breakdown
  - Course-specific performance tracking
  - Performance trends and analytics

### 2. CourseCompletionProgress
- **Purpose**: Tracks and visualizes course completion rates and progress
- **Features**:
  - Course completion statistics
  - Milestone tracking
  - Monthly completion trends
  - Top performing courses
  - Detailed progress breakdown

### 3. BestPerformingStudents
- **Purpose**: Highlights and celebrates top-performing students
- **Features**:
  - Podium display for top 3 students
  - Top 10 leaderboard
  - Detailed performance analysis
  - Achievement tracking
  - Strengths and improvement areas

### 4. ClassRegister
- **Purpose**: Manages student enrollment and class registration
- **Features**:
  - Student directory with search and filtering
  - Enrollment status tracking
  - Course enrollment management
  - Emergency contact information
  - Export/import functionality

### 5. AttendanceTracker
- **Purpose**: Tracks and manages student attendance
- **Features**:
  - Session-based attendance marking
  - Attendance statistics and trends
  - Bulk attendance marking
  - Attendance rate calculations
  - Session management

### 6. ComprehensiveAnalyticsDashboard
- **Purpose**: Main dashboard that integrates all analytics components
- **Features**:
  - Tabbed interface for different analytics views
  - Overview statistics
  - Timeframe filtering (week, month, quarter, year)
  - Export functionality
  - Real-time data refresh

## Usage

```tsx
import { ComprehensiveAnalyticsDashboard } from './analytics';

// In your component
<ComprehensiveAnalyticsDashboard 
  data={{
    students: studentData,
    courses: courseData,
    assignments: assignmentData,
    attendanceRecords: attendanceData,
    sessions: sessionData
  }}
  onRefresh={() => console.log('Refreshing...')}
  onExport={(type) => console.log(`Exporting ${type}...`)}
/>
```

## Data Structure

### Student Performance Data
```typescript
interface StudentPerformance {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  overallGrade: number;
  courseProgress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastActive: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  trend: 'up' | 'down' | 'stable';
  courses: CoursePerformance[];
}
```

### Course Completion Data
```typescript
interface CourseCompletionData {
  courseId: string;
  courseTitle: string;
  totalEnrolled: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  averageTimeToComplete: number;
  lastActivity: string;
  milestones: Milestone[];
  monthlyCompletions: MonthlyCompletion[];
}
```

## Features

- **Responsive Design**: All components are fully responsive and work on desktop and mobile
- **Real-time Updates**: Components support real-time data updates
- **Export Functionality**: Built-in export capabilities for reports and data
- **Filtering & Search**: Advanced filtering and search capabilities
- **Performance Optimized**: Memoized components for optimal performance
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## Customization

All components accept props for customization:
- Color schemes can be modified via CSS variables
- Data processing can be customized through props
- Layout and styling can be overridden with custom CSS classes

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- Radix UI components (Card, Button, Badge, etc.)
