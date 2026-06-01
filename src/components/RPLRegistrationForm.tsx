import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, FileText, Briefcase, Award, Phone, Mail, MapPin } from "lucide-react";
import { emailService } from "@/services/emailService";

interface RPLRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RPLFormData {
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

export const RPLRegistrationForm = ({ isOpen, onClose }: RPLRegistrationFormProps) => {
  const [formData, setFormData] = useState<RPLFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    currentRole: "",
    company: "",
    yearsExperience: "",
    previousQualifications: "",
    motivation: "",
    preferredContact: "",
    availability: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const rplQualifications = [
    "Occupational Health & Safety (NQF Level 4-6)",
    "Project Management (NQF Level 4-5)",
    "Quality Management (NQF Level 4-6)",
    "Human Resources (NQF Level 4-5)",
    "Supervisory Management (NQF Level 4-5)",
    "Training & Development (NQF Level 4-6)",
    "Other (Please specify in motivation)"
  ];

  const experienceLevels = [
    "3-5 years",
    "5-10 years",
    "10-15 years",
    "15+ years"
  ];

  const contactMethods = [
    "Phone call",
    "Email",
    "WhatsApp",
    "Video call"
  ];

  const availabilityOptions = [
    "Weekdays 8:00-16:30",
    "Weekdays after 16:30",
    "Weekends",
    "Flexible"
  ];

  const handleInputChange = (field: keyof RPLFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Send RPL application email
      await emailService.sendRPLApplication({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        qualification: formData.qualification,
        experience: formData.experience,
        currentRole: formData.currentRole,
        company: formData.company,
        yearsExperience: formData.yearsExperience,
        previousQualifications: formData.previousQualifications,
        motivation: formData.motivation,
        preferredContact: formData.preferredContact,
        availability: formData.availability
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('RPL application submission failed:', error);
      setError("Failed to submit RPL application. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSubmitted(false);
      setError("");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        qualification: "",
        experience: "",
        currentRole: "",
        company: "",
        yearsExperience: "",
        previousQualifications: "",
        motivation: "",
        preferredContact: "",
        availability: ""
      });
      onClose();
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="py-8 space-y-6 text-left">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">RPL Application Received</h3>
              <p className="text-gray-600">
                Welcome and thank you for applying to Revo Quest Institute.
              </p>
              <p className="text-sm text-gray-500">
                A confirmation email (including holiday office hours) has been sent to {formData.email}.
              </p>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Welcome and thank you for applying to Revo Quest Institute. Our offices will be closed for the December holidays between the 19th of December and 6 of January 2026.
              </p>
              <p>
                As an RPL candidate please send us your documents for pre-assessment first thing when our offices opens in Jan. We will also call you to verify all documents and for speedy processing of your applications.
              </p>
              <div>
                <p className="font-medium text-gray-900">The following documents will be required:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Certified ID</li>
                <li>Certified qualifications</li>
                <li>Comprehensive CV</li>
                  <li>Service letter from your employer with relevant experience supporting the qualification you are seeking RPL.</li>
              </ul>
              </div>
              <p>
                Thank you for your corporation and we hope and wish you the best this season and a happy new year.
              </p>
              <p className="font-medium">
                Regards<br />Revo Quest Admissions Team
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <p>Preferred contact: <strong>{formData.preferredContact}</strong></p>
                <p>Preferred time: <strong>{formData.availability}</strong></p>
              </div>
            </div>
            <Button onClick={handleClose} className="mt-4 w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your RPL Journey
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Complete this form to begin your Recognition of Prior Learning assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-600" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentRole">Current Job Title *</Label>
                <Input
                  id="currentRole"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange("currentRole", e.target.value)}
                  required
                  placeholder="e.g., Safety Manager, Project Coordinator"
                />
              </div>
              <div>
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Your current employer"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange("yearsExperience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="qualification">Desired Qualification *</Label>
                  <Select value={formData.qualification} onValueChange={(value) => handleInputChange("qualification", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {rplQualifications.map((qual) => (
                        <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Experience & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience">Work Experience Summary *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  required
                  placeholder="Describe your relevant work experience, key responsibilities, and achievements..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="previousQualifications">Previous Qualifications/Certifications</Label>
                <Textarea
                  id="previousQualifications"
                  value={formData.previousQualifications}
                  onChange={(e) => handleInputChange("previousQualifications", e.target.value)}
                  placeholder="List any relevant qualifications, certifications, or training you have completed..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="motivation">Motivation for RPL *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  required
                  placeholder="Explain why you want to pursue RPL and how it will benefit your career..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-orange-600" />
                Contact Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
                  <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange("preferredContact", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How should we contact you?" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="availability">Best Time to Contact *</Label>
                  <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="When are you available?" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Submit RPL Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
