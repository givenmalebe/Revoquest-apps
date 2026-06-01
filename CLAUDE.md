# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern Quest Vision is a full-featured Learning Management System (LMS) built with React, TypeScript, and Firebase. It supports:
- Separate dashboards for learners, instructors, and admins
- AI-powered course creation (AICourseBuilder) and tutoring (AITutorChat) using Google Gemini
- Real-time progress tracking and analytics
- PDF learning with interactive features
- Course payment funnel with Yoco integration
- Firebase Cloud Functions for backend operations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite (port 8085)
- **UI**: Radix UI primitives with Tailwind CSS (shadcn/ui-style components in `src/components/ui/`)
- **State**: React Query (server state), Context API (global state)
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI**: Google Generative AI (@google/generative-ai)
- **PDF**: react-pdf, pdfjs-dist
- **Payments**: Yoco gateway
- **Cloud Storage**: Cloudinary

## Key Architecture

### Data Flow
- All Firebase interactions go through service layer (`src/services/`)
- `firebaseApi.ts` provides typed Firestore CRUD operations
- Individual services (e.g., `lessonContentService.ts`, `progressService.ts`) contain business logic
- Real-time updates via Firestore `onSnapshot` listeners in context providers

### Authentication Context
`src/contexts/AuthContext.tsx` manages auth state. User roles: `'learner'` (frontend) / `'student'` (Firestore), `'instructor'`, `'admin'`. Profile data stored in Firestore `users` collection.

### Context Providers (order matters in App.tsx)
1. `QueryClientProvider` - React Query
2. `TooltipProvider` - Radix UI tooltips
3. `AuthProvider` - Authentication state
4. `NotificationProvider` - Toast notifications (sonner)
5. `DataSyncProvider` - Real-time data synchronization for enrolled courses, assignments, messages

### Routing Structure
- Main app routes: `/`, `/lms`, `/ai-tutor`, `/profile`, `/courses`, etc.
- Funnel/marketing routes: `/funnel/*`, `/funnel/checkout/:courseId`
- Test routes: `/test-next-button`, `/delete-courses`
- All custom routes must be above the catch-all `*` route in `App.tsx`

### Firebase Cloud Functions
Located in `firebase-functions/`. Separate Node.js project with:
- Email sending (nodemailer)
- Enrollment form processing
- RPL application handling
- Assessment booking
- Deployed separately from frontend

### Environment Variables
- **Frontend**: `.env` (committed - contains API keys), `.env.local` (local overrides, gitignored)
- **Functions**: `firebase-functions/.env` for local emulator
- Required vars: `VITE_GEMINI_API_KEY`, `YOCO_SECRET_KEY`

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8085)
npm run dev

# Start development server with clean Vite cache
npm run dev:clean

# Production build
npm run build

# Development build
npm run build:dev

# Preview production build
npm run preview

# Lint codebase
npm run lint

# Firebase operations
npm run firebase:emulators      # Start all emulators (Auth:9099, Firestore:8080, Storage:9199, Functions:5001)
npm run firebase:deploy         # Deploy everything
npm run firebase:deploy:hosting # Deploy only hosting
npm run firebase:deploy:functions # Deploy only functions
npm run firebase:deploy:firestore # Deploy Firestore rules
npm run firebase:deploy:storage   # Deploy Storage rules

# Firebase Functions (separate directory)
cd firebase-functions
npm run build   # TypeScript compilation
npm run serve   # Emulator only
npm run logs    # View function logs
```

## Database Structure

### Key Collections
- `users` - User profiles (role: student/instructor/admin)
- `courses` - Course metadata, structure stored in `courseContent` subcollection
- `enrollments` - Student course enrollments
- `assignments` - Instructor-created assignments
- `submissions` - Student assignment submissions
- `messages` - Direct and group messages
- `notifications` - User notifications
- `progress` - Lesson completion tracking per user/lesson
- `certificates` - Issued certificates

### Course Structure
Courses store content in a `courseContent` subcollection with documents:
- `sections/{sectionId}/lessons/{lessonId}`
- Each lesson has `content` (HTML), `resources` (files), `activities` (quizzes), `order`

## Important Files & Directories

- `src/App.tsx` - Main routing and provider setup
- `src/contexts/` - React context providers (Auth, Chat, DataSync, Notification)
- `src/firebase/` - Firebase initialization and auth service
- `src/services/` - Business logic layer (27+ service files)
- `src/components/` - Reusable components including `ui/` (Radix-based)
- `src/pages/` - Page components; `/funnel/` for marketing pages
- `src/hooks/` - Custom hooks (use-mobile, useSlideNarration, etc.)
- `firebase.json` - Firebase project configuration and emulator ports
- `firebase-functions/src/index.ts` - Cloud Functions entry point

## Testing Approach

- **No formal test suite configured** - Manual testing via development server
- Test routes available: `/test-next-button`, `/timer-test.html` (deleted but can be recreated)
- Firebase emulator recommended for local testing to avoid production data
- AI features tested via UI components (AITodoListDemo, etc.)

## Firebase Configuration

The project uses production Firebase by default (no emulator setup in `src/firebase/config.ts`). For local development with emulators:

1. Update `src/firebase/config.ts` to connect to emulators OR use the current production setup
2. Run `npm run firebase:emulators` in one terminal
3. Run `npm run dev` in another
4. Current config: Firestore location `africa-south1`, hosting site `revoquest-9e217`

## AI Services

- `src/services/aiCourseBuilder.ts` - Generates course content using Gemini
- `src/services/aiTutorChatPersistence.ts` - Chat history management
- `src/services/aiTodoService.ts` - AI-generated todo items
- `src/services/learnerProgressForAIService.ts` - Progress context for AI
- Uses `@google/generative-ai` with `VITE_GEMINI_API_KEY`

## Common Development Tasks

**Add a new page**: Create component in `src/pages/`, add route in `App.tsx` above catch-all.

**Add a new service**: Create file in `src/services/`, implement business logic, import where needed.

**Modify auth flow**: Edit `src/contexts/AuthContext.tsx` and `src/firebase/auth.ts`.

**Add UI component**: Use shadcn/ui pattern: copy from `src/components/ui/` or create new following Radix UI + Tailwind.

**Backend function**: Add to `firebase-functions/src/index.ts`, rebuild functions (`cd firebase-functions && npm run build`).

## Known Constraints

- User role `'student'` in Firestore maps to `'learner'` in frontend (see `AuthContext.tsx` conversion)
- Firestore rules and Storage rules must be deployed via `firebase deploy --only firestore:rules` / `storage:rules`
- Production Firebase credentials are in committed files; be cautious with `.env` changes
- No Jest/Vitest configured - manual testing only
- Firebase Functions use Node.js 20 runtime

## Code Style

- TypeScript strict mode partially enabled (see `tsconfig.json`: `strictNullChecks: false`)
- ESLint config uses `typescript-eslint` with React hooks rules
- Components follow Radix UI patterns with forwardRef and composition
- Tailwind CSS with shadcn/ui component variants (cn utility for class merging)

## Deployment Notes

1. Build frontend: `npm run build`
2. Deploy: `npm run firebase:deploy` (or selective deploy)
3. Functions auto-build before deploy via `predeploy` script in `firebase.json`
4. Deploy Firestore/Storage rules separately after changes
5. Environment variables for functions must be set in Firebase Console
