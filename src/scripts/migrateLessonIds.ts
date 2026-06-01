import { DatabaseService } from '../firebase/database.js';

/**
 * Migration script to update existing course data with unique lesson IDs
 * This fixes the issue where all units had the same lesson IDs (lesson-1, lesson-2, lesson-3)
 * New format: lesson-{unitIndex + 1}-{lessonIndex + 1}
 */

interface Course {
  id: string;
  title: string;
  units: Unit[];
}

interface Unit {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string | number;
  title: string;
  description: string;
  type: string;
  duration: number;
  content: string;
  youtubeUrl: string;
  pdfUrl: string;
  order: number;
  isPublished: boolean;
  objectives: string[];
  resources: string[];
  quiz?: any;
  quizContent?: any;
}

async function migrateLessonIds() {
  console.log('🚀 Starting lesson ID migration...');
  
  try {
    // Get all courses from the database
    const courses = await DatabaseService.getCourses();
    console.log(`📚 Found ${courses.length} courses to migrate`);
    
    let totalCoursesUpdated = 0;
    let totalLessonsUpdated = 0;
    
    for (const course of courses) {
      console.log(`\n📖 Processing course: ${course.title} (${course.id})`);
      
      let courseUpdated = false;
      let lessonsUpdatedInCourse = 0;
      let globalLessonCounter = 1; // Start from 1 for truly unique IDs
      
      // Process each unit
      for (let unitIndex = 0; unitIndex < course.units.length; unitIndex++) {
        const unit = course.units[unitIndex];
        console.log(`  📁 Processing unit ${unitIndex + 1}: ${unit.title}`);
        
        // Process each lesson in the unit
        for (let lessonIndex = 0; lessonIndex < unit.lessons.length; lessonIndex++) {
          const lesson = unit.lessons[lessonIndex];
          const oldId = lesson.id;
          const newId = `lesson-${globalLessonCounter}`;
          
          // Only update if the ID needs to be changed
          if (oldId !== newId) {
            console.log(`    🔄 Updating lesson ID: ${oldId} → ${newId}`);
            lesson.id = newId;
            courseUpdated = true;
            lessonsUpdatedInCourse++;
          } else {
            console.log(`    ✅ Lesson ID already correct: ${oldId}`);
          }
          
          globalLessonCounter++; // Increment for next lesson
        }
      }
      
      // Update the course in the database if any changes were made
      if (courseUpdated) {
        console.log(`  💾 Updating course in database: ${lessonsUpdatedInCourse} lessons updated`);
        await DatabaseService.updateCourse(course.id, course);
        totalCoursesUpdated++;
        totalLessonsUpdated += lessonsUpdatedInCourse;
      } else {
        console.log(`  ✅ No updates needed for this course`);
      }
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`  - Courses updated: ${totalCoursesUpdated}`);
    console.log(`  - Total lessons updated: ${totalLessonsUpdated}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateLessonIds()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateLessonIds };
