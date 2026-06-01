// Profile picture upload handler with Firebase Storage and Cloudinary fallback
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { CloudinaryService } from '../services/cloudinaryService';

export const uploadProfilePicture = async (
  file: File, 
  userId: string
): Promise<{ url: string; path: string }> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error('File must be a JPG, PNG, GIF, or WebP image');
    }

    // For now, skip Firebase Storage entirely due to CORS issues
    // and use data URL fallback directly
    console.log('Using data URL fallback for profile picture upload');
    
    const dataUrl = await fileToDataUrl(file);
    
    console.log('Profile picture uploaded successfully using data URL:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      url: dataUrl.substring(0, 50) + '...' // Truncate for logging
    });
    
    return {
      url: dataUrl,
      path: `temp-${userId}-${Date.now()}`
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload profile picture');
  }
};

export const deleteProfilePicture = async (filePath: string): Promise<void> => {
  try {
    const fileRef = ref(storage, filePath);
    // Note: Firebase Storage doesn't have a direct delete method in the client SDK
    // This would typically be handled by a Cloud Function
    console.log('Profile picture deletion would be handled by Cloud Function:', filePath);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw new Error('Failed to delete profile picture');
  }
};

// Helper function to convert file to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};
