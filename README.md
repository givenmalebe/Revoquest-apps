# Modern Quest Vision - Learning Management System

A comprehensive, modern Learning Management System (LMS) built with React, TypeScript, and Firebase. This platform provides an intuitive interface for both learners and instructors to create, manage, and participate in educational courses with AI-powered features.

## Features

- **🎓 Course Management**: Create and manage courses with lessons, assessments, and multimedia content
- **👥 User Roles**: Separate dashboards for learners and instructors
- **🤖 AI Integration**: AI-powered course builder and tutor chat functionality
- **📊 Progress Tracking**: Real-time progress monitoring and analytics
- **📱 Responsive Design**: Mobile-first design with modern UI components
- **🔥 Firebase Backend**: Scalable cloud infrastructure with authentication and real-time data sync
- **📚 Content Management**: Support for various content types including PDFs, videos, and interactive slides
- **🎨 Professional Presentations**: Advanced slide generation and presentation tools

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **Backend**: Firebase (Firestore, Authentication, Storage, Functions)
- **State Management**: React Query, Context API
- **Routing**: React Router DOM
- **PDF Handling**: React PDF, PDF.js
- **AI Services**: Google Generative AI
- **File Storage**: Cloudinary integration

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI
- Firebase project with Firestore, Authentication, and Storage enabled

## How to Run

### 1. Clone the repository
```bash
git clone <repository-url>
cd modern-quest-vision
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore Database, and Storage
3. Copy your Firebase configuration to `src/firebase/config.ts`
4. Update Firestore rules in `firestore.rules`
5. Update Storage rules in `storage.rules`

### 4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:8085`

### 5. (Optional) Run Firebase emulators for local development
```bash
npm run firebase:emulators
```

This will start Firebase emulators for local testing without affecting production data.

## How to Test

### Manual Testing
1. **User Registration/Login**: Test the authentication flow
2. **Course Creation**: Create courses as an instructor
3. **Course Enrollment**: Enroll in courses as a learner
4. **Progress Tracking**: Verify progress is saved and displayed correctly
5. **AI Features**: Test the AI course builder and tutor chat
6. **Responsive Design**: Test on different screen sizes

### Testing Tools Available
- **Next Button Test**: Navigate to `/test-next-button` to test lesson navigation
- **Timer Test**: Navigate to `/timer-test.html` to test lesson timers
- **Progress Test**: Use the progress test components for debugging

### Firebase Emulator Testing
```bash
# Start emulators
npm run firebase:emulators

# In another terminal, run the app
npm run dev
```

## Deployment

### Deploy to Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase
npm run firebase:deploy
```

### Deploy specific services
```bash
# Deploy only hosting
npm run firebase:deploy:hosting

# Deploy only functions
npm run firebase:deploy:functions

# Deploy only Firestore rules
npm run firebase:deploy:firestore

# Deploy only Storage rules
npm run firebase:deploy:storage
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── firebase/           # Firebase configuration and services
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── services/           # Business logic and API services
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Key Components

- **InstructorDashboard**: Course management interface for instructors
- **LearnerDashboard**: Learning interface for students
- **AICourseBuilder**: AI-powered course creation tool
- **AITutorChat**: AI tutoring chat interface
- **LessonViewer**: Interactive lesson display
- **VirtualStudio**: Advanced presentation and content creation tools

## Environment Setup

1. **Firebase Configuration**: Update `src/firebase/config.ts` with your Firebase project settings
2. **Cloudinary Setup**: Configure Cloudinary for image and file storage
3. **AI Services**: Set up Google Generative AI API keys
4. **Environment Variables**: Create `.env.local` for sensitive configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.