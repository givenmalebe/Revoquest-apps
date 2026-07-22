import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from project root or firebase-functions dir (for local emulator); deployed functions use Firebase config or env vars
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

// Force redeploy - switching to live Yoco mode - 2025-03-27

import {HttpsError, onCall, onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";

// Helper to get Firebase Runtime Config (deprecated but still works)
const getFunctionsConfig = (): Record<string, any> => {
  try {
    // @ts-ignore - functions.config() may exist at runtime
    return (global as any).functions?.config?.() ?? {};
  } catch {
    return {};
  }
};

// Email configuration — set in firebase-functions/.env (see .env.example)
const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const APP_BASE_URL = process.env.APP_BASE_URL || "https://revoquest.co.za";
const FIREBASE_AUTH_ACTION_BASE_URL =
  process.env.FIREBASE_AUTH_ACTION_BASE_URL || "https://revoquest-9e217.web.app";

// Yoco Payment — keys only from env / Firebase secrets (never hardcode)
const functionsConfig = getFunctionsConfig();
const yocoConfig = functionsConfig.yoco ?? {};

const nvidiaApiKey = defineSecret("NVIDIA_API_KEY_SECRET");

const YOCO_ENVIRONMENT = process.env.YOCO_ENVIRONMENT || yocoConfig.environment || "test";
const YOCO_TEST_SECRET_KEY = process.env.YOCO_TEST_SECRET_KEY || "";
const YOCO_LIVE_SECRET_KEY = process.env.YOCO_LIVE_SECRET_KEY || "";
const YOCO_SECRET_KEY =
  process.env.YOCO_SECRET_KEY ||
  yocoConfig.secret_key ||
  (YOCO_ENVIRONMENT === "live" ? YOCO_LIVE_SECRET_KEY : YOCO_TEST_SECRET_KEY);
const YOCO_CHECKOUT_URL = "https://payments.yoco.com/api/checkouts";

// Email configuration
const createTransporter = (user: string, pass: string) => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: user,
      pass: pass
    }
  });
};

// Interface for enrollment form data
interface EnrollmentFormData {
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

// Interface for RPL application data
interface RPLApplicationData {
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

// Interface for assessment booking data
interface AssessmentBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assessmentType: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

// Send enrollment email function
export const sendEnrollmentEmail = onCall(async (request) => {
    const formData: EnrollmentFormData = request.data;
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        logger.error('Missing required fields for enrollment email', formData);
        throw new Error('Missing required fields');
      }

      logger.info('Sending enrollment email to admin', { 
        studentEmail: formData.email, 
        studentName: `${formData.firstName} ${formData.lastName}` 
      });

      const transporter = createTransporter(EMAIL_USER, EMAIL_PASS);
      
      // Email content
      const mailOptions = {
        from: EMAIL_USER,
        to: ADMIN_EMAIL,
      subject: `New Enrollment: ${formData.firstName} ${formData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Student Enrollment</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Student Information</h3>
            <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Role:</strong> ${formData.role}</p>
            <p><strong>Course Interest:</strong> ${formData.course || 'Not specified'}</p>
          </div>
          
          ${formData.message ? `
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Additional Message</h3>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
          ` : ''}

          ${formData.fileUrl ? `
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Attached CV</h3>
            <p><strong>File Name:</strong> ${formData.cvFileName || 'CV File'}</p>
            <p><strong>File URL:</strong> <a href="${formData.fileUrl}" style="color: #1e40af;">Download CV</a></p>
          </div>
          ` : ''}

          ${formData.qualificationsFileUrl ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Attached Qualifications</h3>
            <p><strong>File Name:</strong> ${formData.qualificationsFileName || 'Qualifications File'}</p>
            <p><strong>File URL:</strong> <a href="${formData.qualificationsFileUrl}" style="color: #92400e;">Download Qualifications</a></p>
          </div>
          ` : ''}
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #065f46; margin: 0;"><strong>Next Steps:</strong></p>
            <ul style="color: #065f46; margin: 10px 0 0 0;">
              <li>Review the student's information</li>
              <li>Contact the student to discuss course enrollment</li>
              <li>Add student to the appropriate course in the LMS</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px;">
            This email was sent from the RevoQuest enrollment form at ${new Date().toLocaleString()}.
          </p>
        </div>
      `
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Enrollment email sent successfully to admin', {
      studentEmail: formData.email,
      studentName: `${formData.firstName} ${formData.lastName}`,
      messageId: result.messageId,
      response: result.response
    });

      return {
        success: true,
        message: 'Enrollment email sent successfully',
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending enrollment email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error details:', { errorMessage, formData });
      throw new Error(`Failed to send enrollment email: ${errorMessage}`);
    }
  }
);

// Send confirmation email to student
export const sendStudentConfirmation = onCall(async (request) => {
    const { studentEmail, studentName, courseInterest } = request.data;
    
    try {
      // Validate required fields
      if (!studentEmail || !studentName) {
        logger.error('Missing required fields for student confirmation', { studentEmail, studentName });
        throw new Error('Missing required fields: studentEmail and studentName are required');
      }
      
      logger.info('Sending student confirmation email', { studentEmail, studentName, courseInterest });
      
      const transporter = createTransporter(EMAIL_USER, EMAIL_PASS);
      
      const mailOptions = {
        from: EMAIL_USER,
        replyTo: ADMIN_EMAIL,
      to: studentEmail,
      subject: 'Welcome to RevoQuest - Enrollment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://revoquest-9e217.web.app/revoquest%20logo.png" alt="RevoQuest Logo" style="max-width: 200px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #f97316; margin: 0; margin-top: 20px;">Thank you for Applying to RevoQuest!</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">Your learning journey starts here</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Hello ${studentName}!</h3>
            <p>Thank you for your interest in our courses. We've received your enrollment request and our team will contact you soon to discuss your learning goals and course options.</p>
          </div>
          
          ${courseInterest ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>Your Course Interest:</strong> ${courseInterest}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">What happens next?</h3>
            <ul style="color: #065f46;">
              <li>Our team will review your application</li>
              <li>We'll contact you to discuss course details and enrollment</li>
              <li>You'll receive access to our learning management system</li>
              <li>Your learning journey will begin!</li>
            </ul>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 24px 0; color: #0f172a;">
            <h3 style="margin-top: 0; color: #0f172a;">Holiday Notice & RPL Guidance</h3>
            <p style="color: #475569; line-height: 1.6;">
              Our offices will be closed for the December holidays from <strong>19 December</strong> until <strong>6 January 2026</strong>.
              If you are applying via Recognition of Prior Learning (RPL), please prepare the documents below and send them for pre-assessment as soon as we reopen. We will call you to verify everything so we can process your application quickly.
            </p>
            <ul style="padding-left: 20px; color: #475569; line-height: 1.6;">
              <li>Certified ID</li>
              <li>Certified qualifications</li>
              <li>Comprehensive CV</li>
              <li>Service letter from your employer outlining relevant experience for the qualification you are seeking RPL</li>
            </ul>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 0;">
              Thank you for your cooperation. We wish you a joyful festive season and a happy New Year!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://revoquest.co.za" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you have any questions or would like to reply to this email, please contact us at <a href="mailto:${ADMIN_EMAIL}" style="color: #f97316; text-decoration: none;">${ADMIN_EMAIL}</a><br>
            RevoQuest Learning Management System
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Student confirmation email sent successfully', { 
      studentEmail, 
      messageId: result.messageId,
      response: result.response 
    });
    
      return {
        success: true,
        message: 'Confirmation email sent to student',
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending student confirmation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error details:', { errorMessage, studentEmail, studentName });
      throw new Error(`Failed to send confirmation email: ${errorMessage}`);
    }
  }
);

// Send RPL application email function
export const sendRPLApplication = onCall(async (request) => {
    try {
      const formData: RPLApplicationData = request.data;

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('Missing required fields');
      }

      const transporter = createTransporter(EMAIL_USER, EMAIL_PASS);

      // Email content
      const mailOptions = {
        from: EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: `New RPL Application: ${formData.firstName} ${formData.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">New RPL Application</h2>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334155; margin-top: 0;">Applicant Information</h3>
              <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
              <p><strong>Current Role:</strong> ${formData.currentRole || 'Not provided'}</p>
              <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">RPL Details</h3>
              <p><strong>Desired Qualification:</strong> ${formData.qualification || 'Not specified'}</p>
              <p><strong>Years of Experience:</strong> ${formData.yearsExperience || 'Not specified'}</p>
              <p><strong>Previous Qualifications:</strong> ${formData.previousQualifications || 'None listed'}</p>
            </div>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334155; margin-top: 0;">Work Experience</h3>
              <p style="white-space: pre-wrap;">${formData.experience || 'Not provided'}</p>
            </div>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334155; margin-top: 0;">Motivation for RPL</h3>
              <p style="white-space: pre-wrap;">${formData.motivation || 'Not provided'}</p>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46; margin-top: 0;">Contact Preferences</h3>
              <p><strong>Preferred Contact Method:</strong> ${formData.preferredContact || 'Not specified'}</p>
              <p><strong>Best Time to Contact:</strong> ${formData.availability || 'Not specified'}</p>
            </div>

            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1e40af; margin: 0;"><strong>Next Steps:</strong></p>
              <ul style="color: #1e40af; margin: 10px 0 0 0;">
                <li>Review the applicant's experience and qualifications</li>
                <li>Schedule initial consultation based on their preferences</li>
                <li>Assess eligibility for the desired qualification</li>
                <li>Begin RPL process if approved</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #64748b; font-size: 14px;">
              This RPL application was submitted at ${new Date().toLocaleString()}.
            </p>
          </div>
        `
      };

      // Send email to admin
      await transporter.sendMail(mailOptions);

      logger.info('RPL application email sent successfully', {
        applicantEmail: formData.email,
        applicantName: `${formData.firstName} ${formData.lastName}`,
        qualification: formData.qualification
      });

      // Send acknowledgement email to applicant with holiday notice and next steps
      const acknowledgementMailOptions = {
        from: EMAIL_USER,
        to: formData.email,
        subject: 'Revo Quest RPL Application Received – Holiday Notice',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
            <h2 style="color: #f97316;">Welcome to Revo Quest Institute</h2>
            <p>Hi ${formData.firstName},</p>
            <p>Thank you for applying to Revo Quest Institute. Our offices will be closed for the December holidays from <strong>19 December</strong> until <strong>6 January 2026</strong>.</p>
            <p>As an RPL candidate, please have the following documents ready for pre-assessment when we reopen in January. We will also call you to verify all documentation so that we can process your application as quickly as possible.</p>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 24px 0;">
              <h3 style="color: #0f172a; margin-top: 0;">Required Documents</h3>
              <ul style="padding-left: 20px; color: #475569; line-height: 1.6;">
                <li>Certified ID</li>
                <li>Certified qualifications</li>
                <li>Comprehensive CV</li>
                <li>Service letter from your employer detailing relevant experience for the qualification you are seeking RPL</li>
              </ul>
            </div>

            <p>We appreciate your patience and cooperation and wish you a restful festive season and a happy New Year.</p>
            <p style="margin-bottom: 32px;">
              Regards,<br/>
              <strong>Revo Quest Admissions Team</strong><br/>
              admissions@revoquest.co.za
            </p>
          </div>
        `
      };

      await transporter.sendMail(acknowledgementMailOptions);

      logger.info('RPL acknowledgement email sent successfully', {
        applicantEmail: formData.email
      });

      return {
        success: true,
        message: 'RPL application sent successfully'
      };

    } catch (error) {
      logger.error('Error sending RPL application:', error);
      throw new Error('Failed to send RPL application');
    }
  }
);

