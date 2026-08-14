import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions as firebaseFunctions } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  phone?: string;
  identityNumber?: string; // National ID / ID NO on certificates
  joinDate: string;
  lastActive: string;
  isActive: boolean;
  // Student specific fields
  enrolledCourses?: string[];
  completedCourses?: string[];
  progress?: number;
  currentGrade?: string;
  // Instructor specific fields
  specialization?: string[];
  qualifications?: string[];
  setaRegistration?: string;
  qctoRegistration?: string;
  assignedLearners?: string[]; // Array of learner IDs assigned to this instructor
  // Admin specific fields
  permissions?: string[];
}

type FirestoreUserRecord = UserProfile & {
  id?: string;
  userType?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  Email?: string;
  userEmail?: string;
};

function normalizeStoredRole(role?: string): UserProfile['role'] | '' {
  const value = String(role || '').toLowerCase().trim().replace(/[_ ]+/g, '-');
  if (
    value === 'admin' ||
    value === 'administrator' ||
    value === 'super-admin' ||
    value === 'superadmin' ||
    value === 'sub-admin' ||
    value === 'subadmin' ||
    value === 'owner'
  ) {
    return 'admin';
  }
  if (value === 'instructor' || value === 'teacher' || value === 'tutor') return 'instructor';
  if (value === 'student' || value === 'learner') return 'student';
  return '';
}

function isPlaceholderName(value: string): boolean {
  const n = value.trim().toLowerCase();
  return !n || ['user', 'u', 'unknown', 'unknown user', 'n/a', 'na', 'test'].includes(n);
}

