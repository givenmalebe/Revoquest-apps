// Cloudinary configuration for browser use
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || '';

function assertCloudinaryConfigured(): void {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env'
    );
  }
}

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

export class CloudinaryService {
  /**
   * Upload a profile picture to Cloudinary using the Upload API
   */
  static async uploadProfilePicture(
    file: File, 
    userId: string
  ): Promise<UploadResult> {
    try {
      assertCloudinaryConfigured();
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

      // Convert file to base64 for upload
      const base64 = await this.fileToBase64(file);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', `data:${file.type};base64,${base64}`);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'revoquest/profile-pictures');
      formData.append('public_id', `profile-${userId}-${Date.now()}`);
      formData.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto');

      // Upload to Cloudinary using the Upload API
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Profile picture uploaded successfully to Cloudinary:', result);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        secureUrl: result.secure_url
      };
    } catch (error) {
      console.error('Error uploading profile picture to Cloudinary:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload profile picture');
    }
  }

  /**
   * Delete a profile picture from Cloudinary
   * Note: This requires server-side implementation for security
   */
  static async deleteProfilePicture(publicId: string): Promise<void> {
    try {
      // Note: Deletion requires server-side API key for security
      // For now, we'll just log the request
      console.log('Profile picture deletion requested for:', publicId);
      console.log('Note: Actual deletion requires server-side implementation');
    } catch (error) {
      console.error('Error deleting profile picture from Cloudinary:', error);
      throw new Error('Failed to delete profile picture');
    }
  }

  /**
   * Convert file to base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Upload any file to Cloudinary
   */
  static async uploadFile(
    file: File, 
    folder: string = 'revoquest/files'
  ): Promise<UploadResult> {
    try {
      assertCloudinaryConfigured();
      const base64 = await this.fileToBase64(file);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', `data:${file.type};base64,${base64}`);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folder);
      formData.append('public_id', `${folder.replace('/', '-')}-${Date.now()}`);

      // Upload to Cloudinary using the Upload API
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        url: result.secure_url,
        publicId: result.public_id,
        secureUrl: result.secure_url
      };
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload an image to Cloudinary (alias for uploadFile)
   */
  static async uploadImage(file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      const result = await this.uploadFile(file, 'revoquest/course-thumbnails');
      return result.secureUrl;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Create a local data URL from file (fallback when Cloudinary is not configured)
   */
  static async createLocalDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

export default CloudinaryService;
