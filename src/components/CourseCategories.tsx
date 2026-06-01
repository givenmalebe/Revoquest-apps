import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HardHat, 
  Briefcase, 
  Monitor,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import constructionImage from "@/assets/construction-worker.jpg";
import businessImage from "@/assets/business-consultant.jpg";

const categories = [
  {
    icon: HardHat,
    title: "Short Courses",
    description: "Practical, industry-focused courses designed to enhance your skills and advance your career in weeks, not years.",
    image: constructionImage,
    color: "bg-primary/10 text-primary",
    features: ["Industry Certified", "Hands-on Training", "Job Ready Skills"]
  },
  {
    icon: Briefcase,
    title: "RPL Programmes",
    description: "Don't let your experience go unrecognized. Join thousands of professionals who have fast-tracked their careers through RPL.",
    image: businessImage,
    color: "bg-success/10 text-success",
    features: ["Experience Recognition", "Fast Track", "Accredited Qualification"]
  },
  {
    icon: Monitor,
    title: "Online Courses",
    description: "Learn at your own pace with our comprehensive online learning platform, accessible anywhere, anytime.",
    image: businessImage,
    color: "bg-warning/10 text-warning",
    features: ["Self-Paced", "24/7 Access", "Interactive Content"]
  }
];

export const CourseCategories = () => {
  return (
    <section className="py-24 relative bg-gradient-to-br from-orange-50 via-orange-50/50 to-orange-100/30 dark:from-orange-900/20 dark:via-orange-800/10 dark:to-orange-700/10" id="courses">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.06),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-6 border-primary/20 text-primary bg-primary/5">
            <GraduationCap className="w-4 h-4 mr-2" />
            Course Categories
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Start Your Journey Today!
          </h2>
          <p className="text-xl text-muted-foreground">
            Don't let your experience go unrecognized. Join thousands of professionals who have fast-tracked their careers through RPL with Revo Quest Institute.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden"
            >
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={category.image}
                  alt={`${category.title} - Professional training and development`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent"></div>
                <div className={`absolute top-4 left-4 p-3 rounded-xl ${category.color} backdrop-blur-sm`}>
                  <category.icon className="w-6 h-6" />
                </div>
              </div>

              <CardHeader className="space-y-4">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {category.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {category.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};