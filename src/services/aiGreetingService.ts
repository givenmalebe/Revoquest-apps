import type { LearnerProgressSummary } from './learnerProgressForAIService';

import { nvidiaGenerateText, hasNvidiaConfigured } from '@/services/nvidiaClient';

/**
 * Generates a short, personal welcome message from the AI tutor for the "Welcome back" popup.
 * Uses the learner's full progress (courses, quizzes, final exam attempts/scores) so the
 * message is performance-based and feels like the tutor speaking—not robotic.
 */
export async function getAIGreetingMessage(
  summary: LearnerProgressSummary,
  userName: string
): Promise<string> {
  if (!hasNvidiaConfigured()) {
    return buildFallbackGreeting(summary, userName);
  }

  const systemPrompt = `You are the learner's personal tutor. You are writing the BODY of a welcome popup—the heading "Welcome back, [name]!" is already shown above, so do NOT repeat "Welcome back" or the learner's name at the start. Write only what you as the tutor are saying: specific, warm, and based on their real data. You must use the learner data provided: mention at least one concrete fact (progress %, course name, quiz result, or final exam attempt/score). End with one clear next step or offer (e.g. "Let's get you ready for your next exam try" or "Chat with me when you want to tackle the next lesson"). Be concise: 2–4 sentences. No bullet points. No robotic phrases like "I notice that" or "It's great to see you." Sound like a tutor who has actually read their file. NEVER mention internal database ids (strings like "JaidHB0sdkqGhyc9KNJb") — only use the human-readable course titles from the data.`;

  const userPrompt = `LEARNER DATA (use this—your reply must reflect real facts from here):

${summary.summaryForAI}

Learner's first name (for reference only; do not start your message with "Hi [name]" or "Welcome back"—the UI already shows that): ${userName || 'there'}

RULES FOR YOUR REPLY:
1. Do NOT start with "Welcome back" or "Hi [name]". Start with the substance (e.g. "You're 69% through your courses" or "I see you've attempted the final exam for [course]" or "You're just getting started—when you're ready...").
2. You MUST include at least one specific fact from the data above (progress percentage, course title, quiz score, final exam attempts or score).
3. If they have final exam data: mention it (e.g. "You're close at 72%—one more push and you can pass" or "You have 2 attempts left; I can help you prepare" or "You passed—go grab your certificate").
4. End with one concrete suggestion or offer: what they could do next or that you're here to help (e.g. "Chat with me when you want to review" or "Let's go over the tricky bits before your next attempt").
5. Write 2–4 sentences only. Natural, warm, like a real tutor. No repetition.
6. NEVER quote or mention Firestore/database ids. Only use course titles exactly as written in the data above.`;

  try {
    const text = await nvidiaGenerateText({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.8,
      max_tokens: 256,
    });
    // Reject short or repetitive "Welcome back" replies; use fallback so the message is always substantive
    if (text && text.length >= 60 && !/^Welcome back[,!]?\s*/i.test(text)) {
      return text;
    }
  } catch (err) {
    console.warn('AI greeting failed:', err);
  }
  return buildFallbackGreeting(summary, userName);
}

function buildFallbackGreeting(summary: LearnerProgressSummary, userName: string): string {
  const name = userName || 'there';
  if (summary.courseCount === 0) {
    return `Hi ${name}, I'm here whenever you're ready to start a course—I can help with lessons, quizzes, and when you get to the final exam.`;
  }
  const percent = summary.overallPercent;
  if (percent >= 100) {
    return `You're all caught up, ${name}. If you've passed your final exams, grab your certificates—and I'm here if you want to review anything or plan what's next.`;
  }
  if (summary.summaryForAI.includes('final exam')) {
    return `You're ${percent}% through your courses, ${name}. I see your exam attempts and results—I'm here to help you get ready for the next try or celebrate when you pass.`;
  }
  return `You're ${percent}% through your courses, ${name}. I'm here for lesson feedback, tricky topics, and when you're ready for your final exam—just chat anytime.`;
}
