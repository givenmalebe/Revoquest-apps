/**
 * One-time: remove per-lesson quizzes from all courses in Firestore.
 * Keeps unit-level quizContent. Converts type "quiz" lessons to "learn".
 *
 * Usage: node scripts/strip-lesson-quizzes.mjs
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseConfig } from "./firebase-config.mjs";

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);

function stripLessonQuizzesFromUnits(units) {
  if (!units?.length) return [];
  return units.map((unit) => ({
    ...unit,
    lessons: (unit.lessons || []).map((lesson) => {
      const { quizContent, quiz, ...rest } = lesson;
      return {
        ...rest,
        type: rest.type === "quiz" ? "learn" : rest.type,
      };
    }),
  }));
}

function courseHasLessonQuizzes(course) {
  const units = course.units || course.modules || [];
  return units.some((unit) =>
    (unit.lessons || []).some((lesson) => {
      if (lesson.type === "quiz") return true;
      if (lesson.quizContent?.questions?.length) return true;
      if (lesson.quiz?.questions?.length) return true;
      return false;
    })
  );
}

function cleanUndefined(obj) {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanUndefined).filter((x) => x !== undefined);
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        const cleaned = cleanUndefined(v);
        if (cleaned !== undefined) out[k] = cleaned;
      }
    }
    return out;
  }
  return obj;
}

async function main() {
  console.log("Stripping lesson-level quizzes from all courses...");
  const snap = await getDocs(collection(db, "courses"));
  let updated = 0;
  let skipped = 0;

  for (const courseDoc of snap.docs) {
    const course = { id: courseDoc.id, ...courseDoc.data() };
    const units = course.units || course.modules;
    if (!units?.length || !courseHasLessonQuizzes(course)) {
      skipped++;
      continue;
    }

    const stripped = stripLessonQuizzesFromUnits(units);
    const payload = cleanUndefined({
      units: stripped,
      ...(course.modules ? { modules: stripped } : {}),
    });

    await updateDoc(doc(db, "courses", course.id), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    updated++;
    console.log(`  ✓ ${course.title || course.id}`);
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}, total ${snap.size}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