// Send assessment booking email function
export const sendAssessmentBooking = onCall(async (request) => {
    try {
      const bookingData: AssessmentBookingData = request.data;

      // Validate required fields
      if (!bookingData.firstName || !bookingData.lastName || !bookingData.email) {
        throw new Error('Missing required fields');
      }

      const transporter = createTransporter(EMAIL_USER, EMAIL_PASS);

      // Email content
      const mailOptions = {
        from: EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: `New Assessment Booking: ${bookingData.firstName} ${bookingData.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">New Assessment Booking</h2>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334155; margin-top: 0;">Student Information</h3>
              <p><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
              <p><strong>Email:</strong> ${bookingData.email}</p>
              <p><strong>Phone:</strong> ${bookingData.phone || 'Not provided'}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">Assessment Details</h3>
              <p><strong>Assessment Type:</strong> ${bookingData.assessmentType || 'Not specified'}</p>
              <p><strong>Preferred Date:</strong> ${bookingData.preferredDate || 'Not specified'}</p>
              <p><strong>Preferred Time:</strong> ${bookingData.preferredTime || 'Not specified'}</p>
            </div>

            ${bookingData.message ? `
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334155; margin-top: 0;">Additional Message</h3>
              <p style="white-space: pre-wrap;">${bookingData.message}</p>
            </div>
            ` : ''}

            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #065f46; margin: 0;"><strong>Next Steps:</strong></p>
              <ul style="color: #065f46; margin: 10px 0 0 0;">
                <li>Confirm the preferred assessment date and time</li>
                <li>Contact the student to confirm booking details</li>
                <li>Send confirmation email with assessment instructions</li>
                <li>Prepare assessment materials and venue</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #64748b; font-size: 14px;">
              This assessment booking was submitted at ${new Date().toLocaleString()}.
            </p>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      logger.info('Assessment booking email sent successfully', {
        studentEmail: bookingData.email,
        studentName: `${bookingData.firstName} ${bookingData.lastName}`,
        assessmentType: bookingData.assessmentType
      });

      return {
        success: true,
        message: 'Assessment booking sent successfully'
      };

    } catch (error) {
      logger.error('Error sending assessment booking:', error);
      throw new Error('Failed to send assessment booking');
    }
  }
);

// Interface for orphaned record
interface OrphanedRecord {
  id: string;
  data: any;
}

// Fix orphaned student progress records by linking them to actual students
export const fixOrphanedProgress = onCall(async (request) => {
  try {
    // Initialize Firebase Admin if not already initialized
    try {
      initializeApp();
    } catch (error) {
      // App already initialized, continue
    }
    
    const db = getFirestore();
    
    logger.info('Starting fix of orphaned student progress records...');
    
    // Get all student progress records
    const progressSnapshot = await db.collection('studentProgress').get();
    logger.info(`Found ${progressSnapshot.size} student progress records`);
    
    // Get all valid student IDs from users collection
    const usersSnapshot = await db.collection('users').get();
    const validStudents: {id: string, firstName: string, lastName: string, role: string}[] = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'learner' || userData.role === 'student') {
        validStudents.push({
          id: doc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        });
        logger.info(`Valid student: ${userData.firstName} ${userData.lastName} (${doc.id})`);
      }
    });
    
    logger.info(`Found ${validStudents.length} valid students`);
    
    if (validStudents.length === 0) {
      return {
        success: false,
        message: 'No valid students found to link progress records to',
        fixedCount: 0,
        remainingCount: progressSnapshot.size
      };
    }
    
    // Find orphaned records and fix them
    const orphanedRecords: {id: string, data: any}[] = [];
    progressSnapshot.forEach(doc => {
      const progressData = doc.data();
      if (!progressData.studentId || progressData.studentId === undefined) {
        orphanedRecords.push({
          id: doc.id,
          data: progressData
        });
      }
    });
    
    logger.info(`Found ${orphanedRecords.length} orphaned student progress records`);
    
    if (orphanedRecords.length > 0) {
      logger.info('Fixing orphaned records by linking them to actual students...');
      const batch = db.batch();
      
      // Link each orphaned record to a student (cycling through available students)
      orphanedRecords.forEach((record, index) => {
        const studentIndex = index % validStudents.length;
        const student = validStudents[studentIndex];
        
        // Update the record with proper studentId and realistic progress data
        const updatedData = {
          ...record.data,
          studentId: student.id,
          courseId: record.data.courseId || '69MOBEUansc6SPXrj34m', // Use the existing course ID
          progress: index === 0 ? 100 : Math.floor(Math.random() * 80) + 10, // First student completed, others partial
          completionRate: index === 0 ? 100 : Math.floor(Math.random() * 50),
          lessonsCompleted: index === 0 ? 9 : Math.floor(Math.random() * 6) + 1,
          totalLessons: 9,
          lastActivity: new Date().toISOString(),
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
        };
        
        batch.update(db.collection('studentProgress').doc(record.id), updatedData);
        logger.info(`Linking record ${record.id} to student ${student.firstName} ${student.lastName} (${student.id})`);
      });
      
      await batch.commit();
      logger.info(`Successfully fixed ${orphanedRecords.length} orphaned student progress records`);
    } else {
      logger.info('No orphaned records found - all student progress records are valid');
    }
    
    // Verify fix
    const remainingSnapshot = await db.collection('studentProgress').get();
    const validRecords = remainingSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.studentId && data.studentId !== undefined;
    });
    
    logger.info(`Remaining student progress records: ${remainingSnapshot.size}`);
    logger.info(`Valid student progress records: ${validRecords.length}`);
    
    return {
      success: true,
      message: `Fix completed successfully. Fixed ${orphanedRecords.length} orphaned records. ${validRecords.length} valid records remaining.`,
      fixedCount: orphanedRecords.length,
      validCount: validRecords.length
    };
    
  } catch (error) {
    logger.error('Error during fix:', error);
    throw new Error('Failed to fix orphaned records');
  }
});

// Cleanup orphaned student progress records
export const cleanupOrphanedProgress = onCall(async (request) => {
  try {
    // Initialize Firebase Admin if not already initialized
    try {
      initializeApp();
    } catch (error) {
      // App already initialized, continue
    }
    
    const db = getFirestore();
    
    logger.info('Starting cleanup of orphaned student progress records...');
    
    // Get all student progress records
    const progressSnapshot = await db.collection('studentProgress').get();
    logger.info(`Found ${progressSnapshot.size} student progress records`);
    
    // Get all valid student IDs from users collection
    const usersSnapshot = await db.collection('users').get();
    const validStudentIds = new Set<string>();
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'learner' || userData.role === 'student') {
        validStudentIds.add(doc.id);
        logger.info(`Valid student: ${userData.firstName} ${userData.lastName} (${doc.id})`);
      }
    });
    
    logger.info(`Found ${validStudentIds.size} valid students`);
    
    // Find orphaned records
    const orphanedRecords: OrphanedRecord[] = [];
    progressSnapshot.forEach(doc => {
      const progressData = doc.data();
      if (!progressData.studentId || !validStudentIds.has(progressData.studentId)) {
        orphanedRecords.push({
          id: doc.id,
          data: progressData
        });
      }
    });
    
    logger.info(`Found ${orphanedRecords.length} orphaned student progress records`);
    
    if (orphanedRecords.length > 0) {
      logger.info('Orphaned records details:', orphanedRecords);
      
      // Delete orphaned records
      logger.info('Deleting orphaned records...');
      const batch = db.batch();
      
      orphanedRecords.forEach(record => {
        batch.delete(db.collection('studentProgress').doc(record.id));
      });
      
      await batch.commit();
      logger.info(`Successfully deleted ${orphanedRecords.length} orphaned student progress records`);
    } else {
      logger.info('No orphaned records found - all student progress records are valid');
    }
    
    // Verify cleanup
    const remainingSnapshot = await db.collection('studentProgress').get();
    logger.info(`Remaining student progress records: ${remainingSnapshot.size}`);
    
    return {
      success: true,
      message: `Cleanup completed successfully. Deleted ${orphanedRecords.length} orphaned records. ${remainingSnapshot.size} records remaining.`,
      deletedCount: orphanedRecords.length,
      remainingCount: remainingSnapshot.size
    };
    
  } catch (error) {
    logger.error('Error during cleanup:', error);
    throw new Error('Failed to cleanup orphaned records');
  }
});

// --- Yoco funnel: create checkout session ---
// YOCO_CHECKOUT_URL is defined above with other Yoco constants

/** Check if an email is already registered in Firebase Auth (for funnel checkout: only allow Yoco for new users). */
export const checkFunnelEmailRegistered = onCall({ cors: true }, async (request) => {
  const email = (request.data?.email as string)?.trim?.();
  if (!email) {
    return { registered: false };
  }
  try {
    try {
      initializeApp();
    } catch (_) {}
    const auth = getAuth();
    await auth.getUserByEmail(email);
    return { registered: true };
  } catch {
    return { registered: false };
  }
});

export const requestPasswordResetEmail = onCall({ cors: true }, async (request) => {
  const email = String(request.data?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Please enter a valid email address.");
  }

  try {
    try {
      initializeApp();
    } catch (_) {}

    const auth = getAuth();
    const userRecord = await auth.getUserByEmail(email);
    const firebaseResetLink = await auth.generatePasswordResetLink(email, {
      url: `${FIREBASE_AUTH_ACTION_BASE_URL}/lms`,
      handleCodeInApp: false,
    });
    const parsed = new URL(firebaseResetLink);
    const oobCode = parsed.searchParams.get("oobCode");
    const continueUrlEnc = encodeURIComponent(`${APP_BASE_URL}/lms`);
    const resetUrl = oobCode
      ? `${APP_BASE_URL}/set-password?mode=resetPassword&oobCode=${encodeURIComponent(
          oobCode
        )}&continueUrl=${continueUrlEnc}`
      : firebaseResetLink;

    const displayName = userRecord.displayName?.trim() || "there";
    const transporter = createTransporter(EMAIL_USER, EMAIL_PASS);
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      replyTo: ADMIN_EMAIL,
      subject: "Revo Learn – Reset your password",
      text: `Hi ${displayName},\n\nWe received a request to reset your Revo Learn password.\n\nUse this one-time link to create a new password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\nRegards,\nRevo Learn Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Reset your password</h2>
        <p>Hi ${displayName},</p>
        <p>We received a request to reset your Revo Learn password.</p>
        <p><a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset password</a></p>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>Regards,<br/>Revo Learn Team</p>
      </div>`,
    });

    logger.info("Forgot password email sent", { to: email });
    return { success: true };
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";
    if (code === "auth/user-not-found") {
      throw new HttpsError("not-found", "No account found with this email address.");
    }
    logger.error("Failed to send forgot password email", { email, error });
    throw new HttpsError("internal", "Could not send password reset email. Please try again.");
  }
});

export const createYocoCheckout = onCall({
  cors: true
}, async (request) => {
  // STEP 1: Get Yoco secret key from environment
  // In production, set YOCO_SECRET_KEY in Firebase Console to the live key
  // In development, the .env file provides test key
  const yocoSecretKey = YOCO_SECRET_KEY;
  
  try {
    const {
      courseId,
      courseTitle,
      amountCents,
      customerEmail,
      firstName,
      lastName,
      password: passwordFromRequest,
      identityNumber,
      successUrl,
      cancelUrl,
    } = request.data as {
      courseId: string;
      courseTitle: string;
      amountCents: number;
      customerEmail: string;
      firstName: string;
      lastName: string;
      password?: string;
      identityNumber?: string;
      successUrl: string;
      cancelUrl: string;
    };

    logger.info("Initiating Yoco live checkout [V3.0 - STEP BY STEP]...", { 
      amount: amountCents,
      email: customerEmail 
    });

    if (!courseId || !customerEmail || !firstName || !lastName || amountCents < 1) {
      return { success: false, error: "Missing or invalid parameters (Check course price and user info)" };
    }
    const password = typeof passwordFromRequest === "string" && passwordFromRequest.length >= 6
      ? passwordFromRequest
      : undefined;
    if (!password) {
      return { success: false, error: "Password is required (at least 6 characters)." };
    }

    try {
      initializeApp();
    } catch (_) {}
    const db = getFirestore();
    const auth = getAuth();

    // STEP 2: Ensure user exists in Firebase
    const email = customerEmail.trim();
    const nameFirst = firstName.trim();
    const nameLast = lastName.trim();
    const idNumber = typeof identityNumber === "string" ? identityNumber.trim() : "";
    let uid: string;
    try {
      const existingUser = await auth.getUserByEmail(email);
      uid = existingUser.uid;
    } catch {
      const newUser = await auth.createUser({
        email,
        password,
        displayName: `${nameFirst} ${nameLast}`,
      });
      uid = newUser.uid;
      const now = new Date().toISOString();
      await db.collection("users").doc(uid).set({
        id: uid, uid, email, firstName: nameFirst, lastName: nameLast,
        role: "student", identityNumber: idNumber || FieldValue.delete(),
        joinDate: now, lastActive: now, isActive: true,
        enrolledCourses: [], completedCourses: [], progress: 0, currentGrade: "N/A",
      }, { merge: true });
    }

    // STEP 3: Determine if using live key and normalize URLs
    const isLiveMode = yocoSecretKey.startsWith('sk_live_');
    logger.info(`Yoco mode: ${isLiveMode ? 'LIVE' : 'TEST'}`);

    // Yoco live API requires HTTPS callback URLs; test API allows HTTP for localhost
    const normalizeUrl = (url: string | undefined): string | undefined => {
      if (!url) return undefined;
      if (isLiveMode && url.startsWith('http://')) {
        logger.warn(`Converting HTTP URL to HTTPS for live mode: ${url} -> ${url.replace('http://', 'https://')}`);
        return url.replace('http://', 'https://');
      }
      return url;
    };

    const normalizedSuccessUrl = normalizeUrl(successUrl);
    const normalizedCancelUrl = normalizeUrl(cancelUrl);

    if (isLiveMode && (normalizedSuccessUrl !== successUrl || normalizedCancelUrl !== cancelUrl)) {
      logger.info(`URLs normalized for live mode: success=${normalizedSuccessUrl}, cancel=${normalizedCancelUrl}`);
    }

    // Construct the request according to https://developer.yoco.com/docs/checkout-api
    const body = {
      amount: Math.round(amountCents), // Ensure integer
      currency: "ZAR",
      successUrl: normalizedSuccessUrl,
      cancelUrl: normalizedCancelUrl,
      metadata: {
        courseId,
        courseTitle,
        customerEmail: email,
        firstName: nameFirst,
        lastName: nameLast,
      },
    };

    // STEP 4: Make the API call using native fetch
    const response = await fetch(YOCO_CHECKOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${yocoSecretKey}`,
      },
      body: JSON.stringify(body),
    });

    // STEP 5: Capture full response for debugging
    const rawData = await response.text();
    let data: any;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      data = { rawResponse: rawData };
    }

    if (!response.ok) {
      logger.error("Yoco API Error", { status: response.status, data });
      // Return the exact error from Yoco to the user
      const detailedError = data.message || data.error || JSON.stringify(data);
      return {
        success: false,
        error: `Yoco Error: ${detailedError} (Status: ${response.status})`,
      };
    }

    const redirectUrl = data.redirectUrl;
    const checkoutId = data.id;
    if (!redirectUrl || !checkoutId) {
      return { success: false, error: `Invalid response from Yoco: ${rawData}` };
    }

    // STEP 6: Store session
    const sessionData: Record<string, unknown> = {
      checkoutId, courseId, courseTitle, customerEmail: email,
      customerEmailLower: email.toLowerCase().trim(),
      firstName: nameFirst, lastName: nameLast,
      identityNumber: idNumber || undefined,
      status: "pending", createdAt: new Date().toISOString(), existingUserId: uid,
    };
    await db.collection("checkoutSessions").doc(checkoutId).set(sessionData);

    return { success: true, redirectUrl, checkoutId };
  } catch (error) {
    logger.error("Global Catch Error", error);
    return {
      success: false,
      error: `System Error: ${error instanceof Error ? error.message : "Unknown failure"}`,
    };
  }
});

