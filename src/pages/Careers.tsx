import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { emailService } from "@/services/emailService";
import { FileUploadService } from "@/services/fileUploadService";
import firebaseApi from "@/services/firebaseApi";
import {
  Briefcase,
  Users,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  Lightbulb,
  Target,
  Globe,
  Building,
  Send,
  X,
  FileText,
  User,
  Upload,
  File
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

export const Careers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("careers");

  // Modal states
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showEDSTModal, setShowEDSTModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [applicationForm, setApplicationForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    message: "",
    cvFile: null as File | null
  });

  const [cvForm, setCvForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    cvFile: null as File | null
  });

  const [edstForm, setEdstForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    program: "",
    message: ""
  });

  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load jobs from Firebase on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log('Loading jobs in Careers page...');
      const response = await firebaseApi.jobs.getAll('active');
      console.log('Careers jobs response:', response);
      if (response.success) {
        console.log('Setting careers jobs:', response.data);
        setOpenPositions(response.data);
      } else {
        console.error('Failed to load jobs in careers:', response);
      }
    } catch (error) {
      console.error('Error loading jobs in careers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "careers" || tab === "edst")) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setSearchParams({ tab });
  };

  // Form handlers
  const handleInputChange = (formType: string, field: string, value: string) => {
    if (formType === "application") {
      setApplicationForm(prev => ({ ...prev, [field]: value }));
    } else if (formType === "cv") {
      setCvForm(prev => ({ ...prev, [field]: value }));
    } else if (formType === "edst") {
      setEdstForm(prev => ({ ...prev, [field]: value }));
    }
    if (error) setError("");
  };

  const handleFileChange = (file: File | null) => {
    setApplicationForm(prev => ({ ...prev, cvFile: file }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let cvFileUrl = "";
      let cvFileName = "";

      // Upload CV file if provided
      if (applicationForm.cvFile) {
        try {
          const uploadedFile = await FileUploadService.uploadCVFile(
            applicationForm.cvFile,
            "job-applications",
            "general",
            "cv"
          );
          cvFileUrl = uploadedFile.url;
          cvFileName = uploadedFile.name;
        } catch (uploadError) {
          console.error("CV file upload failed:", uploadError);
          setError("Failed to upload CV file. Please try again or submit without the file.");
          setIsSubmitting(false);
          return;
        }
      }

      // Save job application to Firebase for admin review
      await firebaseApi.jobApplications.create({
        jobId: "general", // Since we don't have a specific job ID from the careers page
        jobTitle: applicationForm.position,
        firstName: applicationForm.firstName,
        lastName: applicationForm.lastName,
        email: applicationForm.email,
        phone: applicationForm.phone,
        position: applicationForm.position,
        message: applicationForm.message,
        closingDate: "", // No closing date from application form
        cvFileUrl: cvFileUrl || undefined,
        cvFileName: cvFileName || undefined
      });

      // TODO: Send job application email when Cloud Function is ready
      // await emailService.sendJobApplication({...});

      setShowApplicationModal(false);
      setApplicationForm({ firstName: "", lastName: "", email: "", phone: "", position: "", message: "", cvFile: null });
      alert("Application submitted successfully! Our HR team will contact you soon.");
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCV = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let fileUrl = "";

      // Upload CV file if provided
      if (cvForm.cvFile) {
        try {
          const uploadedFile = await FileUploadService.uploadPOEFile(
            cvForm.cvFile,
            "cv-submissions",
            "general",
            "cv"
          );
          fileUrl = uploadedFile.url;
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          setError("Failed to upload CV file. Please try again or submit without the file.");
          setIsSubmitting(false);
          return;
        }
      }

      await emailService.sendEnrollmentEmail({
        firstName: cvForm.firstName,
        lastName: cvForm.lastName,
        email: cvForm.email,
        phone: cvForm.phone,
        role: "CV Submission",
        course: "General CV Submission",
        message: `${cvForm.message}${fileUrl ? `\n\nCV File: ${fileUrl}` : ''}`
      });

      setShowCVModal(false);
      setCvForm({ firstName: "", lastName: "", email: "", phone: "", message: "", cvFile: null });
      alert("CV submitted successfully! Our HR team will review your application.");
    } catch (error) {
      setError("Failed to submit CV. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEDST = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await emailService.sendEnrollmentEmail({
        firstName: edstForm.firstName,
        lastName: edstForm.lastName,
        email: edstForm.email,
        phone: edstForm.phone,
        role: "EDST Program Interest",
        course: edstForm.program,
        message: `Interest in EDST Program: ${edstForm.program}\n\n${edstForm.message}`
      });

      setShowEDSTModal(false);
      setEdstForm({ firstName: "", lastName: "", email: "", phone: "", program: "", message: "" });
      alert("EDST program inquiry submitted successfully! Our team will contact you soon.");
    } catch (error) {
      setError("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button handlers
  const handleViewPositions = () => {
    if (selectedTab !== "careers") {
      handleTabChange("careers");
    }
    // Scroll to open positions section
    setTimeout(() => {
      const element = document.querySelector('#open-positions');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleViewEDSTPrograms = () => {
    if (selectedTab !== "edst") {
      handleTabChange("edst");
    }
    // Scroll to EDST programs section
    setTimeout(() => {
      const element = document.querySelector('#edst-programs');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSendCV = () => {
    setShowCVModal(true);
  };

  const handleEnrollNow = () => {
    setShowEDSTModal(true);
  };

  const handleApplyNow = (positionTitle: string) => {
    setApplicationForm(prev => ({ ...prev, position: positionTitle }));
    setShowApplicationModal(true);
  };

  const handleViewDetails = (position: any) => {
    // For now, just show an alert - could be expanded to show a detailed modal
    alert(`Viewing details for: ${position.title}\n\n${position.description}\n\nRequirements: ${position.requirements.join(", ")}`);
  };

  const handleCallHR = () => {
    window.location.href = "tel:+27105953692";
  };

  const handleEmailHR = () => {
    window.location.href = "mailto:info@revoquest.co.za";
  };

  const handleEmailEDST = () => {
    window.location.href = "mailto:edst@revoquest.co.za";
  };

  // Admin functions


  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive medical aid and wellness programs"
    },
    {
      icon: GraduationCap,
      title: "Professional Development",
      description: "Free access to all our courses and training programs"
    },
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description: "Market-related salaries with performance bonuses"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Work-life balance with flexible working arrangements"
    },
    {
      icon: Users,
      title: "Team Environment",
      description: "Collaborative and supportive work culture"
    },
    {
      icon: Star,
      title: "Career Growth",
      description: "Clear career progression paths and opportunities"
    }
  ];

  const companyValues = [
    "Excellence in Education",
    "Student-Centered Approach",
    "Innovation & Technology",
    "Professional Integrity",
    "Continuous Learning",
    "Community Impact"
  ];

  const applicationProcess = [
    {
      step: 1,
      title: "Submit Application",
      description: "Complete online application with CV and cover letter"
    },
    {
      step: 2,
      title: "Initial Screening",
      description: "HR team reviews applications and shortlists candidates"
    },
    {
      step: 3,
      title: "Interview Process",
      description: "Panel interview with department heads and HR"
    },
    {
      step: 4,
      title: "Skills Assessment",
      description: "Practical assessment relevant to the role"
    },
    {
      step: 5,
      title: "Reference Checks",
      description: "Verification of previous employment and references"
    },
    {
      step: 6,
      title: "Job Offer",
      description: "Successful candidates receive formal job offers"
    }
  ];

  // EDST Content
  const edstPrograms = [
    {
      title: "Workforce Development Program",
      description: "Comprehensive training for small to medium companies to enhance employee development and performance management",
      duration: "6 months",
      level: "Intermediate",
      features: [
        "Modern training techniques",
        "Employee performance management strategies",
        "Skills assessment methods",
        "Technology integration in workforce development"
      ],
      icon: GraduationCap
    },
    {
      title: "Business Leadership Course",
      description: "Develop leadership skills for small to medium company managers and department heads",
      duration: "4 months",
      level: "Advanced",
      features: [
        "Strategic planning in business",
        "Team management and motivation",
        "Budget and resource management",
        "Organizational policy implementation"
      ],
      icon: Target
    },
    {
      title: "Training Program Development Workshop",
      description: "Learn to design and implement effective training programs for various business contexts",
      duration: "3 months",
      level: "Intermediate",
      features: [
        "Training program design principles",
        "Learning outcome alignment",
        "Assessment integration",
        "Quality assurance in workforce development"
      ],
      icon: BookOpen
    },
    {
      title: "Digital Training Specialist",
      description: "Master digital tools and platforms for modern workforce training delivery",
      duration: "5 months",
      level: "Intermediate",
      features: [
        "Learning Management Systems",
        "Online assessment tools",
        "Interactive content creation",
        "Employee engagement strategies"
      ],
      icon: Lightbulb
    }
  ];

  const edstBenefits = [
    {
      icon: Award,
      title: "Industry Recognition",
      description: "Gain credentials recognized by educational institutions nationwide"
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Training aligned with international best practices in education"
    },
    {
      icon: Users,
      title: "Business Network",
      description: "Connect with small to medium companies and industry leaders from across the country"
    },
    {
      icon: Lightbulb,
      title: "Innovation Focus",
      description: "Learn cutting-edge teaching methods and educational technologies"
    },
    {
      icon: Target,
      title: "Business Growth",
      description: "Enhance your company's capabilities and competitive advantage in the market"
    },
    {
      icon: Heart,
      title: "Impact Making",
      description: "Contribute to improving workforce development and organizational performance"
    }
  ];

  const edstTestimonials = [
    {
      name: "Dr. Sarah Mthembu",
      role: "CEO, TechStart Solutions",
      quote: "The EDST program transformed our company's approach to workforce development. The practical strategies we learned are now implemented across our entire organization.",
      rating: 5
    },
    {
      name: "Mr. Thabo Nkosi",
      role: "HR Director, Cape Town Manufacturing",
      quote: "The digital learning specialist course revolutionized our training methods. Our employees are more engaged and perform better than ever before.",
      rating: 5
    },
    {
      name: "Ms. Nomsa Dlamini",
      role: "Operations Manager, Durban Logistics",
      quote: "The curriculum development workshop gave us the tools to create more effective training programs. Our employee success rates have improved significantly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 text-slate-900 dark:text-white py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.2),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30">
              {selectedTab === "careers" ? (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Join Our Team
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Education Development
                </>
              )}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {selectedTab === "careers" 
                ? "Careers at RevoQuest Training Institute"
                : "EDST - Education Development & Support Training"
              }
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-600 dark:text-slate-300">
              {selectedTab === "careers" 
                ? "Build Your Career in Education Excellence"
                : "Advance Your Educational Career with Professional Development"
              }
            </p>
            <p className="text-lg mb-8 text-slate-500 dark:text-slate-400">
              {selectedTab === "careers"
                ? "Join our passionate team dedicated to transforming lives through quality education and professional development"
                : "Enhance your teaching skills and advance your career in education with our comprehensive development programs"
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {selectedTab === "careers" ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleViewPositions}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    View Open Positions
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleSendCV}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <Mail className="mr-2 w-5 h-5" />
                    Send CV
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={handleViewEDSTPrograms}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    View EDST Programs
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleEnrollNow}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <Mail className="mr-2 w-5 h-5" />
                    Enroll Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Careers Content */}
      {selectedTab === "careers" && (
        <>
          {/* Enhanced Why Work With Us */}
          <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-green-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-green-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Employee Benefits
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Why Work{" "}
                  <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                    With Us?
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  We offer more than just a job - we provide a fulfilling career path in the education sector with comprehensive benefits and growth opportunities
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative pb-4">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-200/50 transition-all duration-300 group-hover:scale-110">
                          <benefit.icon className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-green-700 transition-colors">
                        {benefit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Enhanced Company Values */}
          <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Our Foundation
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Our{" "}
                  <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                    Values
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  These core values guide everything we do and shape our workplace culture, ensuring we deliver excellence in education
                </p>
              </div>
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyValues.map((value, index) => (
                    <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6 relative">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                            {value}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Open Positions */}
          <section id="open-positions" className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Current Openings
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Open{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                    Positions
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Explore current job opportunities and find your perfect role in our growing team
                </p>
                <Button
                  onClick={loadJobs}
                  variant="outline"
                  className="mt-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Refresh Jobs
                </Button>
              </div>
              <div className="max-w-6xl mx-auto">
                {loading ? (
                  <Card className="text-center py-16">
                    <CardContent className="p-8">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 dark:text-slate-400">Loading job opportunities...</p>
                    </CardContent>
                  </Card>
                ) : openPositions.length > 0 ? (
                  <div className="space-y-8">
                    {openPositions.map((position, index) => (
                      <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CardHeader className="relative pb-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                  {position.department}
                                </Badge>
                                <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                                  {position.type}
                                </Badge>
                              </div>
                              <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-blue-700 transition-colors">
                                {position.title}
                              </CardTitle>
                              <CardDescription className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                {position.description}
                              </CardDescription>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">{position.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">{position.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">{position.salary}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">{position.experience}</span>
                                </div>
                              </div>
                              <div className="mt-4 space-y-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Posted {new Date(position.postedAt).toLocaleDateString()}
                                </p>
                                {position.closingDate && (
                                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                    ⏰ Closes {new Date(position.closingDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="relative pt-0">
                          <div className="mb-8">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-lg">Requirements:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {position.requirements.map((req, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-600 dark:text-slate-300">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                              onClick={() => handleApplyNow(position.title)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                            >
                              Apply Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20 border-0">
                    <CardContent className="p-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                        No Open Positions Currently
                      </h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                        We're not currently hiring, but we're always interested in connecting with talented individuals. 
                        Send us your CV and we'll keep you in mind for future opportunities.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={handleSendCV}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3"
                        >
                          <Mail className="mr-2 w-5 h-5" />
                          Send Your CV
                        </Button>
                        <Button
                          onClick={handleCallHR}
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3"
                        >
                          <Phone className="mr-2 w-5 h-5" />
                          Contact HR
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>

          {/* Enhanced Application Process */}
          <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Hiring Process
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Application{" "}
                  <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent">
                    Process
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Our streamlined hiring process ensures a smooth and professional experience for all candidates
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 transform md:-translate-x-0.5"></div>

                  <div className="space-y-12">
                    {applicationProcess.map((step, index) => (
                      <div key={index} className={`relative flex items-center ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}>
                        {/* Timeline Node */}
                        <div className={`absolute left-8 md:left-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transform md:-translate-x-8 z-10 transition-all duration-300 ${
                          index % 2 === 0 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-white border-4 border-amber-300 text-amber-600'
                        }`}>
                          {step.step}
                        </div>

                        {/* Content Card */}
                        <div className={`w-full md:w-5/12 ml-20 md:ml-0 ${
                          index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                        }`}>
                          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
                          </Card>
                        </div>

                        {/* Spacer for alternating layout */}
                        <div className="hidden md:block md:w-2/12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </>
      )}

      {/* EDST Content */}
      {selectedTab === "edst" && (
        <>
          {/* Enhanced EDST Programs */}
          <section id="edst-programs" className="py-20 bg-gradient-to-br from-white via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Professional Development
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  EDST{" "}
                  <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                    Programs
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Comprehensive professional development programs designed for small to medium companies to enhance their workforce capabilities
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {edstPrograms.map((program, index) => (
                  <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative pb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-200/50 transition-all duration-300 group-hover:scale-110">
                            <program.icon className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                          {program.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-purple-700 transition-colors">
                        {program.title}
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                        {program.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Duration: {program.duration}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-lg">Program Features:</h4>
                      <div className="space-y-3 mb-6">
                        {program.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Enhanced EDST Benefits */}
          <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-green-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Why Choose EDST
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Why Choose{" "}
                  <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                    EDST?
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Our programs are designed to provide maximum value and workforce development opportunities for small to medium companies
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {edstBenefits.map((benefit, index) => (
                  <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative pb-4">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-200/50 transition-all duration-300 group-hover:scale-110">
                          <benefit.icon className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-green-700 transition-colors">
                        {benefit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Enhanced EDST Testimonials */}
          <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="mb-6 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                  <Star className="w-4 h-4 mr-2" />
                  Success Stories
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Success{" "}
                  <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent">
                    Stories
                  </span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Hear from small to medium companies who have transformed their workforce with our EDST programs
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {edstTestimonials.map((testimonial, index) => (
                  <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800 dark:to-amber-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-center mb-6 justify-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <blockquote className="text-slate-600 dark:text-slate-300 mb-6 text-center leading-relaxed italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="border-t border-amber-200 dark:border-amber-800 pt-6 text-center">
                        <p className="font-bold text-slate-800 dark:text-white mb-1">{testimonial.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Enhanced EDST Call to Action */}
          <section className="relative py-24 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,0,0,0.1),transparent_70%)]"></div>

            {/* Animated floating elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <GraduationCap className="w-20 h-20 mx-auto mb-8 text-purple-100" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Ready to Advance Your{" "}
                  <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                    Educational Career?
                  </span>
                </h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
                  <p className="text-xl md:text-2xl mb-4 text-purple-50 leading-relaxed">
                    Join thousands of small to medium companies who have enhanced their workforce capabilities with our comprehensive EDST programs
                  </p>
                  <p className="text-lg text-purple-100 leading-relaxed">
                    Take the next step in your educational journey with industry-recognized professional development
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                  <Button
                    size="lg"
                    onClick={handleEnrollNow}
                    className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  >
                    <GraduationCap className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Enroll in EDST Program
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleEmailEDST}
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Mail className="mr-2 w-5 h-5" />
                    Request Information
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <button
                    onClick={handleEmailEDST}
                    className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 text-left"
                  >
                    <Mail className="w-8 h-8 mx-auto mb-4 text-purple-200" />
                    <p className="font-semibold text-lg mb-1">Email Us</p>
                    <p className="text-purple-100">edst@revoquest.co.za</p>
                  </button>
                  <button
                    onClick={handleCallHR}
                    className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 text-left"
                  >
                    <Phone className="w-8 h-8 mx-auto mb-4 text-purple-200" />
                    <p className="font-semibold text-lg mb-1">Call Us</p>
                    <p className="text-purple-100">010 595 3692</p>
                  </button>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                    <Calendar className="w-8 h-8 mx-auto mb-4 text-purple-200" />
                    <p className="font-semibold text-lg mb-1">Office Hours</p>
                    <p className="text-purple-100">Mon-Fri: 8:00 - 16:30</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    ✓
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                    Apply for Position
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                    Submit your application for {applicationForm.position}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApplicationModal(false)}
                className="h-10 w-10 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="appFirstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  First Name *
                </Label>
                <Input
                  id="appFirstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={applicationForm.firstName}
                  onChange={(e) => handleInputChange("application", "firstName", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appLastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Name *
                </Label>
                <Input
                  id="appLastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={applicationForm.lastName}
                  onChange={(e) => handleInputChange("application", "lastName", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address *
              </Label>
              <Input
                id="appEmail"
                type="email"
                placeholder="Enter your email address"
                value={applicationForm.email}
                onChange={(e) => handleInputChange("application", "email", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number *
              </Label>
              <Input
                id="appPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={applicationForm.phone}
                onChange={(e) => handleInputChange("application", "phone", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appPosition" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Position
              </Label>
              <Input
                id="appPosition"
                type="text"
                value={applicationForm.position}
                onChange={(e) => handleInputChange("application", "position", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                disabled
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="appMessage" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cover Letter / Message
              </Label>
              <Textarea
                id="appMessage"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                value={applicationForm.message}
                onChange={(e) => handleInputChange("application", "message", e.target.value)}
                rows={5}
                className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appCvFile" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Upload Your CV (PDF, DOC, DOCX - Max 5MB) *
              </Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="appCvFile"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
                <label htmlFor="appCvFile" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {applicationForm.cvFile ? applicationForm.cvFile.name : 'Click to upload CV'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        PDF, DOC, or DOCX files only
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              {applicationForm.cvFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <File className="w-4 h-4" />
                  <span>File selected: {applicationForm.cvFile.name}</span>
                  <span className="text-slate-500">
                    ({(applicationForm.cvFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
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
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Application...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Application</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 h-14 text-lg font-medium transition-all duration-300"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              By submitting this application, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CV Submission Modal */}
      <Dialog open={showCVModal} onOpenChange={(open) => {
        setShowCVModal(open);
        if (!open) {
          setCvForm({ firstName: "", lastName: "", email: "", phone: "", message: "", cvFile: null });
          if (error) setError("");
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    ✓
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                    Send Your CV
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                    Submit your CV for general consideration
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCVModal(false)}
                className="h-10 w-10 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitCV} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cvFirstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  First Name *
                </Label>
                <Input
                  id="cvFirstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={cvForm.firstName}
                  onChange={(e) => handleInputChange("cv", "firstName", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvLastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Name *
                </Label>
                <Input
                  id="cvLastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={cvForm.lastName}
                  onChange={(e) => handleInputChange("cv", "lastName", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address *
              </Label>
              <Input
                id="cvEmail"
                type="email"
                placeholder="Enter your email address"
                value={cvForm.email}
                onChange={(e) => handleInputChange("cv", "email", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number *
              </Label>
              <Input
                id="cvPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={cvForm.phone}
                onChange={(e) => handleInputChange("cv", "phone", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvMessage" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tell us about yourself
              </Label>
              <Textarea
                id="cvMessage"
                placeholder="Share your experience, skills, and what type of role you're interested in..."
                value={cvForm.message}
                onChange={(e) => handleInputChange("cv", "message", e.target.value)}
                rows={5}
                className="border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvFile" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Upload Your CV (PDF, DOC, DOCX - Max 5MB)
              </Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                <input
                  id="cvFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError("File size must be less than 5MB");
                      return;
                    }
                    setCvForm(prev => ({ ...prev, cvFile: file }));
                    if (error) setError("");
                  }}
                  className="hidden"
                />
                <label htmlFor="cvFile" className="cursor-pointer">
                  {cvForm.cvFile ? (
                    <div className="flex items-center justify-center gap-3 text-green-600">
                      <File className="w-8 h-8" />
                      <div className="text-left">
                        <p className="font-medium">{cvForm.cvFile.name}</p>
                        <p className="text-sm text-slate-500">
                          {(cvForm.cvFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 text-slate-500">
                      <Upload className="w-8 h-8" />
                      <div className="text-left">
                        <p className="font-medium">Click to upload your CV</p>
                        <p className="text-sm">PDF, DOC, or DOCX (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
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
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting CV...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Submit CV</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCVModal(false)}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 h-14 text-lg font-medium transition-all duration-300"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              We will review your CV and contact you if we have suitable opportunities.
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDST Enrollment Modal */}
      <Dialog open={showEDSTModal} onOpenChange={setShowEDSTModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    ✓
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                    EDST Program Enrollment
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                    Express your interest in our professional development programs
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEDSTModal(false)}
                className="h-10 w-10 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitEDST} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edstFirstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  First Name *
                </Label>
                <Input
                  id="edstFirstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={edstForm.firstName}
                  onChange={(e) => handleInputChange("edst", "firstName", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edstLastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Name *
                </Label>
                <Input
                  id="edstLastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={edstForm.lastName}
                  onChange={(e) => handleInputChange("edst", "lastName", e.target.value)}
                  className="h-12 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edstEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address *
              </Label>
              <Input
                id="edstEmail"
                type="email"
                placeholder="Enter your email address"
                value={edstForm.email}
                onChange={(e) => handleInputChange("edst", "email", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edstPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number *
              </Label>
              <Input
                id="edstPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={edstForm.phone}
                onChange={(e) => handleInputChange("edst", "phone", e.target.value)}
                className="h-12 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edstProgram" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Program of Interest
              </Label>
              <select
                id="edstProgram"
                value={edstForm.program}
                onChange={(e) => handleInputChange("edst", "program", e.target.value)}
                className="w-full h-12 px-3 border border-slate-300 dark:border-slate-600 rounded-md focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-800"
              >
                <option value="">Select a program</option>
                <option value="Teacher Development Program">Teacher Development Program</option>
                <option value="Educational Leadership Course">Educational Leadership Course</option>
                <option value="Curriculum Development Workshop">Curriculum Development Workshop</option>
                <option value="Digital Learning Specialist">Digital Learning Specialist</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edstMessage" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Additional Information
              </Label>
              <Textarea
                id="edstMessage"
                placeholder="Tell us about your background and why you're interested in this program..."
                value={edstForm.message}
                onChange={(e) => handleInputChange("edst", "message", e.target.value)}
                rows={4}
                className="border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-800 resize-none"
              />
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
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Inquiry...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Inquiry</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEDSTModal(false)}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 h-14 text-lg font-medium transition-all duration-300"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Our team will contact you with program details and enrollment information.
            </div>
          </form>
        </DialogContent>
      </Dialog>


      <Footer />
    </div>
  );
};

export default Careers;
