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
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

const createFallbackProfile = (user: User): UserProfile => {
  const now = new Date().toISOString();
  const displayName = user.displayName?.trim() ?? '';
  const [firstNamePart, ...lastNameParts] = displayName.split(/\s+/).filter(Boolean);
  const emailPrefix = user.email?.split('@')[0] ?? 'User';

  return {
    uid: user.uid,
    email: user.email ?? '',
    firstName: firstNamePart || emailPrefix,
    lastName: lastNameParts.join(' ') || '',
    role: 'student',
    identityNumber: '',
    joinDate: now,
    lastActive: now,
    isActive: true,
    enrolledCourses: [],
    completedCourses: [],
    progress: 0,
    currentGrade: 'N/A',
  };
};

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

      const userRef = doc(db, 'users', user.uid);
      const lastActive = new Date().toISOString();

      // Update last active timestamp (creates doc if missing)
      await setDoc(
        userRef,
        {
          lastActive,
          uid: user.uid,
          email: user.email ?? undefined,
        },
        { merge: true }
      );

      // Get user profile, create fallback if it doesn't exist yet
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        return {
          ...profileData,
          uid: user.uid,
          email: user.email ?? profileData.email
        };
      }

      const fallbackProfile = createFallbackProfile(user);
      await setDoc(userRef, fallbackProfile, { merge: true });
      return fallbackProfile;
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
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        return {
          ...profileData,
          uid: user.uid,
          email: user.email ?? profileData.email
        };
      }
      return null;
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