/** Create Yoco checkout for an existing logged-in learner. Requires auth. On payment success, webhook enrolls the user. */
export const createYocoCheckoutForLearner = onCall({
  cors: true
}, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    return { success: false, error: "You must be logged in to purchase a course." };
  }
  try {
    // Use the same key configuration as createYocoCheckout
    const yocoSecretKey = YOCO_SECRET_KEY;
    const { courseId, successUrl, cancelUrl } = request.data as {
      courseId: string;
      successUrl: string;
      cancelUrl: string;
    };

    const isLiveMode = yocoSecretKey.startsWith('sk_live_');
    logger.info(`Yoco mode (learner): ${isLiveMode ? 'LIVE' : 'TEST'}`, {
      uid,
      courseId,
      hasKey: !!yocoSecretKey,
      keyLength: yocoSecretKey.length
    });

    if (!yocoSecretKey || yocoSecretKey.length < 5) {
      return { success: false, error: "Payment gateway configuration error (Key Missing)." };
    }
    if (!yocoSecretKey) {
      logger.error("YOCO_SECRET_KEY not set.");
      return { success: false, error: "Payment gateway not configured" };
    }
    if (!courseId || !successUrl || !cancelUrl) {
      return { success: false, error: "Missing courseId, successUrl, or cancelUrl" };
    }
    try {
      initializeApp();
    } catch (_) {}
    const db = getFirestore();
    const courseSnap = await db.collection("courses").doc(courseId).get();
    if (!courseSnap.exists) {
      return { success: false, error: "Course not found" };
    }
    const courseData = courseSnap.data() as { title?: string; price?: number };
    const courseTitle = courseData?.title ?? "Course";
    const price = Number(courseData?.price ?? 0);
    const amountCents = Math.round(price * 100);
    if (amountCents < 1) {
      return { success: false, error: "This course has no price set. Contact support." };
    }
    const auth = getAuth();
    let customerEmail: string;
    try {
      const authUser = await auth.getUser(uid);
      customerEmail = (authUser.email ?? "").trim();
    } catch {
      customerEmail = "";
    }
    if (!customerEmail) {
      const userSnap = await db.collection("users").doc(uid).get();
      const userData = userSnap.data() as { email?: string } | undefined;
      customerEmail = (userData?.email ?? "").trim();
    }
    if (!customerEmail) {
      return { success: false, error: "Your account has no email. Update your profile." };
    }
    const userSnap = await db.collection("users").doc(uid).get();
    const userData = userSnap.data() as { firstName?: string; lastName?: string } | undefined;
    const firstName = (userData?.firstName ?? "").trim() || "Learner";
    const lastName = (userData?.lastName ?? "").trim() || "User";

    // Normalize URLs for live mode (enforce HTTPS)
    const normalizeUrl = (url: string | undefined): string | undefined => {
      if (!url) return undefined;
      if (isLiveMode && url.startsWith('http://')) {
        logger.warn(`Converting HTTP URL to HTTPS for live mode: ${url} -> ${url.replace('http://', 'https://')}`);
        return url.replace('http://', 'https://');
      }
      return url;
    };

    const body = {
      amount: amountCents,
      currency: "ZAR",
      successUrl: normalizeUrl(successUrl) || undefined,
      cancelUrl: normalizeUrl(cancelUrl) || undefined,
      metadata: {
        courseId,
        courseTitle,
        customerEmail,
        firstName,
        lastName,
      },
    };

    const response = await fetch(YOCO_CHECKOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${yocoSecretKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      logger.error("Yoco checkout (learner) error", { status: response.status, data });
      return {
        success: false,
        error: (data as { message?: string }).message || "Failed to create checkout",
      };
    }

    const redirectUrl = (data as { redirectUrl?: string }).redirectUrl;
    const checkoutId = (data as { id?: string }).id;
    if (!redirectUrl || !checkoutId) {
      return { success: false, error: "No redirect URL or checkout ID from payment gateway" };
    }

    const sessionData = {
      checkoutId,
      courseId,
      courseTitle,
      customerEmail,
      customerEmailLower: customerEmail.toLowerCase().trim(),
      firstName,
      lastName,
      status: "pending",
      createdAt: new Date().toISOString(),
      existingUserId: uid,
    };
    await db.collection("checkoutSessions").doc(checkoutId).set(sessionData);
    logger.info("Checkout session stored (existing learner)", { checkoutId, courseId, uid });

    return {
      success: true,
      redirectUrl,
      checkoutId,
    };
  } catch (error) {
    logger.error("createYocoCheckoutForLearner error", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed",
    };
  }
});

