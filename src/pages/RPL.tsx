import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RPLRegistrationForm } from "@/components/RPLRegistrationForm";
import {
  Award,
  Users,
  Clock,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Target,
  BookOpen,
  GraduationCap,
  Star,
  Calendar,
  DollarSign,
  Shield,
  Lightbulb,
  Briefcase,
  X
} from "lucide-react";

const RPL = () => {
  const [selectedProcess, setSelectedProcess] = useState(0);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<any>(null);
  const [showQualificationModal, setShowQualificationModal] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const rplBenefits = [
    {
      icon: Award,
      title: "Formal Recognition",
      description: "Transform your practical experience into nationally recognized qualifications that employers value."
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Achieve qualifications faster by leveraging your existing knowledge and experience."
    },
    {
      icon: DollarSign,
      title: "Cost Effective",
      description: "Save money by not repeating training for skills you already possess."
    },
    {
      icon: Target,
      title: "Career Advancement",
      description: "Enhance your resume and open doors to new career opportunities and promotions."
    },
    {
      icon: Shield,
      title: "Industry Recognition",
      description: "Gain QCTO and SETA accredited qualifications that are respected across industries."
    },
    {
      icon: Lightbulb,
      title: "Skills Validation",
      description: "Get formal validation of the skills you've developed through years of experience."
    }
  ];

  const rplProcess = [
    {
      step: 1,
      title: "Initial Consultation",
      description: "Meet with our RPL advisors to discuss your experience, career goals, and determine the best qualification pathway for you.",
      details: ["Free consultation", "Experience assessment", "Qualification mapping", "Timeline planning"]
    },
    {
      step: 2,
      title: "Portfolio Development",
      description: "Work with our experts to compile comprehensive evidence of your skills, knowledge, and experience.",
      details: ["Document collection", "Evidence compilation", "Skills mapping", "Portfolio preparation"]
    },
    {
      step: 3,
      title: "Assessment & Evaluation",
      description: "Our qualified assessors evaluate your portfolio against national qualification standards.",
      details: ["Skills assessment", "Knowledge evaluation", "Competency testing", "Evidence review"]
    },
    {
      step: 4,
      title: "Gap Analysis",
      description: "Identify any gaps in your knowledge and provide targeted training to meet qualification requirements.",
      details: ["Gap identification", "Customized training", "Skills development", "Additional support"]
    },
    {
      step: 5,
      title: "Final Assessment",
      description: "Complete the final assessment to demonstrate your competency in all required areas.",
      details: ["Final evaluation", "Competency demonstration", "Practical assessment", "Knowledge testing"]
    },
    {
      step: 6,
      title: "Certification",
      description: "Receive your nationally recognized qualification and celebrate your achievement.",
      details: ["Qualification awarded", "Certificate issued", "Digital credentials", "Career advancement"]
    }
  ];

  const eligibleQualifications = [
    {
      title: "Occupational Health & Safety",
      level: "NQF Level 4-6",
      duration: "3-6 months",
      description: "Safety management, risk assessment, and compliance qualifications",
      detailedDescription: "This comprehensive qualification covers occupational health and safety management principles, risk assessment methodologies, and compliance with relevant legislation. You'll learn to identify workplace hazards, implement safety systems, and ensure legal compliance.",
      learningOutcomes: [
        "Understand occupational health and safety legislation and regulations",
        "Conduct comprehensive risk assessments and hazard identification",
        "Develop and implement safety management systems",
        "Manage incident investigations and reporting",
        "Ensure compliance with health and safety standards",
        "Train staff on safety protocols and procedures"
      ],
      careerOpportunities: [
        "Safety Officer",
        "Health & Safety Manager",
        "Risk Assessment Specialist",
        "Safety Compliance Officer",
        "Safety Training Coordinator"
      ],
      requirements: [
        "Minimum 3 years experience in safety-related role",
        "Understanding of basic safety principles",
        "Evidence of safety-related responsibilities",
        "References from safety supervisors"
      ]
    },
    {
      title: "Project Management",
      level: "NQF Level 4-5",
      duration: "2-4 months",
      description: "Project planning, execution, and management competencies",
      detailedDescription: "Master the fundamentals of project management including planning, execution, monitoring, and control. This qualification equips you with industry-standard methodologies and tools for successful project delivery.",
      learningOutcomes: [
        "Apply project management principles and methodologies",
        "Develop comprehensive project plans and schedules",
        "Manage project resources effectively",
        "Monitor project progress and performance",
        "Handle project risks and issues",
        "Lead project teams and stakeholders"
      ],
      careerOpportunities: [
        "Project Coordinator",
        "Junior Project Manager",
        "Project Administrator",
        "Operations Coordinator",
        "Project Support Specialist"
      ],
      requirements: [
        "Minimum 2 years project coordination experience",
        "Basic project management knowledge",
        "Evidence of project involvement",
        "Understanding of project lifecycles"
      ]
    },
    {
      title: "Quality Management",
      level: "NQF Level 4-6",
      duration: "3-6 months",
      description: "Quality systems, auditing, and continuous improvement",
      detailedDescription: "Learn comprehensive quality management systems, auditing techniques, and continuous improvement methodologies. This qualification prepares you for quality assurance and control roles across various industries.",
      learningOutcomes: [
        "Implement quality management systems and standards",
        "Conduct internal and external quality audits",
        "Apply statistical process control techniques",
        "Lead continuous improvement initiatives",
        "Manage quality documentation and records",
        "Ensure compliance with quality standards"
      ],
      careerOpportunities: [
        "Quality Assurance Manager",
        "Quality Control Supervisor",
        "Quality Auditor",
        "Continuous Improvement Specialist",
        "Quality Systems Coordinator"
      ],
      requirements: [
        "Minimum 3 years quality-related experience",
        "Understanding of quality principles",
        "Evidence of quality responsibilities",
        "Basic knowledge of quality tools and techniques"
      ]
    },
    {
      title: "Human Resources",
      level: "NQF Level 4-5",
      duration: "2-4 months",
      description: "HR practices, employment law, and people management",
      detailedDescription: "Develop essential human resources management skills including recruitment, employee relations, performance management, and compliance with employment legislation.",
      learningOutcomes: [
        "Manage recruitment and selection processes",
        "Handle employee relations and disciplinary procedures",
        "Implement performance management systems",
        "Ensure compliance with employment legislation",
        "Manage employee development and training",
        "Handle HR administration and record keeping"
      ],
      careerOpportunities: [
        "HR Officer",
        "HR Administrator",
        "Employee Relations Specialist",
        "Recruitment Coordinator",
        "HR Support Specialist"
      ],
      requirements: [
        "Minimum 2 years HR or people management experience",
        "Understanding of basic HR principles",
        "Evidence of HR-related responsibilities",
        "Knowledge of employment legislation"
      ]
    },
    {
      title: "Supervisory Management",
      level: "NQF Level 4-5",
      duration: "2-4 months",
      description: "Leadership, team management, and operational oversight",
      detailedDescription: "Enhance your leadership and management skills for supervisory roles. Learn effective team management, operational planning, and leadership strategies for organizational success.",
      learningOutcomes: [
        "Apply effective leadership and management principles",
        "Manage team performance and development",
        "Plan and organize operational activities",
        "Communicate effectively with team members",
        "Solve problems and make decisions",
        "Manage resources and budgets"
      ],
      careerOpportunities: [
        "Team Leader",
        "Supervisor",
        "Operations Coordinator",
        "Department Supervisor",
        "Shift Manager"
      ],
      requirements: [
        "Minimum 2 years supervisory or team leadership experience",
        "Understanding of management principles",
        "Evidence of leadership responsibilities",
        "Experience managing team performance"
      ]
    },
    {
      title: "Training & Development",
      level: "NQF Level 4-6",
      duration: "3-6 months",
      description: "Training design, delivery, and assessment competencies",
      detailedDescription: "Master the skills needed to design, deliver, and assess training programs. This qualification covers adult learning principles, training methodologies, and evaluation techniques.",
      learningOutcomes: [
        "Design effective training programs and materials",
        "Deliver engaging training sessions",
        "Assess learning outcomes and training effectiveness",
        "Apply adult learning principles and methodologies",
        "Manage training administration and logistics",
        "Evaluate and improve training programs"
      ],
      careerOpportunities: [
        "Training Officer",
        "Learning & Development Coordinator",
        "Training Facilitator",
        "Skills Development Practitioner",
        "Training Administrator"
      ],
      requirements: [
        "Minimum 3 years training or facilitation experience",
        "Understanding of adult learning principles",
        "Evidence of training delivery",
        "Experience in training needs analysis"
      ]
    }
  ];

  const handleLearnMore = (qualification: any) => {
    setSelectedQualification(qualification);
    setShowQualificationModal(true);
  };

  const requirements = [
    "Minimum 3-5 years relevant work experience",
    "Valid South African ID or passport",
    "Current CV with detailed work history",
    "References from current/previous employers",
    "Evidence of skills and competencies",
    "Proof of any previous training or qualifications",
    "Portfolio of work samples (where applicable)",
    "Motivation letter explaining your RPL goals"
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
              <Award className="w-4 h-4 mr-2" />
              Recognition of Prior Learning
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Recognition of Prior Learning (RPL)
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-600 dark:text-slate-300">
              Transform Your Experience Into Accredited Qualifications
            </p>
            <p className="text-lg mb-8 text-slate-500 dark:text-slate-400">
              Don't let your years of experience go unrecognized. RPL allows you to gain formal qualifications based on your existing skills, knowledge, and work experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                onClick={() => setIsRegistrationOpen(true)}
              >
                Start Your RPL Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <Phone className="mr-2 w-5 h-5" />
                Call: 010 595 3692
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is RPL Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          {/* Enhanced Section Header */}
          <div className="max-w-5xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
                Understanding RPL
              </Badge>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              What is{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Recognition of Prior Learning?
              </span>
            </h2>

            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto mb-8">
              Recognition of Prior Learning (RPL) is a process that allows you to gain formal recognition for the skills, knowledge, and experience you've acquired through work, life experiences, or informal learning.
            </p>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-orange-600 dark:text-orange-400">Instead of starting from scratch,</strong> RPL evaluates your existing competencies against national qualification standards, giving you credit for what you already know and can do.
              </p>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Formal Recognition Card */}
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300">
                      <BookOpen className="w-10 h-10 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white group-hover:text-orange-700 transition-colors">
                    Formal Recognition
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    Get nationally recognized qualifications for skills you already possess, validated by accredited institutions.
                  </p>
                </CardContent>
              </Card>

              {/* Time Efficient Card */}
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300">
                      <Clock className="w-10 h-10 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      2
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white group-hover:text-orange-700 transition-colors">
                    Time Efficient
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    Complete qualifications faster by leveraging your existing experience instead of traditional classroom learning.
                  </p>
                </CardContent>
              </Card>

              {/* Career Growth Card */}
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300">
                      <Target className="w-10 h-10 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      3
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white group-hover:text-orange-700 transition-colors">
                    Career Growth
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    Advance your career with formal qualifications that employers value and recognize across industries.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info Box */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-100/80 to-orange-200/80 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
                <Award className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 dark:text-orange-300 font-medium">
                  All qualifications are accredited by QCTO and SETA registered institutions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30">
              Why Choose RPL?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Benefits of Recognition of Prior Learning
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Discover how RPL can transform your career and validate your experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rplBenefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* RPL Process Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Target className="w-4 h-4 mr-2" />
              Our Proven Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your RPL Journey in{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                6 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Follow our proven process to transform your experience into formal qualifications
            </p>
          </div>

          {/* Process Timeline */}
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500 transform md:-translate-x-0.5"></div>

              {/* Process Steps */}
              <div className="space-y-12">
                {rplProcess.map((step, index) => (
                  <div key={index} className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}>
                    {/* Timeline Node */}
                    <div className={`absolute left-8 md:left-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transform md:-translate-x-8 z-10 transition-all duration-300 ${
                      selectedProcess === index
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white scale-110 shadow-orange-200'
                        : 'bg-white border-4 border-orange-300 text-orange-600 hover:scale-105'
                    }`}>
                      {step.step}
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-5/12 ml-20 md:ml-0 ${
                      index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                    }`}>
                      <Card
                        className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                          selectedProcess === index
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-orange-100'
                            : 'bg-white hover:bg-orange-50/50 border-gray-200 hover:border-orange-200'
                        }`}
                        onClick={() => setSelectedProcess(index)}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              selectedProcess === index
                                ? 'bg-orange-600 text-white'
                                : 'bg-orange-100 text-orange-600'
                            }`}>
                              <Target className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className={`text-xl font-bold mb-3 transition-colors ${
                                selectedProcess === index
                                  ? 'text-orange-800'
                                  : 'text-gray-800'
                              }`}>
                                {step.title}
                              </h3>
                              <p className={`text-gray-600 mb-4 leading-relaxed ${
                                selectedProcess === index ? 'text-orange-700' : ''
                              }`}>
                                {step.description}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {step.details.map((detail, i) => (
                                  <div key={i} className={`flex items-center gap-2 text-sm ${
                                    selectedProcess === index ? 'text-orange-700' : 'text-gray-500'
                                  }`}>
                                    <CheckCircle className={`w-3 h-3 flex-shrink-0 ${
                                      selectedProcess === index ? 'text-orange-600' : 'text-gray-400'
                                    }`} />
                                    <span>{detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block md:w-2/12"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Step Details */}
            <div className="mt-16">
              <Card className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 dark:from-orange-900/20 dark:via-orange-800/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg">
                      <span className="text-3xl font-bold text-white">{rplProcess[selectedProcess].step}</span>
                    </div>
                    <Badge className="mb-4 border-orange-300 text-orange-700 bg-orange-100">
                      Step {rplProcess[selectedProcess].step}
                    </Badge>
                    <h3 className="text-3xl font-bold text-orange-800 mb-4">
                      {rplProcess[selectedProcess].title}
                    </h3>
                    <p className="text-lg text-orange-700 leading-relaxed max-w-2xl mx-auto">
                      {rplProcess[selectedProcess].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rplProcess[selectedProcess].details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-orange-200/50">
                        <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setIsRegistrationOpen(true)}
                    >
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Start Your RPL Journey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Available Qualifications */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30">
              Qualifications
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Available RPL Qualifications
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Choose from our range of accredited qualifications available through RPL
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleQualifications.map((qualification, index) => (
              <Card key={index} className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{qualification.title}</CardTitle>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {qualification.level}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-500">
                    Duration: {qualification.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{qualification.description}</p>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => handleLearnMore(qualification)}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30">
                Requirements
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                RPL Requirements & Eligibility
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Ensure you meet the basic requirements for RPL assessment
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-600">What You Need</h3>
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-600">Why These Requirements?</h3>
                <div className="space-y-4">
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Experience Validation</h4>
                    <p className="text-sm text-gray-600">We need to verify your practical experience and skills through documented evidence.</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Quality Assurance</h4>
                    <p className="text-sm text-gray-600">Rigorous assessment ensures qualifications maintain their value and credibility.</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Compliance</h4>
                    <p className="text-sm text-gray-600">Meeting national standards ensures your qualification is recognized everywhere.</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />

      {/* RPL Registration Form */}
      <RPLRegistrationForm
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />

      {/* Qualification Details Modal */}
      <Dialog open={showQualificationModal} onOpenChange={setShowQualificationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">
              {selectedQualification?.title}
            </DialogTitle>
            <DialogDescription className="text-lg">
              {selectedQualification?.level} • Duration: {selectedQualification?.duration}
            </DialogDescription>
          </DialogHeader>

          {selectedQualification && (
            <div className="space-y-6">
              {/* Qualification Overview */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Overview</h3>
                <p className="text-gray-700 leading-relaxed">{selectedQualification.detailedDescription}</p>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Learning Outcomes</h3>
                <ul className="space-y-2">
                  {selectedQualification.learningOutcomes.map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Career Opportunities */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Career Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedQualification.careerOpportunities.map((career: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700">{career}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">RPL Requirements</h3>
                <ul className="space-y-2">
                  {selectedQualification.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowQualificationModal(false);
                    setIsRegistrationOpen(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Start RPL Assessment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQualificationModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RPL;