function splitName(data: Partial<FirestoreUserRecord>, authDisplayName?: string): { firstName: string; lastName: string } {
  const firstName = String(
    data.firstName || (data as { first_name?: string }).first_name || ''
  ).trim();
  const lastName = String(
    data.lastName || (data as { last_name?: string }).last_name || ''
  ).trim();
  if (firstName || lastName) {
    return { firstName, lastName };
  }
  const combined = String(data.name || data.fullName || data.displayName || authDisplayName || '').trim();
  if (!combined) return { firstName: '', lastName: '' };
  const parts = combined.split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

function profileRole(data: Partial<FirestoreUserRecord> | undefined): UserProfile['role'] | '' {
  if (!data) return '';
  return normalizeStoredRole(
    data.role ||
      data.userType ||
      (data as { userRole?: string }).userRole ||
      (data as { accountType?: string }).accountType ||
      (data as { type?: string }).type
  );
}

function isCompleteProfile(data: Partial<FirestoreUserRecord> | undefined, authDisplayName?: string): boolean {
  if (!data) return false;
  const role = profileRole(data);
  if (!role) return false;
  const { firstName, lastName } = splitName(data, authDisplayName);
  const full = `${firstName} ${lastName}`.trim();
  return Boolean((firstName || lastName) && !isPlaceholderName(full) && !isPlaceholderName(firstName));
}

function pickBestProfile(
  candidates: Array<{ id: string; data: FirestoreUserRecord } | null | undefined>,
  authDisplayName?: string
): { id: string; data: FirestoreUserRecord } | null {
  const usable = candidates.filter(
    (item): item is { id: string; data: FirestoreUserRecord } =>
      Boolean(item) && Boolean(profileRole(item!.data))
  );
  const named = usable.filter((item) => isCompleteProfile(item.data, authDisplayName));
  return (
    named.find((item) => profileRole(item.data) === 'admin') ||
    named[0] ||
    usable.find((item) => profileRole(item.data) === 'admin') ||
    usable[0] ||
    null
  );
}

function toUserProfile(
  uid: string,
  email: string,
  data: FirestoreUserRecord,
  authDisplayName?: string
): UserProfile {
  const role = profileRole(data);
  const { firstName, lastName } = splitName(data, authDisplayName);
  return {
    ...data,
    uid,
    email: data.email || email,
    firstName,
    lastName,
    role: role as UserProfile['role'],
    isActive: data.isActive !== false,
    joinDate: data.joinDate || new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
}

async function findProfileByEmail(
  email: string,
  authDisplayName?: string
): Promise<{ id: string; data: FirestoreUserRecord } | null> {
  const trimmed = email.trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized) return null;
  const usersRef = collection(db, 'users');
  const unique = new Map<string, FirestoreUserRecord>();
  for (const value of [...new Set([trimmed, normalized])]) {
    const snap = await getDocs(query(usersRef, where('email', '==', value)));
    for (const item of snap.docs) {
      unique.set(item.id, { id: item.id, ...(item.data() as FirestoreUserRecord) });
    }
  }
  return pickBestProfile(
    [...unique.entries()].map(([id, data]) => ({ id, data })),
    authDisplayName
  );
}

async function findCompleteProfile(
  q: ReturnType<typeof query>,
  authDisplayName?: string
): Promise<{ id: string; data: FirestoreUserRecord } | null> {
  const snap = await getDocs(q);
  return pickBestProfile(
    snap.docs.map((item) => ({ id: item.id, data: { id: item.id, ...(item.data() as FirestoreUserRecord) } })),
    authDisplayName
  );
}

/** Load the real account for this Auth user — never an empty stub. */
async function resolveAuthUserProfile(user: User): Promise<UserProfile | null> {
  const email = user.email || '';
  const uidRef = doc(db, 'users', user.uid);
  let uidData: FirestoreUserRecord | undefined;
  try {
    const uidSnap = await getDoc(uidRef);
    if (uidSnap.exists()) {
      uidData = { id: user.uid, ...(uidSnap.data() as FirestoreUserRecord) };
    }
  } catch (error) {
    console.error('Could not read users/' + user.uid, error);
  }

  // The signed-in Auth UID document wins whenever it has a real role.
  // Never replace a learner/instructor with a different admin profile.
  if (uidData && profileRole(uidData)) {
    return toUserProfile(user.uid, email, uidData, user.displayName);
  }

  const candidates: Array<{ id: string; data: FirestoreUserRecord } | null> = [];
  try {
    candidates.push(
      await findCompleteProfile(
        query(collection(db, 'users'), where('uid', '==', user.uid)),
        user.displayName
      )
    );
  } catch (error) {
    console.error('Could not look up profile by uid field', error);
  }
  try {
    if (email) {
      candidates.push(await findProfileByEmail(email, user.displayName));
    }
  } catch (error) {
    console.error('Could not look up profile by email', error);
  }

  const match = pickBestProfile(candidates, user.displayName);
  if (!match || !profileRole(match.data)) return null;

  const restored = toUserProfile(user.uid, email, match.data, user.displayName);
  try {
    await setDoc(
      uidRef,
      {
        ...match.data,
        id: user.uid,
        uid: user.uid,
        email: email || match.data.email,
        role: restored.role,
        firstName: restored.firstName,
        lastName: restored.lastName,
        lastActive: restored.lastActive,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Could not restore profile onto users/' + user.uid, error);
  }
  return restored;
}

export class AuthService {
  // Sign up new user
  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'student' | 'instructor' | 'admin',
    identityNumber?: string
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        role,
        identityNumber: identityNumber || '',
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isActive: true,
        ...(role === 'student' && {
          enrolledCourses: [],
          completedCourses: [],
          progress: 0,
          currentGrade: 'N/A'
        }),
        ...(role === 'instructor' && {
          specialization: [],
          qualifications: [],
          setaRegistration: '',
          qctoRegistration: ''
        }),
        ...(role === 'admin' && {
          permissions: ['read', 'write', 'delete', 'manage_users']
        })
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const profile = await resolveAuthUserProfile(user);
      if (!profile) {
        await signOut(auth);
        throw new Error('No complete profile found for this account. Please contact an administrator.');
      }
      return profile;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      return await resolveAuthUserProfile(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      const requestResetEmail = httpsCallable<
        { email: string },
        { success: boolean }
      >(firebaseFunctions, 'requestPasswordResetEmail');
      await requestResetEmail({ email: email.trim() });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Update password
  static async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  static async updateEmailAddress(currentPassword: string, newEmail: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: newEmail,
          lastActive: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error updating email address:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get user by role
  static async getUsersByRole(role: 'student' | 'instructor' | 'admin'): Promise<UserProfile[]> {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }
}