// --- Shared: run enrollment + send email (used by webhook and completeFunnelEnrollmentByEmail) ---
async function runEnrollmentFromSession(
  session: { courseId: string; customerEmail: string; firstName: string; lastName: string; password?: string; identityNumber?: string },
  sessionRef: { update: (data: object) => Promise<unknown>; get: () => Promise<{ data: () => Record<string, unknown> | undefined }> },
  db: ReturnType<typeof getFirestore>,
  auth: ReturnType<typeof getAuth>
): Promise<{ uid: string; isNewUser: boolean }> {
  const { courseId, customerEmail, firstName, lastName, password: sessionPassword, identityNumber } = session;
  let uid: string;
  let isNewUser = false;
  let usedProvidedPassword = false;
  try {
    const existingUser = await auth.getUserByEmail(customerEmail);
    uid = existingUser.uid;
  } catch {
    const passwordToUse = typeof sessionPassword === "string" && sessionPassword.length >= 6
      ? sessionPassword
      : Math.random().toString(36).slice(-12) + "A1!";
    usedProvidedPassword = passwordToUse === sessionPassword;
    const newUser = await auth.createUser({
      email: customerEmail,
      password: passwordToUse,
      displayName: `${firstName} ${lastName}`,
    });
    uid = newUser.uid;
    isNewUser = true;
    // Remove password from session after use; keep flag so we send verification email (not set-password) on retries
    if (sessionPassword) {
      await sessionRef.update({ password: FieldValue.delete(), hadPasswordAtCheckout: true });
    }
  }
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const existingData = userSnap.data();
  const existingEnrolled = (existingData?.enrolledCourses as string[] | undefined) || [];
  const now = new Date().toISOString();

  // Always ensure the learner has a Firestore user document (Auth already has them; this is the profile for the app)
  // Use role "student" so it matches app signUp and convertUserProfileToUser maps it to "learner" for the UI
  await userRef.set(
    {
      id: uid,
      uid,
      email: customerEmail,
      firstName,
      lastName,
      role: "student",
      joinDate: existingData?.joinDate ?? now,
      lastActive: now,
      isActive: true,
      enrolledCourses: existingEnrolled.includes(courseId) ? existingEnrolled : [...existingEnrolled, courseId],
      completedCourses: existingData?.completedCourses ?? [],
      progress: existingData?.progress ?? 0,
      currentGrade: existingData?.currentGrade ?? "N/A",
      identityNumber: typeof identityNumber === "string" && identityNumber.trim()
        ? identityNumber.trim()
        : existingData?.identityNumber ?? FieldValue.delete(),
    },
    { merge: true }
  );

  const courseRef = db.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();
  const courseData = courseSnap.exists ? courseSnap.data() : null;
  const coursePrice = typeof (courseData?.price as number | undefined) === "number" ? (courseData?.price as number) : 0;

  if (!existingEnrolled.includes(courseId)) {
    await db.collection("enrollments").add({
      studentId: uid,
      courseId,
      enrolledAt: now,
      progress: 0,
      status: "Active",
      lastAccessed: now,
      amountPaid: coursePrice,
    });
    const totalLessons = (courseData?.units as Array<{ lessons?: unknown[] }> | undefined)?.reduce(
      (sum, u) => sum + (u.lessons?.length ?? 0),
      0
    ) ?? 0;
    await db.collection("studentProgress").add({
      studentId: uid,
      studentEmail: customerEmail,
      courseId,
      progress: 0,
      lessonsCompleted: 0,
      totalLessons,
      lastActivity: now,
      timeSpent: 0,
      completionRate: 0,
      averageGrade: 0,
    });
    if (courseSnap.exists) {
      const current = (courseSnap.data()?.enrolledStudents as number) || 0;
      await courseRef.update({ enrolledStudents: current + 1 });
    }
  }
  if (isNewUser) {
    await sessionRef.update({ newUserCreated: true });
  }

  try {
    const transporter = createTransporter(EMAIL_USER, EMAIL_PASS);
    const sessionData = (await sessionRef.get().then((s) => s.data())) as { newUserCreated?: boolean; hadPasswordAtCheckout?: boolean } | undefined;
    const sendWelcomeEmail = isNewUser || sessionData?.newUserCreated === true;
    const sendVerificationNotSetPassword = usedProvidedPassword || sessionData?.hadPasswordAtCheckout === true;

    if (sendWelcomeEmail) {
      if (sendVerificationNotSetPassword) {
        // User set password at checkout: send email verification link + login details; after verifying they log in with that password
        const verificationLink = await auth.generateEmailVerificationLink(customerEmail, {
          url: `${FIREBASE_AUTH_ACTION_BASE_URL}/lms`,
          handleCodeInApp: false,
        });
        const passwordForEmail = typeof sessionPassword === "string" && sessionPassword.length >= 6 ? sessionPassword : null;
        const subject = "Revo Learn – Confirm your email and your login details";
        const loginDetailsText = passwordForEmail
          ? `\n\nYour login details to access the platform:\nEmail (username): ${customerEmail}\nPassword: ${passwordForEmail}\n\n`
          : `\n\nUse your email and the password you set at checkout to log in after confirming your email.\n\n`;
        const textBody = `Hi ${firstName},\n\nYour payment was successful. We've created your Revo Learn account and enrolled you in your course.${loginDetailsText}Please confirm your email address by clicking the link below (one-time):\n\n${verificationLink}\n\nAfter you confirm your email, log in at ${APP_BASE_URL}/funnel/login or ${APP_BASE_URL}/lms with the email and password above.\n\nRegards,\nRevo Learn Team`;
        const loginDetailsHtml = passwordForEmail
          ? `<p><strong>Your login details to access the platform:</strong></p><p>Email (username): <strong>${customerEmail}</strong><br/>Password: <strong>${passwordForEmail}</strong></p><p>Keep these safe. After confirming your email below, use them to log in.</p>`
          : `<p>Use your email and the password you set at checkout to log in after confirming your email.</p>`;
        const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Confirm your email</h2>
          <p>Hi ${firstName},</p>
          <p>Your payment was successful. We've created your account and enrolled you in your course.</p>
          ${loginDetailsHtml}
          <p><strong>Confirm your email</strong> by clicking the button below:</p>
          <p><a href="${verificationLink}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm my email</a></p>
          <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p>After confirming, log in at <a href="${APP_BASE_URL}/funnel/login">${APP_BASE_URL}/funnel/login</a> or <a href="${APP_BASE_URL}/lms">${APP_BASE_URL}/lms</a>.</p>
          <p>Regards,<br/>Revo Learn Team</p>
        </div>`;
        await transporter.sendMail({
          from: EMAIL_USER,
          to: customerEmail,
          replyTo: ADMIN_EMAIL,
          subject,
          text: textBody,
          html: htmlBody,
        });
        logger.info("Funnel: welcome + email verification sent", { to: customerEmail });
      } else {
        // No password at checkout: send set-password link
        const firebaseResetLink = await auth.generatePasswordResetLink(customerEmail, {
          url: `${FIREBASE_AUTH_ACTION_BASE_URL}/lms`,
          handleCodeInApp: false,
        });
        const parsed = new URL(firebaseResetLink);
        const oobCode = parsed.searchParams.get("oobCode");
        const continueUrlEnc = encodeURIComponent(`${APP_BASE_URL}/lms`);
        const setPasswordUrl = oobCode
          ? `${APP_BASE_URL}/set-password?mode=resetPassword&oobCode=${encodeURIComponent(
              oobCode
            )}&continueUrl=${continueUrlEnc}`
          : firebaseResetLink;
        const subject = "Revo Learn – Create your password and log in to your course";
        const textBody = `Hi ${firstName},\n\nYour payment was successful. We've created your Revo Learn account and enrolled you in your course.\n\nYour login username is your email: ${customerEmail}\n\nTo log in to the learner dashboard, you need to create a password first. Use this link (one-time):\n\n${setPasswordUrl}\n\nAfter you set your password, you'll be logged in and can access your course at: ${APP_BASE_URL}/lms\n\nRegards,\nRevo Learn Team`;
        const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Your Revo Learn account is ready</h2>
          <p>Hi ${firstName},</p>
          <p>Your payment was successful. We've created your account and enrolled you in your course.</p>
          <p><strong>Your login username:</strong> ${customerEmail}</p>
          <p><strong>Create your password</strong> using the link below, then you can log in to your learner dashboard.</p>
          <p><a href="${setPasswordUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Create password & go to dashboard</a></p>
          <p>Or copy this link: <a href="${setPasswordUrl}">${setPasswordUrl}</a></p>
          <p>Regards,<br/>Revo Learn Team</p>
        </div>`;
        await transporter.sendMail({
          from: EMAIL_USER,
          to: customerEmail,
          replyTo: ADMIN_EMAIL,
          subject,
          text: textBody,
          html: htmlBody,
        });
        logger.info("Funnel: welcome + set-password email sent", { to: customerEmail });
      }
    } else {
      const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #f97316;">Course access added</h2><p>Hi ${firstName},</p><p>Your payment was successful. The new course is now available in your learner dashboard.</p><p><a href="${APP_BASE_URL}/lms" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to learner dashboard</a></p><p>Regards,<br/>Revo Quest Team</p></div>`;
      await transporter.sendMail({
        from: EMAIL_USER,
        to: customerEmail,
        replyTo: ADMIN_EMAIL,
        subject: "Revo Quest – New course added to your account",
        text: `Hi ${firstName},\n\nYour payment was successful. The new course is in your learner dashboard. Log in at ${APP_BASE_URL}/lms\n\nRegards,\nRevo Quest Team`,
        html: htmlBody,
      });
      logger.info("Funnel: course-added email sent", { to: customerEmail });
    }
    await sessionRef.update({
      status: "completed",
      completedAt: now,
      amountPaid: coursePrice,
      courseTitle: (courseData?.title as string) || undefined,
    });
  } catch (emailError) {
    logger.error("Funnel: failed to send post-payment email", { customerEmail, error: emailError });
    throw emailError;
  }
  return { uid, isNewUser };
}

