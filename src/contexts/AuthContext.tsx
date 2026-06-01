import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, UserProfile } from '../firebase/auth';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'instructor' | 'learner';
  avatar?: string;
  phone?: string;
  identityNumber?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  timezone?: string;
  language?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive?: boolean;
  isEmailVerified?: boolean;
  enrolledCourses?: string[];
  completedLessons?: Array<{
    lesson: string;
    completedAt: string;
    score?: number;
  }>;
  certificates?: string[];
  badges?: Array<{
    name: string;
    description: string;
    earnedAt: string;
    icon: string;
  }>;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy?: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    timezone: string;
  };
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  // Student specific fields
  progress?: number;
  currentGrade?: string;
  // Instructor specific fields
  specialization?: string[];
  qualifications?: string[];
  setaRegistration?: string;
  qctoRegistration?: string;
  // Admin specific fields
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'learner' | 'instructor' | 'admin';
  }) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateEmailAddress: (currentPassword: string, newEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to convert UserProfile to User
const convertUserProfileToUser = (profile: UserProfile): User => ({
  id: profile.uid,
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  role: profile.role === 'student' ? 'learner' : profile.role,
  avatar: profile.avatar,
  phone: profile.phone,
  identityNumber: profile.identityNumber,
  isActive: profile.isActive,
  isEmailVerified: true, // Firebase handles email verification
  enrolledCourses: profile.enrolledCourses,
  completedLessons: profile.completedCourses?.map(courseId => ({
    lesson: courseId,
    completedAt: new Date().toISOString(),
    score: 100
  })),
  certificates: [],
  badges: [],
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    language: 'en',
    timezone: 'UTC'
  },
  createdAt: profile.joinDate,
  updatedAt: profile.lastActive,
  lastLogin: profile.lastActive,
  progress: profile.progress,
  currentGrade: profile.currentGrade,
  specialization: profile.specialization,
  qualifications: profile.qualifications,
  setaRegistration: profile.setaRegistration,
  qctoRegistration: profile.qctoRegistration,
  permissions: profile.permissions
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await AuthService.getCurrentUserProfile();
          if (userProfile) {
            setUser(convertUserProfileToUser(userProfile));
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userProfile = await AuthService.signIn(email, password);
      setUser(convertUserProfileToUser(userProfile));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'learner' | 'instructor' | 'admin';
    identityNumber?: string;
  }) => {
    try {
      setIsLoading(true);
      const firebaseRole = userData.role === 'learner' ? 'student' : userData.role || 'student';
      const userProfile = await AuthService.signUp(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        firebaseRole as 'student' | 'instructor' | 'admin',
        userData.identityNumber
      );
      setUser(convertUserProfileToUser(userProfile));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectTo?: string) => {
    try {
      await AuthService.signOut();
      setUser(null);
      try {
        sessionStorage.removeItem('learner_ai_greeting_shown');
        sessionStorage.removeItem('course_page_tour_popout_shown');
      } catch {
        // ignore
      }
      window.location.href = redirectTo ?? '/lms';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      await AuthService.updateUserProfile(user.id, profileData);
      
      // Update local state
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await AuthService.updateUserPassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  const updateEmailAddress = async (currentPassword: string, newEmail: string) => {
    try {
      await AuthService.updateEmailAddress(currentPassword, newEmail);
      setUser(prev => (prev ? { ...prev, email: newEmail } : prev));
    } catch (error) {
      console.error('Update email error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    resetPassword,
    updatePassword,
    updateEmailAddress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};