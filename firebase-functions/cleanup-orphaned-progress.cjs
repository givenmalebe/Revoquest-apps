const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://modern-quest-vision-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function cleanupOrphanedStudentProgress() {
  try {
    console.log('🧹 Starting cleanup of orphaned student progress records...');
    
    // Get all student progress records
    const progressSnapshot = await db.collection('studentProgress').get();
    console.log(`📊 Found ${progressSnapshot.size} student progress records`);
    
    // Get all valid student IDs from users collection
    const usersSnapshot = await db.collection('users').get();
    const validStudentIds = new Set();
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'learner' || userData.role === 'student') {
        validStudentIds.add(doc.id);
        console.log(`✅ Valid student: ${userData.firstName} ${userData.lastName} (${doc.id})`);
      }
    });
    
    console.log(`👥 Found ${validStudentIds.size} valid students`);
    
    // Find orphaned records
    const orphanedRecords = [];
    progressSnapshot.forEach(doc => {
      const progressData = doc.data();
      if (!progressData.studentId || !validStudentIds.has(progressData.studentId)) {
        orphanedRecords.push({
          id: doc.id,
          data: progressData
        });
      }
    });
    
    console.log(`🗑️ Found ${orphanedRecords.length} orphaned student progress records`);
    
    if (orphanedRecords.length > 0) {
      console.log('📋 Orphaned records details:');
      orphanedRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ID: ${record.id}, studentId: ${record.data.studentId || 'undefined'}, courseId: ${record.data.courseId || 'undefined'}`);
      });
      
      // Delete orphaned records
      console.log('🗑️ Deleting orphaned records...');
      const batch = db.batch();
      
      orphanedRecords.forEach(record => {
        batch.delete(db.collection('studentProgress').doc(record.id));
      });
      
      await batch.commit();
      console.log(`✅ Successfully deleted ${orphanedRecords.length} orphaned student progress records`);
    } else {
      console.log('✅ No orphaned records found - all student progress records are valid');
    }
    
    // Verify cleanup
    const remainingSnapshot = await db.collection('studentProgress').get();
    console.log(`📊 Remaining student progress records: ${remainingSnapshot.size}`);
    
    console.log('🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
}

// Run the cleanup
cleanupOrphanedStudentProgress();
