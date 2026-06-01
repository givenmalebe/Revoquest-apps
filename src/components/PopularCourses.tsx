import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Award,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Zap
} from "lucide-react";

const courses = [
  {
    title: "Quality Manager",
    searchTitle: "Quality Manager",
    description: "Quality Managers plan, organise, direct, control and coordinate quality activities to ensure stated quality requirements and objectives are met.",
    rating: 4.9,
    nqfLevel: 6,
    category: "Management"
  },
  {
    title: "Small Business Consultant",
    searchTitle: "Small Business Consultant",
    description: "A Small Business Consultant guides in interpreting the key components of business efficiency and strategic planning for sustainable growth.",
    rating: 4.8,
    nqfLevel: 5,
    category: "Business"
  },
  {
    title: "Construction Health and Safety",
    searchTitle: "Construction health and safety",
    description: "Comprehensive training in construction health and safety practices, risk assessment, and regulatory compliance.",
    rating: 4.9,
    nqfLevel: 3,
    category: "Safety"
  },
  {
    title: "Safety Inspector",
    searchTitle: "Safety Inspector",
    description: "Professional training in safety inspection, risk assessment, and compliance monitoring across various industries.",
    rating: 4.7,
    nqfLevel: 4,
    category: "Safety"
  }
];

export const PopularCourses = () => {
  const navigate = useNavigate();

  const handleViewCourse = (searchTitle: string) => {
    // Navigate to courses page with search parameter
    navigate(`/courses?search=${encodeURIComponent(searchTitle)}`);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10 relative overflow-hidden" id="courses">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(251,146,60,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
            <BookOpen className="w-5 h-5 text-orange-600" />
            <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
              Popular Courses
            </Badge>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Highly Recommended{" "}
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
              Courses
            </span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            Our most sought-after programs designed to advance your career and recognize your professional expertise.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => window.open('https://api.whatsapp.com/send/?phone=27696831929&text=Hi+%2ARevoQuest+Training+Institute%2A%21+I+need+more+info+about+RevoQuest+Training+Institute+https%3A%2F%2Fwww.revoquest.co.za%2F&type=phone_number&app_absent=0', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              WhatsApp for Quote
            </Button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Instant response • Professional guidance</span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105"
            >
              {/* Card Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Popular Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>

              <CardHeader className="relative space-y-4 pb-4">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs px-3 py-1 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300">
                    {course.category}
                  </Badge>
                  <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-700/90 px-2 py-1 rounded-full shadow-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight group-hover:text-orange-700 transition-colors duration-300">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="text-xs px-3 py-1 border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-semibold">
                    NQF Level {course.nqfLevel}
                  </Badge>
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    <Award className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">Certified</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  onClick={() => handleViewCourse(course.searchTitle)}
                >
                  <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  View Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};