import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { DatabaseService } from '@/firebase/database';

const DEFAULT_COURSE_NAME = 'Your course';
const DEFAULT_LESSON_NAME = 'Lesson quiz';

/** True when a string looks like a Firestore document id, not a human title. */
export function looksLikeFirestoreId(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(' ')) return false;
  if (trimmed.length < 12 || trimmed.length > 128) return false;
  return /^[A-Za-z0-9_-]+$/.test(trimmed);
}

/** Never show raw ids in UI or AI copy. */
export function sanitizeDisplayName(
  value: string | undefined | null,
  fallback = DEFAULT_COURSE_NAME
): string {
  const trimmed = String(value || '').trim();
  if (!trimmed || looksLikeFirestoreId(trimmed)) return fallback;
  return trimmed;
}

export function getCourseDisplayName(
  courseId: string,
  titleMap: Map<string, string>,
  course?: { title?: string } | null,
  fallback = DEFAULT_COURSE_NAME
): string {
  const fromCourse = sanitizeDisplayName(course?.title, '');
  if (fromCourse) return fromCourse;
  const fromMap = titleMap.get(courseId);
  if (fromMap) return fromMap;
  return fallback;
}

type CourseWithUnits = {
  title?: string;
  units?: {
    id?: string | number;
    title?: string;
    lessons?: { id: string; title?: string }[];
  }[];
};

export function resolveLessonDisplayName(
  lessonId: string,
  course?: CourseWithUnits | null
): { unitTitle: string | null; lessonTitle: string } {
  if (lessonId.startsWith('unit-quiz-')) {
    const unitId = lessonId.replace(/^unit-quiz-/, '');
    const unit = course?.units?.find((item) => String(item.id) === unitId);
    return {
      unitTitle: unit?.title ? sanitizeDisplayName(unit.title, '') : null,
      lessonTitle: 'Unit quiz',
    };
  }

  if (course?.units) {
    for (const unit of course.units) {
      const lesson = unit.lessons?.find((item) => item.id === lessonId);
      if (lesson) {
        return {
          unitTitle: unit.title ? sanitizeDisplayName(unit.title, '') : null,
          lessonTitle: sanitizeDisplayName(lesson.title, DEFAULT_LESSON_NAME),
        };
      }
    }
  }

  if (looksLikeFirestoreId(lessonId)) {
    return { unitTitle: null, lessonTitle: DEFAULT_LESSON_NAME };
  }

  return { unitTitle: null, lessonTitle: sanitizeDisplayName(lessonId, DEFAULT_LESSON_NAME) };
}

/** Resolve human-readable course titles for progress, grades, and AI tutor. */
export async function buildCourseTitleMap(
  studentId: string,
  courseIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniqueIds = [...new Set(courseIds.filter(Boolean))];

  const allCourses = await DatabaseService.getCourses().catch(() => []);
  for (const course of allCourses) {
    if (!course.id) continue;
    const title = sanitizeDisplayName(course.title, '');
    if (title) map.set(course.id, title);
  }

  await Promise.all(
    uniqueIds.map(async (courseId) => {
      if (map.has(courseId)) return;

      try {
        const certSnap = await getDoc(doc(db, 'certificates', `${studentId}_${courseId}`));
        if (certSnap.exists()) {
          const certTitle = sanitizeDisplayName(String(certSnap.data()?.courseTitle || ''), '');
          if (certTitle) {
            map.set(courseId, certTitle);
            return;
          }
        }
      } catch {
        // ignore certificate lookup errors
      }

      try {
        const course = await DatabaseService.getCourse(courseId);
        const title = sanitizeDisplayName(course?.title, '');
        if (title) map.set(courseId, title);
      } catch {
        // ignore per-course lookup errors
      }
    })
  );

  return map;
}
