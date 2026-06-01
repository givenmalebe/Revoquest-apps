import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, User, Mail, Phone, GraduationCap, CheckCircle, Send, Upload, FileText } from "lucide-react";
import { emailService, EnrollmentEmailData } from "@/services/emailService";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  identityNumber: "",
  course: "",
  message: "",
  cvFile: null as File | null,
  cvFileName: "",
  qualificationsFile: null as File | null,
  qualificationsFileName: ""
};

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationForm = ({ isOpen, onClose }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({ ...initialFormState });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isUploadingQualifications, setIsUploadingQualifications] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("CV file size must be less than 5MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name
      }));
      setError("");
    }
  };

  const handleQualificationsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Qualifications file size must be less than 5MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        qualificationsFile: file,
        qualificationsFileName: file.name
      }));
      setError("");
    }
  };

  const uploadCVFile = async (file: File, email: string): Promise<string> => {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `enrollments/${email.replace(/[^a-zA-Z0-9]/g, '_')}_CV_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw new Error('Failed to upload CV file');
    }
  };

  const uploadQualificationsFile = async (file: File, email: string): Promise<string> => {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `enrollments/${email.replace(/[^a-zA-Z0-9]/g, '_')}_Qualifications_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading qualifications:', error);
      throw new Error('Failed to upload qualifications file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Validate CV is required
    if (!formData.cvFile) {
      setError("CV file is required. Please upload your CV.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Upload CV file (required)
      let cvFileUrl: string | undefined;
      let cvFileName: string | undefined;
      
      setIsUploadingCV(true);
      try {
        cvFileUrl = await uploadCVFile(formData.cvFile, formData.email);
        cvFileName = formData.cvFileName;
      } catch (uploadError) {
        console.error('CV upload failed:', uploadError);
        setError("Failed to upload CV file. Please try again.");
        setIsUploadingCV(false);
        setIsSubmitting(false);
        return;
      } finally {
        setIsUploadingCV(false);
      }

      // Upload Qualifications file if provided (optional)
      let qualificationsFileUrl: string | undefined;
      let qualificationsFileName: string | undefined;
      
      if (formData.qualificationsFile) {
        setIsUploadingQualifications(true);
        try {
          qualificationsFileUrl = await uploadQualificationsFile(formData.qualificationsFile, formData.email);
          qualificationsFileName = formData.qualificationsFileName;
        } catch (uploadError) {
          console.error('Qualifications upload failed:', uploadError);
          setError("Failed to upload qualifications file. Please try again or submit without qualifications.");
          setIsUploadingQualifications(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingQualifications(false);
        }
      }

      // IMPORTANT: Applicants are NOT learners yet.
      // Do not create Firebase Auth users or learner profiles here.
      // Store as an application record for admin review.
      try {
        await addDoc(collection(db, "applications"), {
          type: "learning-journey",
          status: "pending",
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          identityNumber: formData.identityNumber,
          courseInterest: formData.course,
          message: formData.message,
          cvFileUrl: cvFileUrl || null,
          cvFileName: cvFileName || null,
          qualificationsFileUrl: qualificationsFileUrl || null,
          qualificationsFileName: qualificationsFileName || null,
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        // Email still goes out; DB entry is optional.
        console.warn("Failed to write application record:", dbErr);
      }
      
      // Send enrollment emails
      try {
        const emailData: EnrollmentEmailData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: "applicant",
          course: formData.course,
          message: formData.message,
          fileUrl: cvFileUrl,
          cvFileName: cvFileName,
          qualificationsFileUrl: qualificationsFileUrl,
          qualificationsFileName: qualificationsFileName
        };
        
        console.log('Sending enrollment emails...', { email: formData.email, name: `${formData.firstName} ${formData.lastName}` });
        const result = await emailService.sendEnrollmentEmails(emailData);
        console.log('Enrollment emails sent successfully:', result);
        setEmailSent(true);
      } catch (emailError: any) {
        console.error('Email sending failed:', emailError);
        console.error('Error details:', {
          message: emailError?.message,
          code: emailError?.code,
          details: emailError?.details
        });
        // Still show success but warn about email
        setError(`Registration successful! However, the confirmation email may not have been sent. Please check your spam folder or contact us at ${ADMIN_EMAIL} if you don't receive it.`);
        // Don't fail the registration if email fails, but log it
      }
      
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsSubmitted(false);
    setEmailSent(false);
    setError("");
    setFormData({ 
      ...initialFormState,
      cvFile: null,
      cvFileName: "",
      qualificationsFile: null,
      qualificationsFileName: ""
    });
    onClose();
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const courses = [
    // Education and Teaching
    "Occupational Certificate: Occupational Trainer (ID: 97154, NQF Level: 4, Credits: 124, QCTO)",
    "Occupational Certificate: Adult Literacy Teacher (ID: 101709, NQF Level: 5, Credits: 198, QCTO)",
    
    // IT and Related
    "Occupational Certificate: Software Tester (ID: 119438, NQF Level: 5, Credits: 70, QCTO)",
    
    // Health and Safety and Construction
    "National Certificate: Construction Health and Safety (ID: 77063, NQF Level: 3, Credits: 133, CETA)",
    
    // Insurance and Finance Courses
    "Occupational Certificate: Trustee (ID: 118694, NQF Level: 4, Credits: 31, QCTO)",
    "Occupational Certificate: Financial Advisor (ID: 105026, NQF Level: 6, Credits: 515, QCTO)",
    "Occupational Certificate: Internal Audit Manager (ID: 101370, NQF Level: 8, Credits: 116, QCTO)",
    "Occupational Certificate: Insurance Claims Administrator (ID: 99668, NQF Level: 4, Credits: 131, QCTO)",
    "Occupational Certificate: Employee and Pension Fund Benefit Adviser (ID: 105025, NQF Level: 5, Credits: 110, QCTO)",
    "Occupational Certificate: Insurance Underwriter (ID: 117329, NQF Level: 5, Credits: 163, QCTO)",
    "Occupational Certificate: Investment Adviser (ID: 105021, NQF Level: 6, Credits: 213, QCTO)",
    "Advanced Occupational Diploma: Financial Administration Manager (ID: 121568, NQF Level: 7, Credits: 232, QCTO)",
    
    // Professional Courses
    "Occupational Certificate: Compliance Officer (ID: 91671, NQF Level: 6, Credits: 240, QCTO)",
    "Occupational Certificate: Organisational Risk Practitioner (ID: 94222, NQF Level: 6, Credits: 125, QCTO)",
    "Advanced Occupational Certificate: Human Resource Management Officer (ID: 121151, NQF Level: 6, Credits: 134, QCTO)",
    "Occupational Certificate: Supply Chain Manager (ID: 111357, NQF Level: 6, Credits: 180, QCTO)",
    "Occupational Certificate: General Manager Public Service (ID: 118791, NQF Level: 6, Credits: 150, QCTO)",
    "Occupational Certificate: Quality Manager (ID: 118768, NQF Level: 6, Credits: 270, QCTO)",
    "Occupational Certificate: Project Manager (ID: 101869, NQF Level: 5, Credits: 240, QCTO)",
    "Occupational Certificate: Labour Inspector (ID: 118748, NQF Level: 5, Credits: 209, QCTO)",
    "Occupational Certificate: Physical Asset Manager (ID: 118113, NQF Level: 7, Credits: 225, QCTO)",
    "Occupational Certificate: Quality Assurer (ID: 118769, NQF Level: 5, Credits: 106, QCTO)",
    "Occupational Certificate: Marketing Coordinator (ID: 706118, NQF Level: 5, Credits: 175, QCTO)",
    "Occupational Certificate: Social Auxiliary Worker (ID: 98890, NQF Level: 5, Credits: 129, QCTO)",
    "Occupational Certificate: Safety Inspector - Forestry (ID: 99712, NQF Level: 4, Credits: 278, QCTO)",
    "Occupational Certificate: Small Business Consultant (ID: 118741, NQF Level: 5, Credits: 244, QCTO)",
    "Occupational Certificate: Governance Professional (ID: 118115, NQF Level: 8, Credits: 156, QCTO)",
    "Occupational Certificate: Tourist Information Officer (ID: 101865, NQF Level: 5, Credits: 280, QCTO)",
    "Occupational Certificate: Environmental Monitor (ID: 121889, NQF Level: 5, Credits: 102, QCTO)",
    "Higher Occupational Certificate: Business Development Officer (ID: 121567, NQF Level: 5, Credits: 230, QCTO)",
    
    // Short Skills Programs
    "Develop Outcomes-Based Learning Programmes (ID: 123394, NQF Level: 5, Credits: 10, ETDP-SETA)",
    "Facilitate Transfer and Application of Learning (ID: 123398, NQF Level: 5, Credits: 5, ETDP-SETA)",
    "Design Outcomes-Based Assessment (ID: 120401, NQF Level: 6, Credits: 15, ETDP-SETA)",
    "Conduct Outcomes-Based Assessment (ID: 115753, NQF Level: 5, Credits: 15, ETDP-SETA)",
    "Facilitate Learning Using Various Methodologies (ID: 117871, NQF Level: 5, Credits: 10, ETDP-SETA)",
    "Conduct Moderation of Outcomes-Based Assessment (ID: 115759, NQF Level: 6, Credits: 10, ETDP-SETA)",
    "Identify and Respond to Learners with Special Needs (ID: 10294, NQF Level: 5, Credits: 10, ETDP-SETA)",
    "Devise Intervention for Learners with Special Needs (ID: 10305, NQF Level: 6, Credits: 16, ETDP-SETA)",
    "Conduct Skills Development Administration (ID: 15227, NQF Level: 4, Credits: 4, ETDP-SETA)"
  ];

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="w-full max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-r from-green-100 via-white to-white dark:from-green-900/40 dark:via-slate-900 dark:to-slate-900/80 px-8 sm:px-12 py-8 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              Application Submitted!
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Thank you for your application. We'll contact you soon with course details.
            </p>
            {emailSent && (
              <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 bg-white dark:bg-green-900/20 border border-green-100 dark:border-green-800 mt-4 px-4 py-1.5 rounded-full text-sm font-medium">
                <Send className="w-4 h-4" />
                Confirmation email sent!
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 px-6 sm:px-10 py-6 text-left text-slate-600 dark:text-slate-300">
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Holiday Notice
                </h4>
                <p>
                  Welcome and thank you for applying to Revo Quest Institute. Our offices will be closed for the December holidays between the 19th of December and 6 of January 2026.
                </p>
                <p>
                  As an RPL candidate please send us your documents for pre-assessment first thing when our offices opens in Jan. We will also call you to verify all documents and for speedy processing of your applications.
                </p>
              </section>

              <section className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Documents Required
                </h4>
                <ul className="mt-4 space-y-2">
                  {[
                    "Certified ID",
                    "Certified qualifications",
                    "Comprehensive CV",
                    "Service letter from your employer with relevant experience supporting the qualification you are seeking RPL."
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/40 space-y-2 mt-6">
              <p>
                Thank you for your corporation and we hope and wish you the best this season and a happy new year.
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                Regards<br />Revo Quest Admissions Team
              </p>
            </section>
          </div>

          <div className="bg-white dark:bg-slate-900 px-6 sm:px-10 pb-6">
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 text-base"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-orange-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  ✓
                </div>
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                  Start Your Learning Journey
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                  Fill out the form below to apply for our courses
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-10 w-10 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Personal Info</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Course Selection</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Submit</span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  First Name *
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="pl-4 h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  Last Name *
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="pl-4 h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-500" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Identity Number (ID NO)
            </Label>
            <Input
              id="identityNumber"
              type="text"
              placeholder="Enter your ID number"
              value={formData.identityNumber}
              onChange={(e) => handleInputChange("identityNumber", e.target.value)}
              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500">
              This will be used on your certificate under <span className="font-semibold">ID NO</span>. You can also edit it later in your profile.
            </p>
          </div>

          {/* Course Selection Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Course Selection</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Course Interest *
              </Label>
              <Select onValueChange={(value) => handleInputChange("course", value)}>
                <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="max-h-96 overflow-y-auto">
                  <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b">
                    Education and Teaching
                  </div>
                  {courses.slice(0, 2).map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}

                  <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b mt-2">
                    IT and Related
                  </div>
                  {courses.slice(2, 3).map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}

                  <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b mt-2">
                    Health and Safety
                  </div>
                  {courses.slice(3, 4).map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}

                  <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b mt-2">
                    Insurance and Finance
                  </div>
                  {courses.slice(4, 12).map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}

                  <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b mt-2">
                    Professional Courses
                  </div>
                  {courses.slice(12, 30).map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}

                  <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b mt-2">
                    Short Skills Programs
                  </div>
                  {courses.slice(30, 39).map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Additional Message
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your learning goals or any questions you have..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={4}
              className="border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800 resize-none"
            />
          </div>

          {/* CV Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="cv" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Upload CV <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  id="cv"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="cv"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <Upload className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {formData.cvFileName || "Choose CV file (PDF, DOC, DOCX - Max 5MB)"}
                  </span>
                </label>
              </div>
              {formData.cvFileName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, cvFile: null, cvFileName: "" }))}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.cvFileName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {formData.cvFileName} ({formData.cvFile ? (formData.cvFile.size / 1024).toFixed(1) : 0} KB)
              </p>
            )}
          </div>

          {/* Qualifications Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="qualifications" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Upload Qualifications (Optional)
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  id="qualifications"
                  accept=".pdf,.doc,.docx"
                  onChange={handleQualificationsFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="qualifications"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <Upload className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {formData.qualificationsFileName || "Choose Qualifications file (PDF, DOC, DOCX - Max 5MB)"}
                  </span>
                </label>
              </div>
              {formData.qualificationsFileName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, qualificationsFile: null, qualificationsFileName: "" }))}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.qualificationsFileName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {formData.qualificationsFileName} ({formData.qualificationsFile ? (formData.qualificationsFile.size / 1024).toFixed(1) : 0} KB)
              </p>
            )}
          </div>

          {/* Submit Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Submit Application</h3>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingCV || isUploadingQualifications}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting || isUploadingCV || isUploadingQualifications ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isUploadingCV ? "Uploading CV..." : 
                       isUploadingQualifications ? "Uploading Qualifications..." : 
                       "Submitting Application..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Apply Now</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
              onClick={handleClose}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 h-14 text-lg font-medium transition-all duration-300"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              By submitting this form, you agree to our{" "}
              <a href="#" className="text-orange-600 hover:text-orange-700 underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-orange-600 hover:text-orange-700 underline">Privacy Policy</a>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
