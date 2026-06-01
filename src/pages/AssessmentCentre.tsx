import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { emailService } from "@/services/emailService";
import {
  ClipboardCheck,
  Award,
  Users,
  CheckCircle,
  FileText,
  Clock,
  Phone,
  Mail,
  Star,
  ArrowRight,
  Building,
  BookOpen,
  Award as AwardIcon,
  Target,
  ChevronDown,
  Calendar
} from "lucide-react";

export const AssessmentCentre = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    education: false,
    business: false,
    social: false,
    safety: false,
    hr: false,
    etdp: false,
    it: false,
    construction: false,
    skills: false,
    insurance: false,
    professional: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleBookAssessment = () => {
    navigate('/contact#contact-form');
  };
  const assessmentTypes = [
    {
      icon: ClipboardCheck,
      title: "Competency Assessments",
      description: "Comprehensive evaluation of practical skills and knowledge",
      features: ["Industry-standard criteria", "Expert assessors", "Real-world scenarios"],
      duration: "2-4 hours"
    },
    {
      icon: Award,
      title: "RPL Assessments",
      description: "Recognition of Prior Learning for experienced professionals",
      features: ["Portfolio evaluation", "Skills demonstration", "Experience validation"],
      duration: "1-2 days"
    },
    {
      icon: Users,
      title: "Group Assessments",
      description: "Team-based evaluations for collaborative skills",
      features: ["Team dynamics", "Leadership assessment", "Communication skills"],
      duration: "3-6 hours"
    },
    {
      icon: FileText,
      title: "Written Examinations",
      description: "Theoretical knowledge testing in controlled environment",
      features: ["Multiple choice", "Essay questions", "Case studies"],
      duration: "1-3 hours"
    }
  ];

  const assessmentProcess = [
    {
      step: 1,
      title: "Registration",
      description: "Complete online registration and submit required documents"
    },
    {
      step: 2,
      title: "Pre-Assessment Briefing",
      description: "Attend orientation session to understand assessment criteria"
    },
    {
      step: 3,
      title: "Assessment Day",
      description: "Complete your assessment in our professional facilities"
    },
    {
      step: 4,
      title: "Evaluation",
      description: "Expert assessors evaluate your performance against standards"
    },
    {
      step: 5,
      title: "Results & Feedback",
      description: "Receive detailed results and constructive feedback"
    },
    {
      step: 6,
      title: "Certification",
      description: "Obtain your certificate upon successful completion"
    }
  ];

  const facilities = [
    {
      title: "Modern Assessment Rooms",
      description: "Fully equipped rooms with latest technology and comfortable seating",
      icon: ClipboardCheck
    },
    {
      title: "Practical Workshops",
      description: "Hands-on assessment areas for technical and practical skills",
      icon: Users
    },
    {
      title: "Computer Labs",
      description: "State-of-the-art computer facilities for digital assessments",
      icon: FileText
    },
    {
      title: "Waiting Areas",
      description: "Comfortable waiting areas with refreshments and study materials",
      icon: Clock
    }
  ];

  const requirements = [
    "Valid South African ID or passport",
    "Proof of qualification or experience",
    "Completed application form",
    "Assessment fee payment",
    "Pre-assessment study materials (if applicable)",
    "Professional references (for RPL assessments)"
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 text-slate-900 dark:text-white py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,146,60,0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(251,146,60,0.2),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.15),transparent_60%)]"></div>

        {/* Animated background shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 dark:bg-orange-800/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full border border-orange-200 dark:border-orange-800 shadow-lg">
              <Award className="w-5 h-5 text-orange-600" />
              <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
                QCTO Approved Assessment Centre
              </Badge>
            </div>

            {/* Enhanced Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Assessment{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Centre
              </span>
            </h1>

            {/* Enhanced Description */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/50 shadow-xl mb-8">
              <p className="text-2xl md:text-3xl mb-6 text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                <span className="font-bold text-orange-600 dark:text-orange-400">QCTO Approved</span>{" "}
                EISA Exam Centre
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Embark on your success journey with accredited assessments that pave the way for your professional growth
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={handleBookAssessment}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Book Your Assessment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Phone className="mr-2 w-5 h-5" />
                Call: 010 595 3692
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Assessment Types */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Assessment Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Assessment{" "}
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                Types
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              We offer various assessment methods to evaluate different types of skills and competencies, ensuring accurate and comprehensive evaluation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {assessmentTypes.map((type, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-4">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200/50 transition-all duration-300 group-hover:scale-110">
                      <type.icon className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-700 transition-colors">
                    {type.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                    Duration: {type.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {type.description}
                  </p>
                  <div className="space-y-3">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Assessment Process */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Target className="w-4 h-4 mr-2" />
              Our Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Assessment{" "}
              <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                Process
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Our streamlined process ensures a smooth and professional assessment experience from start to finish
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 via-purple-400 to-purple-500 transform md:-translate-x-0.5"></div>

              <div className="space-y-12">
                {assessmentProcess.map((step, index) => (
                  <div key={index} className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}>
                    {/* Timeline Node */}
                    <div className={`absolute left-8 md:left-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transform md:-translate-x-8 z-10 transition-all duration-300 ${
                      index % 2 === 0 ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'bg-white border-4 border-purple-300 text-purple-600'
                    }`}>
                      {step.step}
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-5/12 ml-20 md:ml-0 ${
                      index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                    }`}>
                      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
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

      {/* Enhanced Facilities */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-green-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-green-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Building className="w-4 h-4 mr-2" />
              World-Class Facilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our{" "}
              <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                Facilities
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              State-of-the-art facilities designed for professional assessment experiences with modern technology and comfortable environments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {facilities.map((facility, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-8 text-center relative">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-200/50 transition-all duration-300 group-hover:scale-110 mx-auto">
                      <facility.icon className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-green-700 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {facility.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Requirements */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-6 py-2 text-sm font-medium shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Assessment Requirements
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Assessment{" "}
                <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent">
                  Requirements
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Ensure you have all necessary documents and meet the requirements for a smooth assessment process
              </p>
            </div>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-amber-200/50 dark:border-amber-800/50 shadow-xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Qualifications Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our{" "}
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                Qualifications
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Comprehensive range of accredited qualifications across multiple industries and sectors
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Education and Teaching */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('education')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-blue-600 transition-colors">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  Education and Teaching
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.education ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.education && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">124 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 transition-colors">
                      Occupational Certificate: Occupational Trainer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 97154</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">198 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 transition-colors">
                      Occupational Certificate: Adult Literacy Teacher
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101709</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">190 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 transition-colors">
                      Occupational Certificate: Training and Development Practitioner
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101321</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">285 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 transition-colors">
                      Occupational Certificate: School Principal (School Manager)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101258</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">NQF Level 7</Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">195 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 transition-colors">
                      Occupational Certificate: Learning and Development Advisor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118774</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">127 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 transition-colors">
                      Occupational Certificate: Library Assistant
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 94598</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* IT and Related */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('it')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-green-600 transition-colors">
                  <Building className="w-8 h-8 text-green-600" />
                  IT and Related
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.it ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.it && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-green-300 text-green-700">70 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-green-700 transition-colors">
                      Occupational Certificate: Software Tester
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 119438</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Health and Safety and Construction */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('construction')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-orange-600 transition-colors">
                  <AwardIcon className="w-8 h-8 text-orange-600" />
                  Health and Safety and Construction
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.construction ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.construction && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">NQF Level 3</Badge>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">133 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-orange-700 transition-colors">
                      National Certificate: Construction Health and Safety
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 77063</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">CETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">NQF Level 2</Badge>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">2 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-orange-700 transition-colors">
                      Basic Emergency First Aid Responder
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-230801</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">NQF Level 3</Badge>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">5 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-orange-700 transition-colors">
                      Intermediate Emergency First Aid Responder
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-230802</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">NQF Level 2</Badge>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">190 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-orange-700 transition-colors">
                      National Certificate: Construction Contracting
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 20813</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">CETA Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Insurance and Finance */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('insurance')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-purple-600 transition-colors">
                  <Target className="w-8 h-8 text-purple-600" />
                  Insurance and Finance
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.insurance ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.insurance && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">31 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Occupational Certificate: Trustee
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118694</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">515 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Occupational Certificate: Financial Advisor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 105026</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 8</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">116 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Internal Audit Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101370</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">131 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Insurance Claims Administrator
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 99668</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">110 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Employee and Pension Fund Benefit Adviser
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 105025</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">163 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Insurance Underwriter
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 117329</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">213 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Investment Adviser
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 105021</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">NQF Level 7</Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">232 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-purple-700 transition-colors">
                      Financial Administration Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121568</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Professional Courses */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('professional')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-indigo-600 transition-colors">
                  <Award className="w-8 h-8 text-indigo-600" />
                  Professional Courses
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.professional ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.professional && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">240 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Occupational Certificate: Compliance Officer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 91671</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">125 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Organisational Risk Practitioner
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 94222</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">134 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Human Resource Management Officer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121151</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">180 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Supply Chain Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 111357</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">70 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Community Development Facilitator
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-210601</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">150 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      General Manager Public Service
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118791</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">270 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Quality Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118768</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">240 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Project Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101869</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">209 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Labour Inspector
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118748</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 7</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">225 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Physical Asset Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118113</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">106 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Quality Assurer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118769</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">175 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Marketing Coordinator
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 706118</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">129 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Social Auxiliary Worker
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 98890</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">278 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Safety Inspector
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 99712</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">244 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Small Business Consultant
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118741</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 8</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">156 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Governance Professional
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118115</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">280 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Tourist Information Officer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101865</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">102 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Environmental Monitor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121889</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700">230 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-700 transition-colors">
                      Business Development Officer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121567</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Short Skills Programs */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('skills')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-teal-600 transition-colors">
                  <Clock className="w-8 h-8 text-teal-600" />
                  Short Skills Programs
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.skills ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.skills && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-800 dark:to-teal-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-teal-300 text-teal-700">25 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-teal-700 transition-colors">
                      Community Counsellor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-211003</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-800 dark:to-teal-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-teal-300 text-teal-700">25 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-teal-700 transition-colors">
                      Community Development Facilitator
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-211006</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-800 dark:to-teal-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">NQF Level 2</Badge>
                      <Badge variant="outline" className="border-teal-300 text-teal-700">2 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-teal-700 transition-colors">
                      Basic Emergency First Aid Responder
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-230801</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-800 dark:to-teal-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">NQF Level 3</Badge>
                      <Badge variant="outline" className="border-teal-300 text-teal-700">5 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-teal-700 transition-colors">
                      Intermediate Emergency First Aid Responder
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: SP-230802</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Business and Management */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('business')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-emerald-600 transition-colors">
                  <Target className="w-8 h-8 text-emerald-600" />
                  Business and Management
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.business ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.business && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">244 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Small Business Consultant
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118741</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">120 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Valuer (Municipal Property Assessor)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 99700</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 8</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">721 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Municipal Finance Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118775</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">120 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Career Development Information Officer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 96372</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">212 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Community Development Practitioner
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 97691</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">240 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Market Research Analyst
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 1119450</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">190 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Trade Unionist
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118790</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">65 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Energy Kinesiology Practitioner
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118869</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">240 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">
                      Occupational Certificate: Office Supervisor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 11840</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Social Services and Health */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('social')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-cyan-600 transition-colors">
                  <Users className="w-8 h-8 text-cyan-600" />
                  Social Services and Health
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.social ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.social && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-cyan-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-cyan-300 text-cyan-700">192 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-700 transition-colors">
                      Occupational Certificate: Social Security Assessor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 105028</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-cyan-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-cyan-300 text-cyan-700">129 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-700 transition-colors">
                      Occupational Certificate: Social Auxiliary Worker
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 98890</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-cyan-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-cyan-300 text-cyan-700">190 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-700 transition-colors">
                      Occupational Certificate: Child and Youth Care Worker
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 99510</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-cyan-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">NQF Level 7</Badge>
                      <Badge variant="outline" className="border-cyan-300 text-cyan-700">454 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-700 transition-colors">
                      Occupational Certificate: Health Information Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 101838</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-cyan-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">NQF Level 3</Badge>
                      <Badge variant="outline" className="border-cyan-300 text-cyan-700">163 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-700 transition-colors">
                      Occupational Certificate: Health Promotion Officer
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 94597</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Public Safety and Emergency Services */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('safety')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-red-600 transition-colors">
                  <AwardIcon className="w-8 h-8 text-red-600" />
                  Public Safety and Emergency Services
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.safety ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.safety && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-red-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-red-300 text-red-700">149 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-red-700 transition-colors">
                      Occupational Certificate: Firefighter
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 98991</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-red-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-red-300 text-red-700">120 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-red-700 transition-colors">
                      Higher Occupational Certificate: Occupational Health and Safety Practitioner
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121527</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-red-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-red-300 text-red-700">102 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-red-700 transition-colors">
                      Occupational Certificate: Environmental Monitor
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121889</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-red-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">NQF Level 8</Badge>
                      <Badge variant="outline" className="border-red-300 text-red-700">304 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-red-700 transition-colors">
                      Occupational Certificate: Water Infrastructure Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 104623</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Human Resources */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('hr')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-violet-600 transition-colors">
                  <Users className="w-8 h-8 text-violet-600" />
                  Human Resources
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.hr ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.hr && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-violet-50/50 dark:from-slate-800 dark:to-violet-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-violet-300 text-violet-700">186 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-violet-700 transition-colors">
                      Occupational Certificate: Recruitment Manager
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 118251</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-violet-50/50 dark:from-slate-800 dark:to-violet-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-violet-300 text-violet-700">120 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-violet-700 transition-colors">
                      Higher Occupational Certificate: Human Resource Management Administrator
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 121150</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">QCTO Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* ETDP-SETA Programs */}
            <div className="mb-12">
              <button
                onClick={() => toggleSection('etdp')}
                className="w-full text-left mb-6 group"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 group-hover:text-rose-600 transition-colors">
                  <Users className="w-8 h-8 text-rose-600" />
                  ETDP-SETA Programs
                  <ChevronDown 
                    className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${
                      expandedSections.etdp ? 'rotate-180' : ''
                    }`} 
                  />
                </h3>
              </button>
              {expandedSections.etdp && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">10 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Develop Outcomes-based Learning Programmes
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 123394</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">5 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Facilitate Transfer and Application of Learning
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 123398</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">15 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Design Outcomes-based Assessment
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 120401</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">15 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Conduct Outcomes-based Assessment
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 115753</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">10 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Facilitate Learning Using Various Methodologies
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 117871</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">10 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Conduct Moderation of Outcomes-based Assessment
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 115759</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 5</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">10 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Identify and Respond to Learners with Special Needs
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 10294</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 6</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">16 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Devise Intervention for Learners with Special Needs
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 10305</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-800 dark:to-rose-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">NQF Level 4</Badge>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">4 Credits</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-rose-700 transition-colors">
                      Conduct Skills Development Administration
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ID: 15227</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">ETDP-SETA Accredited</p>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="relative py-24 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,0,0,0.1),transparent_70%)]"></div>

        {/* Animated floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Award className="w-20 h-20 mx-auto mb-8 text-orange-100" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Get{" "}
              <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                Assessed?
              </span>
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
              <p className="text-xl md:text-2xl mb-4 text-orange-50 leading-relaxed">
                Contact our assessment team to book your evaluation or get more information
              </p>
              <p className="text-lg text-orange-100 leading-relaxed">
                We're here to guide you through every step of your assessment journey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Phone className="w-8 h-8 mx-auto mb-4 text-orange-200" />
                <p className="font-semibold text-lg mb-1">Call Us</p>
                <p className="text-orange-100">010 595 3692</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Mail className="w-8 h-8 mx-auto mb-4 text-orange-200" />
                <p className="font-semibold text-lg mb-1">Email Us</p>
                <p className="text-orange-100">info@revoquest.co.za</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Calendar className="w-8 h-8 mx-auto mb-4 text-orange-200" />
                <p className="font-semibold text-lg mb-1">Office Hours</p>
                <p className="text-orange-100">Mon-Fri: 8:00 - 16:30</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AssessmentCentre;