/** Enroll an existing user (by uid) in a course. Used when payment is for a logged-in learner. */
async function enrollExistingUserInCourse(
  uid: string,
  courseId: string,
  db: ReturnType<typeof getFirestore>
): Promise<void> {
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const existingData = userSnap.data() || {};
  const existingEnrolled = (existingData.enrolledCourses as string[] | undefined) || [];
  if (existingEnrolled.includes(courseId)) {
    return;
  }
  const now = new Date().toISOString();
  await userRef.update({
    enrolledCourses: [...existingEnrolled, courseId],
    lastActive: now,
  });
  const userEmail = (existingData.email as string) || "";
  await db.collection("enrollments").add({
    studentId: uid,
    courseId,
    enrolledAt: now,
    progress: 0,
    status: "Active",
    lastAccessed: now,
  });
  const courseRef = db.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();
  const courseData = courseSnap.exists ? courseSnap.data() : null;
  const totalLessons = (courseData?.units as Array<{ lessons?: unknown[] }> | undefined)?.reduce(
    (sum, u) => sum + (u.lessons?.length ?? 0),
    0
  ) ?? 0;
  await db.collection("studentProgress").add({
    studentId: uid,
    studentEmail: userEmail,
    courseId,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons,
    lastActivity: now,
    timeSpent: 0,
    completionRate: 0,
    averageGrade: 0,
  });
  if (courseSnap.exists) {
    const current = (courseSnap.data()?.enrolledStudents as number) || 0;
    await courseRef.update({ enrolledStudents: current + 1 });
  }
}

