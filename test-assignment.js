// Simple test script to assign Jane Smith2 to a course
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
    
    // Course ID (JavaScript Fundamentals - Complete Course)
    const courseId = 'lhP2qpbZYertyEj4wYLf';
    
    // Update the course to assign Jane Smith2
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      assignedStudents: [studentId],
      studentAssignments: [{
        studentId: studentId,
        assignedAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      }]
    });
    
    console.log('Successfully assigned Jane Smith2 to the course!');
  } catch (error) {
    console.error('Error assigning student to course:', error);
  }
}

assignStudentToCourse();
