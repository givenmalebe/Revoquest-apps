import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { funnelPath } from "@/utils/funnelPath";
import { 
  Users, 
  Award, 
  Target, 
  Heart, 
  Lightbulb, 
  Globe,
  BookOpen,
  GraduationCap,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Handshake
} from "lucide-react";

interface AboutUsProps {
  skipHeader?: boolean;
  skipFooter?: boolean;
  revoLearn?: boolean;
}

export const AboutUs = ({ skipHeader, skipFooter, revoLearn }: AboutUsProps = {}) => {
  const brand = revoLearn ? "Revo Learn" : "RevoQuest";
  const brandFull = revoLearn ? "Revo Learn" : "RevoQuest Training Institute";
  const brandInstitute = revoLearn ? "Revo Learn" : "RevoQuest Institute";

  if (revoLearn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {!skipHeader && <Header />}

        <section className="relative overflow-hidden border-b border-slate-800/80 bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          </div>
          <div className="container mx-auto max-w-5xl px-4 py-20 relative z-10 text-center">
            <Badge className="mb-4 border-orange-500/40 bg-orange-500/15 text-orange-300">About Revo Learn</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Practical online learning with AI support
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Revo Learn helps working professionals build job-ready skills through short, practical online courses.
              Learn at your own pace, get guided by AI, and apply your knowledge immediately.
            </p>
            <div className="mt-8">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                <a href={`${funnelPath('')}#courses`}>
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-orange-400">75+</p>
                  <p className="mt-1 text-sm text-slate-300">Online courses</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-orange-400">10,000+</p>
                  <p className="mt-1 text-sm text-slate-300">Learners trained</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-orange-400">100%</p>
                  <p className="mt-1 text-sm text-slate-300">Self-paced access</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto max-w-5xl px-4">
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Why learners choose Revo Learn</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <p className="text-slate-300">Career-focused programs designed for real workplaces.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <p className="text-slate-300">AI-powered support to help you study faster and stay consistent.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <p className="text-slate-300">Simple enrollment and instant access to your learner dashboard.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <p className="text-slate-300">Built by RevoQuest Institute for modern South African learners.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {!skipFooter && <Footer />}
      </div>
    );
  }

  const stats = [
    { number: "15+", label: "Years of Excellence", icon: Calendar },
    { number: "10,000+", label: "Students Trained", icon: Users },
    { number: "75+", label: "Courses Available", icon: BookOpen },
    { number: "47+", label: "Trained Teachers", icon: GraduationCap }
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence in Education",
      description: "We are committed to delivering the highest quality education and training programs that meet international standards."
    },
    {
      icon: Heart,
      title: "Student-Centered Approach",
      description: "Every decision we make is focused on providing the best learning experience and outcomes for our students."
    },
    {
      icon: Lightbulb,
      title: "Innovation & Technology",
      description: "We embrace cutting-edge teaching methods and technology to enhance learning and keep pace with industry demands."
    },
    {
      icon: Shield,
      title: "Professional Integrity",
      description: "We maintain the highest ethical standards in all our interactions and educational delivery."
    },
    {
      icon: TrendingUp,
      title: "Continuous Learning",
      description: "We believe in lifelong learning and continuously improve our programs based on industry feedback and best practices."
    },
    {
      icon: Globe,
      title: "Community Impact",
      description: "We are dedicated to making a positive impact on communities through education and skills development."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Mthembu",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: `With over 20 years in education and training, Dr. Mthembu founded ${brandFull} to bridge the skills gap in South Africa.`,
      qualifications: ["PhD in Education", "MBA in Business Management", "20+ Years Experience"]
    },
    {
      name: "Mr. Thabo Nkosi",
      role: "Director of Training",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "A passionate educator with expertise in curriculum development and adult learning methodologies.",
      qualifications: ["MEd in Curriculum Development", "Certified Training Facilitator", "15+ Years Experience"]
    },
    {
      name: "Ms. Nomsa Dlamini",
      role: "Head of Assessment Centre",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Specialist in assessment design and quality assurance, ensuring our programs meet national standards.",
      qualifications: ["MSc in Educational Assessment", "QCTO Registered Assessor", "12+ Years Experience"]
    },
    {
      name: "Mr. Sipho Mthembu",
      role: "Technology Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Leading our digital transformation and e-learning platform development initiatives.",
      qualifications: ["BSc Computer Science", "Certified EdTech Specialist", "10+ Years Experience"]
    }
  ];

  const milestones = [
    {
      year: "2009",
      title: "Foundation",
      description: `${brandFull} was established with a vision to transform education in South Africa.`
    },
    {
      year: "2012",
      title: "First Accreditation",
      description: "Received our first QCTO accreditation, marking a significant milestone in our journey."
    },
    {
      year: "2015",
      title: "Digital Transformation",
      description: "Launched our e-learning platform, making education accessible to students nationwide."
    },
    {
      year: "2018",
      title: "10,000 Students",
      description: "Celebrated training our 10,000th student, a testament to our growing impact."
    },
    {
      year: "2021",
      title: "EDST Program Launch",
      description: "Introduced our Education Development and Support Training programs for small to medium companies."
    },
    {
      year: "2024",
      title: "75+ Courses",
      description: "Expanded our course catalog to over 75 accredited programs across various industries."
    }
  ];

  const certifications = [
    { name: "QCTO Accredited", description: "Quality Council for Trades and Occupations" },
    { name: "CETA Approved", description: "Construction Education and Training Authority" },
    { name: "SETA Registered", description: "Sector Education and Training Authority" },
    { name: "BBBEE Level 1", description: "Broad-Based Black Economic Empowerment" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {!skipHeader && <Header />}

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
              <Heart className="w-5 h-5 text-orange-600" />
              <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
                About {brandInstitute}
              </Badge>
            </div>

            {/* Enhanced Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              About{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                {brand}
              </span>
            </h1>

            {/* Enhanced Description */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/50 shadow-xl mb-8">
              <p className="text-2xl md:text-3xl mb-6 text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                Transforming Lives Through Quality Education
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                For over 15 years, {brandFull} has been at the forefront of skills development and professional education in South Africa, empowering individuals and organizations to achieve their full potential.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">15+</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Years of Excellence</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">10,000+</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Students Trained</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">75+</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Accredited Courses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="group relative text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="w-10 h-10 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-3 group-hover:text-orange-700 transition-colors">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Mission & Vision */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                  Mission & Vision
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                The guiding principles that drive everything we do at {brandFull}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-6">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200/50 transition-all duration-300 group-hover:scale-110">
                      <Target className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      M
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-blue-700 transition-colors">
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    To provide high-quality, accessible education and training that empowers individuals with the skills and knowledge needed to succeed in today's competitive job market. We are committed to bridging the skills gap and fostering economic growth through innovative learning solutions.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-6">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200/50 transition-all duration-300 group-hover:scale-110">
                      <Lightbulb className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      V
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-blue-700 transition-colors">
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    To be South Africa's leading provider of professional education and skills development, recognized for our excellence in training delivery, innovative teaching methods, and commitment to student success. We envision a future where every individual has access to quality education that transforms their lives.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Our Values */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-green-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-green-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our{" "}
              <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 dark:from-green-400 dark:via-green-500 dark:to-green-600 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              The principles that guide everything we do at {brandFull}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-4">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-200/50 transition-all duration-300 group-hover:scale-110">
                      <value.icon className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-green-700 transition-colors">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Enhanced Our Journey */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-purple-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our{" "}
              <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Key milestones in our growth and development journey
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 via-purple-400 to-purple-500 transform md:-translate-x-0.5"></div>

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}>
                    {/* Timeline Node */}
                    <div className={`absolute left-8 md:left-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transform md:-translate-x-8 z-10 transition-all duration-300 hover:scale-110 ${
                      index % 2 === 0 ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'bg-white border-4 border-purple-300 text-purple-600'
                    }`}>
                      {milestone.year.slice(-2)}
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-5/12 ml-20 md:ml-0 ${
                      index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                    }`}>
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{milestone.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{milestone.description}</p>
                      </div>
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

      {/* Enhanced Certifications & Accreditations */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-amber-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Certifications &{" "}
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent">
                Accreditations
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Recognized by leading educational and industry bodies for our commitment to quality and excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800 dark:to-amber-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-amber-200/50 transition-all duration-300 group-hover:scale-110">
                      <Award className="w-10 h-10 text-amber-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      ✓
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white group-hover:text-amber-700 transition-colors">
                    {cert.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Clients & Partners */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our Trusted{" "}
              <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                Clients & Partners
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              We're proud to have worked with leading organizations across various industries, delivering exceptional training solutions and workforce development programs
            </p>
          </div>

          {/* Client Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {/* Government & Public Sector */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Government & Public Sector</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Municipal Finance Managers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Public Service General Managers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Government Compliance Officers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Labour Inspectors</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Corporate & Private Sector */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Corporate & Private Sector</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Small Business Consultants</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Quality Managers & Assurers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Supply Chain Managers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>HR Management Officers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational Institutions */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <GraduationCap className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Educational Institutions</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Occupational Trainers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Adult Literacy Teachers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>School Principals & Managers</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Training & Development Practitioners</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Specializations */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-white">
              Industry Specializations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Health & Safety</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Construction Health & Safety, Safety Inspectors, Emergency First Aid</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-800">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Finance & Insurance</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Financial Advisors, Insurance Underwriters, Investment Advisers</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Education & Training</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Occupational Trainers, Adult Literacy Teachers, School Principals</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Professional Services</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Quality Managers, Project Managers, Compliance Officers</p>
              </div>
            </div>
          </div>

          {/* Accreditations & Achievements */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-white">
              Accreditations & Achievements
            </h3>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">QCTO Accredited</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Quality Council for Trades and Occupations accreditation for multiple qualifications</p>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">ETDP-SETA Registered</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Education, Training and Development Practices Sector Education and Training Authority</p>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">CETA Approved</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Construction Education and Training Authority approved training provider</p>
                  </div>
                </Card>
              </div>
              <div className="mt-8 text-center">
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                  With over <span className="font-bold text-orange-600">50+ accredited qualifications</span> across various NQF levels (2-8) and 
                  <span className="font-bold text-orange-600"> 2,000+ credits</span> of training content
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">NQF Level 2-8</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">Professional Qualifications</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">Skills Programs</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">Assessment Centre</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {!skipFooter && <Footer />}
    </div>
  );
};

export default AboutUs;