// --- Yoco webhook: payment succeeded -> create user and enroll ---
// Yoco sends: { type: "payment.succeeded", payload: { id, metadata: { checkoutId? }, ... } } or similar variants
export const yocoWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }
  try {
    const body = req.body as Record<string, unknown>;
    const event = (body?.type as string) ?? (body?.event as string);
    logger.info("Webhook received", { bodyKeys: Object.keys(body || {}), event });
    const payload = body?.payload as Record<string, unknown> | undefined;
    const data = body?.data as Record<string, unknown> | undefined;
    // Checkout ID: Yoco often puts it in payload.metadata.checkoutId; also try body.id (event id), payload.id (payment id), data.checkout.id
    let checkoutId: string | null = null;
    if (payload && typeof payload === "object" && payload.metadata && typeof payload.metadata === "object") {
      const meta = payload.metadata as Record<string, unknown>;
      checkoutId = (meta.checkoutId as string) ?? (meta.checkout_id as string) ?? null;
    }
    if (!checkoutId) {
      checkoutId =
        (body?.checkoutId as string) ??
        (body?.id as string) ??
        (data?.checkoutId as string) ??
        (data?.id as string) ??
        (payload?.id as string) ??
        null;
    }
    if (data && typeof data === "object" && data?.checkout && typeof data.checkout === "object") {
      const checkout = data.checkout as Record<string, unknown>;
      if (!checkoutId && checkout.id) checkoutId = checkout.id as string;
    }
    if (!checkoutId || typeof checkoutId !== "string") {
      logger.warn("Webhook: missing checkoutId", { body: JSON.stringify(body).slice(0, 500) });
      res.status(200).send("OK");
      return;
    }
    const allowedEvents = ["payment.succeeded", "checkout.completed", "payment.succeeded.v2", "checkout.completed.v2"];
    if (!event || !allowedEvents.includes(event)) {
      res.status(200).send("OK");
      return;
    }
    try {
      initializeApp();
    } catch (_) {}
    const db = getFirestore();
    const auth = getAuth();
    let sessionRef = db.collection("checkoutSessions").doc(checkoutId);
    let sessionSnap = await sessionRef.get();
    // Fallback: if no session by checkoutId, find by metadata (Yoco may send payment id instead of checkout id)
    if (!sessionSnap.exists && payload && typeof payload.metadata === "object") {
      const meta = payload.metadata as Record<string, unknown>;
      const metaEmail = (meta.customerEmail as string) ?? (meta.email as string);
      const metaCourseId = meta.courseId as string;
      if (metaEmail && metaCourseId) {
        const normalized = String(metaEmail).toLowerCase().trim();
        const [byLower, byExact] = await Promise.all([
          db.collection("checkoutSessions").where("customerEmailLower", "==", normalized).where("status", "==", "pending").get(),
          db.collection("checkoutSessions").where("customerEmail", "==", String(metaEmail).trim()).where("status", "==", "pending").get(),
        ]);
        const docs = [...byLower.docs, ...byExact.docs];
        const withCourse = docs.filter((d) => (d.data() as { courseId?: string }).courseId === metaCourseId);
        const sorted = withCourse.length ? withCourse : docs;
        const latest = sorted.sort((a, b) => (b.data().createdAt || "").localeCompare(a.data().createdAt || ""))[0];
        if (latest) {
          sessionRef = latest.ref;
          sessionSnap = await sessionRef.get();
          logger.info("Webhook: found session by metadata", { email: metaEmail, courseId: metaCourseId });
        }
      }
    }
    if (!sessionSnap.exists) {
      logger.warn("Webhook: no session for checkout", { checkoutId });
      res.status(200).send("OK");
      return;
    }
    const session = sessionSnap.data() as { courseId: string; customerEmail: string; firstName: string; lastName: string; password?: string; status?: string; existingUserId?: string };
    if (session.status === "completed") {
      res.status(200).send("OK");
      return;
    }
    if (session.existingUserId) {
      await enrollExistingUserInCourse(session.existingUserId, session.courseId, db);
      const courseRef = db.collection("courses").doc(session.courseId);
      const courseSnap = await courseRef.get();
      const courseData = courseSnap.exists ? courseSnap.data() : null;
      const coursePrice =
        typeof (courseData?.price as number | undefined) === "number" ? (courseData?.price as number) : 0;
      await sessionRef.update({
        status: "completed",
        completedAt: new Date().toISOString(),
        amountPaid: coursePrice,
        courseTitle: (courseData?.title as string) || undefined,
      });
      logger.info("Webhook: existing learner enrolled", { checkoutId, userId: session.existingUserId, courseId: session.courseId });
      res.status(200).send("OK");
      return;
    }
    await runEnrollmentFromSession(session, sessionRef, db, auth);
    logger.info("Webhook: user enrolled", { checkoutId, customerEmail: session.customerEmail });
    res.status(200).send("OK");
  } catch (error) {
    logger.error("yocoWebhook error", error);
    res.status(500).send("Internal error");
  }
});

