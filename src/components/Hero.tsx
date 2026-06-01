import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, GraduationCap, Award, Users, Star, TrendingUp } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Hero = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleRegistrationClick = () => {
    setIsRegistrationOpen(true);
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20" id="home">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.2),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.2),transparent_50%)]"></div>
      
      {/* Refined gradient orbs with enhanced blur and movement */}
      <div className="absolute top-16 left-8 w-40 h-40 bg-gradient-to-r from-orange-400/15 to-orange-600/15 rounded-full blur-3xl animate-glow-orb"></div>
      <div className="absolute top-32 right-12 w-48 h-48 bg-gradient-to-r from-blue-400/15 to-blue-600/15 rounded-full blur-3xl animate-glow-orb" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-24 left-1/3 w-32 h-32 bg-gradient-to-r from-emerald-400/15 to-emerald-600/15 rounded-full blur-3xl animate-glow-orb" style={{ animationDelay: "4s" }}></div>
      <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-glow-orb" style={{ animationDelay: "1s" }}></div>
      
      {/* Refined floating geometric shapes with smoother movement */}
      <div className="absolute top-1/5 left-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/25 to-pink-400/25 rounded-lg rotate-45 animate-float-refined"></div>
      <div className="absolute top-3/5 right-1/5 w-8 h-8 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full animate-float-refined-reverse"></div>
      <div className="absolute bottom-1/4 left-1/6 w-16 h-16 bg-gradient-to-r from-yellow-400/25 to-orange-400/25 rounded-full animate-float-refined" style={{ animationDelay: "3s" }}></div>
      <div className="absolute top-2/5 right-1/3 w-10 h-10 bg-gradient-to-r from-green-400/25 to-emerald-400/25 rounded-lg rotate-12 animate-float-refined-reverse" style={{ animationDelay: "1.5s" }}></div>
      
      {/* Enhanced particle system with better physics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle-refined"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${15 + Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Refined gradient waves with smoother transitions */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/3 to-transparent animate-wave-refined"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-500/3 to-transparent animate-wave-refined-reverse" style={{ animationDelay: "3s" }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-500/2 to-transparent animate-wave-refined" style={{ animationDelay: "6s" }}></div>
      
      {/* Refined floating accent dots */}
      <div className="absolute top-1/6 left-1/5 w-2 h-2 bg-orange-400/50 rounded-full animate-float-accent"></div>
      <div className="absolute top-2/3 right-1/5 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-float-accent" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-1/3 left-3/4 w-2.5 h-2.5 bg-emerald-400/50 rounded-full animate-float-accent" style={{ animationDelay: "4s" }}></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400/50 rounded-full animate-float-accent" style={{ animationDelay: "1s" }}></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center min-h-[70vh] sm:min-h-[75vh] lg:min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-fade-in-up text-center lg:text-left">
            <Badge variant="outline" className="border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shadow-sm">
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">Trusted by 10,000+ Students Worldwide</span>
              <span className="sm:hidden">Trusted Worldwide</span>
            </Badge>
            
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-slate-900 dark:text-white">
                Transform Your Future with{" "}
                <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                  Expert Learning
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-light">
                Join thousands of successful professionals who've accelerated their careers with our world-class courses. Learn from industry experts and unlock your potential.
              </p>
            </div>
            
            {/* Enhanced feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Certified Courses</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Industry recognized</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Expert Mentors</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Top professionals</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">QCTO Accredited</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">95% success rate</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">5-Star Rated</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Student reviews</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 sm:pt-8">
              <div className="w-full sm:w-auto sm:ml-8 lg:ml-16 xl:ml-44">
                <Button 
                  size="lg" 
                  onClick={handleRegistrationClick}
                  className="group w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  Start Learning Today
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Content - Enhanced Hero Image */}
          <div className="hidden lg:block relative animate-fade-in-right mt-8 lg:-mt-12">
            <div className="relative">
              {/* Main image container */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
                <img 
                  src="/DSC05541.JPG"
                  alt="Diverse group of graduates celebrating their academic achievements in graduation gowns and caps"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Registration Form Modal */}
      <RegistrationForm 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />
    </section>
  );
};