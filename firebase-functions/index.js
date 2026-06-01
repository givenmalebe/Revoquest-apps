const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Cloud Function to send email notifications
exports.sendEmailNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    // Here you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log('Sending email notification:', notification);
    
    // For now, just log the notification
    return null;
  });

// Cloud Function to update course enrollment count
exports.updateCourseEnrollmentCount = functions.firestore
  .document('enrollments/{enrollmentId}')
  .onCreate(async (snap, context) => {
    const enrollment = snap.data();
    const courseId = enrollment.courseId;
    
    try {
      // Get current course data
      const courseRef = db.collection('courses').doc(courseId);
      const courseDoc = await courseRef.get();
      
      if (courseDoc.exists) {
        const courseData = courseDoc.data();
        const newCount = courseData.enrolledStudents + 1;
        
        // Update enrollment count
        await courseRef.update({
          enrolledStudents: newCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Updated course ${courseId} enrollment count to ${newCount}`);
      }
    } catch (error) {
      console.error('Error updating course enrollment count:', error);
    }
  });

// Cloud Function to update course enrollment count when enrollment is deleted
exports.updateCourseEnrollmentCountOnDelete = functions.firestore
  .document('enrollments/{enrollmentId}')
  .onDelete(async (snap, context) => {
    const enrollment = snap.data();
    const courseId = enrollment.courseId;
    
    try {
      // Get current course data
      const courseRef = db.collection('courses').doc(courseId);
      const courseDoc = await courseRef.get();
      
      if (courseDoc.exists) {
        const courseData = courseDoc.data();
        const newCount = Math.max(0, courseData.enrolledStudents - 1);
        
        // Update enrollment count
        await courseRef.update({
          enrolledStudents: newCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Updated course ${courseId} enrollment count to ${newCount}`);
      }
    } catch (error) {
      console.error('Error updating course enrollment count:', error);
    }
  });

// Cloud Function to calculate course analytics
exports.calculateCourseAnalytics = functions.firestore
  .document('courses/{courseId}')
  .onUpdate(async (change, context) => {
    const courseId = context.params.courseId;
    const before = change.before.data();
    const after = change.after.data();
    
    // Only recalculate if enrollment count changed
    if (before.enrolledStudents !== after.enrolledStudents) {
      try {
        // Get all enrollments for this course
        const enrollmentsSnapshot = await db.collection('enrollments')
          .where('courseId', '==', courseId)
          .get();
        
        const totalEnrollments = enrollmentsSnapshot.size;
        const completedEnrollments = enrollmentsSnapshot.docs.filter(
          doc => doc.data().status === 'Completed'
        ).length;
        
        const completionRate = totalEnrollments > 0 
          ? (completedEnrollments / totalEnrollments) * 100 
          : 0;
        
        // Update course with analytics
        await db.collection('courses').doc(courseId).update({
          completionRate: completionRate,
          analyticsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Updated analytics for course ${courseId}: ${completionRate}% completion rate`);
      } catch (error) {
        console.error('Error calculating course analytics:', error);
      }
    }
  });

// Cloud Function to send welcome email to new users
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  try {
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // Here you would integrate with an email service
      console.log(`Sending welcome email to ${userData.email} (${userData.role})`);
      
      // For now, just log the user creation
      console.log('New user created:', {
        uid: user.uid,
        email: user.email,
        role: userData.role
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
});

// Cloud Function to clean up old notifications
exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldNotifications = await db.collection('notifications')
        .where('createdAt', '<', thirtyDaysAgo)
        .where('isRead', '==', true)
        .get();
      
      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`Cleaned up ${oldNotifications.size} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  });

// Cloud Function to generate instructor reports
exports.generateInstructorReport = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated and is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
  }
  
  const { instructorId, period } = data;
  
  try {
    // Get instructor data
    const instructorDoc = await db.collection('users').doc(instructorId).get();
    if (!instructorDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Instructor not found');
    }
    
    const instructorData = instructorDoc.data();
    
    // Get instructor's courses
    const coursesSnapshot = await db.collection('courses')
      .where('instructorId', '==', instructorId)
      .get();
    
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate analytics
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents, 0);
    
    const report = {
      instructorId,
      instructorName: instructorData.firstName + ' ' + instructorData.lastName,
      period,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save report to Firestore
    await db.collection('instructorReports').add(report);
    
    return report;
  } catch (error) {
    console.error('Error generating instructor report:', error);
    throw new functions.https.HttpsError('internal', 'Error generating report');
  }
});