// --- Callable: complete enrollment for the currently logged-in user (e.g. after payment redirect when webhook may not have run yet) ---
export const completeEnrollmentForCurrentUser = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    return { success: false, error: "You must be logged in." };
  }
  try {
    initializeApp();
  } catch (_) {}
  const db = getFirestore();
  const auth = getAuth();
  let email: string;
  try {
    const authUser = await auth.getUser(uid);
    email = (authUser.email || "").trim();
  } catch {
    return { success: false, error: "User not found." };
  }
  // The Yoco webhook is the only automated path that grants course access.
  // This callable only reports whether payment confirmation has already arrived.
  const completedByUid = await db.collection("checkoutSessions").where("existingUserId", "==", uid).where("status", "==", "completed").get();
  let completedDocs = completedByUid.docs;
  if (completedDocs.length === 0 && email) {
    const normalized = email.toLowerCase();
    const [byLower, byExact] = await Promise.all([
      db.collection("checkoutSessions").where("customerEmailLower", "==", normalized).where("status", "==", "completed").get(),
      db.collection("checkoutSessions").where("customerEmail", "==", email).where("status", "==", "completed").get(),
    ]);
    completedDocs = Array.from(new Map([...byLower.docs, ...byExact.docs].map((d) => [d.id, d])).values());
  }
  if (completedDocs.length > 0) {
    const sorted = completedDocs.sort((a, b) => (b.data().completedAt || b.data().createdAt || "").localeCompare(a.data().completedAt || a.data().createdAt || ""));
    const session = sorted[0].data() as { courseId?: string };
    return { success: true, courseId: session.courseId, message: "Payment confirmed. Your course is available in My Courses." };
  }

  const byUid = await db.collection("checkoutSessions").where("existingUserId", "==", uid).where("status", "==", "pending").get();
  if (byUid.docs.length > 0) {
    return { success: false, error: "Payment has not been confirmed yet. Please wait a moment and refresh My Courses." };
  }

  return { success: false, error: "No confirmed purchase found for your account. If you just paid, wait a moment and refresh My Courses." };
});

// --- Callable: complete enrollment by email (fallback when webhook does not run) ---
export const completeFunnelEnrollmentByEmail = onCall({ cors: true }, async (request) => {
  const email = (request.data?.email as string)?.trim?.();
  if (!email) {
    return { success: false, error: "Email is required." };
  }
  try {
    initializeApp();
  } catch (_) {}
  const db = getFirestore();
  const normalized = email.toLowerCase().trim();
  const [completedByLower, completedByExact] = await Promise.all([
    db.collection("checkoutSessions").where("customerEmailLower", "==", normalized).where("status", "==", "completed").get(),
    db.collection("checkoutSessions").where("customerEmail", "==", email.trim()).where("status", "==", "completed").get(),
  ]);
  const completedDocs = Array.from(new Map([...completedByLower.docs, ...completedByExact.docs].map((d) => [d.id, d])).values());
  if (completedDocs.length > 0) {
    return { success: true, message: "Payment confirmed. Your course is available in My Courses. Log in to continue." };
  }

  const [pendingByLower, pendingByExact] = await Promise.all([
    db.collection("checkoutSessions").where("customerEmailLower", "==", normalized).where("status", "==", "pending").get(),
    db.collection("checkoutSessions").where("customerEmail", "==", email.trim()).where("status", "==", "pending").get(),
  ]);
  if (pendingByLower.docs.length > 0 || pendingByExact.docs.length > 0) {
    return { success: false, error: "Payment has not been confirmed yet. Please wait a moment and refresh My Courses." };
  }

  return { success: false, error: "No confirmed payment found for this email. If you just paid, wait a minute and try again." };
});

/** Admin-only: grant course access to a learner by email (e.g. after purchase if webhook didn't run). Finds latest checkout session for that email or uses provided courseId. */
export const grantCourseAccessByEmail = onCall({ cors: true }, async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    return { success: false, error: "You must be logged in." };
  }
  try {
    initializeApp();
  } catch (_) {}
  const db = getFirestore();
  const auth = getAuth();
  const callerSnap = await db.collection("users").doc(callerUid).get();
  const callerRole = callerSnap.data()?.role as string | undefined;
  if (callerRole !== "admin") {
    return { success: false, error: "Only admins can grant course access." };
  }
  const email = (request.data?.email as string)?.trim?.();
  if (!email) {
    return { success: false, error: "Email is required." };
  }
  let uid: string;
  try {
    const authUser = await auth.getUserByEmail(email);
    uid = authUser.uid;
  } catch {
    return { success: false, error: "No Firebase user found for this email. They must complete sign-up or checkout first." };
  }
  let courseId = (request.data?.courseId as string)?.trim?.();
  if (!courseId) {
    const normalized = email.toLowerCase().trim();
    const [byLower, byExact] = await Promise.all([
      db.collection("checkoutSessions").where("customerEmailLower", "==", normalized).get(),
      db.collection("checkoutSessions").where("customerEmail", "==", email).get(),
    ]);
    const docs = [...byLower.docs, ...byExact.docs];
    const unique = Array.from(new Map(docs.map((d) => [d.id, d])).values());
    const latest = unique.sort((a, b) => (b.data().createdAt || "").localeCompare(a.data().createdAt || ""))[0];
    if (!latest) {
      return { success: false, error: "No checkout session found for this email. Provide courseId to enroll them in a specific course." };
    }
    courseId = (latest.data() as { courseId: string }).courseId;
    const sessionRef = latest.ref;
    await sessionRef.update({ status: "completed", completedAt: new Date().toISOString() });
  }
  await enrollExistingUserInCourse(uid, courseId, db);
  logger.info("grantCourseAccessByEmail: enrolled", { email, courseId, uid });
  return { success: true, message: "Course access granted. The course will appear in My Courses for this learner." };
});

// Allowed origins for callable CORS (use full origin e.g. http://localhost:8085)
const CORS_ORIGINS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  "http://localhost:8085",
  "http://localhost:8086",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:8085",
  "http://127.0.0.1:8086",
  "http://127.0.0.1:5173",
  "https://revoquest.co.za",
  "https://www.revoquest.co.za",
  "https://revoquest-9e217.web.app",
  "https://revoquest-9e217.firebaseapp.com",
];

/**
 * Delete a user from Firebase Auth and Firestore (users collection).
 * Callable only by an authenticated user with role "admin".
 * Pass the user ID (Firebase Auth UID, same as Firestore users doc id) to delete.
 */
