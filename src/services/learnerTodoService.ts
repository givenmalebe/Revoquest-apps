import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface LearnerTodo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category: 'study' | 'assignment' | 'exam' | 'personal' | 'meeting' | 'project' | 'review';
  aiGenerated: boolean;
  createdAt: string;
  completedAt?: string;
}

const COLLECTION = 'learnerTodos';

export const learnerTodoService = {
  async addTodo(
    userId: string,
    todo: Omit<LearnerTodo, 'id' | 'userId' | 'createdAt' | 'completedAt'>
  ): Promise<LearnerTodo> {
    const id = `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const docData: LearnerTodo = {
      ...todo,
      id,
      userId,
      createdAt: now,
      completedAt: undefined,
    };
    await setDoc(doc(db, COLLECTION, id), docData);
    return docData;
  },

  async getTodos(userId: string): Promise<LearnerTodo[]> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as LearnerTodo);
  },

  subscribeToTodos(
    userId: string,
    callback: (todos: LearnerTodo[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map((d) => d.data() as LearnerTodo);
      callback(todos);
    });
  },

  async updateTodo(
    todoId: string,
    updates: Partial<Pick<LearnerTodo, 'completed' | 'title' | 'description' | 'priority' | 'dueDate' | 'category' | 'completedAt'>>
  ): Promise<void> {
    const ref = doc(db, COLLECTION, todoId);
    if (updates.completed !== undefined && updates.completed) {
      (updates as any).completedAt = new Date().toISOString();
    }
    await updateDoc(ref, updates as Record<string, unknown>);
  },

  async deleteTodo(todoId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, todoId));
  },
};
