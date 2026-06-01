import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export interface EnrollmentEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  course: string;
  message: string;
  fileUrl?: string;
  cvFileName?: string;
  qualificationsFileUrl?: string;
  qualificationsFileName?: string;
}

export interface ConfirmationEmailData {
  studentEmail: string;
  studentName: string;
  courseInterest: string;
}

export interface RPLApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  currentRole: string;
  company: string;
  yearsExperience: string;
  previousQualifications: string;
  motivation: string;
  preferredContact: string;
  availability: string;
}

export interface AssessmentBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assessmentType: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export interface JobApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  closingDate: string;
  cvFileUrl?: string;
  cvFileName?: string;
}

class EmailService {
  private functions = getFunctions();

  /**
   * Send enrollment notification email to admin
   */
  async sendEnrollmentEmail(formData: EnrollmentEmailData): Promise<{ success: boolean; message: string }> {
    try {
      const sendEnrollmentEmail = httpsCallable(this.functions, 'sendEnrollmentEmail');
      const result = await sendEnrollmentEmail(formData);
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending enrollment email:', error);
      throw new Error('Failed to send enrollment email');
    }
  }

  /**
   * Send confirmation email to student
   */
  async sendStudentConfirmation(data: ConfirmationEmailData): Promise<{ success: boolean; message: string }> {
    try {
      const sendStudentConfirmation = httpsCallable(this.functions, 'sendStudentConfirmation');
      const result = await sendStudentConfirmation(data);
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending student confirmation:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  /**
   * Send both admin notification and student confirmation
   */
  async sendEnrollmentEmails(formData: EnrollmentEmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Send admin notification
      await this.sendEnrollmentEmail(formData);
      
      // Send student confirmation
      await this.sendStudentConfirmation({
        studentEmail: formData.email,
        studentName: `${formData.firstName} ${formData.lastName}`,
        courseInterest: formData.course
      });

      return {
        success: true,
        message: 'Enrollment emails sent successfully'
      };
    } catch (error) {
      console.error('Error sending enrollment emails:', error);
      throw new Error('Failed to send enrollment emails');
    }
  }

  /**
   * Send RPL application to admin
   */
  async sendRPLApplication(data: RPLApplicationData): Promise<{ success: boolean; message: string }> {
    try {
      const sendRPLApplication = httpsCallable(this.functions, 'sendRPLApplication');
      const result = await sendRPLApplication(data);
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending RPL application:', error);
      throw new Error('Failed to send RPL application');
    }
  }

  /**
   * Send assessment booking to admin
   */
  async sendAssessmentBooking(data: AssessmentBookingData): Promise<{ success: boolean; message: string }> {
    try {
      const sendAssessmentBooking = httpsCallable(this.functions, 'sendAssessmentBooking');
      const result = await sendAssessmentBooking(data);
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending assessment booking:', error);
      throw new Error('Failed to send assessment booking');
    }
  }

  /**
   * Send job application to admin
   */
  async sendJobApplication(data: JobApplicationData): Promise<{ success: boolean; message: string }> {
    try {
      const sendJobApplication = httpsCallable(this.functions, 'sendJobApplication');
      const result = await sendJobApplication(data);
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending job application:', error);
      throw new Error('Failed to send job application');
    }
  }
}

export const emailService = new EmailService();