export const deleteUserByAdmin = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new Error("You must be logged in to delete a user.");
  }
  try {
    initializeApp();
  } catch (_) {}
  const db = getFirestore();
  const adminAuth = getAuth();

  const callerSnap = await db.collection("users").doc(callerUid).get();
  const callerRole = (callerSnap.data()?.role as string)?.toLowerCase?.();
  const isAdmin = callerRole === "admin";
  if (!isAdmin) {
    throw new Error("Only admins can delete users.");
  }

  const userId = (request.data?.userId as string)?.trim?.();
  if (!userId) {
    throw new Error("userId is required.");
  }
  if (userId === callerUid) {
    throw new Error("You cannot delete your own account from here.");
  }

  try {
    await adminAuth.deleteUser(userId);
  } catch (authErr: unknown) {
    const code = authErr && typeof authErr === "object" && "code" in authErr
      ? (authErr as { code: string }).code
      : "";
    const msg = code === "auth/user-not-found"
      ? "Firebase Auth user not found (may already be deleted)."
      : authErr instanceof Error ? authErr.message : "Failed to delete Auth user.";
    logger.warn("deleteUserByAdmin: Auth delete", { userId, error: msg });
    // Continue to delete Firestore doc even if Auth user was already gone
  }

  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    await userRef.delete();
    logger.info("deleteUserByAdmin: deleted Firestore user doc", { userId });
  }

  return { success: true, message: "User deleted from Authentication and Firestore." };
});

/**
 * secureOpenRouterChat: Secure backend proxy for OpenRouter chat completions.
 * Authenticates the user and calls OpenRouter without exposing the API key on the frontend.
 */
export const secureOpenRouterChat = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY || functionsConfig.openrouter?.api_key;
  if (!apiKey) {
    logger.error("secureOpenRouterChat: OPENROUTER_API_KEY is not set.");
    throw new Error("Service configuration error: OpenRouter key not configured.");
  }

  const { messages, options } = request.data as {
    messages: any[];
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      tools?: any[];
      tool_choice?: any;
      response_format?: any;
    };
  };

  if (!messages || !Array.isArray(messages)) {
    throw new Error("Missing required 'messages' array.");
  }

  const model = options?.model || "z-ai/glm-4.7-flash";
  const body: Record<string, any> = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
  };

  if (options?.max_tokens != null) {
    body.max_tokens = options.max_tokens;
  }
  if (options?.tools?.length) {
    body.tools = options.tools;
    body.tool_choice = options.tool_choice ?? 'auto';
  }
  if (options?.response_format) {
    body.response_format = options.response_format;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://revoquest-9e217.web.app",
        "X-Title": "Modern Quest Vision LMS Secure Proxy",
      },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    if (!response.ok) {
      logger.error("secureOpenRouterChat API Error:", { status: response.status, rawText });
      throw new Error(`OpenRouter Error: ${response.status} ${rawText.slice(0, 300)}`);
    }

    return JSON.parse(rawText);
  } catch (error: any) {
    logger.error("secureOpenRouterChat global catch:", error);
    throw new Error(error.message || "Failed to contact OpenRouter.");
  }
});

/**
 * secureOpenRouterImage: Secure backend proxy for OpenRouter educational illustrations/images.
 * Authenticates the user and handles the OpenRouter multimodal image endpoints.
 */
export const secureOpenRouterImage = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY || functionsConfig.openrouter?.api_key;
  if (!apiKey) {
    logger.error("secureOpenRouterImage: OPENROUTER_API_KEY is not set.");
    throw new Error("Service configuration error: OpenRouter key not configured.");
  }

  const { prompt, model } = request.data as { prompt: string; model?: string };
  if (!prompt) {
    throw new Error("Missing required 'prompt' parameter.");
  }

  const targetModel = model || "google/gemini-2.5-flash-image";

  const post = async (body: Record<string, any>) => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://revoquest-9e217.web.app",
          "X-Title": "Modern Quest Vision LMS Secure Proxy",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        logger.warn(`secureOpenRouterImage post error: ${response.status} ${errText.slice(0, 200)}`);
        return null;
      }

      return await response.json();
    } catch (e) {
      logger.error("secureOpenRouterImage fetch failed:", e);
      return null;
    }
  };

  const base: Record<string, any> = {
    model: targetModel,
    messages: [{ role: "user", content: prompt }],
    modalities: ["image", "text"],
    temperature: 0.35,
    max_tokens: 2048,
  };

  // Attempt standard aspect ratio config first
  let data = await post({ ...base, image_config: { aspect_ratio: "16:9" } });
  if (!data) {
    data = await post({ ...base });
  }
  if (!data) {
    data = await post({
      model: targetModel,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image"],
      temperature: 0.35,
      max_tokens: 1024,
    });
  }

  if (!data) {
    throw new Error("OpenRouter image generation failed.");
  }

  return data;
});

/**
 * secureGeminiImage: Secure backend proxy for direct Gemini image illustrations as a fallback.
 * Authenticates the user and connects to the Google Generative Language API securely.
 */
export const secureGeminiImage = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  const apiKey = process.env.GEMINI_API_KEY || functionsConfig.gemini?.api_key;
  if (!apiKey) {
    logger.error("secureGeminiImage: GEMINI_API_KEY is not set.");
    throw new Error("Service configuration error: Gemini key not configured.");
  }

  const { prompt, model } = request.data as { prompt: string; model?: string };
  if (!prompt) {
    throw new Error("Missing required 'prompt' parameter.");
  }

  const targetModel = model || "gemini-2.5-flash-image";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.error("secureGeminiImage API Error:", { status: response.status, errText });
      throw new Error(`Gemini direct image failed: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    logger.error("secureGeminiImage global catch:", error);
    throw new Error(error.message || "Failed to contact Gemini image service.");
  }
});

/**
 * secureNvidiaChat: Secure backend proxy for NVIDIA API chat completions.
 * OpenAI-compatible endpoint. Authenticates the user and proxies without exposing the API key.
 */
export const secureNvidiaChat = onCall({ cors: CORS_ORIGINS, secrets: [nvidiaApiKey], timeoutSeconds: 300 }, async (request) => {
  try {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    let apiKey: string;
    try {
      apiKey = nvidiaApiKey.value();
    } catch (secretErr: any) {
      logger.error("secureNvidiaChat: Failed to read NVIDIA secret:", { message: secretErr.message });
      throw new HttpsError("failed-precondition", `NVIDIA secret not available: ${secretErr.message}`);
    }

    if (!apiKey) {
      logger.error("secureNvidiaChat: NVIDIA_API_KEY is empty.");
      throw new HttpsError("failed-precondition", "NVIDIA API key is empty. Set NVIDIA_API_KEY_SECRET in Firebase.");
    }

    const { messages, options } = request.data as {
      messages: any[];
      options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: { type: "json_object" };
      };
    };

    if (!messages || !Array.isArray(messages)) {
      throw new HttpsError("invalid-argument", "Missing required 'messages' array.");
    }

    const body: Record<string, any> = {
      model: options?.model || "meta/llama-3.1-8b-instruct",
      messages,
      temperature: options?.temperature ?? 0.7,
    };

    if (options?.max_tokens != null) {
      body.max_tokens = options.max_tokens;
    }
    if (options?.response_format) {
      body.response_format = options.response_format;
    }

    logger.info("secureNvidiaChat: Calling NVIDIA API", { model: body.model, messageCount: messages.length });

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    if (!response.ok) {
      logger.error("secureNvidiaChat API Error:", { status: response.status, rawText: rawText.slice(0, 500) });
      throw new HttpsError("internal", `NVIDIA API error (${response.status}): ${rawText.slice(0, 300)}`);
    }

    const parsed = JSON.parse(rawText);
    logger.info("secureNvidiaChat: Success", { model: body.model, hasChoices: !!parsed?.choices?.length });
    return parsed;
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    logger.error("secureNvidiaChat global catch:", { message: error.message, stack: error.stack });
    throw new HttpsError("internal", `NVIDIA proxy failed: ${error.message || "Unknown error"}`);
  }
});

