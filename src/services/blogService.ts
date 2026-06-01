import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author?: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const BLOGS_COLLECTION = 'blogs';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toBlogPost(id: string, data: Record<string, unknown>): BlogPost {
  const ts = (v: unknown): string =>
    v instanceof Timestamp ? v.toDate().toISOString() : typeof v === 'string' ? v : '';
  return {
    id,
    title: (data.title as string) ?? '',
    slug: (data.slug as string) ?? '',
    content: (data.content as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    author: data.author as string | undefined,
    status: ((data.status as string) ?? 'draft') as 'draft' | 'published',
    publishedAt: data.publishedAt ? ts(data.publishedAt) : null,
    createdAt: ts(data.createdAt),
    updatedAt: ts(data.updatedAt)
  };
}

export async function createBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const data: Record<string, unknown> = {
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    author: blog.author ?? null,
    status: blog.status,
    publishedAt: blog.publishedAt ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, BLOGS_COLLECTION), data);
  return ref.id;
}

export async function getPublishedBlogs(limitCount: number = 50): Promise<BlogPost[]> {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toBlogPost(d.id, d.data()));
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where('slug', '==', slug),
    where('status', '==', 'published'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  const doc = snapshot.docs[0];
  if (!doc) return null;
  return toBlogPost(doc.id, doc.data());
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const ref = doc(db, BLOGS_COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return toBlogPost(snapshot.id, snapshot.data());
}

export { slugify };
