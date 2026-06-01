import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  GraduationCap, 
  DollarSign, 
  CheckCircle, 
  FileText, 
  Users, 
  Calendar,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  AlertCircle
} from "lucide-react";

export const FundiStudentLoans = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Flexible Payment Plans",
      description: "Customized repayment options that fit your budget and timeline"
    },
    {
      icon: CheckCircle,
      title: "Quick Approval",
      description: "Fast application processing with approval within 48 hours"
    },
    {
      icon: GraduationCap,
      title: "Study While You Learn",
      description: "Deferred payment options available until after course completion"
    },
    {
      icon: FileText,
      title: "Simple Documentation",
      description: "Minimal paperwork required for application"
    }
  ];

  const eligibilityCriteria = [
    "South African citizen or permanent resident",
    "18 years or older",
    "Enrolled or accepted into an accredited institution",
    "Valid South African ID",
    "Proof of income or sponsor details",
    "Recent bank statements (3 months)"
  ];

  const applicationSteps = [
    {
      step: 1,
      title: "Visit Fundi Website",
      description: "Go to the official Fundi website to access their application form",
      icon: FileText
    },
    {
      step: 2,
      title: "Complete Application",
      description: "Fill out the online application with your personal and course details",
      icon: CheckCircle
    },
    {
      step: 3,
      title: "Upload Documents",
      description: "Submit required documentation through their secure portal",
      icon: FileText
    },
    {
      step: 4,
      title: "Credit Assessment",
      description: "Fundi will review your application and creditworthiness",
      icon: Users
    },
    {
      step: 5,
      title: "Approval & Terms",
      description: "Receive loan approval with personalized terms and conditions",
      icon: CheckCircle
    },
    {
      step: 6,
      title: "Funds Disbursement",
      description: "Funds are transferred directly to your institution or account",
      icon: DollarSign
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Enhanced Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <Badge className="border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300 font-medium">
                Student Financing
              </Badge>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              Fundi{" "}
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                Student Loans
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Get the financing you need for your education through our partnership with Fundi, South Africa's leading student loan provider.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                asChild
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
              >
                <a 
                  href="https://www.fundi.co.za" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Apply Now on Fundi Website
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 px-8 py-4 text-lg"
              >
                <a 
                  href="https://oss.fundi.co.za/educational-loans-for-students-in-south-africa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                Fundi?
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Fundi offers comprehensive student financing solutions designed to make quality education accessible to all South Africans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-700 transition-colors">
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

      {/* Application Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Apply for{" "}
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                Student Loans
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Get the financing you need for your education through Fundi's comprehensive student loan program
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-2xl">
              <CardContent className="p-12">
                <div className="text-center space-y-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mx-auto">
                    <DollarSign className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                      Ready to Apply?
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                      Apply directly through Fundi's official website to access their complete range of student loan options, 
                      requirements, and terms. Our partnership with Fundi ensures you get the best financing solutions for your education.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-800 dark:text-blue-300">Important Notice</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      All loan applications, requirements, and terms are managed directly by Fundi. 
                      Please visit their official website for the most up-to-date information and to complete your application.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
                    >
                      <a 
                        href="https://www.fundi.co.za" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="w-5 h-5" />
                        Apply on Fundi Website
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 px-8 py-4 text-lg"
                    >
                      <a 
                        href="https://oss.fundi.co.za/educational-loans-for-students-in-south-africa" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        Learn More
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-purple-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How to{" "}
              <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                Apply
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Simple, straightforward application process in 6 easy steps to get your education financing
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 via-purple-400 to-purple-500 transform md:-translate-x-0.5"></div>

              <div className="space-y-12">
                {applicationSteps.map((step, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Timeline Dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">{step.step}</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:ml-8' : 'md:mr-8'}`}>
                      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20">
                        <CardContent className="p-8">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <step.icon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-700 transition-colors">
                                {step.title}
                              </h3>
                              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Requirements */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 dark:from-amber-900/10 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Basic{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 dark:from-amber-400 dark:via-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                Requirements
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Basic requirements to qualify for a student loan with Fundi
            </p>
          </div>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-amber-200/50 dark:border-amber-800/50 shadow-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibilityCriteria.map((criteria, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{criteria}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FundiStudentLoans;