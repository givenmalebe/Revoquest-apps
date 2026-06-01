// Simple script to assign Jane Smith2 to a course
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseConfig } from './scripts/firebase-config.mjs';

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function assignStudentToCourse() {
  try {
    // Jane Smith2's user ID
    const studentId = 'dIwgPLyDkWfjZKnChLcP6qWuT9B2';
    const courseId = 'xmsp3X8Gu6zpWN9JyGLm';

    const enrollmentRef = doc(db, 'enrollments', `${studentId}_${courseId}`);
    await updateDoc(enrollmentRef, {
      status: 'Active',
      progress: 0,
      lastAccessed: new Date().toISOString()
    });

    console.log('✅ Student assigned to course successfully!');
  } catch (error) {
    console.error('❌ Error assigning student:', error);
  }
}

assignStudentToCourse();
