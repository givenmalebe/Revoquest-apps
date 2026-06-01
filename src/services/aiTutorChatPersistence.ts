import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'aiTutorChat';
const MAX_MESSAGES = 50;

export interface PersistedMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

function toPersisted(m: { id: string; content: string; sender: 'user' | 'ai'; timestamp: Date }): PersistedMessage {
  return {
    id: m.id,
    content: m.content,
    sender: m.sender,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
  };
}

export function fromPersisted(p: PersistedMessage): { id: string; content: string; sender: 'user' | 'ai'; timestamp: Date } {
  return {
    id: p.id,
    content: p.content,
    sender: p.sender,
    timestamp: new Date(p.timestamp),
  };
}

export async function getAITutorChatMessages(userId: string): Promise<PersistedMessage[]> {
  if (!userId) return [];
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const list = (data?.messages as PersistedMessage[] | undefined) ?? [];
  return Array.isArray(list) ? list : [];
}

export async function saveAITutorChatMessages(
  userId: string,
  messages: Array<{ id: string; content: string; sender: 'user' | 'ai'; timestamp: Date }>
): Promise<void> {
  if (!userId) return;
  const toSave = messages.slice(-MAX_MESSAGES).map(toPersisted);
  const ref = doc(db, COLLECTION, userId);
  await setDoc(ref, { messages: toSave, updatedAt: serverTimestamp() }, { merge: true });
}
