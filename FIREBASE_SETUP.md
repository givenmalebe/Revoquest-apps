# Firebase Setup Guide for RevoQuest LMS

This guide will help you set up Firebase for the RevoQuest Learning Management System with full authentication, database, storage, and cloud functions.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI
   ```bash
   npm install -g firebase-tools
   ```

2. **Node.js**: Version 18 or higher

3. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)

## Project Configuration

Firebase settings are loaded from environment variables (never commit real keys to git):
- Copy `.env.example` → `.env` and fill in values from Firebase Console → Project settings → Your apps.
- Copy `firebase-functions/.env.example` → `firebase-functions/.env` for Yoco, OpenRouter, and email secrets.

## Setup Steps

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install Firebase functions dependencies
cd firebase-functions
npm install
cd ..
```

### 2. Firebase Login and Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Select the following features:
# - Firestore
# - Functions
# - Storage
# - Hosting
```

### 3. Deploy Firebase Rules and Functions

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules
firebase deploy --only storage:rules

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything at once
firebase deploy
```

### 4. Set up Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`revoquest-9e217`)
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the following providers:
   - **Email/Password**: Enable
   - **Google**: Optional (for future use)
   - **Phone**: Optional (for future use)

### 5. Set up Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Create database in **production mode**
3. The security rules will be automatically applied from `firestore.rules`

### 6. Set up Cloud Storage

1. Go to **Storage** in Firebase Console
2. Create a new bucket
3. The security rules will be automatically applied from `storage.rules`

## Database Structure

### Collections

#### `users`
- **Document ID**: User UID from Firebase Auth
- **Fields**:
  - `firstName` (string)
  - `lastName` (string)
  - `email` (string)
  - `role` (string): 'student', 'instructor', 'admin'
  - `avatar` (string, optional): URL to profile image
  - `phone` (string, optional)
  - `joinDate` (timestamp)
  - `lastActive` (timestamp)
  - `isActive` (boolean)
  - `enrolledCourses` (array, for students)
  - `completedCourses` (array, for students)
  - `progress` (number, for students)
  - `specialization` (array, for instructors)
  - `qualifications` (array, for instructors)

#### `courses`
- **Document ID**: Auto-generated
- **Fields**:
  - `title` (string)
  - `description` (string)
  - `instructor` (string): Instructor name
  - `instructorId` (string): Instructor UID
  - `duration` (string)
  - `level` (string): 'Beginner', 'Intermediate', 'Advanced'
  - `category` (string)
  - `price` (number)
  - `enrolledStudents` (number)
  - `rating` (number)
  - `thumbnail` (string): URL to course image
  - `lessons` (number)
  - `isPublished` (boolean)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
  - `saqaId` (string, optional)
  - `setaUnitStandards` (array, optional)
  - `qctoQualifications` (array, optional)

#### `enrollments`
- **Document ID**: Auto-generated
- **Fields**:
  - `studentId` (string): Student UID
  - `courseId` (string): Course document ID
  - `enrolledAt` (timestamp)
  - `progress` (number): 0-100
  - `status` (string): 'Active', 'Completed', 'Dropped', 'Suspended'
  - `lastAccessed` (timestamp)
  - `completionDate` (timestamp, optional)
  - `grade` (number, optional)

#### `assignments`
- **Document ID**: Auto-generated
- **Fields**:
  - `title` (string)
  - `description` (string)
  - `courseId` (string)
  - `dueDate` (timestamp)
  - `points` (number)
  - `type` (string): 'Quiz', 'Project', 'Essay', 'Presentation', 'Portfolio'
  - `status` (string): 'Not Started', 'In Progress', 'Submitted', 'Graded'
  - `grade` (number, optional)
  - `submittedAt` (timestamp, optional)
  - `feedback` (string, optional)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

#### `messages`
- **Document ID**: Auto-generated
- **Fields**:
  - `senderId` (string): Sender UID
  - `senderName` (string)
  - `senderRole` (string): 'instructor', 'learner', 'admin'
  - `recipientId` (string): Recipient UID
  - `recipientName` (string)
  - `courseId` (string, optional)
  - `courseName` (string, optional)
  - `subject` (string)
  - `content` (string)
  - `timestamp` (timestamp)
  - `isRead` (boolean)
  - `attachments` (array, optional)

#### `notifications`
- **Document ID**: Auto-generated
- **Fields**:
  - `userId` (string): User UID
  - `title` (string)
  - `message` (string)
  - `type` (string): 'assignment', 'course', 'system', 'achievement'
  - `isRead` (boolean)
  - `createdAt` (timestamp)
  - `data` (object, optional)

## Security Rules

### Firestore Rules
- Users can read/write their own data
- Instructors can read student data and their own courses
- Admins have full access
- Published courses are publicly readable

### Storage Rules
- Users can upload their own files
- Course content is publicly readable
- Assignment submissions are private to student and instructor
- POE submissions are private to student and instructor

## Cloud Functions

### Available Functions

1. **sendEmailNotification**: Sends email when notifications are created
2. **updateCourseEnrollmentCount**: Updates enrollment count when students enroll
3. **updateCourseEnrollmentCountOnDelete**: Updates enrollment count when students unenroll
4. **calculateCourseAnalytics**: Calculates course completion rates
5. **sendWelcomeEmail**: Sends welcome email to new users
6. **cleanupOldNotifications**: Cleans up old notifications (runs daily)
7. **generateInstructorReport**: Generates detailed instructor reports

## Development

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# The app will be available at:
# - App: http://localhost:5173
# - Firebase UI: http://localhost:4000
# - Firestore: http://localhost:8080
# - Auth: http://localhost:9099
# - Storage: http://localhost:9199
```

### Testing

```bash
# Run tests
npm test

# Run Firebase emulator tests
firebase emulators:exec --only firestore,storage,auth "npm test"
```

## Production Deployment

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

For Cloud Functions secrets (Yoco, OpenRouter, Gmail), use `firebase-functions/.env` locally and `firebase functions:secrets:set` in production.

## Monitoring and Analytics

1. **Firebase Analytics**: Automatically enabled
2. **Firebase Performance**: Monitor app performance
3. **Firebase Crashlytics**: Monitor crashes and errors
4. **Firebase Functions Logs**: Monitor cloud function execution

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check if Firebase Auth is enabled and configured correctly
2. **Permission Denied**: Verify Firestore security rules are deployed
3. **Storage Upload Fails**: Check Storage security rules
4. **Functions Not Working**: Ensure functions are deployed and have proper permissions

### Debug Mode

```bash
# Enable debug logging
export FIREBASE_DEBUG=true
firebase emulators:start
```

## Support

For issues related to Firebase setup, check:
1. [Firebase Documentation](https://firebase.google.com/docs)
2. [Firebase Console](https://console.firebase.google.com/)
3. [Firebase Support](https://firebase.google.com/support)

## Next Steps

1. Set up email service integration (SendGrid, Mailgun, etc.)
2. Configure push notifications
3. Set up monitoring and alerting
4. Implement backup strategies
5. Set up CI/CD pipeline for automated deployments
