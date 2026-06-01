import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseConfig } from './scripts/firebase-config.mjs';

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test users to create
const testUsers = [
  {
    email: 'admin@smartlms.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    email: 'instructor@smartlms.com',
    password: 'instructor123',
    firstName: 'John',
    lastName: 'Instructor',
    role: 'instructor',
    specialization: ['Quality Management', 'Safety Training'],
    qualifications: ['MSc Quality Management', 'SETA Assessor'],
    setaRegistration: 'SETA123456',
    qctoRegistration: 'QCTO789012'
  },
  {
    email: 'learner@smartlms.com',
    password: 'learner123',
    firstName: 'Jane',
    lastName: 'Student',
    role: 'student',
    enrolledCourses: [],
    completedCourses: [],
    progress: 0,
    currentGrade: 'N/A'
  }
];

async function createTestUsers() {
  console.log('🚀 Starting test user creation...');
  
  for (const userData of testUsers) {
    try {
      console.log(`Processing user: ${userData.email}`);
      
      let user;
      
      try {
        // Try to sign in first to get existing user
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        user = userCredential.user;
        console.log(`✅ User ${userData.email} already exists in Auth`);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          // Create user with email and password
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
          );
          user = userCredential.user;
          
          // Update display name
          await updateProfile(user, {
            displayName: `${userData.firstName} ${userData.lastName}`
          });
          console.log(`✅ Created new user: ${userData.email}`);
        } else {
          throw authError;
        }
      }
      
      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log(`Creating Firestore profile for: ${userData.email}`);
        
        // Create user profile in Firestore
        const userProfile = {
          uid: user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isActive: true,
          ...(userData.role === 'student' && {
            enrolledCourses: userData.enrolledCourses || [],
            completedCourses: userData.completedCourses || [],
            progress: userData.progress || 0,
            currentGrade: userData.currentGrade || 'N/A'
          }),
          ...(userData.role === 'instructor' && {
            specialization: userData.specialization || [],
            qualifications: userData.qualifications || [],
            setaRegistration: userData.setaRegistration || '',
            qctoRegistration: userData.qctoRegistration || ''
          }),
          ...(userData.role === 'admin' && {
            permissions: ['read', 'write', 'delete', 'manage_users']
          })
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), userProfile);
        console.log(`✅ Created Firestore profile for: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⚠️  Firestore profile already exists for: ${userData.email}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing user ${userData.email}:`, error.message);
    }
  }
  
  console.log('🎉 Test user creation completed!');
  console.log('\nTest accounts created:');
  console.log('Admin: admin@smartlms.com / admin123');
  console.log('Instructor: instructor@smartlms.com / instructor123');
  console.log('Learner: learner@smartlms.com / learner123');
}

// Run the script
createTestUsers()
  .then(() => {
    console.log('\n✨ Setup complete! You can now test the application.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
