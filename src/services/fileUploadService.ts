import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'powerpoint' | 'document';
  url: string;
  size: number;
  storagePath: string;
}

export class FileUploadService {
  /**
   * Upload a file to Firebase Storage
   */
  static async uploadFile(
    file: File, 
    courseId: string, 
    lessonId: string
  ): Promise<UploadedFile> {
    try {
      console.log('📤 Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        courseId,
        lessonId
      });
      
      // Create a unique file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storagePath = `courses/${courseId}/lessons/${lessonId}/${fileName}`;
      
      console.log('📁 Storage path:', storagePath);
      
      // Create a reference to the file
      const fileRef = ref(storage, storagePath);
      console.log('✅ Storage reference created');
      
      // Upload the file
      console.log('⏫ Uploading file to Firebase Storage...');
      const snapshot = await uploadBytes(fileRef, file);
      console.log('✅ File uploaded successfully');
      
      // Get the download URL
      console.log('🔗 Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);
      
      // Determine file type
      const fileType = file.type.includes('pdf') ? 'pdf' : 
                     file.type.includes('powerpoint') || file.type.includes('presentation') ? 'powerpoint' : 
                     'document';
      
      const uploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: downloadURL,
        size: file.size,
        storagePath: storagePath
      };
      
      console.log('✅ File upload completed:', uploadedFile);
      
      return uploadedFile;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files to Firebase Storage
   */
  static async uploadFiles(
    files: File[], 
    courseId: string, 
    lessonId: string
  ): Promise<UploadedFile[]> {
    try {
      console.log(`📤 Starting batch upload of ${files.length} files`);
      const uploadPromises = files.map(file => this.uploadFile(file, courseId, lessonId));
      const results = await Promise.all(uploadPromises);
      console.log(`✅ Batch upload completed: ${results.length} files uploaded`);
      return results;
    } catch (error) {
      console.error('❌ Error uploading files:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload CV file for job applications to Firebase Storage
   */
  static async uploadCVFile(
    file: File, 
    studentId: string, 
    courseId: string,
    moduleId: string
  ): Promise<UploadedFile> {
    try {
      console.log('📤 Starting CV file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        studentId,
        courseId,
        moduleId
      });
      
      // Create a unique file path for CV submissions
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storagePath = `poe/${studentId}/${courseId}/${moduleId}/${fileName}`;
      
      console.log('📁 CV Storage path:', storagePath);
      
      // Create a reference to the file
      const fileRef = ref(storage, storagePath);
      console.log('✅ CV Storage reference created');
      
      // Upload the file
      console.log('⏫ Uploading CV file to Firebase Storage...');
      const snapshot = await uploadBytes(fileRef, file);
      console.log('✅ CV File uploaded successfully');
      
      // Get the download URL
      console.log('🔗 Getting CV download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ CV Download URL obtained:', downloadURL);
      
      // Determine file type
      const fileType = file.type.includes('pdf') ? 'pdf' : 
                     file.type.includes('powerpoint') || file.type.includes('presentation') ? 'powerpoint' : 
                     file.type.includes('word') || file.type.includes('document') ? 'document' :
                     file.type.includes('image') ? 'image' :
                     'file';
      
      const uploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: downloadURL,
        size: file.size,
        storagePath: storagePath
      };
      
      console.log('✅ CV File upload completed:', uploadedFile);
      return uploadedFile;
    } catch (error) {
      console.error('❌ Error uploading CV file:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to upload CV file: ${error.message}`);
    }
  }

  /**
   * Upload POE (Portfolio of Evidence) file to Firebase Storage
   */
  static async uploadPOEFile(
    file: File, 
    studentId: string, 
    courseId: string,
    moduleId: string
  ): Promise<UploadedFile> {
    try {
      console.log('📤 Starting POE file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        studentId,
        courseId,
        moduleId
      });
      
      // Create a unique file path for POE submissions
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storagePath = `poe/${studentId}/${courseId}/${moduleId}/${fileName}`;
      
      console.log('📁 POE Storage path:', storagePath);
      
      // Create a reference to the file
      const fileRef = ref(storage, storagePath);
      console.log('✅ POE Storage reference created');
      
      // Upload the file
      console.log('⏫ Uploading POE file to Firebase Storage...');
      const snapshot = await uploadBytes(fileRef, file);
      console.log('✅ POE File uploaded successfully');
      
      // Get the download URL
      console.log('🔗 Getting POE download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ POE Download URL obtained:', downloadURL);
      
      // Determine file type
      const fileType = file.type.includes('pdf') ? 'pdf' : 
                     file.type.includes('powerpoint') || file.type.includes('presentation') ? 'powerpoint' : 
                     file.type.includes('word') || file.type.includes('document') ? 'document' :
                     file.type.includes('image') ? 'image' :
                     'file';
      
      const uploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: downloadURL,
        size: file.size,
        storagePath: storagePath
      };
      
      console.log('✅ POE File upload completed:', uploadedFile);
      
      return uploadedFile;
    } catch (error) {
      console.error('❌ Error uploading POE file:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw new Error(`Failed to upload POE file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload assessment submission file to Firebase Storage
   */
  static async uploadAssessmentSubmissionFile(
    file: File, 
    studentId: string, 
    courseId: string,
    assessmentId: string
  ): Promise<UploadedFile> {
    try {
      console.log('📤 Starting assessment submission file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        studentId,
        courseId,
        assessmentId
      });
      
      // Create a unique file path for assessment submissions
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storagePath = `assessments/${courseId}/${assessmentId}/submissions/${studentId}/${fileName}`;
      
      console.log('📁 Assessment submission storage path:', storagePath);
      
      // Create a reference to the file
      const fileRef = ref(storage, storagePath);
      console.log('✅ Assessment submission storage reference created');
      
      // Upload the file
      console.log('⏫ Uploading assessment submission file to Firebase Storage...');
      const snapshot = await uploadBytes(fileRef, file);
      console.log('✅ Assessment submission file uploaded successfully');
      
      // Get the download URL
      console.log('🔗 Getting assessment submission download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Assessment submission download URL obtained:', downloadURL);
      
      // Determine file type
      const fileType = file.type.includes('pdf') ? 'pdf' : 
                     file.type.includes('powerpoint') || file.type.includes('presentation') ? 'powerpoint' : 
                     file.type.includes('word') || file.type.includes('document') ? 'document' :
                     file.type.includes('image') ? 'image' :
                     file.type.includes('text') ? 'document' :
                     'file';
      
      const uploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: downloadURL,
        size: file.size,
        storagePath: storagePath
      };
      
      console.log('✅ Assessment submission file upload completed:', uploadedFile);
      
      return uploadedFile;
    } catch (error) {
      console.error('❌ Error uploading assessment submission file:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw new Error(`Failed to upload assessment submission file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload marked document for POE to Firebase Storage
   */
  static async uploadMarkedDocument(
    file: File, 
    studentId: string, 
    courseId: string,
    assessmentId: string,
    submissionId: string
  ): Promise<UploadedFile> {
    try {
      console.log('📤 Starting marked document upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        studentId,
        courseId,
        assessmentId,
        submissionId
      });
      
      // Create a unique file path for marked documents
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storagePath = `assessments/${courseId}/${assessmentId}/submissions/${studentId}/marked/${fileName}`;
      
      console.log('📁 Marked document storage path:', storagePath);
      
      // Create a reference to the file
      const fileRef = ref(storage, storagePath);
      console.log('✅ Marked document storage reference created');
      
      // Upload the file
      console.log('⏫ Uploading marked document to Firebase Storage...');
      const snapshot = await uploadBytes(fileRef, file);
      console.log('✅ Marked document uploaded successfully');
      
      // Get the download URL
      console.log('🔗 Getting marked document download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Marked document download URL obtained:', downloadURL);
      
      // Determine file type
      const fileType = file.type.includes('pdf') ? 'pdf' : 
                     file.type.includes('powerpoint') || file.type.includes('presentation') ? 'powerpoint' : 
                     file.type.includes('word') || file.type.includes('document') ? 'document' :
                     file.type.includes('image') ? 'image' :
                     file.type.includes('text') ? 'document' :
                     'file';
      
      const uploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: downloadURL,
        size: file.size,
        storagePath: storagePath
      };
      
      console.log('✅ Marked document upload completed:', uploadedFile);
      
      return uploadedFile;
    } catch (error) {
      console.error('❌ Error uploading marked document:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw new Error(`Failed to upload marked document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  static async deleteFile(storagePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon
   */
  static getFileTypeIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return 'text-red-500';
      case 'powerpoint':
        return 'text-orange-500';
      case 'document':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }
}
