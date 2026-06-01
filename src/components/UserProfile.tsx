import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Upload,
  Shield,
  GraduationCap,
  BookOpen,
  Bell,
  Lock,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import firebaseApiService from '@/services/firebaseApi';
import { uploadProfilePicture } from '@/utils/uploadHandler';
import UserAvatar from './UserAvatar';
import { format } from 'date-fns';

interface UserProfileProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose, isModal = false }) => {
  const { user, updateUser, updatePassword, updateEmailAddress } = useAuth();
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailData, setEmailData] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: ''
  });
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    identityNumber: user?.identityNumber || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || '',
    github: user?.github || '',
    timezone: user?.timezone || 'UTC',
    language: user?.language || 'en',
    notifications: {
      email: user?.notifications?.email ?? true,
      push: user?.notifications?.push ?? true,
      sms: user?.notifications?.sms ?? false,
      marketing: user?.notifications?.marketing ?? false
    },
    privacy: {
      profileVisibility: user?.privacy?.profileVisibility || 'public',
      showEmail: user?.privacy?.showEmail ?? true,
      showPhone: user?.privacy?.showPhone ?? false,
      showLocation: user?.privacy?.showLocation ?? true
    }
  });

  // Only initialize profileData when user first loads or user ID changes
  // This prevents overwriting user input when user object updates during editing
  const lastUserId = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Only initialize on mount or when user ID actually changes
    if (user && (isInitialMount.current || user.id !== lastUserId.current)) {
      // Don't reset if user is currently editing (unless it's the initial mount)
      // Check isEditing from ref to avoid dependency issues
      const currentlyEditing = isEditing;
      if (!currentlyEditing || isInitialMount.current) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        identityNumber: user.identityNumber || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        github: user.github || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
        notifications: {
          email: user.notifications?.email ?? true,
          push: user.notifications?.push ?? true,
          sms: user.notifications?.sms ?? false,
          marketing: user.notifications?.marketing ?? false
        },
        privacy: {
          profileVisibility: user.privacy?.profileVisibility || 'public',
          showEmail: user.privacy?.showEmail ?? true,
          showPhone: user.privacy?.showPhone ?? false,
          showLocation: user.privacy?.showLocation ?? true
        }
      });
      setProfileImage(user.avatar || null);
    }
      lastUserId.current = user.id;
      isInitialMount.current = false;
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-renders

  // Validation functions - memoized to prevent unnecessary re-renders
  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return `${field} is required`;
        if (value.length < 2) return `${field} must be at least 2 characters`;
        if (value.length > 50) return `${field} must be less than 50 characters`;
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'bio':
        if (value.length > 500) return 'Bio must be less than 500 characters';
        return '';
      case 'website':
      case 'linkedin':
      case 'twitter':
      case 'github':
        if (value && !value.match(/^https?:\/\/.+/)) {
          return 'Please enter a valid URL starting with http:// or https://';
        }
        return '';
      default:
        return '';
    }
  }, []);

  // Use ref to prevent updateUser from causing re-renders during typing
  const handleAutoSave = useCallback(async () => {
    if (!user || !hasUnsavedChanges) return;
    
    try {
      // Get current profileData from state using a function
      setProfileData(currentData => {
        const updatedData = {
          ...currentData,
          avatar: profileImage,
          updatedAt: new Date().toISOString()
        };

        // Fire and forget - don't wait for this to complete
        firebaseApiService.users.update(user.id, updatedData).then(() => {
          // Only update user context if not currently typing to avoid re-renders
          if (!isTypingRef.current && updateUser) {
            updateUser(updatedData);
          }
          setHasUnsavedChanges(false);
          setSuccessMessage('Changes saved automatically');
          setTimeout(() => setSuccessMessage(''), 3000);
        }).catch(error => {
          console.error('Auto-save failed:', error);
        });

        return currentData; // Return unchanged to avoid re-render
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [user, profileImage, updateUser]);

  // Simple handleInputChange like RegistrationForm - no complex focus restoration
  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
        const parentData = prev[parent as keyof typeof prev] as any;
        return {
        ...prev,
        [parent]: {
            ...parentData,
          [child]: value
        }
        };
    } else {
        return {
        ...prev,
        [field]: value
        };
      }
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Auto-save for certain fields after 2 seconds of inactivity
    if (['bio', 'location', 'website', 'linkedin', 'twitter', 'github'].includes(field)) {
      setAutoSaveTimeout(prev => {
        if (prev) {
          clearTimeout(prev);
      }
        return setTimeout(() => {
        handleAutoSave();
      }, 2000);
      });
    }
  };


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Clear previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    setIsLoading(true);
    try {
      // Upload to Firebase Storage (validation is handled in uploadProfilePicture)
      const { url } = await uploadProfilePicture(file, user.id);
      
      setProfileImage(url);
      // Update user profile with new image URL
      if (updateUser) {
        updateUser({ avatar: url });
      }
      
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log('Profile picture uploaded successfully:', url);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      setErrors({ image: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate all fields before saving
    const validationErrors: Record<string, string> = {};
    Object.keys(profileData).forEach(field => {
      if (typeof profileData[field as keyof typeof profileData] === 'string') {
        const error = validateField(field, profileData[field as keyof typeof profileData] as string);
        if (error) {
          validationErrors[field] = error;
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        ...profileData,
        avatar: profileImage || user?.avatar, // Use current image or existing avatar
        updatedAt: new Date().toISOString()
      };

      // Update user profile in Firebase
      const response = await firebaseApiService.users.update(user.id, updatedData);
      
      if (response.success) {
        // Update local user context
        if (updateUser) {
          updateUser(updatedData);
        }
        setIsEditing(false);
        setHasUnsavedChanges(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Error updating profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrors({ password: 'All password fields are required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ password: 'New password must be at least 6 characters' });
      return;
    }

    setIsChangingPassword(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.password;
      return newErrors;
    });
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.message || 'Failed to change password. Please check your current password.';
      setErrors({ password: errorMessage });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailData.currentPassword || !emailData.newEmail || !emailData.confirmEmail) {
      setErrors({ emailChange: 'All fields are required' });
      return;
    }

    if (emailData.newEmail !== emailData.confirmEmail) {
      setErrors({ emailChange: 'Email addresses do not match' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setErrors({ emailChange: 'Please enter a valid email address' });
      return;
    }

    setIsChangingEmail(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.emailChange;
      return newErrors;
    });

    try {
      await updateEmailAddress(emailData.currentPassword, emailData.newEmail);
      if (updateUser) {
        updateUser({ email: emailData.newEmail });
      }
      setProfileData(prev => ({ ...prev, email: emailData.newEmail }));
      setSuccessMessage('Email updated successfully!');
      setEmailData({
        currentPassword: '',
        newEmail: '',
        confirmEmail: ''
      });
      setShowEmailChange(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Error changing email:', error);
      const errorMessage = error?.message || 'Failed to update email. Please check your password.';
      setErrors({ emailChange: errorMessage });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        github: user.github || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
        notifications: {
          email: user.notifications?.email ?? true,
          push: user.notifications?.push ?? true,
          sms: user.notifications?.sms ?? false,
          marketing: user.notifications?.marketing ?? false
        },
        privacy: {
          profileVisibility: user.privacy?.profileVisibility || 'public',
          showEmail: user.privacy?.showEmail ?? true,
          showPhone: user.privacy?.showPhone ?? false,
          showLocation: user.privacy?.showLocation ?? true
        }
      });
      setProfileImage(user.avatar || null);
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setErrors({});
    setSuccessMessage('');
    
    // Clear auto-save timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'instructor': return <GraduationCap className="w-4 h-4" />;
      case 'learner': return <BookOpen className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'learner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const ProfileHeader = () => (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b">
      <div className="flex items-start space-x-5">
        <div className="relative group">
        <div className="relative">
          <UserAvatar 
            user={{
              avatar: profileImage || undefined,
              firstName: user.firstName,
              lastName: user.lastName
            }} 
            size="xl" 
              className="ring-2 ring-offset-2 ring-offset-background ring-primary/20"
          />
          {isEditing && (
              <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2.5 cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-110 z-10">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          )}
        </div>
        </div>
        <div className="flex-1 pt-1">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {user.firstName} {user.lastName}
          </h2>
          {errors.image && (
            <div className="mt-2 mb-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.image}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`${getRoleColor(user.role)} px-3 py-1 text-sm font-medium`}>
              {getRoleIcon(user.role)}
              <span className="ml-1.5 capitalize">{user.role}</span>
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1.5" />
              Member since {format(new Date(user.createdAt || new Date()), 'MMM yyyy')}
          </div>
        </div>
      </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        {/* Status indicators */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Unsaved changes
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            {successMessage}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                disabled={isSaving}
                className="min-w-[100px]"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || Object.keys(errors).length > 0}
                className="min-w-[140px] bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const content = (
    <Card className="w-full shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <ProfileHeader />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full">
            {(() => {
              // Inline BasicInfoTab JSX to prevent React from recreating it on every render
              return (
                <div className="space-y-8">
                  {/* Error message */}
                  {errors.general && (
                    <Alert variant="destructive" className="border-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium">
                          <User className="w-4 h-4 text-muted-foreground" />
                          First Name
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          onBlur={(e) => {
                            const error = validateField('firstName', e.target.value);
                            if (error) {
                              setErrors(prev => ({ ...prev, firstName: error }));
                            }
                          }}
                          disabled={!isEditing}
                          className={`h-11 ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder="Enter your first name"
                          autoComplete="given-name"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium">
                          <User className="w-4 h-4 text-muted-foreground" />
                          Last Name
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          onBlur={(e) => {
                            const error = validateField('lastName', e.target.value);
                            if (error) {
                              setErrors(prev => ({ ...prev, lastName: error }));
                            }
                          }}
                          disabled={!isEditing}
                          className={`h-11 ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder="Enter your last name"
                          autoComplete="family-name"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Mail className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        readOnly
                        disabled
                        className="h-11 bg-muted/20 text-muted-foreground"
                        placeholder="Enter your email address"
                        autoComplete="email"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use the <span className="font-semibold">Change Email</span> section below to update your login email.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={(e) => {
                          const error = validateField('phone', e.target.value);
                          if (error) {
                            setErrors(prev => ({ ...prev, phone: error }));
                          }
                        }}
                        disabled={!isEditing}
                        className={`h-11 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identityNumber" className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        Identity Number (ID NO)
                      </Label>
                      <Input
                        id="identityNumber"
                        type="text"
                        value={profileData.identityNumber}
                        onChange={(e) => handleInputChange('identityNumber', e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                        placeholder="e.g. 9001015009087"
                        autoComplete="off"
                      />
                      <p className="text-xs text-muted-foreground">
                        Used on your certificate under <span className="font-semibold">ID NO</span>.
                      </p>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Info className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center justify-between text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          Bio
                        </div>
                        <span className={`text-xs font-normal ${profileData.bio.length > 450 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {profileData.bio.length}/500
                        </span>
                      </Label>
                      <Textarea
                        ref={bioTextareaRef}
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleInputChange('bio', newValue);
                          if (bioTextareaRef.current) {
                            bioTextareaRef.current.style.height = 'auto';
                            bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                          }
                        }}
                        onBlur={(e) => {
                          const error = validateField('bio', e.target.value);
                          if (error) {
                            setErrors(prev => ({ ...prev, bio: error }));
                          }
                        }}
                        disabled={!isEditing}
                        rows={4}
                        className={`resize-none min-h-[100px] ${errors.bio ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.bio}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                        <Info className="w-3.5 h-3.5" />
                        This will be visible on your public profile
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        onBlur={(e) => {
                          const error = validateField('location', e.target.value);
                          if (error) {
                            setErrors(prev => ({ ...prev, location: error }));
                          }
                        }}
                        disabled={!isEditing}
                        className={`h-11 ${errors.location ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        placeholder="City, Country (e.g., New York, USA)"
                        autoComplete="address-level2"
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Change Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Email</h3>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowEmailChange(!showEmailChange);
                          setEmailData({
                            currentPassword: '',
                            newEmail: '',
                            confirmEmail: ''
                          });
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.emailChange;
                            return newErrors;
                          });
                        }}
                      >
                        {showEmailChange ? 'Cancel' : 'Change Email'}
                      </Button>
                    </div>

                    {showEmailChange && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        {errors.emailChange && (
                          <Alert variant="destructive" className="border-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">{errors.emailChange}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="newEmail" className="flex items-center gap-2 text-sm font-medium">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            New Email
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="newEmail"
                            type="email"
                            value={emailData.newEmail}
                            onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                            className="h-11"
                            placeholder="Enter your new email address"
                            autoComplete="email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmEmail" className="flex items-center gap-2 text-sm font-medium">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Confirm New Email
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="confirmEmail"
                            type="email"
                            value={emailData.confirmEmail}
                            onChange={(e) => setEmailData(prev => ({ ...prev, confirmEmail: e.target.value }))}
                            className="h-11"
                            placeholder="Confirm your new email address"
                            autoComplete="email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emailPassword" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            Current Password
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="emailPassword"
                            type="password"
                            value={emailData.currentPassword}
                            onChange={(e) => setEmailData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="h-11"
                            placeholder="Enter your current password to verify"
                            autoComplete="current-password"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={handleEmailChange}
                          disabled={isChangingEmail}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          {isChangingEmail ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating Email...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Update Email
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Password Change Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Password</h3>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPasswordChange(!showPasswordChange);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.password;
                            return newErrors;
                          });
                        }}
                      >
                        {showPasswordChange ? 'Cancel' : 'Change Password'}
                      </Button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        {errors.password && (
                          <Alert variant="destructive" className="border-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">{errors.password}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            Current Password
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="h-11"
                            placeholder="Enter your current password"
                            autoComplete="current-password"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            New Password
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="h-11"
                            placeholder="Enter your new password (min 6 characters)"
                            autoComplete="new-password"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            Confirm New Password
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="h-11"
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={isChangingPassword}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </div>
      </CardContent>
    </Card>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {content}
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="mt-4 w-full"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return content;
};

export default UserProfile;
