import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Award, Target, ArrowRight, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import studentsImage from "@/assets/students-learning.jpg";

export const AboutSection = () => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate('/rpl');
  };

  return (
    <section className="py-24 relative overflow-hidden" id="about">
      {/* Light purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-200/30 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-700/20"></div>
      
      {/* Geometric background patterns */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(124,58,237,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Static background elements - no animation to prevent stuttering */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Content - Image aligned with heading */}
          <div className="hidden lg:block relative -mt-30">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-smooth"></div>
              <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-800 p-2">
                <img 
                  src={studentsImage}
                  alt="Diverse group of professional students collaborating and learning together in a modern educational environment"
                  className="w-full h-auto rounded-xl"
                />
                <div className="absolute inset-2 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl"></div>
              </div>
            </div>
            
            {/* Information under the picture */}
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Why Choose RPL?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Fast-track your career</strong> - Get qualified in weeks, not years
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Cost-effective</strong> - Save time and money on traditional courses
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Industry recognition</strong> - Same qualifications as traditional learning
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Flexible process</strong> - Work at your own pace and schedule
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Floating stats with animations */}
            <div className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform-smooth">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-orange-500 mr-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">95%</div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced with better spacing */}
          <div className="space-y-8 -mt-8 lg:col-span-1 text-center lg:text-left">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                Unlock Your Potential with{" "}
                <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                  Recognition of Prior Learning (RPL)
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                At Revo Quest Institute, we specialize in Recognition of Prior Learning (RPL)—a unique pathway designed to formally recognize your existing skills, knowledge, and work experience. RPL allows seasoned professionals to gain accredited qualifications without the need to undergo traditional classroom learning.
              </p>
            </div>

            {/* Enhanced Key Benefits */}
            <div className="space-y-6">
              {[
                {
                  icon: Target,
                  title: "Your Journey, Our Commitment",
                  description: "From enrollment to graduation and beyond, we are here to guide you every step of the way.",
                  color: "from-orange-500 to-orange-600"
                },
                {
                  icon: Award,
                  title: "Driven by Excellence and Trusted Innovation",
                  description: "Our commitment to excellence, innovation, and customer satisfaction has earned us a reputation as a reliable partner.",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: CheckCircle,
                  title: "Accredited Courses for Career Success",
                  description: "Our accredited short courses are tailored to provide you with the skills needed in today's competitive job market.",
                  color: "from-green-500 to-green-600"
                }
              ].map((benefit, index) => (
                <div key={index} className="group flex gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors-smooth">
                  <div className={`p-3 bg-gradient-to-r ${benefit.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform-smooth`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors-smooth">
                      {benefit.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-smooth hover:scale-105"
                onClick={handleReadMore}
              >
                Start Your RPL Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform-smooth" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};